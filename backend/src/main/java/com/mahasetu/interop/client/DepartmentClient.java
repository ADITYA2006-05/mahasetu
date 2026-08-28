package com.mahasetu.interop.client;

import com.mahasetu.interop.dto.integration.DepartmentExecutionResult;

public interface DepartmentClient {
    String getDepartmentCode();
    String getShortCode();
    String getDepartmentName();
    DepartmentExecutionResult executeRequest(String citizenId, String resolvedIdentifier, String endpointPath);
}
