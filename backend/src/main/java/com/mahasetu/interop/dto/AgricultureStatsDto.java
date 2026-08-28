package com.mahasetu.interop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgricultureStatsDto {
    private long totalFarmerProfiles;
    private BigDecimal totalSubsidiesAvailedInr;
    private Map<String, Long> farmerCategoryBreakdown;
    private Map<String, Long> cropBreakdown;
}
