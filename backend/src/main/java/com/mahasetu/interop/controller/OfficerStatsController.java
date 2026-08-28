package com.mahasetu.interop.controller;

import com.mahasetu.interop.dto.officer.OfficerDashboardStatsDto;
import com.mahasetu.interop.service.OfficerStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/officer/stats")
@RequiredArgsConstructor
public class OfficerStatsController {

    private final OfficerStatsService officerStatsService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DEPARTMENT_OFFICER', 'ADMIN', 'SYSTEM')")
    public ResponseEntity<OfficerDashboardStatsDto> getOfficerStats() {
        OfficerDashboardStatsDto stats = officerStatsService.getOfficerDashboardStats();
        return ResponseEntity.ok(stats);
    }
}
