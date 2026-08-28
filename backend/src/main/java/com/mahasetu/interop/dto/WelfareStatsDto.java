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
public class WelfareStatsDto {
    private long totalBeneficiaries;
    private BigDecimal totalMonthlyDisbursementInr;
    private Map<String, Long> disbursementStatusBreakdown;
    private Map<String, Long> schemesBreakdown;
}
