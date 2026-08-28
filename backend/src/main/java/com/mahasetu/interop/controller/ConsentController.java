package com.mahasetu.interop.controller;

import com.mahasetu.interop.dto.consent.ConsentDto;
import com.mahasetu.interop.dto.consent.CreateConsentDto;
import com.mahasetu.interop.service.ConsentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/consents")
@RequiredArgsConstructor
@Tag(name = "Consent Management", description = "Citizen-centric Data Sharing Consent and Purpose Limitation APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class ConsentController {

    private final ConsentService consentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN', 'SYSTEM')")
    @Operation(summary = "Grant new citizen consent", description = "Allows a citizen (or Admin) to grant purposeful, time-bound data sharing consent with specific data scopes.")
    public ResponseEntity<ConsentDto> createConsent(
            @Valid @RequestBody CreateConsentDto dto,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        log.info("API: User [{}] creating consent for purpose [{}] with scopes {}", username, dto.getPurpose(), dto.getScopes());
        ConsentDto created = consentService.createConsent(dto, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CITIZEN', 'DEPARTMENT_OFFICER', 'ADMIN', 'SYSTEM')")
    @Operation(summary = "List citizen consents", description = "Retrieves active/revoked consents. Citizens see only their own; Admins see state-wide agreements.")
    public ResponseEntity<List<ConsentDto>> listConsents(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        return ResponseEntity.ok(consentService.getConsentsForUser(username));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN', 'SYSTEM')")
    @Operation(summary = "Get consent by ID", description = "Retrieves specific consent agreement metadata.")
    public ResponseEntity<ConsentDto> getConsentById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        return ResponseEntity.ok(consentService.getConsentById(id, username));
    }

    @PutMapping("/{id}/revoke")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN', 'SYSTEM')")
    @Operation(summary = "Revoke active consent", description = "Instantly revokes an active consent agreement. Future integration queries for this purpose/scope will be rejected.")
    public ResponseEntity<ConsentDto> revokeConsent(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        log.info("API: User [{}] revoking consent ID [{}]", username, id);
        return ResponseEntity.ok(consentService.revokeConsent(id, username));
    }
}
