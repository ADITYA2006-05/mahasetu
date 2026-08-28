package com.mahasetu.interop.dto.consent;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@Schema(description = "Citizen Consent record DTO")
public class ConsentDto {

    @Schema(description = "Database ID")
    private Long id;

    @Schema(description = "Unique Consent Identifier", example = "CNS-A1B2C3D4")
    private String consentId;

    @Schema(description = "Citizen Master Identifier", example = "MH-CIT-10001")
    private String citizenId;

    @Schema(description = "Citizen Full Name", example = "Ramesh Tukaram Shinde")
    private String citizenName;

    @Schema(description = "Authorized Requesting Department", example = "AGRICULTURE")
    private String requestingDepartment;

    @Schema(description = "Authorized Purpose", example = "SUBSIDY_VERIFICATION")
    private String purpose;

    @Schema(description = "Consent Status (ACTIVE, REVOKED, EXPIRED)", example = "ACTIVE")
    private String status;

    @Schema(description = "List of approved data scopes", example = "[\"IDENTITY\", \"LAND\", \"AGRICULTURE\", \"WELFARE\"]")
    private List<String> scopes;

    @Schema(description = "Timestamp when consent was granted")
    private OffsetDateTime createdAt;

    @Schema(description = "Timestamp when consent will expire")
    private OffsetDateTime expiresAt;

    @Schema(description = "Timestamp when consent was revoked")
    private OffsetDateTime revokedAt;
}
