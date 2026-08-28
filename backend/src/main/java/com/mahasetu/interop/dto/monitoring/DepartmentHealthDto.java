package com.mahasetu.interop.dto.monitoring;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentHealthDto {
    private String departmentCode; // REV, AGR, WEL
    private String departmentName;
    private String status; // ONLINE, OFFLINE, DEGRADED
    private Long responseTimeMs;
    private String endpoint;
    private String healthStatus; // UP, DOWN
    private String details;
    private OffsetDateTime lastChecked;
}
