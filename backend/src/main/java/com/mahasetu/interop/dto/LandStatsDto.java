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
public class LandStatsDto {
    private BigDecimal totalAreaHectares;
    private BigDecimal cultivableAreaHectares;
    private long totalRecords;
    private Map<String, Long> landTypeBreakdown;
}
