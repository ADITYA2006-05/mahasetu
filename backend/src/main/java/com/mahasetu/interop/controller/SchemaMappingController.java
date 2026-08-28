package com.mahasetu.interop.controller;

import com.mahasetu.interop.dto.canonical.SchemaMappingDto;
import com.mahasetu.interop.dto.canonical.TransformTestRequestDto;
import com.mahasetu.interop.service.SchemaMappingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/schema-mappings")
@RequiredArgsConstructor
@Tag(name = "Schema Mappings", description = "Administrative APIs for managing semantic field mappings and the Canonical Data Model")
@SecurityRequirement(name = "BearerAuth")
public class SchemaMappingController {

    private final SchemaMappingService schemaMappingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEPARTMENT_OFFICER', 'SYSTEM')")
    @Operation(summary = "List all schema mappings", description = "Retrieves active and configured schema mappings, optionally filtered by department code (REV, AGR, WEL).")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Schema mappings retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Requires officer or administrator privileges")
    })
    public ResponseEntity<List<SchemaMappingDto>> listMappings(
            @Parameter(description = "Optional Department Code filter (REV, AGR, WEL)")
            @RequestParam(required = false) String departmentCode) {
        return ResponseEntity.ok(schemaMappingService.getAllMappings(departmentCode));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEPARTMENT_OFFICER', 'SYSTEM')")
    @Operation(summary = "Get schema mapping by ID", description = "Retrieves a single schema mapping definition by its unique identifier.")
    public ResponseEntity<SchemaMappingDto> getMappingById(@PathVariable Long id) {
        return ResponseEntity.ok(schemaMappingService.getMappingById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new schema mapping", description = "Configures a new field transformation rule from legacy department source to canonical target path. (Admin Only)")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Schema mapping created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request validation errors"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Only ROLE_ADMIN can create schema mappings")
    })
    public ResponseEntity<SchemaMappingDto> createMapping(@Valid @RequestBody SchemaMappingDto dto) {
        SchemaMappingDto created = schemaMappingService.createMapping(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update schema mapping", description = "Updates an existing schema mapping definition. (Admin Only)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Schema mapping updated successfully"),
        @ApiResponse(responseCode = "404", description = "Schema mapping ID not found"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Only ROLE_ADMIN can update schema mappings")
    })
    public ResponseEntity<SchemaMappingDto> updateMapping(
            @PathVariable Long id,
            @Valid @RequestBody SchemaMappingDto dto) {
        return ResponseEntity.ok(schemaMappingService.updateMapping(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete schema mapping", description = "Deletes a schema mapping definition from PostgreSQL. (Admin Only)")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Schema mapping deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Schema mapping ID not found"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Only ROLE_ADMIN can delete schema mappings")
    })
    public ResponseEntity<Void> deleteMapping(@PathVariable Long id) {
        schemaMappingService.deleteMapping(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/transform")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEPARTMENT_OFFICER', 'SYSTEM')")
    @Operation(summary = "Test live schema transformation", description = "Interactive testing simulator: transforms sample raw department payload into the canonical data model.")
    public ResponseEntity<Map<String, Object>> testTransformation(@Valid @RequestBody TransformTestRequestDto testRequest) {
        Map<String, Object> canonicalResult = schemaMappingService.transformRawData(
                testRequest.getDepartmentCode(), testRequest.getRawData());
        return ResponseEntity.ok(canonicalResult);
    }
}
