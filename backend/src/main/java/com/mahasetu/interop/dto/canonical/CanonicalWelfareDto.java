package com.mahasetu.interop.dto.canonical;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Canonical Social Welfare & DBT Beneficiary Profile")
public class CanonicalWelfareDto {

    @Schema(description = "Welfare Scheme Code", example = "SCH-SGNY-01")
    private String schemeCode;

    @Schema(description = "Welfare Scheme Full Title", example = "Sanjay Gandhi Niradhar Anudan Yojana")
    private String schemeName;

    @Schema(description = "Flag indicating previous benefit entitlement", example = "true")
    private Boolean previousBenefit;

    @Schema(description = "Current Benefit Application Status", example = "APPROVED")
    private String applicationStatus;

    @Schema(description = "Monthly Benefit Disbursement Amount in INR", example = "1500.0")
    private Double benefitAmount;

    @Schema(description = "Originating Department Source", example = "WELFARE")
    @Builder.Default
    private String source = "WELFARE";
}
