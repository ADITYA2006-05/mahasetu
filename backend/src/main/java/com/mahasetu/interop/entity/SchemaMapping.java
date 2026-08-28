package com.mahasetu.interop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(
    name = "schema_mappings"
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchemaMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_department_id", nullable = false)
    private Department sourceDepartment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_department_id")
    private Department targetDepartment;

    @Column(name = "entity_type", nullable = false, length = 50)
    @Builder.Default
    private String entityType = "CANONICAL_MAPPING"; // CANONICAL_MAPPING, LAND_TO_FARMER, etc.

    @Column(name = "source_field", nullable = false, length = 100)
    private String sourceField;

    @Column(name = "target_field", nullable = false, length = 100)
    private String targetField;

    @Column(name = "data_type", nullable = false, length = 30)
    @Builder.Default
    private String dataType = "STRING"; // STRING, NUMBER, DOUBLE, INTEGER, BOOLEAN

    @Column(name = "transformation_rule", nullable = false, length = 100)
    @Builder.Default
    private String transformationRule = "DIRECT_MAP"; // DIRECT_MAP, FEDERATED_KEY, etc.

    @Column(name = "version", nullable = false, length = 20)
    @Builder.Default
    private String version = "1.0";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
