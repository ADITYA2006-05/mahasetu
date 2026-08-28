package com.mahasetu.interop.service.mock;

import com.mahasetu.interop.dto.mock.AgricultureFarmerResponseDto;
import com.mahasetu.interop.dto.mock.MockDepartmentHealthDto;
import com.mahasetu.interop.entity.AgricultureFarmerProfile;
import com.mahasetu.interop.exception.ResourceNotFoundException;
import com.mahasetu.interop.exception.ServiceUnavailableException;
import com.mahasetu.interop.repository.AgricultureFarmerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class MockAgricultureService {

    private final AgricultureFarmerProfileRepository agricultureFarmerProfileRepository;
    private final DepartmentStateService departmentStateService;

    @Transactional(readOnly = true, noRollbackFor = {ServiceUnavailableException.class, ResourceNotFoundException.class})
    public AgricultureFarmerResponseDto getFarmerProfile(String citizenId) {
        checkDepartmentAvailability();

        AgricultureFarmerProfile profile = agricultureFarmerProfileRepository.findFirstByCitizen_CitizenId(citizenId.trim())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Citizen with ID '" + citizenId + "' was not found in Agriculture Department farmer registration profiles."));

        String surveyNo = "SN-" + (100 + profile.getCitizen().getId());
        String usage = profile.getLandholdingHectares() != null ? profile.getLandholdingHectares().toPlainString() + " Ha" : "0.0000 Ha";

        return AgricultureFarmerResponseDto.builder()
            .farmerName(profile.getCitizen().getFullName())
            .district(profile.getCitizen().getDistrict().getName())
            .landSurveyNumber(surveyNo)
            .cropName(profile.getPrimaryCrop())
            .season("Kharif")
            .landUsage(usage)
            .build();
    }

    public MockDepartmentHealthDto getHealth() {
        boolean isOnline = departmentStateService.isOnline("AGR");
        String gatewayState = departmentStateService.getStatus("AGR");

        return MockDepartmentHealthDto.builder()
            .department("AGR")
            .departmentName("Department of Agriculture (Farmer & Crop Registry)")
            .status(isOnline ? "UP" : "DOWN")
            .gatewayState(gatewayState)
            .serviceCode("AGR_FARMER_PROFILE_MOCK_V1")
            .latencyMs(isOnline ? 38L : 0L)
            .timestamp(OffsetDateTime.now())
            .build();
    }

    private void checkDepartmentAvailability() {
        if (!departmentStateService.isOnline("AGR")) {
            throw new ServiceUnavailableException("AGR",
                "Department of Agriculture API gateway is currently OFFLINE (Simulated State Outage).");
        }
    }
}
