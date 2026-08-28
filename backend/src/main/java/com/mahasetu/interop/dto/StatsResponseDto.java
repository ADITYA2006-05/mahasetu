package com.mahasetu.interop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponseDto {
    private String status;
    private Map<String, Long> summary;
    private List<DepartmentStatDto> departmentStats;
    private LandStatsDto landStats;
    private AgricultureStatsDto agricultureStats;
    private WelfareStatsDto welfareStats;
    private List<DistrictDistributionDto> districtDistribution;
    
    // Phase 7 Integration Metrics & Chart Data
    private Long totalIntegrationRequests;
    private Long successfulRequests;
    private Long partialRequests;
    private Long failedRequests;
    private Long averageResponseTimeMs;
    private Map<String, Long> requestsByStatus;
    private Map<String, Long> requestsByDepartment;
    private Map<String, Long> latencyDistribution;

    private OffsetDateTime timestamp;
}
