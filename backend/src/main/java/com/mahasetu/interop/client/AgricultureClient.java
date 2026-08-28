package com.mahasetu.interop.client;

import com.mahasetu.interop.dto.integration.DepartmentExecutionResult;
import com.mahasetu.interop.dto.mock.AgricultureFarmerResponseDto;
import com.mahasetu.interop.exception.ResourceNotFoundException;
import com.mahasetu.interop.exception.ServiceUnavailableException;
import com.mahasetu.interop.service.mock.MockAgricultureService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AgricultureClient implements DepartmentClient {

    private final MockAgricultureService mockAgricultureService;

    @Override
    public String getDepartmentCode() {
        return "AGRICULTURE";
    }

    @Override
    public String getShortCode() {
        return "AGR";
    }

    @Override
    public String getDepartmentName() {
        return "Department of Agriculture (Farmer & Crop Registry)";
    }

    @Override
    public DepartmentExecutionResult executeRequest(String citizenId, String resolvedIdentifier, String endpointPath) {
        long startTime = System.currentTimeMillis();
        String targetEndpoint = (endpointPath != null && !endpointPath.isBlank()) 
            ? endpointPath 
            : "/api/mock/agriculture/farmers/" + citizenId;

        try {
            log.info("Integration Engine -> AgricultureClient: Requesting farmer profile for citizen [{}] at endpoint [{}]", citizenId, targetEndpoint);
            AgricultureFarmerResponseDto result = mockAgricultureService.getFarmerProfile(citizenId);
            long elapsed = Math.max(1L, System.currentTimeMillis() - startTime);

            return DepartmentExecutionResult.builder()
                .departmentCode(getDepartmentCode())
                .shortCode(getShortCode())
                .departmentName(getDepartmentName())
                .status("SUCCESS")
                .responseTimeMs(elapsed)
                .departmentSpecificId(resolvedIdentifier)
                .endpointQueried(targetEndpoint)
                .rawPayload(result)
                .build();

        } catch (ServiceUnavailableException ex) {
            long elapsed = Math.max(1L, System.currentTimeMillis() - startTime);
            log.warn("Integration Engine -> AgricultureClient: Department OFFLINE for citizen [{}] - {}", citizenId, ex.getMessage());
            return DepartmentExecutionResult.builder()
                .departmentCode(getDepartmentCode())
                .shortCode(getShortCode())
                .departmentName(getDepartmentName())
                .status("FAILED")
                .responseTimeMs(elapsed)
                .departmentSpecificId(resolvedIdentifier)
                .endpointQueried(targetEndpoint)
                .errorCode("SERVICE_UNAVAILABLE")
                .errorMessage("Department of Agriculture API gateway is currently OFFLINE (Simulated State Outage)")
                .build();

        } catch (ResourceNotFoundException ex) {
            long elapsed = Math.max(1L, System.currentTimeMillis() - startTime);
            log.warn("Integration Engine -> AgricultureClient: Record not found for citizen [{}] - {}", citizenId, ex.getMessage());
            return DepartmentExecutionResult.builder()
                .departmentCode(getDepartmentCode())
                .shortCode(getShortCode())
                .departmentName(getDepartmentName())
                .status("FAILED")
                .responseTimeMs(elapsed)
                .departmentSpecificId(resolvedIdentifier)
                .endpointQueried(targetEndpoint)
                .errorCode("RECORD_NOT_FOUND")
                .errorMessage("No farmer registration profiles registered for citizen in Department of Agriculture.")
                .build();

        } catch (Exception ex) {
            long elapsed = Math.max(1L, System.currentTimeMillis() - startTime);
            log.error("Integration Engine -> AgricultureClient: Unexpected failure querying citizen [{}]", citizenId, ex);
            return DepartmentExecutionResult.builder()
                .departmentCode(getDepartmentCode())
                .shortCode(getShortCode())
                .departmentName(getDepartmentName())
                .status("FAILED")
                .responseTimeMs(elapsed)
                .departmentSpecificId(resolvedIdentifier)
                .endpointQueried(targetEndpoint)
                .errorCode("GATEWAY_CONNECTION_ERROR")
                .errorMessage("Unable to establish secure connection to Agriculture gateway.")
                .build();
        }
    }
}
