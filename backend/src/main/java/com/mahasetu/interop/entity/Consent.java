package com.mahasetu.interop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "consents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "consent_id", nullable = false, unique = true, length = 50)
    private String consentId; // CNS-XXXXXXXX

    @Column(name = "citizen_id", nullable = false, length = 30)
    private String citizenId; // MH-CIT-10001

    @Column(name = "requesting_department", nullable = false, length = 30)
    private String requestingDepartment; // AGRICULTURE, REVENUE, WELFARE, ALL

    @Column(name = "purpose", nullable = false, length = 100)
    private String purpose; // SUBSIDY_VERIFICATION, BENEFIT_DISBURSEMENT, etc.

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, REVOKED, EXPIRED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @Column(name = "revoked_at")
    private OffsetDateTime revokedAt;

    @OneToMany(mappedBy = "consent", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ConsentScope> scopes = new ArrayList<>();
}
