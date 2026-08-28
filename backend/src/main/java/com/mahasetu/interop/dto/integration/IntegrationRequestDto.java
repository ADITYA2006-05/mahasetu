package com.mahasetu.interop.dto.integration;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Federated cross-department integration request payload")
public class IntegrationRequestDto {

    @NotBlank(message = "Citizen ID is mandatory (e.g., MH-CIT-10001)")
    @Schema(description = "Master synthetic citizen ID", example = "MH-CIT-10001", requiredMode = Schema.RequiredMode.REQUIRED)
    private String citizenId;

    @NotBlank(message = "Purpose of integration request is required")
    @Schema(description = "Business or administrative purpose for data access", example = "SUBSIDY_VERIFICATION", requiredMode = Schema.RequiredMode.REQUIRED)
    private String purpose;

    @NotEmpty(message = "At least one target department must be requested")
    @Schema(description = "List of target departments to query (REVENUE, AGRICULTURE, WELFARE)", example = "[\"REVENUE\", \"AGRICULTURE\", \"WELFARE\"]", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<String> requestedDepartments;
}
