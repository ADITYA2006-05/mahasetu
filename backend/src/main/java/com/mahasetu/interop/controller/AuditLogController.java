package com.mahasetu.interop.controller;

import com.mahasetu.interop.dto.audit.AuditLogDto;
import com.mahasetu.interop.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logging", description = "Immutable State-wide Audit Trail Oversight APIs (Admin Only)")
@SecurityRequirement(name = "Bearer Authentication")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM')")
    @Operation(summary = "Query state-wide audit logs", description = "Admin-only API to query immutable audit records with multi-criteria filters (citizen ID, department, status, requestId, date range).")
    public ResponseEntity<List<AuditLogDto>> getAuditLogs(
            @RequestParam(required = false) String citizenId,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String requestId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate
    ) {
        log.info("API: Querying audit logs (citizenId: {}, dept: {}, status: {}, requestId: {})",
                citizenId, department, status, requestId);
        List<AuditLogDto> logs = auditLogService.getFilteredAuditLogs(citizenId, department, status, requestId, startDate, endDate);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM')")
    @Operation(summary = "Get audit record by ID", description = "Retrieves complete audit trail entry by primary key ID.")
    public ResponseEntity<AuditLogDto> getAuditLogById(@PathVariable Long id) {
        return ResponseEntity.ok(auditLogService.getAuditLogById(id));
    }
}
