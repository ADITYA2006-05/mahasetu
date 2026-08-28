package com.mahasetu.interop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "audit_id", nullable = false, unique = true, length = 50)
    private String auditId; // AUD-XXXXXXXX

    @Column(name = "request_id", nullable = false, length = 50)
    private String requestId; // REQ-XXXXXXXX

    @Column(name = "citizen_id", nullable = false, length = 30)
    private String citizenId; // MH-CIT-10001

    @Column(name = "requesting_user", nullable = false, length = 100)
    private String requestingUser; // officer.revenue, admin, etc.

    @Column(name = "requesting_department", length = 50)
    private String requestingDepartment; // AGRICULTURE, REVENUE, WELFARE, SYSTEM

    @Column(name = "target_department", length = 50)
    private String targetDepartment; // REVENUE, AGRICULTURE, WELFARE, ALL

    @Column(name = "target_service", length = 150)
    private String targetService; // e.g. Federated Integration Gateway

    @Column(name = "purpose", length = 100)
    private String purpose; // SUBSIDY_VERIFICATION, etc.

    @Column(name = "data_scope", length = 150)
    private String dataScope; // IDENTITY, LOCATION, LAND, AGRICULTURE, WELFARE

    @Column(name = "status", nullable = false, length = 30)
    private String status; // SUCCESS, PARTIAL_SUCCESS, FAILED, CONSENT_REJECTED, SCOPE_REJECTED

    @Column(name = "response_time_ms")
    @Builder.Default
    private Long responseTimeMs = 0L;

    @Column(name = "error_code", length = 50)
    private String errorCode;

    @CreationTimestamp
    @Column(name = "timestamp", updatable = false)
    private OffsetDateTime timestamp;
}
