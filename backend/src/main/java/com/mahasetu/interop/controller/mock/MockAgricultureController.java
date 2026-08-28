package com.mahasetu.interop.controller.mock;

import com.mahasetu.interop.dto.mock.AgricultureFarmerResponseDto;
import com.mahasetu.interop.dto.mock.MockDepartmentHealthDto;
import com.mahasetu.interop.service.mock.MockAgricultureService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/mock/agriculture")
@RequiredArgsConstructor
public class MockAgricultureController {

    private final MockAgricultureService mockAgricultureService;

    @GetMapping("/farmers/{citizenId}")
    public ResponseEntity<AgricultureFarmerResponseDto> getFarmerProfile(@PathVariable String citizenId) {
        log.info("Mock Agriculture API: Querying farmer profile for citizen [{}]", citizenId);
        AgricultureFarmerResponseDto response = mockAgricultureService.getFarmerProfile(citizenId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<MockDepartmentHealthDto> getHealth() {
        MockDepartmentHealthDto health = mockAgricultureService.getHealth();
        HttpStatus status = "UP".equalsIgnoreCase(health.getStatus()) ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return ResponseEntity.status(status).body(health);
    }
}
