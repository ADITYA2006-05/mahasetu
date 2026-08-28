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
public class ServiceHealthDto {
    private Long id;
    private String departmentCode;
    private String departmentName;
    private String serviceName;
    private String serviceCode;
    private String endpoint;
    private String httpMethod;
    private String status; // ACTIVE, ONLINE, OFFLINE
    private Long responseTimeMs;
    private String schemaVersion;
    private OffsetDateTime lastChecked;
}
