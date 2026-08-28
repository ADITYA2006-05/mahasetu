package com.mahasetu.interop.dto.integration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentExecutionResult {
    private String departmentCode; // Normalized code: REVENUE, AGRICULTURE, WELFARE
    private String shortCode;      // REV, AGR, WEL
    private String departmentName;
    private String status;         // SUCCESS, FAILED
    private long responseTimeMs;
    private String departmentSpecificId;
    private String endpointQueried;
    private Object rawPayload;
    private String errorCode;
    private String errorMessage;
}
