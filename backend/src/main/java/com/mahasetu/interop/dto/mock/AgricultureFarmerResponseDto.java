package com.mahasetu.interop.dto.mock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgricultureFarmerResponseDto {

    private String farmerName;

    private String district;

    private String landSurveyNumber;

    private String cropName;

    private String season;

    private String landUsage;
}
