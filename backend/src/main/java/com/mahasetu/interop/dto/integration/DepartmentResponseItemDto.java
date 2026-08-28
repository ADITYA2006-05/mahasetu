package com.mahasetu.interop.dto.integration;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Execution result from an individual government department gateway")
public class DepartmentResponseItemDto {

    @Schema(description = "Department identifier code", example = "REVENUE")
    private String department;

    @Schema(description = "Department query execution status", example = "SUCCESS")
    private String status; // SUCCESS, FAILED

    @Schema(description = "Department query response time in milliseconds", example = "120")
    private Long responseTimeMs;

    @Schema(description = "Department specific identifier resolved from crosswalk", example = "MH-REV-KH-10001")
    private String departmentSpecificId;

    @Schema(description = "Service endpoint queried", example = "/api/mock/revenue/citizens/MH-CIT-10001")
    private String serviceEndpoint;

    @Schema(description = "Error code if department call failed", example = "SERVICE_UNAVAILABLE")
    private String errorCode;

    @Schema(description = "Error message if department call failed", example = "Revenue gateway is currently OFFLINE")
    private String errorMessage;
}
