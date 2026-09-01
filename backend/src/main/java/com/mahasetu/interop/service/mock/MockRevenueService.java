package com.mahasetu.interop.service.mock;

import com.mahasetu.interop.dto.mock.MockDepartmentHealthDto;
import com.mahasetu.interop.dto.mock.RevenueCitizenResponseDto;
import com.mahasetu.interop.entity.RevenueLandRecord;
import com.mahasetu.interop.exception.ResourceNotFoundException;
import com.mahasetu.interop.exception.ServiceUnavailableException;
import com.mahasetu.interop.repository.RevenueLandRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class MockRevenueService {

    private final RevenueLandRecordRepository revenueLandRecordRepository;
    private final DepartmentStateService departmentStateService;
    private final com.mahasetu.interop.service.CitizenProvisioningService citizenProvisioningService;

    private static final double HECTARE_TO_ACRES = 2.47105;

    @Transactional(noRollbackFor = {ServiceUnavailableException.class, ResourceNotFoundException.class})
    public RevenueCitizenResponseDto getCitizenLandRecord(String citizenId) {
        checkDepartmentAvailability();

        RevenueLandRecord record = revenueLandRecordRepository.findFirstByCitizen_CitizenId(citizenId.trim())
            .orElseGet(() -> {
                citizenProvisioningService.getOrCreateCitizen(citizenId.trim(), null, null, null);
                return revenueLandRecordRepository.findFirstByCitizen_CitizenId(citizenId.trim())
                    .orElseThrow(() -> new ResourceNotFoundException(
                        "Citizen with ID '" + citizenId + "' was not found in Revenue Department (7/12) records."));
            });

        double totalHa = record.getTotalAreaHectares() != null ? record.getTotalAreaHectares().doubleValue() : 0.0;
        double acres = BigDecimal.valueOf(totalHa * HECTARE_TO_ACRES)
            .setScale(2, RoundingMode.HALF_UP)
            .doubleValue();

        return RevenueCitizenResponseDto.builder()
            .citizenName(record.getCitizen().getFullName())
            .districtName(record.getDistrict().getName())
            .talukaName(record.getTaluka().getName())
            .villageName(record.getVillage().getName())
            .surveyNo(record.getSurveyNumber())
            .areaAcres(acres)
            .build();
    }

    public MockDepartmentHealthDto getHealth() {
        boolean isOnline = departmentStateService.isOnline("REV");
        String gatewayState = departmentStateService.getStatus("REV");

        return MockDepartmentHealthDto.builder()
            .department("REV")
            .departmentName("Revenue & Forest Department (Legacy Land Record System)")
            .status(isOnline ? "UP" : "DOWN")
            .gatewayState(gatewayState)
            .serviceCode("REV_LAND_RECORD_MOCK_V1")
            .latencyMs(isOnline ? 42L : 0L)
            .timestamp(OffsetDateTime.now())
            .build();
    }

    private void checkDepartmentAvailability() {
        if (!departmentStateService.isOnline("REV")) {
            throw new ServiceUnavailableException("REV",
                "Revenue & Forest Department (7/12) API gateway is currently OFFLINE (Simulated State Outage).");
        }
    }
}
