package com.mahasetu.interop.dto.audit;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Citizen-facing personal data access history log")
public class CitizenDataAccessDto {

    @Schema(description = "Access event timestamp")
    private OffsetDateTime timestamp;

    @Schema(description = "Integration Request Correlation ID", example = "REQ-4B5DB3F0")
    private String requestId;

    @Schema(description = "Department which accessed citizen records", example = "Department of Agriculture")
    private String department;

    @Schema(description = "Authorized purpose for accessing data", example = "SUBSIDY_VERIFICATION")
    private String purpose;

    @Schema(description = "Data categories accessed", example = "LAND, AGRICULTURE, WELFARE")
    private String dataAccessed;

    @Schema(description = "Access status", example = "SUCCESS")
    private String status;
}
