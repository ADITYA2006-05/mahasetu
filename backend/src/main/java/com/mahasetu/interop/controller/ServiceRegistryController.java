package com.mahasetu.interop.controller;

import com.mahasetu.interop.dto.monitoring.ServiceHealthDto;
import com.mahasetu.interop.service.MonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceRegistryController {

    private final MonitoringService monitoringService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEPARTMENT_OFFICER', 'SYSTEM')")
    public ResponseEntity<List<ServiceHealthDto>> getAllServices() {
        List<ServiceHealthDto> services = monitoringService.getServiceHealthList();
        return ResponseEntity.ok(services);
    }
}
