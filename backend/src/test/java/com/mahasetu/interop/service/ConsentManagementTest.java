package com.mahasetu.interop.service;

import com.mahasetu.interop.dto.canonical.CanonicalCitizenDto;
import com.mahasetu.interop.dto.consent.ConsentDto;
import com.mahasetu.interop.dto.consent.CreateConsentDto;
import com.mahasetu.interop.dto.integration.IntegrationRequestDto;
import com.mahasetu.interop.dto.integration.IntegrationResponseDto;
import com.mahasetu.interop.entity.Consent;
import com.mahasetu.interop.entity.ConsentScope;
import com.mahasetu.interop.exception.ConsentRequiredException;
import com.mahasetu.interop.exception.InsufficientScopeException;
import com.mahasetu.interop.repository.ConsentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ConsentManagementTest {

    @Autowired
    private ConsentService consentService;

    @Autowired
    private ConsentRepository consentRepository;

    @Autowired
    private IntegrationService integrationService;

    @Autowired
    private com.mahasetu.interop.service.mock.DepartmentStateService departmentStateService;

    @BeforeEach
    void setUp() {
        departmentStateService.setStatus("REV", "ONLINE");
        departmentStateService.setStatus("AGR", "ONLINE");
        departmentStateService.setStatus("WEL", "ONLINE");
    }

    @Test
    @DisplayName("Should successfully create citizen consent with custom scopes and expiry")
    void testCreateConsentSuccess() {
        CreateConsentDto dto = CreateConsentDto.builder()
                .requestingDepartment("AGRICULTURE")
                .purpose("LOAN_SANCTION_INQUIRY")
                .scopes(List.of("IDENTITY", "LAND", "AGRICULTURE"))
                .validityDays(30)
                .build();

        ConsentDto result = consentService.createConsent(dto, "ramesh.shinde");

        assertNotNull(result);
        assertNotNull(result.getConsentId());
        assertTrue(result.getConsentId().startsWith("CNS-"));
        assertEquals("ACTIVE", result.getStatus());
        assertEquals("AGRICULTURE", result.getRequestingDepartment());
        assertEquals("LOAN_SANCTION_INQUIRY", result.getPurpose());
        assertEquals(3, result.getScopes().size());
        assertTrue(result.getScopes().contains("LAND"));
        assertNotNull(result.getExpiresAt());
    }

    @Test
    @DisplayName("Should successfully revoke active citizen consent")
    void testRevokeConsent() {
        // Create initial consent
        CreateConsentDto dto = CreateConsentDto.builder()
                .requestingDepartment("WELFARE")
                .purpose("PENSION_DISBURSEMENT_CHECK")
                .scopes(List.of("IDENTITY", "WELFARE"))
                .validityDays(60)
                .build();

        ConsentDto created = consentService.createConsent(dto, "ramesh.shinde");
        assertNotNull(created.getId());

        // Revoke consent
        ConsentDto revoked = consentService.revokeConsent(created.getId(), "ramesh.shinde");

        assertEquals("REVOKED", revoked.getStatus());
        assertNotNull(revoked.getRevokedAt());
    }

    @Test
    @DisplayName("Should reject validation when citizen consent has expired")
    void testExpiredConsentValidation() {
        // Create expired consent entity directly
        Consent expired = Consent.builder()
                .consentId("CNS-EXPIRED-TEST")
                .citizenId("MH-CIT-10001")
                .requestingDepartment("ALL")
                .purpose("EXPIRED_PURPOSE_TEST")
                .status("ACTIVE")
                .createdAt(OffsetDateTime.now().minusDays(100))
                .expiresAt(OffsetDateTime.now().minusDays(10)) // Expired
                .build();

        List<ConsentScope> scopes = List.of(
                ConsentScope.builder().consent(expired).dataScope("IDENTITY").build(),
                ConsentScope.builder().consent(expired).dataScope("LAND").build()
        );
        expired.setScopes(scopes);
        consentRepository.save(expired);

        assertThrows(ConsentRequiredException.class, () ->
                consentService.validateConsentAndScope("MH-CIT-10001", "REVENUE", "EXPIRED_PURPOSE_TEST", List.of("REVENUE"))
        );
    }

    @Test
    @DisplayName("Should reject validation when requesting purpose does not match active consent")
    void testPurposeMismatchValidation() {
        assertThrows(ConsentRequiredException.class, () ->
                consentService.validateConsentAndScope("MH-CIT-10001", "ALL", "UNAUTHORIZED_COMMERCIAL_PURPOSE", List.of("REVENUE"))
        );
    }

    @Test
    @DisplayName("Should reject validation with INSUFFICIENT_SCOPE when requested data exceeds approved scopes")
    void testInsufficientDataScopeValidation() {
        // Create consent with ONLY IDENTITY and LAND scopes
        CreateConsentDto dto = CreateConsentDto.builder()
                .requestingDepartment("ALL")
                .purpose("LIMITED_LAND_ONLY_PURPOSE")
                .scopes(List.of("IDENTITY", "LAND"))
                .validityDays(30)
                .build();

        consentService.createConsent(dto, "ramesh.shinde");

        // Requesting REVENUE and WELFARE -> WELFARE requires WELFARE scope, which is missing
        assertThrows(InsufficientScopeException.class, () ->
                consentService.validateConsentAndScope("MH-CIT-10001", "ALL", "LIMITED_LAND_ONLY_PURPOSE", List.of("REVENUE", "WELFARE"))
        );
    }

    @Test
    @DisplayName("Should enforce citizen security: Citizen cannot grant consent for another citizen ID")
    void testCitizenCannotCreateConsentForAnotherCitizen() {
        CreateConsentDto dto = CreateConsentDto.builder()
                .citizenId("MH-CIT-10002") // Trying to spoof another citizen
                .requestingDepartment("REVENUE")
                .purpose("SPOOF_TEST")
                .scopes(List.of("IDENTITY", "LAND"))
                .build();

        // kailas.salunkhe is mapped to MH-CIT-10001
        ConsentDto created = consentService.createConsent(dto, "ramesh.shinde");
        // Service automatically enforces caller's own citizen ID
        assertEquals("MH-CIT-10001", created.getCitizenId());
    }

    @Test
    @DisplayName("Should succeed in federated integration when active consent and full scopes exist")
    void testIntegrationSuccessWithActiveConsent() {
        IntegrationRequestDto requestDto = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("SUBSIDY_VERIFICATION")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE", "WELFARE"))
                .build();

        IntegrationResponseDto response = integrationService.processIntegrationRequest(requestDto, "officer.revenue");

        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertEquals("MH-CIT-10001", response.getCitizenId());
        assertNotNull(response.getCitizen());
        assertNotNull(response.getLand());
        assertNotNull(response.getAgriculture());
        assertNotNull(response.getWelfare());
    }

    @Test
    @DisplayName("Should block integration request with CONSENT_REQUIRED when consent is revoked")
    void testIntegrationFailsWhenConsentRevoked() {
        // Create specific purpose consent
        CreateConsentDto dto = CreateConsentDto.builder()
                .requestingDepartment("ALL")
                .purpose("TEMPORARY_SUBSIDY_CHECK")
                .scopes(List.of("IDENTITY", "LAND", "AGRICULTURE", "WELFARE"))
                .validityDays(10)
                .build();

        ConsentDto consent = consentService.createConsent(dto, "ramesh.shinde");

        // Revoke it
        consentService.revokeConsent(consent.getId(), "ramesh.shinde");

        IntegrationRequestDto requestDto = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("TEMPORARY_SUBSIDY_CHECK")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE"))
                .build();

        ConsentRequiredException ex = assertThrows(ConsentRequiredException.class, () ->
                integrationService.processIntegrationRequest(requestDto, "officer.revenue")
        );

        assertEquals("CONSENT_REQUIRED", ex.getErrorCode());
        assertNotNull(ex.getRequestId());
    }
}
