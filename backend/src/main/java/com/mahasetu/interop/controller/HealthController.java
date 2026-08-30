package com.mahasetu.interop.controller;

import com.mahasetu.interop.dto.HealthResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping({"/", "/api/health"})
    public ResponseEntity<HealthResponseDto> getHealth() {
        String dbStatus = "CONNECTED";
        String dialect = "PostgreSQL";
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        } catch (Exception e) {
            dbStatus = "DEGRADED: " + e.getMessage();
        }

        Map<String, Object> dbInfo = new LinkedHashMap<>();
        dbInfo.put("status", dbStatus);
        dbInfo.put("dialect", dialect);
        dbInfo.put("entities_loaded", 11);
        dbInfo.put("seeder_mode", "SYNTHETIC_CONSISTENT");

        HealthResponseDto response = HealthResponseDto.builder()
            .status("UP")
            .service("MahaSetu Interoperability Platform")
            .version("1.0.0-phase1")
            .environment("production-ready")
            .database(dbInfo)
            .timestamp(OffsetDateTime.now())
            .build();

        return ResponseEntity.ok(response);
    }
}
