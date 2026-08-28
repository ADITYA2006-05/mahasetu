package com.mahasetu.interop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "integration_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntegrationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false, unique = true, length = 50)
    private String requestId;

    @Column(name = "citizen_id", nullable = false, length = 30)
    private String citizenId;

    @Column(name = "requesting_user", nullable = false, length = 100)
    private String requestingUser;

    @Column(nullable = false, length = 100)
    private String purpose;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING"; // SUCCESS, PARTIAL_SUCCESS, FAILED, PENDING

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @OneToMany(mappedBy = "integrationRequest", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<IntegrationRequestResult> results = new ArrayList<>();
}
