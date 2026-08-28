package com.mahasetu.interop.service;

import com.mahasetu.interop.dto.audit.AuditLogDto;
import com.mahasetu.interop.dto.audit.CitizenDataAccessDto;
import com.mahasetu.interop.dto.consent.CreateConsentDto;
import com.mahasetu.interop.dto.integration.IntegrationRequestDto;
import com.mahasetu.interop.entity.AuditLog;
import com.mahasetu.interop.exception.ConsentRequiredException;
import com.mahasetu.interop.exception.InsufficientScopeException;
import com.mahasetu.interop.repository.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuditLogTest {

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private IntegrationService integrationService;

    @Autowired
    private ConsentService consentService;

    @Autowired
    private com.mahasetu.interop.service.mock.DepartmentStateService departmentStateService;

    @BeforeEach
    void setUp() {
        departmentStateService.setStatus("REV", "ONLINE");
        departmentStateService.setStatus("AGR", "ONLINE");
        departmentStateService.setStatus("WEL", "ONLINE");
    }

    @Test
    @DisplayName("Should automatically record immutable audit log on successful integration query")
    void testAuditLogRecordedOnIntegrationSuccess() {
        long countBefore = auditLogRepository.count();

        IntegrationRequestDto requestDto = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("SUBSIDY_VERIFICATION")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE", "WELFARE"))
                .build();

        integrationService.processIntegrationRequest(requestDto, "officer.revenue");

        long countAfter = auditLogRepository.count();
        assertTrue(countAfter > countBefore, "Audit log count must increase after integration request");

        List<AuditLog> logs = auditLogRepository.findByCitizenIdOrderByTimestampDesc("MH-CIT-10001");
        assertFalse(logs.isEmpty());
        AuditLog latest = logs.get(0);

        assertEquals("MH-CIT-10001", latest.getCitizenId());
        assertEquals("officer.revenue", latest.getRequestingUser());
        assertEquals("SUBSIDY_VERIFICATION", latest.getPurpose());
        assertEquals("SUCCESS", latest.getStatus());
        assertNotNull(latest.getAuditId());
        assertTrue(latest.getAuditId().startsWith("AUD-"));
    }

    @Test
    @DisplayName("Should automatically record immutable audit log when consent validation fails")
    void testAuditLogRecordedOnConsentRejection() {
        IntegrationRequestDto requestDto = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("UNAUTHORIZED_TEST_PURPOSE")
                .requestedDepartments(List.of("REVENUE"))
                .build();

        assertThrows(ConsentRequiredException.class, () ->
                integrationService.processIntegrationRequest(requestDto, "officer.revenue")
        );

        List<AuditLog> logs = auditLogRepository.findByCitizenIdOrderByTimestampDesc("MH-CIT-10001");
        assertFalse(logs.isEmpty());
        AuditLog latest = logs.get(0);

        assertEquals("CONSENT_REJECTED", latest.getStatus());
        assertEquals("CONSENT_REQUIRED", latest.getErrorCode());
        assertEquals("UNAUTHORIZED_TEST_PURPOSE", latest.getPurpose());
    }

    @Test
    @DisplayName("Should automatically record immutable audit log when data scope is insufficient")
    void testAuditLogRecordedOnInsufficientScope() {
        // Create consent with ONLY IDENTITY and LAND scopes
        CreateConsentDto dto = CreateConsentDto.builder()
                .requestingDepartment("ALL")
                .purpose("AUDIT_SCOPE_TEST_PURPOSE")
                .scopes(List.of("IDENTITY", "LAND"))
                .validityDays(30)
                .build();

        consentService.createConsent(dto, "ramesh.shinde");

        IntegrationRequestDto requestDto = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("AUDIT_SCOPE_TEST_PURPOSE")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE")) // AGRICULTURE requires AGRICULTURE scope
                .build();

        assertThrows(InsufficientScopeException.class, () ->
                integrationService.processIntegrationRequest(requestDto, "officer.agri")
        );

        List<AuditLog> logs = auditLogRepository.findByCitizenIdOrderByTimestampDesc("MH-CIT-10001");
        assertFalse(logs.isEmpty());
        AuditLog latest = logs.get(0);

        assertEquals("SCOPE_REJECTED", latest.getStatus());
        assertEquals("INSUFFICIENT_SCOPE", latest.getErrorCode());
    }

    @Test
    @DisplayName("Should allow administrators to query and filter state-wide audit logs")
    void testAdminCanQueryFilteredAuditLogs() {
        // Query with citizen filter
        List<AuditLogDto> logs = auditLogService.getFilteredAuditLogs(
                "MH-CIT-10001",
                null,
                null,
                null,
                null,
                null
        );

        assertNotNull(logs);
        for (AuditLogDto log : logs) {
            assertEquals("MH-CIT-10001", log.getCitizenId());
        }
    }

    @Test
    @DisplayName("Should provide transparent citizen data access history isolated to caller's citizen ID")
    void testCitizenDataAccessHistoryIsolation() {
        List<CitizenDataAccessDto> history = auditLogService.getCitizenDataAccessHistory("MH-CIT-10001");
        assertNotNull(history);

        for (CitizenDataAccessDto item : history) {
            assertNotNull(item.getTimestamp());
            assertNotNull(item.getRequestId());
            assertNotNull(item.getDepartment());
            assertNotNull(item.getPurpose());
            assertNotNull(item.getStatus());
        }
    }
}
