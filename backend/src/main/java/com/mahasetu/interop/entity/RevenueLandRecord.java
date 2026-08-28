package com.mahasetu.interop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "revenue_land_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueLandRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "record_id", nullable = false, unique = true, length = 50)
    private String recordId; // e.g. MH-REV-LR-10001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_identifier_id")
    private DepartmentIdentifier departmentIdentifier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "taluka_id", nullable = false)
    private Taluka taluka;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "village_id", nullable = false)
    private Village village;

    @Column(name = "survey_number", nullable = false, length = 30)
    private String surveyNumber;

    @Column(name = "gat_number", nullable = false, length = 30)
    private String gatNumber;

    @Column(name = "khata_number", nullable = false, length = 30)
    private String khataNumber;

    @Column(name = "total_area_hectares", nullable = false, precision = 8, scale = 4)
    private BigDecimal totalAreaHectares;

    @Column(name = "cultivable_area_hectares", nullable = false, precision = 8, scale = 4)
    private BigDecimal cultivableAreaHectares;

    @Column(name = "uncultivable_area_hectares", nullable = false, precision = 8, scale = 4)
    @Builder.Default
    private BigDecimal uncultivableAreaHectares = BigDecimal.ZERO;

    @Column(name = "land_type", nullable = false, length = 50)
    private String landType; // BAGAYAT, JIRAIT, TARI

    @Column(name = "ownership_type", nullable = false, length = 50)
    private String ownershipType; // SINGLE, OCCUPANT_CLASS_1

    @Column(name = "encumbrance_status", nullable = false, length = 50)
    @Builder.Default
    private String encumbranceStatus = "NONE";

    @Column(name = "registration_date", nullable = false)
    private LocalDate registrationDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
