package com.mahasetu.interop.dto.mock;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WelfareBeneficiaryResponseDto {

    @JsonProperty("beneficiary_name")
    private String beneficiaryName;

    @JsonProperty("scheme_code")
    private String schemeCode;

    @JsonProperty("scheme_name")
    private String schemeName;

    @JsonProperty("previous_benefit")
    private Boolean previousBenefit;

    @JsonProperty("application_status")
    private String applicationStatus;

    @JsonProperty("benefit_amount")
    private Double benefitAmount;
}
