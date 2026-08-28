package com.mahasetu.interop.service;

import com.mahasetu.interop.dto.audit.AuditLogDto;
import com.mahasetu.interop.dto.audit.CitizenDataAccessDto;
import com.mahasetu.interop.entity.AuditLog;
import com.mahasetu.interop.exception.ResourceNotFoundException;
import com.mahasetu.interop.repository.AuditLogRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Records an immutable audit log entry for every data access / integration attempt.
     */
    @Transactional
    public AuditLog recordAuditLog(
            String requestId,
            String citizenId,
            String requestingUser,
            String requestingDepartment,
            String targetDepartment,
            String targetService,
            String purpose,
            String dataScope,
            String status,
            Long responseTimeMs,
            String errorCode
    ) {
        String auditId = "AUD-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

        AuditLog entry = AuditLog.builder()
                .auditId(auditId)
                .requestId(requestId != null ? requestId : "REQ-UNKNOWN")
                .citizenId(citizenId != null ? citizenId : "UNKNOWN")
                .requestingUser(requestingUser != null ? requestingUser : "ANONYMOUS")
                .requestingDepartment(requestingDepartment)
                .targetDepartment(targetDepartment)
                .targetService(targetService)
                .purpose(purpose)
                .dataScope(dataScope)
                .status(status != null ? status : "UNKNOWN")
                .responseTimeMs(responseTimeMs != null ? responseTimeMs : 0L)
                .errorCode(errorCode)
                .build();

        AuditLog saved = auditLogRepository.save(entry);
        log.info("Audit Log recorded [{}] - Citizen: [{}], Status: [{}], Purpose: [{}], User: [{}]",
                auditId, citizenId, status, purpose, requestingUser);
        return saved;
    }

    /**
     * Retrieves filtered audit logs for administrator oversight.
     */
    @Transactional(readOnly = true)
    public List<AuditLogDto> getFilteredAuditLogs(
            String citizenId,
            String department,
            String status,
            String requestId,
            OffsetDateTime startDate,
            OffsetDateTime endDate
    ) {
        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (citizenId != null && !citizenId.isBlank()) {
                predicates.add(cb.equal(root.get("citizenId"), citizenId.trim()));
            }
            if (department != null && !department.isBlank()) {
                String deptUpper = department.trim().toUpperCase();
                predicates.add(cb.or(
                        cb.equal(root.get("requestingDepartment"), deptUpper),
                        cb.equal(root.get("targetDepartment"), deptUpper)
                ));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status.trim().toUpperCase()));
            }
            if (requestId != null && !requestId.isBlank()) {
                predicates.add(cb.equal(root.get("requestId"), requestId.trim()));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), endDate));
            }

            query.orderBy(cb.desc(root.get("timestamp")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<AuditLog> logs = auditLogRepository.findAll(spec);
        return logs.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    /**
     * Retrieves single audit log by ID.
     */
    @Transactional(readOnly = true)
    public AuditLogDto getAuditLogById(Long id) {
        AuditLog entry = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log not found with ID: " + id));
        return mapToDto(entry);
    }

    /**
     * Retrieves citizen-facing personal data access history.
     */
    @Transactional(readOnly = true)
    public List<CitizenDataAccessDto> getCitizenDataAccessHistory(String citizenId) {
        if (citizenId == null || citizenId.isBlank()) {
            return Collections.emptyList();
        }

        List<AuditLog> logs = auditLogRepository.findByCitizenIdOrderByTimestampDesc(citizenId.trim());
        return logs.stream().map(log -> CitizenDataAccessDto.builder()
                .timestamp(log.getTimestamp())
                .requestId(log.getRequestId())
                .department(log.getRequestingDepartment() != null ? log.getRequestingDepartment() : "State Portal")
                .purpose(log.getPurpose() != null ? log.getPurpose() : "GENERAL_INQUIRY")
                .dataAccessed(log.getDataScope() != null ? log.getDataScope() : "IDENTITY, LAND, AGRICULTURE, WELFARE")
                .status(log.getStatus())
                .build()
        ).collect(Collectors.toList());
    }

    private AuditLogDto mapToDto(AuditLog a) {
        return AuditLogDto.builder()
                .id(a.getId())
                .auditId(a.getAuditId())
                .requestId(a.getRequestId())
                .citizenId(a.getCitizenId())
                .requestingUser(a.getRequestingUser())
                .requestingDepartment(a.getRequestingDepartment())
                .targetDepartment(a.getTargetDepartment())
                .targetService(a.getTargetService())
                .purpose(a.getPurpose())
                .dataScope(a.getDataScope())
                .status(a.getStatus())
                .responseTimeMs(a.getResponseTimeMs())
                .errorCode(a.getErrorCode())
                .timestamp(a.getTimestamp())
                .build();
    }
}
