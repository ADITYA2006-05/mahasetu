package com.mahasetu.interop.controller.mock;

import com.mahasetu.interop.dto.mock.MockDepartmentHealthDto;
import com.mahasetu.interop.dto.mock.RevenueCitizenResponseDto;
import com.mahasetu.interop.service.mock.MockRevenueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/mock/revenue")
@RequiredArgsConstructor
public class MockRevenueController {

    private final MockRevenueService mockRevenueService;

    @GetMapping("/citizens/{citizenId}")
    public ResponseEntity<RevenueCitizenResponseDto> getCitizenLandRecord(@PathVariable String citizenId) {
        log.info("Mock Revenue API: Querying 7/12 land record for citizen [{}]", citizenId);
        RevenueCitizenResponseDto response = mockRevenueService.getCitizenLandRecord(citizenId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<MockDepartmentHealthDto> getHealth() {
        MockDepartmentHealthDto health = mockRevenueService.getHealth();
        HttpStatus status = "UP".equalsIgnoreCase(health.getStatus()) ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return ResponseEntity.status(status).body(health);
    }
}
