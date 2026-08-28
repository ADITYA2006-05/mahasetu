package com.mahasetu.interop.controller;

import com.mahasetu.interop.dto.StatsResponseDto;
import com.mahasetu.interop.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM')")
    public ResponseEntity<StatsResponseDto> getStats() {
        StatsResponseDto stats = statsService.getPlatformStats();
        return ResponseEntity.ok(stats);
    }
}
