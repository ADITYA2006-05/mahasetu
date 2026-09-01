package com.mahasetu.interop.service;

import com.mahasetu.interop.dto.consent.ConsentDto;
import com.mahasetu.interop.dto.consent.CreateConsentDto;
import com.mahasetu.interop.entity.Citizen;
import com.mahasetu.interop.entity.Consent;
import com.mahasetu.interop.entity.ConsentScope;
import com.mahasetu.interop.entity.RoleType;
import com.mahasetu.interop.entity.User;
import com.mahasetu.interop.exception.ConsentRequiredException;
import com.mahasetu.interop.exception.InsufficientScopeException;
import com.mahasetu.interop.exception.ResourceNotFoundException;
import com.mahasetu.interop.repository.CitizenRepository;
import com.mahasetu.interop.repository.ConsentRepository;
import com.mahasetu.interop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsentService {

    private final ConsentRepository consentRepository;
    private final CitizenRepository citizenRepository;
    private final UserRepository userRepository;

    /**
     * Creates a new citizen consent agreement with data scopes and validity period.
     */
    @Transactional
    public ConsentDto createConsent(CreateConsentDto dto, String authenticatedUsername) {
        User authUser = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + authenticatedUsername));

        boolean isPrivileged = authUser.getRoles().stream().anyMatch(r -> 
                r.getName() == RoleType.ROLE_ADMIN || r.getName() == RoleType.ROLE_SYSTEM || r.getName() == RoleType.ROLE_DEPARTMENT_OFFICER);

        final String targetCitizenId;
        if (!isPrivileged) {
            // Regular citizens can only create consent for themselves
            if (authUser.getCitizenId() == null || authUser.getCitizenId().isBlank()) {
                authUser.setCitizenId("MH-CIT-10001");
                userRepository.save(authUser);
            }
            targetCitizenId = authUser.getCitizenId();
        } else {
            if (dto.getCitizenId() != null && !dto.getCitizenId().isBlank()) {
                targetCitizenId = dto.getCitizenId().trim();
            } else if (authUser.getCitizenId() != null && !authUser.getCitizenId().isBlank()) {
                targetCitizenId = authUser.getCitizenId();
            } else {
                targetCitizenId = "MH-CIT-10001";
            }
        }

        // Validate Citizen exists in canonical registry
        Citizen citizen = citizenRepository.findByCitizenId(targetCitizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen with ID '" + targetCitizenId + "' not found."));

        String consentId = "CNS-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        OffsetDateTime now = OffsetDateTime.now();
        int validityDays = dto.getValidityDays() != null && dto.getValidityDays() > 0 ? dto.getValidityDays() : 90;
        OffsetDateTime expiresAt = now.plusDays(validityDays);

        Consent consent = Consent.builder()
                .consentId(consentId)
                .citizenId(citizen.getCitizenId())
                .requestingDepartment(dto.getRequestingDepartment() != null ? dto.getRequestingDepartment().trim().toUpperCase() : "ALL")
                .purpose(dto.getPurpose() != null ? dto.getPurpose().trim().toUpperCase() : "SUBSIDY_VERIFICATION")
                .status("ACTIVE")
                .createdAt(now)
                .expiresAt(expiresAt)
                .build();

        List<ConsentScope> scopeEntities = new ArrayList<>();
        if (dto.getScopes() != null) {
            for (String sc : dto.getScopes()) {
                if (sc == null || sc.isBlank()) continue;
                scopeEntities.add(ConsentScope.builder()
                        .consent(consent)
                        .dataScope(sc.trim().toUpperCase())
                        .build());
            }
        }
        consent.setScopes(scopeEntities);

        Consent saved = consentRepository.save(consent);
        log.info("Consent granted [{}] for citizen [{}] - Dept: [{}], Purpose: [{}], Scopes: {}",
                consentId, citizen.getCitizenId(), saved.getRequestingDepartment(), saved.getPurpose(), dto.getScopes());

        return mapToDto(saved, citizen.getFullName());
    }

    /**
     * Lists consents filtered by ownership (citizens see their own, admin/officer sees all).
     */
    @Transactional(readOnly = true)
    public List<ConsentDto> getConsentsForUser(String authenticatedUsername) {
        User authUser = userRepository.findByUsernameOrEmail(authenticatedUsername)
                .orElse(null);

        if (authUser == null) {
            return Collections.emptyList();
        }

        boolean isPrivileged = authUser.getRoles().stream().anyMatch(r -> 
                r.getName() == RoleType.ROLE_ADMIN || r.getName() == RoleType.ROLE_SYSTEM || r.getName() == RoleType.ROLE_DEPARTMENT_OFFICER);

        List<Consent> list;
        if (isPrivileged && (authUser.getCitizenId() == null || authUser.getCitizenId().isBlank())) {
            list = consentRepository.findAllByOrderByCreatedAtDesc();
        } else {
            String citizenId = authUser.getCitizenId() != null ? authUser.getCitizenId() : "MH-CIT-10001";
            list = consentRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId);
        }

        return list.stream().map(c -> {
            String name = citizenRepository.findByCitizenId(c.getCitizenId())
                    .map(Citizen::getFullName)
                    .orElse("Citizen " + c.getCitizenId());
            return mapToDto(c, name);
        }).collect(Collectors.toList());
    }

    /**
     * Retrieves single consent with ownership verification.
     */
    @Transactional(readOnly = true)
    public ConsentDto getConsentById(Long id, String authenticatedUsername) {
        Consent consent = consentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consent not found with ID: " + id));

        User authUser = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authenticatedUsername));

        boolean isPrivileged = authUser.getRoles().stream().anyMatch(r -> 
                r.getName() == RoleType.ROLE_ADMIN || r.getName() == RoleType.ROLE_SYSTEM || r.getName() == RoleType.ROLE_DEPARTMENT_OFFICER);

        if (!isPrivileged && authUser.getCitizenId() != null && !authUser.getCitizenId().equals(consent.getCitizenId())) {
            throw new AccessDeniedException("Access denied: You do not possess ownership of this consent.");
        }

        String name = citizenRepository.findByCitizenId(consent.getCitizenId())
                .map(Citizen::getFullName)
                .orElse("Citizen " + consent.getCitizenId());

        return mapToDto(consent, name);
    }

    /**
     * Revokes active consent.
     */
    @Transactional
    public ConsentDto revokeConsent(Long id, String authenticatedUsername) {
        Consent consent = consentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consent not found with ID: " + id));

        User authUser = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authenticatedUsername));

        boolean isAdmin = authUser.getRoles().stream().anyMatch(r -> 
                r.getName() == RoleType.ROLE_ADMIN || r.getName() == RoleType.ROLE_SYSTEM);

        if (!isAdmin && authUser.getCitizenId() != null && !authUser.getCitizenId().equals(consent.getCitizenId())) {
            throw new AccessDeniedException("Access denied: Only the citizen owning the consent can revoke it.");
        }

        consent.setStatus("REVOKED");
        consent.setRevokedAt(OffsetDateTime.now());

        Consent updated = consentRepository.save(consent);
        log.info("Consent revoked [{}] for citizen [{}]", updated.getConsentId(), updated.getCitizenId());

        String name = citizenRepository.findByCitizenId(consent.getCitizenId())
                .map(Citizen::getFullName)
                .orElse("Citizen " + consent.getCitizenId());

        return mapToDto(updated, name);
    }

    /**
     * Core Gatekeeper: Validates citizen active consent, purpose limitation, and data scope coverage.
     */
    @Transactional(readOnly = true)
    public Consent validateConsentAndScope(
            String citizenId,
            String requestingDepartment,
            String purpose,
            List<String> requestedDepartments
    ) {
        String citizen = citizenId != null ? citizenId.trim() : "";
        String dept = requestingDepartment != null ? requestingDepartment.trim().toUpperCase() : "ALL";
        String purp = purpose != null ? purpose.trim().toUpperCase() : "SUBSIDY_VERIFICATION";
        OffsetDateTime now = OffsetDateTime.now();

        // 1. Query for valid active consent matching citizen, department (or ALL), and purpose
        List<Consent> validConsents = consentRepository.findValidActiveConsents(citizen, dept, purp, now);

        if (validConsents.isEmpty()) {
            // Check for revoked or expired consents to provide specific informative error message
            List<Consent> allCitizenConsents = consentRepository.findByCitizenIdOrderByCreatedAtDesc(citizen);

            for (Consent c : allCitizenConsents) {
                if (c.getPurpose().equalsIgnoreCase(purp)) {
                    if ("REVOKED".equalsIgnoreCase(c.getStatus())) {
                        throw new ConsentRequiredException("Citizen consent has been revoked for purpose '" + purp + "'.");
                    }
                    if (c.getExpiresAt() != null && c.getExpiresAt().isBefore(now)) {
                        throw new ConsentRequiredException("Citizen consent has expired on " + c.getExpiresAt() + " for purpose '" + purp + "'.");
                    }
                }
            }

            throw new ConsentRequiredException("Active citizen consent is required for purpose '" + purp + "'.");
        }

        Consent activeConsent = validConsents.get(0);
        Set<String> approvedScopes = activeConsent.getScopes() != null 
                ? activeConsent.getScopes().stream().map(s -> s.getDataScope().toUpperCase()).collect(Collectors.toSet())
                : Collections.emptySet();

        // 2. Validate requested departments against approved data scopes
        Set<String> requiredScopes = new HashSet<>();
        requiredScopes.add("IDENTITY"); // Basic citizen identity

        if (requestedDepartments != null) {
            for (String d : requestedDepartments) {
                String norm = d != null ? d.trim().toUpperCase() : "";
                if ("REVENUE".equals(norm) || "REV".equals(norm)) {
                    requiredScopes.add("LAND");
                } else if ("AGRICULTURE".equals(norm) || "AGR".equals(norm)) {
                    requiredScopes.add("AGRICULTURE");
                } else if ("WELFARE".equals(norm) || "WEL".equals(norm)) {
                    requiredScopes.add("WELFARE");
                }
            }
        }

        // Check for missing scopes
        List<String> missingScopes = new ArrayList<>();
        for (String reqScope : requiredScopes) {
            if (!approvedScopes.contains(reqScope)) {
                missingScopes.add(reqScope);
            }
        }

        if (!missingScopes.isEmpty()) {
            throw new InsufficientScopeException("Requested data scope exceeds citizen authorized scopes. Missing approved scopes: " + missingScopes);
        }

        return activeConsent;
    }

    private ConsentDto mapToDto(Consent c, String citizenName) {
        List<String> scopes = c.getScopes() != null 
                ? c.getScopes().stream().map(ConsentScope::getDataScope).collect(Collectors.toList())
                : Collections.emptyList();

        return ConsentDto.builder()
                .id(c.getId())
                .consentId(c.getConsentId())
                .citizenId(c.getCitizenId())
                .citizenName(citizenName)
                .requestingDepartment(c.getRequestingDepartment())
                .purpose(c.getPurpose())
                .status(c.getStatus())
                .scopes(scopes)
                .createdAt(c.getCreatedAt())
                .expiresAt(c.getExpiresAt())
                .revokedAt(c.getRevokedAt())
                .build();
    }
}
