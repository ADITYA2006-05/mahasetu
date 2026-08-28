package com.mahasetu.interop.dto.canonical;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Schema Mapping Entity DTO for administrative configuration")
public class SchemaMappingDto {

    @Schema(description = "Internal database ID")
    private Long id;

    @NotBlank(message = "Source department code is required (e.g. REV, AGR, WEL)")
    @Schema(description = "Source Department Code", example = "REV", requiredMode = Schema.RequiredMode.REQUIRED)
    private String departmentCode;

    @Schema(description = "Source Department Name", example = "Revenue & Forest Department")
    private String departmentName;

    @Schema(description = "Entity / Domain classification", example = "CANONICAL_REVENUE")
    @Builder.Default
    private String entityType = "CANONICAL_MAPPING";

    @NotBlank(message = "Source field expression is required")
    @Schema(description = "Legacy source field name", example = "survey_no", requiredMode = Schema.RequiredMode.REQUIRED)
    private String sourceField;

    @NotBlank(message = "Canonical target path is required")
    @Schema(description = "Canonical target path in dot notation", example = "land.surveyNumber", requiredMode = Schema.RequiredMode.REQUIRED)
    private String canonicalField;

    @Schema(description = "Target data type coercion", example = "STRING")
    @Builder.Default
    private String dataType = "STRING"; // STRING, NUMBER, DOUBLE, INTEGER, BOOLEAN

    @Schema(description = "Transformation rule logic", example = "DIRECT_MAP")
    @Builder.Default
    private String transformationRule = "DIRECT_MAP";

    @Schema(description = "Mapping schema version", example = "1.0")
    @Builder.Default
    private String version = "1.0";

    @Schema(description = "Description or documentation for mapping")
    private String description;

    @Schema(description = "Active status flag", example = "true")
    @Builder.Default
    private Boolean isActive = true;

    @Schema(description = "Creation timestamp")
    private OffsetDateTime createdAt;
}
