package com.mahasetu.interop.controller;

import com.mahasetu.interop.dto.audit.CitizenDataAccessDto;
import com.mahasetu.interop.entity.User;
import com.mahasetu.interop.exception.ResourceNotFoundException;
import com.mahasetu.interop.repository.UserRepository;
import com.mahasetu.interop.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/citizen")
@RequiredArgsConstructor
@Tag(name = "Citizen Data Access", description = "Citizen Transparency and Data Access History APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class CitizenDataAccessController {

    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    @GetMapping("/data-access")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN', 'SYSTEM')")
    @Operation(summary = "Get citizen data access log", description = "Allows a citizen to see exactly which department accessed their data, timestamp, purpose, and scope.")
    public ResponseEntity<List<CitizenDataAccessDto>> getPersonalDataAccessHistory(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        String citizenId = user.getCitizenId() != null && !user.getCitizenId().isBlank() 
                ? user.getCitizenId() 
                : "MH-CIT-10001";

        log.info("API: Fetching personal data access history for citizen [{}] (user: [{}])", citizenId, username);
        List<CitizenDataAccessDto> history = auditLogService.getCitizenDataAccessHistory(citizenId);
        return ResponseEntity.ok(history);
    }
}
