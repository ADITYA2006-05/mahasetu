package com.mahasetu.interop.dto.monitoring;

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
public class SystemMonitoringResponseDto {
    private String platformStatus; // HEALTHY, DEGRADED, CRITICAL
    private int totalDepartments;
    private int onlineDepartments;
    private int offlineDepartments;
    private Long averageGatewayLatencyMs;
    private String databaseStatus; // CONNECTED, DISCONNECTED
    private OffsetDateTime timestamp;
    private List<DepartmentHealthDto> departments;
    private Map<String, Object> systemMetrics;
}
