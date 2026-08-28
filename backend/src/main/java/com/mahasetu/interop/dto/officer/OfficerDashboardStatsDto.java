package com.mahasetu.interop.dto.officer;

import com.mahasetu.interop.dto.integration.IntegrationResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficerDashboardStatsDto {
    private long totalRequests;
    private long successfulRequests;
    private long partialRequests;
    private long failedRequests;
    private long averageResponseTimeMs;
    private int activeDepartmentsCount;
    private Map<String, String> departmentStatuses;
    private List<IntegrationResponseDto> recentRequests;
    private OffsetDateTime timestamp;
}
