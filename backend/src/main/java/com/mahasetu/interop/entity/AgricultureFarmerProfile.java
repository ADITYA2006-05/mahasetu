package com.mahasetu.interop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "agriculture_farmer_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgricultureFarmerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "profile_id", nullable = false, unique = true, length = 50)
    private String profileId; // e.g. MH-AGR-FP-10001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_identifier_id")
    private DepartmentIdentifier departmentIdentifier;

    @Column(name = "farmer_category", nullable = false, length = 50)
    private String farmerCategory; // MARGINAL, SMALL, SEMI_MEDIUM, LARGE

    @Column(name = "primary_crop", nullable = false, length = 100)
    private String primaryCrop;

    @Column(name = "secondary_crop", length = 100)
    private String secondaryCrop;

    @Column(name = "soil_type", nullable = false, length = 50)
    private String soilType;

    @Column(name = "irrigation_source", nullable = false, length = 50)
    private String irrigationSource;

    @Column(name = "landholding_hectares", nullable = false, precision = 8, scale = 4)
    private BigDecimal landholdingHectares;

    @Column(name = "kisan_credit_card_status", nullable = false, length = 20)
    @Builder.Default
    private String kisanCreditCardStatus = "ACTIVE";

    @Column(name = "subsidy_availed_inr", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal subsidyAvailedInr = BigDecimal.ZERO;

    @Column(name = "last_claim_date")
    private LocalDate lastClaimDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
