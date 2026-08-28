package com.mahasetu.interop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRegistry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "service_code", nullable = false, unique = true, length = 50)
    private String serviceCode;

    @Column(nullable = false, length = 150)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "endpoint_path", nullable = false, length = 200)
    private String endpointPath;

    @Column(name = "request_method", nullable = false, length = 10)
    @Builder.Default
    private String requestMethod = "GET";

    @Column(name = "response_format", nullable = false, length = 20)
    @Builder.Default
    private String responseFormat = "JSON";

    @Column(name = "sla_seconds", nullable = false)
    @Builder.Default
    private Integer slaSeconds = 2;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
