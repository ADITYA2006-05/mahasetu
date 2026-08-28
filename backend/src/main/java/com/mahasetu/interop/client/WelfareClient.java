package com.mahasetu.interop.client;

import com.mahasetu.interop.dto.integration.DepartmentExecutionResult;
import com.mahasetu.interop.dto.mock.WelfareBeneficiaryResponseDto;
import com.mahasetu.interop.exception.ResourceNotFoundException;
import com.mahasetu.interop.exception.ServiceUnavailableException;
import com.mahasetu.interop.service.mock.MockWelfareService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WelfareClient implements DepartmentClient {

    private final MockWelfareService mockWelfareService;

    @Override
    public String getDepartmentCode() {
        return "WELFARE";
    }

    @Override
    public String getShortCode() {
        return "WEL";
    }

    @Override
    public String getDepartmentName() {
        return "Social Justice & Welfare Department (DBT & Beneficiary Ledger)";
    }

    @Override
    public DepartmentExecutionResult executeRequest(String citizenId, String resolvedIdentifier, String endpointPath) {
        long startTime = System.currentTimeMillis();
        String targetEndpoint = (endpointPath != null && !endpointPath.isBlank()) 
            ? endpointPath 
            : "/api/mock/welfare/beneficiaries/" + citizenId;

        try {
            log.info("Integration Engine -> WelfareClient: Requesting beneficiary record for citizen [{}] at endpoint [{}]", citizenId, targetEndpoint);
            WelfareBeneficiaryResponseDto result = mockWelfareService.getBeneficiaryRecord(citizenId);
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
            log.warn("Integration Engine -> WelfareClient: Department OFFLINE for citizen [{}] - {}", citizenId, ex.getMessage());
            return DepartmentExecutionResult.builder()
                .departmentCode(getDepartmentCode())
                .shortCode(getShortCode())
                .departmentName(getDepartmentName())
                .status("FAILED")
                .responseTimeMs(elapsed)
                .departmentSpecificId(resolvedIdentifier)
                .endpointQueried(targetEndpoint)
                .errorCode("SERVICE_UNAVAILABLE")
                .errorMessage("Social Justice & Welfare Department API gateway is currently OFFLINE (Simulated State Outage)")
                .build();

        } catch (ResourceNotFoundException ex) {
            long elapsed = Math.max(1L, System.currentTimeMillis() - startTime);
            log.warn("Integration Engine -> WelfareClient: Record not found for citizen [{}] - {}", citizenId, ex.getMessage());
            return DepartmentExecutionResult.builder()
                .departmentCode(getDepartmentCode())
                .shortCode(getShortCode())
                .departmentName(getDepartmentName())
                .status("FAILED")
                .responseTimeMs(elapsed)
                .departmentSpecificId(resolvedIdentifier)
                .endpointQueried(targetEndpoint)
                .errorCode("RECORD_NOT_FOUND")
                .errorMessage("No welfare beneficiary records registered for citizen in Social Justice Department.")
                .build();

        } catch (Exception ex) {
            long elapsed = Math.max(1L, System.currentTimeMillis() - startTime);
            log.error("Integration Engine -> WelfareClient: Unexpected failure querying citizen [{}]", citizenId, ex);
            return DepartmentExecutionResult.builder()
                .departmentCode(getDepartmentCode())
                .shortCode(getShortCode())
                .departmentName(getDepartmentName())
                .status("FAILED")
                .responseTimeMs(elapsed)
                .departmentSpecificId(resolvedIdentifier)
                .endpointQueried(targetEndpoint)
                .errorCode("GATEWAY_CONNECTION_ERROR")
                .errorMessage("Unable to establish secure connection to Welfare gateway.")
                .build();
        }
    }
}
