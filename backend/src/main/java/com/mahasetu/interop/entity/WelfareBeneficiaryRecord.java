package com.mahasetu.interop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "welfare_beneficiary_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WelfareBeneficiaryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "beneficiary_record_id", nullable = false, unique = true, length = 50)
    private String beneficiaryRecordId; // e.g. MH-WEL-BR-10001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_identifier_id")
    private DepartmentIdentifier departmentIdentifier;

    @Column(name = "scheme_name", nullable = false, length = 150)
    private String schemeName;

    @Column(name = "scheme_code", nullable = false, length = 50)
    private String schemeCode;

    @Column(name = "beneficiary_category", nullable = false, length = 50)
    private String beneficiaryCategory;

    @Column(name = "monthly_stipend_inr", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyStipendInr;

    @Column(name = "bank_account_masked", nullable = false, length = 30)
    private String bankAccountMasked;

    @Column(name = "ifsc_code_masked", nullable = false, length = 20)
    private String ifscCodeMasked;

    @Column(name = "disbursement_status", nullable = false, length = 20)
    @Builder.Default
    private String disbursementStatus = "PROCESSED"; // PROCESSED, PENDING_AUDIT

    @Column(name = "last_disbursement_date", nullable = false)
    private LocalDate lastDisbursementDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
