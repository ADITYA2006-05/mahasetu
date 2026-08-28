package com.mahasetu.interop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "integration_request_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntegrationRequestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", referencedColumnName = "request_id", nullable = false)
    private IntegrationRequest integrationRequest;

    @Column(name = "department_code", nullable = false, length = 20)
    private String departmentCode; // REVENUE, AGRICULTURE, WELFARE

    @Column(nullable = false, length = 30)
    private String status; // SUCCESS, FAILED

    @Column(name = "response_time_ms", nullable = false)
    @Builder.Default
    private Long responseTimeMs = 0L;

    @Column(name = "error_code", length = 50)
    private String errorCode;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
