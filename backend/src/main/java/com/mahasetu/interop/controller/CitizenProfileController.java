package com.mahasetu.interop.controller;

import com.mahasetu.interop.dto.citizen.CitizenProfileDto;
import com.mahasetu.interop.service.CitizenProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/citizen/profile")
@RequiredArgsConstructor
public class CitizenProfileController {

    private final CitizenProfileService citizenProfileService;

    @GetMapping
    @PreAuthorize("hasAnyRole('CITIZEN', 'DEPARTMENT_OFFICER', 'ADMIN', 'SYSTEM')")
    public ResponseEntity<CitizenProfileDto> getProfile(
            @RequestParam(required = false) String citizenId,
            Authentication authentication
    ) {
        String username = authentication.getName();
        boolean isAdminOrOfficer = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") 
                        || a.getAuthority().equals("ROLE_SYSTEM") 
                        || a.getAuthority().equals("ROLE_DEPARTMENT_OFFICER"));

        CitizenProfileDto profile;
        if (citizenId != null && !citizenId.isBlank() && isAdminOrOfficer) {
            profile = citizenProfileService.getCitizenProfileById(citizenId);
        } else {
            profile = citizenProfileService.getCitizenProfile(username);
        }

        return ResponseEntity.ok(profile);
    }
}
