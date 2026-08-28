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
@Schema(description = "Immutable State-wide Audit Log Record")
public class AuditLogDto {

    @Schema(description = "Database ID")
    private Long id;

    @Schema(description = "Unique Audit Correlation ID", example = "AUD-1A2B3C4D")
    private String auditId;

    @Schema(description = "Associated Integration Request ID", example = "REQ-4B5DB3F0")
    private String requestId;

    @Schema(description = "Target Citizen ID", example = "MH-CIT-10001")
    private String citizenId;

    @Schema(description = "Officer or user who initiated the query", example = "officer.revenue")
    private String requestingUser;

    @Schema(description = "Requesting Department / Source Node", example = "AGRICULTURE")
    private String requestingDepartment;

    @Schema(description = "Target Department / Queried Gateway", example = "REVENUE")
    private String targetDepartment;

    @Schema(description = "Target Service Endpoint", example = "/api/integration/request")
    private String targetService;

    @Schema(description = "Authorized Purpose", example = "SUBSIDY_VERIFICATION")
    private String purpose;

    @Schema(description = "Data Scope queried", example = "IDENTITY, LAND, AGRICULTURE, WELFARE")
    private String dataScope;

    @Schema(description = "Execution Status", example = "SUCCESS")
    private String status; // SUCCESS, PARTIAL_SUCCESS, FAILED, CONSENT_REJECTED, SCOPE_REJECTED

    @Schema(description = "Roundtrip latency in milliseconds", example = "85")
    private Long responseTimeMs;

    @Schema(description = "Error code if failed or rejected", example = "CONSENT_REQUIRED")
    private String errorCode;

    @Schema(description = "Timestamp when audit event occurred")
    private OffsetDateTime timestamp;
}
