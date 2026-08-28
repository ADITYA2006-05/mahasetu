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
public class RevenueCitizenResponseDto {

    @JsonProperty("citizen_name")
    private String citizenName;

    @JsonProperty("district_name")
    private String districtName;

    @JsonProperty("taluka_name")
    private String talukaName;

    @JsonProperty("village_name")
    private String villageName;

    @JsonProperty("survey_no")
    private String surveyNo;

    @JsonProperty("area_acres")
    private Double areaAcres;
}
