package com.mahasetu.interop.dto.consent;

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
@Schema(description = "Request payload for granting new citizen consent")
public class CreateConsentDto {

    @Schema(description = "Target Citizen ID (Optional for citizens, derived from auth; required for admin)", example = "MH-CIT-10001")
    private String citizenId;

    @NotBlank(message = "Requesting department is required (AGRICULTURE, REVENUE, WELFARE, or ALL)")
    @Schema(description = "Authorized requesting department code or 'ALL'", example = "AGRICULTURE", requiredMode = Schema.RequiredMode.REQUIRED)
    private String requestingDepartment;

    @NotBlank(message = "Purpose is required")
    @Schema(description = "Authorized purpose for data sharing", example = "SUBSIDY_VERIFICATION", requiredMode = Schema.RequiredMode.REQUIRED)
    private String purpose;

    @NotEmpty(message = "At least one data scope must be selected")
    @Schema(description = "Approved data scopes (IDENTITY, LOCATION, LAND, AGRICULTURE, WELFARE)", example = "[\"IDENTITY\", \"LAND\", \"AGRICULTURE\", \"WELFARE\"]", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<String> scopes;

    @Schema(description = "Consent validity period in days (e.g. 30, 90, 365)", example = "90")
    @Builder.Default
    private Integer validityDays = 90;
}
