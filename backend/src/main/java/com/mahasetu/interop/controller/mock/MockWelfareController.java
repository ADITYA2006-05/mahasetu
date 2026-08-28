package com.mahasetu.interop.controller.mock;

import com.mahasetu.interop.dto.mock.MockDepartmentHealthDto;
import com.mahasetu.interop.dto.mock.WelfareBeneficiaryResponseDto;
import com.mahasetu.interop.service.mock.MockWelfareService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/mock/welfare")
@RequiredArgsConstructor
public class MockWelfareController {

    private final MockWelfareService mockWelfareService;

    @GetMapping("/beneficiaries/{citizenId}")
    public ResponseEntity<WelfareBeneficiaryResponseDto> getBeneficiaryRecord(@PathVariable String citizenId) {
        log.info("Mock Welfare API: Querying beneficiary record for citizen [{}]", citizenId);
        WelfareBeneficiaryResponseDto response = mockWelfareService.getBeneficiaryRecord(citizenId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<MockDepartmentHealthDto> getHealth() {
        MockDepartmentHealthDto health = mockWelfareService.getHealth();
        HttpStatus status = "UP".equalsIgnoreCase(health.getStatus()) ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return ResponseEntity.status(status).body(health);
    }
}
