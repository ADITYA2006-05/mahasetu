package com.mahasetu.interop.service.mock;

import com.mahasetu.interop.dto.mock.MockDepartmentHealthDto;
import com.mahasetu.interop.dto.mock.WelfareBeneficiaryResponseDto;
import com.mahasetu.interop.entity.WelfareBeneficiaryRecord;
import com.mahasetu.interop.exception.ResourceNotFoundException;
import com.mahasetu.interop.exception.ServiceUnavailableException;
import com.mahasetu.interop.repository.WelfareBeneficiaryRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class MockWelfareService {

    private final WelfareBeneficiaryRecordRepository welfareBeneficiaryRecordRepository;
    private final DepartmentStateService departmentStateService;

    @Transactional(readOnly = true, noRollbackFor = {ServiceUnavailableException.class, ResourceNotFoundException.class})
    public WelfareBeneficiaryResponseDto getBeneficiaryRecord(String citizenId) {
        checkDepartmentAvailability();

        WelfareBeneficiaryRecord record = welfareBeneficiaryRecordRepository.findFirstByCitizen_CitizenId(citizenId.trim())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Citizen with ID '" + citizenId + "' was not found in Social Justice & Welfare Department beneficiary records."));

        String appStatus = "REJECTED".equalsIgnoreCase(record.getDisbursementStatus()) ? "REJECTED" : "APPROVED";
        double amount = record.getMonthlyStipendInr() != null ? record.getMonthlyStipendInr().doubleValue() : 0.0;

        return WelfareBeneficiaryResponseDto.builder()
            .beneficiaryName(record.getCitizen().getFullName())
            .schemeCode(record.getSchemeCode())
            .schemeName(record.getSchemeName())
            .previousBenefit(true)
            .applicationStatus(appStatus)
            .benefitAmount(amount)
            .build();
    }

    public MockDepartmentHealthDto getHealth() {
        boolean isOnline = departmentStateService.isOnline("WEL");
        String gatewayState = departmentStateService.getStatus("WEL");

        return MockDepartmentHealthDto.builder()
            .department("WEL")
            .departmentName("Social Justice & Welfare Department (DBT & Beneficiary Ledger)")
            .status(isOnline ? "UP" : "DOWN")
            .gatewayState(gatewayState)
            .serviceCode("WEL_BENEFICIARY_MOCK_V1")
            .latencyMs(isOnline ? 35L : 0L)
            .timestamp(OffsetDateTime.now())
            .build();
    }

    private void checkDepartmentAvailability() {
        if (!departmentStateService.isOnline("WEL")) {
            throw new ServiceUnavailableException("WEL",
                "Social Justice & Welfare Department API gateway is currently OFFLINE (Simulated State Outage).");
        }
    }
}
