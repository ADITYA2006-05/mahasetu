package com.mahasetu.interop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistrictDistributionDto {
    private String code;
    private String name;
    private long citizensCount;
    private long villagesCount;
}
