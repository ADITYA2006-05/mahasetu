package com.mahasetu.interop.service;

import com.mahasetu.interop.client.DepartmentClient;
import com.mahasetu.interop.client.DepartmentClientRegistry;
import com.mahasetu.interop.dto.canonical.*;
import com.mahasetu.interop.dto.integration.*;
import com.mahasetu.interop.entity.*;
import com.mahasetu.interop.exception.ResourceNotFoundException;
import com.mahasetu.interop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class IntegrationService {

    private final CitizenRepository citizenRepository;
    private final DepartmentRepository departmentRepository;
    private final DepartmentIdentifierRepository departmentIdentifierRepository;
    private final ServiceRegistryRepository serviceRegistryRepository;
    private final IntegrationRequestRepository integrationRequestRepository;
    private final IntegrationRequestResultRepository integrationRequestResultRepository;
    private final DepartmentClientRegistry clientRegistry;
    private final SchemaMappingService schemaMappingService;
    private final ConsentService consentService;
    private final AuditLogService auditLogService;
    private final CitizenProvisioningService citizenProvisioningService;

    /**
     * Executes a federated cross-department integration request and applies dynamic canonical schema mapping.
     */
    @Transactional
    public IntegrationResponseDto processIntegrationRequest(IntegrationRequestDto requestDto, String requestingUser) {
        long overallStart = System.currentTimeMillis();
        String citizenId = requestDto.getCitizenId().trim();
        String purpose = requestDto.getPurpose().trim();
        List<String> requestedDepts = requestDto.getRequestedDepartments();

        // 1. Generate Correlation Request ID
        String correlationRequestId = generateRequestId();
        OffsetDateTime createdAt = OffsetDateTime.now();

        log.info("Integration Service: Initiating federated request [{}] for citizen [{}] with [{}] departments by user [{}] (Purpose: [{}])",
            correlationRequestId, citizenId, requestedDepts.size(), requestingUser, purpose);

        // 2. Validate Master Citizen Existence in Canonical Registry or Auto-provision
        Citizen citizen = citizenRepository.findByCitizenId(citizenId)
            .orElseGet(() -> citizenProvisioningService.getOrCreateCitizen(citizenId, null, null, null));

        // 3. Privacy & Consent Gatekeeper: Validate Citizen Active Consent & Data Scope Coverage
        Consent activeConsent;
        try {
            activeConsent = consentService.validateConsentAndScope(citizenId, "ALL", purpose, requestedDepts);
        } catch (com.mahasetu.interop.exception.ConsentRequiredException ex) {
            long latency = Math.max(1L, System.currentTimeMillis() - overallStart);
            auditLogService.recordAuditLog(
                correlationRequestId,
                citizenId,
                requestingUser,
                "INTEGRATION_GATEWAY",
                String.join(",", requestedDepts),
                "/api/integration/request",
                purpose,
                "IDENTITY",
                "CONSENT_REJECTED",
                latency,
                ex.getErrorCode()
            );
            throw new com.mahasetu.interop.exception.ConsentRequiredException(ex.getMessage(), correlationRequestId);
        } catch (com.mahasetu.interop.exception.InsufficientScopeException ex) {
            long latency = Math.max(1L, System.currentTimeMillis() - overallStart);
            auditLogService.recordAuditLog(
                correlationRequestId,
                citizenId,
                requestingUser,
                "INTEGRATION_GATEWAY",
                String.join(",", requestedDepts),
                "/api/integration/request",
                purpose,
                "IDENTITY",
                "SCOPE_REJECTED",
                latency,
                ex.getErrorCode()
            );
            throw new com.mahasetu.interop.exception.InsufficientScopeException(ex.getMessage(), correlationRequestId);
        }

        // 4. Resolve Department-Specific Federated Identifiers
        List<DepartmentIdentifier> citizenIdentifiers = departmentIdentifierRepository.findByCitizenId(citizen.getId());
        Map<String, String> identifierMap = new HashMap<>();
        for (DepartmentIdentifier ident : citizenIdentifiers) {
            String deptCode = ident.getDepartment().getDepartmentCode().toUpperCase();
            identifierMap.put(deptCode, ident.getDepartmentSpecificId());
        }

        // 4. Resolve Services from Service Registry and Execute Department Clients
        List<DepartmentResponseItemDto> responseItems = new ArrayList<>();
        List<DepartmentExecutionResult> executionResults = new ArrayList<>();

        for (String rawDept : requestedDepts) {
            if (rawDept == null || rawDept.isBlank()) continue;
            String normalizedDept = rawDept.trim().toUpperCase();

            Optional<DepartmentClient> clientOpt = clientRegistry.getClient(normalizedDept);
            if (clientOpt.isEmpty()) {
                log.warn("Integration Service: Unsupported department requested: [{}]", rawDept);
                DepartmentExecutionResult unsuppResult = DepartmentExecutionResult.builder()
                    .departmentCode(normalizedDept)
                    .shortCode(normalizedDept)
                    .departmentName("Unknown Department (" + rawDept + ")")
                    .status("FAILED")
                    .responseTimeMs(0L)
                    .errorCode("UNSUPPORTED_DEPARTMENT")
                    .errorMessage("Department '" + rawDept + "' is not registered with the MahaSetu gateway.")
                    .build();
                executionResults.add(unsuppResult);
                continue;
            }

            DepartmentClient client = clientOpt.get();
            String shortCode = client.getShortCode();
            String resolvedIdentifier = identifierMap.getOrDefault(shortCode, "UNRESOLVED-" + citizenId);

            // Lookup endpoint from Service Registry table
            String serviceEndpoint = resolveServiceEndpoint(shortCode, citizenId);

            // Execute Department Client (isolated error trapping and SLA timing)
            DepartmentExecutionResult execResult = client.executeRequest(citizenId, resolvedIdentifier, serviceEndpoint);
            executionResults.add(execResult);
        }

        // 5. Aggregate Execution Results & Determine Overall Status
        int totalRequests = executionResults.size();
        int successCount = 0;
        int failedCount = 0;

        List<String> sources = new ArrayList<>();
        CanonicalCitizenDto canonicalCitizen = CanonicalCitizenDto.builder()
            .id(citizen.getCitizenId())
            .name(citizen.getFullName())
            .build();
        CanonicalLocationDto canonicalLocation = null;
        CanonicalLandDto canonicalLand = null;
        CanonicalAgricultureDto canonicalAgriculture = null;
        CanonicalWelfareDto canonicalWelfare = null;

        for (DepartmentExecutionResult res : executionResults) {
            if ("SUCCESS".equalsIgnoreCase(res.getStatus())) {
                successCount++;
                String deptCode = schemaMappingService.normalizeDepartmentCode(res.getDepartmentCode());
                sources.add(deptCode);

                // --- Phase 5 Dynamic Database-Driven Schema Transformation ---
                try {
                    Map<String, Object> canonicalTree = schemaMappingService.transformRawData(deptCode, res.getRawPayload());
                    
                    // Merge Citizen Data
                    if (canonicalTree.containsKey("citizen") && canonicalTree.get("citizen") instanceof Map<?, ?> citMap) {
                        if (citMap.get("name") != null) {
                            canonicalCitizen.setName(citMap.get("name").toString());
                        }
                    }

                    // Merge Location Data
                    if (canonicalTree.containsKey("location") && canonicalTree.get("location") instanceof Map<?, ?> locMap) {
                        if (canonicalLocation == null) {
                            canonicalLocation = CanonicalLocationDto.builder().build();
                        }
                        if (locMap.get("district") != null) canonicalLocation.setDistrict(locMap.get("district").toString());
                        if (locMap.get("taluka") != null) canonicalLocation.setTaluka(locMap.get("taluka").toString());
                        if (locMap.get("village") != null) canonicalLocation.setVillage(locMap.get("village").toString());
                    }

                    // Merge Land Data (Revenue)
                    if (canonicalTree.containsKey("land") && canonicalTree.get("land") instanceof Map<?, ?> landMap) {
                        canonicalLand = CanonicalLandDto.builder()
                            .surveyNumber(landMap.get("surveyNumber") != null ? landMap.get("surveyNumber").toString() : null)
                            .areaAcres(landMap.get("areaAcres") instanceof Number num ? num.doubleValue() : null)
                            .source("REVENUE")
                            .build();
                    }

                    // Merge Agriculture Data
                    if (canonicalTree.containsKey("agriculture") && canonicalTree.get("agriculture") instanceof Map<?, ?> agriMap) {
                        canonicalAgriculture = CanonicalAgricultureDto.builder()
                            .crop(agriMap.get("crop") != null ? agriMap.get("crop").toString() : null)
                            .season(agriMap.get("season") != null ? agriMap.get("season").toString() : null)
                            .landUsage(agriMap.get("landUsage") != null ? agriMap.get("landUsage").toString() : null)
                            .source("AGRICULTURE")
                            .build();
                    }

                    // Merge Welfare Data
                    if (canonicalTree.containsKey("welfare") && canonicalTree.get("welfare") instanceof Map<?, ?> welMap) {
                        canonicalWelfare = CanonicalWelfareDto.builder()
                            .schemeCode(welMap.get("schemeCode") != null ? welMap.get("schemeCode").toString() : null)
                            .schemeName(welMap.get("schemeName") != null ? welMap.get("schemeName").toString() : null)
                            .previousBenefit(welMap.get("previousBenefit") instanceof Boolean b ? b : null)
                            .applicationStatus(welMap.get("applicationStatus") != null ? welMap.get("applicationStatus").toString() : null)
                            .benefitAmount(welMap.get("benefitAmount") instanceof Number num ? num.doubleValue() : null)
                            .source("WELFARE")
                            .build();
                    }

                } catch (Exception ex) {
                    log.error("Failed to map schema for department [{}]: {}", deptCode, ex.getMessage());
                }

            } else {
                failedCount++;
            }

            responseItems.add(DepartmentResponseItemDto.builder()
                .department(res.getDepartmentCode())
                .status(res.getStatus())
                .responseTimeMs(res.getResponseTimeMs())
                .departmentSpecificId(res.getDepartmentSpecificId())
                .serviceEndpoint(res.getEndpointQueried())
                .errorCode(res.getErrorCode())
                .errorMessage(res.getErrorMessage())
                .build());
        }

        String overallStatus;
        if (totalRequests == 0 || failedCount == totalRequests) {
            overallStatus = "FAILED";
        } else if (successCount == totalRequests) {
            overallStatus = "SUCCESS";
        } else {
            overallStatus = "PARTIAL_SUCCESS";
        }

        OffsetDateTime completedAt = OffsetDateTime.now();
        long totalElapsed = Math.max(1L, System.currentTimeMillis() - overallStart);

        // 6. Persist Audit Record into Database
        IntegrationRequest entity = IntegrationRequest.builder()
            .requestId(correlationRequestId)
            .citizenId(citizenId)
            .requestingUser(requestingUser != null ? requestingUser : "ANONYMOUS_OFFICER")
            .purpose(purpose)
            .status(overallStatus)
            .createdAt(createdAt)
            .completedAt(completedAt)
            .build();

        List<IntegrationRequestResult> resultEntities = new ArrayList<>();
        for (DepartmentExecutionResult res : executionResults) {
            resultEntities.add(IntegrationRequestResult.builder()
                .integrationRequest(entity)
                .departmentCode(res.getDepartmentCode())
                .status(res.getStatus())
                .responseTimeMs(res.getResponseTimeMs())
                .errorCode(res.getErrorCode())
                .errorMessage(res.getErrorMessage())
                .createdAt(completedAt)
                .build());
        }
        entity.setResults(resultEntities);

        integrationRequestRepository.save(entity);
        log.info("Integration Service: Completed request [{}] - Overall Status: [{}] (Success: {}/{}, Latency: {}ms, Sources: {})",
            correlationRequestId, overallStatus, successCount, totalRequests, totalElapsed, sources);

        // 7. Record Immutable Audit Trail Event in PostgreSQL
        String approvedScopesStr = (activeConsent.getScopes() != null && !activeConsent.getScopes().isEmpty())
            ? activeConsent.getScopes().stream().map(ConsentScope::getDataScope).collect(Collectors.joining(", "))
            : "IDENTITY";

        auditLogService.recordAuditLog(
            correlationRequestId,
            citizenId,
            requestingUser,
            "INTEGRATION_GATEWAY",
            String.join(",", requestedDepts),
            "/api/integration/request",
            purpose,
            approvedScopesStr,
            overallStatus,
            totalElapsed,
            "FAILED".equals(overallStatus) ? "DEPARTMENT_FAILURE" : null
        );

        // 8. Construct & Return Unified Response with Standardized Canonical Model
        return IntegrationResponseDto.builder()
            .requestId(correlationRequestId)
            .citizenId(citizenId)
            .status(overallStatus)
            .purpose(purpose)
            .requestingUser(entity.getRequestingUser())
            .citizen(canonicalCitizen)
            .location(canonicalLocation)
            .land(canonicalLand)
            .agriculture(canonicalAgriculture)
            .welfare(canonicalWelfare)
            .sources(sources)
            .departmentResponses(responseItems)
            .createdAt(createdAt)
            .completedAt(completedAt)
            .totalLatencyMs(totalElapsed)
            .build();
    }

    /**
     * Resolves active endpoint from Service Registry or provides fallback standard endpoint.
     */
    private String resolveServiceEndpoint(String deptShortCode, String citizenId) {
        try {
            Optional<Department> deptOpt = departmentRepository.findByDepartmentCode(deptShortCode);
            if (deptOpt.isPresent()) {
                List<ServiceRegistry> services = serviceRegistryRepository.findByDepartmentId(deptOpt.get().getId());
                if (!services.isEmpty()) {
                    ServiceRegistry primaryService = services.get(0);
                    return primaryService.getEndpointPath() + "/" + citizenId;
                }
            }
        } catch (Exception e) {
            log.debug("Could not resolve dynamic endpoint from service registry for [{}]: {}", deptShortCode, e.getMessage());
        }

        return switch (deptShortCode.toUpperCase()) {
            case "REV" -> "/api/mock/revenue/citizens/" + citizenId;
            case "AGR" -> "/api/mock/agriculture/farmers/" + citizenId;
            case "WEL" -> "/api/mock/welfare/beneficiaries/" + citizenId;
            default -> "/api/mock/" + deptShortCode.toLowerCase() + "/" + citizenId;
        };
    }

    /**
     * Generates standard correlation ID in format REQ-XXXXXXXX
     */
    private String generateRequestId() {
        String uuidSnippet = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "REQ-" + uuidSnippet;
    }

    /**
     * Fetches details of a specific integration request by requestId.
     */
    @Transactional(readOnly = true)
    public IntegrationResponseDto getRequestByRequestId(String requestId) {
        IntegrationRequest entity = integrationRequestRepository.findByRequestId(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Integration request '" + requestId + "' not found."));

        List<IntegrationRequestResult> results = integrationRequestResultRepository.findByIntegrationRequest_RequestId(requestId);

        List<DepartmentResponseItemDto> deptItems = results.stream().map(r -> DepartmentResponseItemDto.builder()
            .department(r.getDepartmentCode())
            .status(r.getStatus())
            .responseTimeMs(r.getResponseTimeMs())
            .errorCode(r.getErrorCode())
            .errorMessage(r.getErrorMessage())
            .build()
        ).collect(Collectors.toList());

        return IntegrationResponseDto.builder()
            .requestId(entity.getRequestId())
            .citizenId(entity.getCitizenId())
            .status(entity.getStatus())
            .purpose(entity.getPurpose())
            .requestingUser(entity.getRequestingUser())
            .departmentResponses(deptItems)
            .createdAt(entity.getCreatedAt())
            .completedAt(entity.getCompletedAt())
            .build();
    }

    /**
     * Fetches recent integration request logs for officer telemetry and audit trails.
     */
    @Transactional(readOnly = true)
    public List<IntegrationResponseDto> getRecentRequests() {
        List<IntegrationRequest> list = integrationRequestRepository.findTop20ByOrderByCreatedAtDesc();
        return list.stream().map(req -> {
            List<DepartmentResponseItemDto> items = req.getResults() != null ? req.getResults().stream().map(r ->
                DepartmentResponseItemDto.builder()
                    .department(r.getDepartmentCode())
                    .status(r.getStatus())
                    .responseTimeMs(r.getResponseTimeMs())
                    .errorCode(r.getErrorCode())
                    .errorMessage(r.getErrorMessage())
                    .build()
            ).collect(Collectors.toList()) : Collections.emptyList();

            return IntegrationResponseDto.builder()
                .requestId(req.getRequestId())
                .citizenId(req.getCitizenId())
                .status(req.getStatus())
                .purpose(req.getPurpose())
                .requestingUser(req.getRequestingUser())
                .departmentResponses(items)
                .createdAt(req.getCreatedAt())
                .completedAt(req.getCompletedAt())
                .build();
        }).collect(Collectors.toList());
    }
}
