package com.mahasetu.interop.dto.mock;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MockDepartmentHealthDto {

    private String department;

    @JsonProperty("department_name")
    private String departmentName;

    private String status; // UP, DOWN, DEGRADED

    @JsonProperty("gateway_state")
    private String gatewayState; // ONLINE, OFFLINE

    @JsonProperty("service_code")
    private String serviceCode;

    @JsonProperty("latency_ms")
    private Long latencyMs;

    private OffsetDateTime timestamp;
}
