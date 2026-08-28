package com.mahasetu.interop.dto.integration;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.mahasetu.interop.dto.canonical.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Aggregated unified response from MahaSetu integration engine with standardized canonical model")
public class IntegrationResponseDto {

    @Schema(description = "Unique correlation request ID", example = "REQ-4B5DB3F0")
    private String requestId;

    @Schema(description = "Citizen identifier", example = "MH-CIT-10001")
    private String citizenId;

    @Schema(description = "Aggregated request execution status", example = "SUCCESS")
    private String status; // SUCCESS, PARTIAL_SUCCESS, FAILED

    @Schema(description = "Purpose of integration request", example = "SUBSIDY_VERIFICATION")
    private String purpose;

    @Schema(description = "Officer or system user who initiated the request", example = "officer.revenue")
    private String requestingUser;

    // --- Phase 5 Standardized Canonical Data Model Sections ---

    @Schema(description = "Canonical Citizen Identity")
    private CanonicalCitizenDto citizen;

    @Schema(description = "Canonical Geographic Location")
    private CanonicalLocationDto location;

    @Schema(description = "Canonical Land Record (Revenue Source)")
    private CanonicalLandDto land;

    @Schema(description = "Canonical Agriculture & Crop Profile (Agriculture Source)")
    private CanonicalAgricultureDto agriculture;

    @Schema(description = "Canonical Social Welfare Record (Welfare Source)")
    private CanonicalWelfareDto welfare;

    @Schema(description = "List of responding data sources contributing to canonical model", example = "[\"REVENUE\", \"AGRICULTURE\", \"WELFARE\"]")
    private List<String> sources;

    // --- Phase 4 Department Telemetry & Execution Tracing ---

    @Schema(description = "List of individual department responses and status telemetry")
    private List<DepartmentResponseItemDto> departmentResponses;

    @Schema(description = "Timestamp when request was initiated")
    private OffsetDateTime createdAt;

    @Schema(description = "Timestamp when request finished execution")
    private OffsetDateTime completedAt;

    @Schema(description = "Total roundtrip latency in milliseconds across all department federations")
    private Long totalLatencyMs;
}
