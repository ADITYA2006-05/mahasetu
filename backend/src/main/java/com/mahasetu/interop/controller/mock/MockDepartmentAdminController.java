package com.mahasetu.interop.controller.mock;

import com.mahasetu.interop.dto.mock.DepartmentStatusResponseDto;
import com.mahasetu.interop.dto.mock.DepartmentStatusUpdateDto;
import com.mahasetu.interop.service.mock.DepartmentStateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mock/admin/departments")
@RequiredArgsConstructor
public class MockDepartmentAdminController {

    private final DepartmentStateService departmentStateService;

    @GetMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, DepartmentStatusResponseDto>> getAllStatuses() {
        return ResponseEntity.ok(departmentStateService.getAllStatuses());
    }

    @PutMapping("/{departmentCode}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentStatusResponseDto> updateDepartmentStatus(
            @PathVariable String departmentCode,
            @Valid @RequestBody DepartmentStatusUpdateDto request) {
        log.info("Admin Action: Updating department [{}] gateway status to [{}]", departmentCode, request.getStatus());
        DepartmentStatusResponseDto response = departmentStateService.setStatus(departmentCode, request.getStatus());
        return ResponseEntity.ok(response);
    }
}
