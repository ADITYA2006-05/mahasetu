package com.mahasetu.interop.controller;

import com.mahasetu.interop.dto.ErrorResponse;
import com.mahasetu.interop.dto.integration.IntegrationRequestDto;
import com.mahasetu.interop.dto.integration.IntegrationResponseDto;
import com.mahasetu.interop.service.IntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/integration")
@RequiredArgsConstructor
@Tag(name = "Federated Integration Engine", description = "Phase 4 Core Interoperability API for requesting and aggregating data across Revenue, Agriculture, and Welfare departments.")
@SecurityRequirement(name = "BearerAuth")
public class IntegrationController {

    private final IntegrationService integrationService;

    @PostMapping("/request")
    @PreAuthorize("hasAnyRole('DEPARTMENT_OFFICER', 'ADMIN', 'SYSTEM')")
    @Operation(
        summary = "Initiate Federated Integration Request",
        description = "Requests cross-department data federation for a citizen across Revenue, Agriculture, and Welfare systems with SLA tracking, timeout resilience, and audit persistence."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Integration request executed successfully (may result in SUCCESS or PARTIAL_SUCCESS)",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = IntegrationResponseDto.class),
                examples = @ExampleObject(
                    name = "Full Success Example",
                    value = """
                    {
                      "requestId": "REQ-20260828-A1B2C3",
                      "citizenId": "MH-CIT-10001",
                      "status": "SUCCESS",
                      "purpose": "SUBSIDY_VERIFICATION",
                      "requestingUser": "officer.revenue",
                      "departmentResponses": [
                        {
                          "department": "REVENUE",
                          "status": "SUCCESS",
                          "responseTimeMs": 120
                        },
                        {
                          "department": "AGRICULTURE",
                          "status": "SUCCESS",
                          "responseTimeMs": 95
                        },
                        {
                          "department": "WELFARE",
                          "status": "SUCCESS",
                          "responseTimeMs": 110
                        }
                      ]
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Validation failure (missing citizenId, empty departments, etc.)",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - Missing or invalid JWT token",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - Requires ROLE_DEPARTMENT_OFFICER, ROLE_ADMIN, or ROLE_SYSTEM",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Citizen not found in master canonical registry",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    public ResponseEntity<IntegrationResponseDto> initiateIntegrationRequest(
        @Valid @RequestBody IntegrationRequestDto requestDto
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String requestingUser = (auth != null) ? auth.getName() : "OFFICER";

        log.info("REST: Received integration request for citizen [{}] from user [{}]", requestDto.getCitizenId(), requestingUser);
        IntegrationResponseDto response = integrationService.processIntegrationRequest(requestDto, requestingUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/requests/{requestId}")
    @PreAuthorize("hasAnyRole('DEPARTMENT_OFFICER', 'ADMIN', 'SYSTEM')")
    @Operation(summary = "Get Integration Request By Correlation ID", description = "Fetches the full execution log and department results for a given request ID.")
    public ResponseEntity<IntegrationResponseDto> getRequestDetails(@PathVariable String requestId) {
        IntegrationResponseDto response = integrationService.getRequestByRequestId(requestId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('DEPARTMENT_OFFICER', 'ADMIN', 'SYSTEM')")
    @Operation(summary = "Get Recent Integration Requests Log", description = "Fetches recent federated requests for auditing and telemetry.")
    public ResponseEntity<List<IntegrationResponseDto>> getRecentRequests() {
        List<IntegrationResponseDto> history = integrationService.getRecentRequests();
        return ResponseEntity.ok(history);
    }
}
