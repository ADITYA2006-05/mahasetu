package com.mahasetu.interop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "department_identifiers",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_dept_citizen_identifier", columnNames = {"department_id", "department_specific_id"}),
        @UniqueConstraint(name = "uq_citizen_dept_type", columnNames = {"citizen_id", "department_id", "identifier_type"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentIdentifier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "department_specific_id", nullable = false, length = 50)
    private String departmentSpecificId;

    @Column(name = "identifier_type", nullable = false, length = 50)
    private String identifierType; // KHATA_7_12, FARMER_REGISTRATION, WELFARE_BENEFICIARY_ID

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "issued_date", nullable = false)
    private LocalDate issuedDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
