package com.mahasetu.interop.client;

import com.mahasetu.interop.dto.integration.DepartmentExecutionResult;
import com.mahasetu.interop.dto.mock.RevenueCitizenResponseDto;
import com.mahasetu.interop.exception.ResourceNotFoundException;
import com.mahasetu.interop.exception.ServiceUnavailableException;
import com.mahasetu.interop.service.mock.MockRevenueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RevenueClient implements DepartmentClient {

    private final MockRevenueService mockRevenueService;

    @Override
    public String getDepartmentCode() {
        return "REVENUE";
    }

    @Override
    public String getShortCode() {
        return "REV";
    }

    @Override
    public String getDepartmentName() {
        return "Revenue & Forest Department (7/12 Land Records)";
    }

    @Override
    public DepartmentExecutionResult executeRequest(String citizenId, String resolvedIdentifier, String endpointPath) {
        long startTime = System.currentTimeMillis();
        String targetEndpoint = (endpointPath != null && !endpointPath.isBlank()) 
            ? endpointPath 
            : "/api/mock/revenue/citizens/" + citizenId;

        try {
            log.info("Integration Engine -> RevenueClient: Requesting 7/12 records for citizen [{}] at endpoint [{}]", citizenId, targetEndpoint);
            RevenueCitizenResponseDto result = mockRevenueService.getCitizenLandRecord(citizenId);
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
            log.warn("Integration Engine -> RevenueClient: Department OFFLINE for citizen [{}] - {}", citizenId, ex.getMessage());
            return DepartmentExecutionResult.builder()
                .departmentCode(getDepartmentCode())
                .shortCode(getShortCode())
                .departmentName(getDepartmentName())
                .status("FAILED")
                .responseTimeMs(elapsed)
                .departmentSpecificId(resolvedIdentifier)
                .endpointQueried(targetEndpoint)
                .errorCode("SERVICE_UNAVAILABLE")
                .errorMessage("Revenue & Forest Department API gateway is currently OFFLINE (Simulated State Outage)")
                .build();

        } catch (ResourceNotFoundException ex) {
            long elapsed = Math.max(1L, System.currentTimeMillis() - startTime);
            log.warn("Integration Engine -> RevenueClient: Record not found for citizen [{}] - {}", citizenId, ex.getMessage());
            return DepartmentExecutionResult.builder()
                .departmentCode(getDepartmentCode())
                .shortCode(getShortCode())
                .departmentName(getDepartmentName())
                .status("FAILED")
                .responseTimeMs(elapsed)
                .departmentSpecificId(resolvedIdentifier)
                .endpointQueried(targetEndpoint)
                .errorCode("RECORD_NOT_FOUND")
                .errorMessage("No land records registered for citizen in Revenue Department.")
                .build();

        } catch (Exception ex) {
            long elapsed = Math.max(1L, System.currentTimeMillis() - startTime);
            log.error("Integration Engine -> RevenueClient: Unexpected failure querying citizen [{}]", citizenId, ex);
            return DepartmentExecutionResult.builder()
                .departmentCode(getDepartmentCode())
                .shortCode(getShortCode())
                .departmentName(getDepartmentName())
                .status("FAILED")
                .responseTimeMs(elapsed)
                .departmentSpecificId(resolvedIdentifier)
                .endpointQueried(targetEndpoint)
                .errorCode("GATEWAY_CONNECTION_ERROR")
                .errorMessage("Unable to establish secure connection to Revenue gateway.")
                .build();
        }
    }
}
