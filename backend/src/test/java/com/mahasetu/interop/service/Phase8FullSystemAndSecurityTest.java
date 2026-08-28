package com.mahasetu.interop.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahasetu.interop.dto.AuthRequest;
import com.mahasetu.interop.dto.consent.CreateConsentDto;
import com.mahasetu.interop.dto.integration.IntegrationRequestDto;
import com.mahasetu.interop.dto.integration.IntegrationResponseDto;
import com.mahasetu.interop.dto.monitoring.SystemMonitoringResponseDto;
import com.mahasetu.interop.entity.Citizen;
import com.mahasetu.interop.repository.*;
import com.mahasetu.interop.service.mock.DepartmentStateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class Phase8FullSystemAndSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DepartmentStateService departmentStateService;

    @Autowired
    private IntegrationService integrationService;

    @Autowired
    private ConsentService consentService;

    @Autowired
    private CitizenRepository citizenRepository;

    @Autowired
    private DepartmentIdentifierRepository departmentIdentifierRepository;

    @Autowired
    private RevenueLandRecordRepository revenueLandRecordRepository;

    @Autowired
    private AgricultureFarmerProfileRepository agricultureFarmerProfileRepository;

    @Autowired
    private WelfareBeneficiaryRecordRepository welfareBeneficiaryRecordRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    private String officerToken;
    private String adminToken;
    private String citizenToken;

    @BeforeEach
    void setUp() throws Exception {
        departmentStateService.setStatus("REV", "ONLINE");
        departmentStateService.setStatus("AGR", "ONLINE");
        departmentStateService.setStatus("WEL", "ONLINE");

        officerToken = obtainToken("officer.revenue", "Officer@Revenue2026");
        adminToken = obtainToken("admin", "Admin@MahaSetu2026");
        citizenToken = obtainToken("ramesh.shinde", "Citizen@Maha2026");
    }

    private String obtainToken(String username, String password) throws Exception {
        AuthRequest req = AuthRequest.builder().usernameOrEmail(username).password(password).build();
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(res.getResponse().getContentAsString()).get("accessToken").asText();
    }

    // =========================================================================
    // 1. FULL END-TO-END DATA FEDERATION FLOW
    // =========================================================================

    @Test
    @DisplayName("Full Flow: Verify MH-CIT-10001 (Ramesh Shinde) with 3 departments")
    void testFullFlowCitizen10001() throws Exception {
        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("SUBSIDY_VERIFICATION")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE", "WELFARE"))
                .build();

        MvcResult res = mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + officerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        IntegrationResponseDto dto = objectMapper.readValue(res.getResponse().getContentAsString(), IntegrationResponseDto.class);
        assertNotNull(dto);
        assertEquals("SUCCESS", dto.getStatus());
        assertEquals("MH-CIT-10001", dto.getCitizenId());
        assertNotNull(dto.getCitizen());
        assertEquals("Ramesh Tukaram Shinde", dto.getCitizen().getName());
        assertNotNull(dto.getLand());
        assertEquals("SN-101", dto.getLand().getSurveyNumber());
        assertNotNull(dto.getAgriculture());
        assertNotNull(dto.getWelfare());
        assertEquals(3, dto.getSources().size());
        assertEquals(3, dto.getDepartmentResponses().size());
    }

    @Test
    @DisplayName("Full Flow: Verify MH-CIT-10002 (Sunita Jadhav) with 3 departments")
    void testFullFlowCitizen10002() throws Exception {
        // Ensure consent for citizen 10002 exists
        consentService.createConsent(CreateConsentDto.builder()
                .citizenId("MH-CIT-10002")
                .requestingDepartment("REVENUE")
                .purpose("SUBSIDY_VERIFICATION")
                .scopes(List.of("IDENTITY", "LOCATION", "LAND", "AGRICULTURE", "WELFARE"))
                .validityDays(365)
                .build(), "officer.revenue");

        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10002")
                .purpose("SUBSIDY_VERIFICATION")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE", "WELFARE"))
                .build();

        MvcResult res = mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + officerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        IntegrationResponseDto dto = objectMapper.readValue(res.getResponse().getContentAsString(), IntegrationResponseDto.class);
        assertNotNull(dto);
        assertEquals("SUCCESS", dto.getStatus());
        assertEquals("MH-CIT-10002", dto.getCitizenId());
        assertNotNull(dto.getCitizen());
        assertEquals("Sunita Baburao Jadhav", dto.getCitizen().getName());
    }

    @Test
    @DisplayName("Full Flow: Verify MH-CIT-10003 (Anand More) with 3 departments")
    void testFullFlowCitizen10003() throws Exception {
        // Ensure consent for citizen 10003 exists
        consentService.createConsent(CreateConsentDto.builder()
                .citizenId("MH-CIT-10003")
                .requestingDepartment("REVENUE")
                .purpose("SUBSIDY_VERIFICATION")
                .scopes(List.of("IDENTITY", "LOCATION", "LAND", "AGRICULTURE", "WELFARE"))
                .validityDays(365)
                .build(), "officer.revenue");

        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10003")
                .purpose("SUBSIDY_VERIFICATION")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE", "WELFARE"))
                .build();

        MvcResult res = mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + officerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        IntegrationResponseDto dto = objectMapper.readValue(res.getResponse().getContentAsString(), IntegrationResponseDto.class);
        assertNotNull(dto);
        assertEquals("SUCCESS", dto.getStatus());
        assertEquals("MH-CIT-10003", dto.getCitizenId());
        assertNotNull(dto.getCitizen());
        assertEquals("Anand Dnyaneshwar More", dto.getCitizen().getName());
    }

    // =========================================================================
    // 2. SECURITY AUDIT & RBAC ENFORCEMENT
    // =========================================================================

    @Test
    @DisplayName("Security: Password hashing matches BCrypt format in database")
    void testPasswordHashingBCrypt() {
        var adminUser = userRepository.findByUsername("admin").orElseThrow();
        assertTrue(adminUser.getPasswordHash().startsWith("$2a$12$") || adminUser.getPasswordHash().startsWith("$2a$") || adminUser.getPasswordHash().startsWith("$2b$"));
        assertTrue(passwordEncoder.matches("Admin@MahaSetu2026", adminUser.getPasswordHash()));
        assertFalse(passwordEncoder.matches("WrongPassword", adminUser.getPasswordHash()));
    }

    @Test
    @DisplayName("Security: Invalid credentials return 401 Unauthorized")
    void testInvalidCredentials401() throws Exception {
        AuthRequest req = AuthRequest.builder().usernameOrEmail("admin").password("WrongPassword123").build();
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Security: Unauthenticated request without JWT returns 401 Unauthorized")
    void testUnauthenticatedRequest401() throws Exception {
        mockMvc.perform(get("/api/stats"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Security: Citizen role attempting to access admin endpoints returns 403 Forbidden")
    void testCitizenForbiddenFromAdminEndpoints403() throws Exception {
        mockMvc.perform(get("/api/stats")
                .header("Authorization", "Bearer " + citizenToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security: Tampered JWT token returns 401 Unauthorized")
    void testTamperedToken401() throws Exception {
        mockMvc.perform(get("/api/stats")
                .header("Authorization", "Bearer " + adminToken + "tamperedSignature"))
                .andExpect(status().isUnauthorized());
    }

    // =========================================================================
    // 3. FAILURE MATRIX & FAULT TOLERANCE
    // =========================================================================

    @Test
    @DisplayName("Failure Matrix: Single Department OFFLINE (Agri) yields PARTIAL_SUCCESS without crash")
    void testAgricultureOfflineFailover() throws Exception {
        departmentStateService.setStatus("AGR", "OFFLINE");

        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("SUBSIDY_VERIFICATION")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE", "WELFARE"))
                .build();

        MvcResult res = mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + officerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        IntegrationResponseDto dto = objectMapper.readValue(res.getResponse().getContentAsString(), IntegrationResponseDto.class);
        assertEquals("PARTIAL_SUCCESS", dto.getStatus());
        assertNotNull(dto.getLand());
        assertNull(dto.getAgriculture());
        assertNotNull(dto.getWelfare());
    }

    @Test
    @DisplayName("Failure Matrix: All 3 Departments OFFLINE yields FAILED overall status without 500 error")
    void testAllDepartmentsOfflineHandledGracefully() throws Exception {
        departmentStateService.setStatus("REV", "OFFLINE");
        departmentStateService.setStatus("AGR", "OFFLINE");
        departmentStateService.setStatus("WEL", "OFFLINE");

        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("SUBSIDY_VERIFICATION")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE", "WELFARE"))
                .build();

        MvcResult res = mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + officerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        IntegrationResponseDto dto = objectMapper.readValue(res.getResponse().getContentAsString(), IntegrationResponseDto.class);
        assertEquals("FAILED", dto.getStatus());
        assertNull(dto.getLand());
        assertNull(dto.getAgriculture());
        assertNull(dto.getWelfare());
    }

    @Test
    @DisplayName("Failure Matrix: Missing consent blocks query with 403 CONSENT_REQUIRED")
    void testMissingConsentBlocksQuery() throws Exception {
        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("UNREGISTERED_UNKNOWN_PURPOSE")
                .requestedDepartments(List.of("REVENUE"))
                .build();

        mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + officerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("CONSENT_REQUIRED"));
    }

    // =========================================================================
    // 4. DATABASE & SYNTHETIC DATASET VALIDATION
    // =========================================================================

    @Test
    @DisplayName("Database: 50 citizens seeded with 100% complete administrative hierarchy")
    void testDatabaseCitizenIntegrity() {
        assertEquals(50, citizenRepository.count());
        List<Citizen> citizens = citizenRepository.findAll();
        for (Citizen c : citizens) {
            assertNotNull(c.getCitizenId());
            assertNotNull(c.getFullName());
            assertNotNull(c.getDistrict());
            assertNotNull(c.getTaluka());
            assertNotNull(c.getVillage());
            assertTrue(c.getCitizenId().startsWith("MH-CIT-"));
        }
    }

    @Test
    @DisplayName("Database: 150 cross-department synthetic identifiers exist across all 50 citizens")
    void testDatabaseDepartmentIdentifiers() {
        assertEquals(150, departmentIdentifierRepository.count());
        assertEquals(50, revenueLandRecordRepository.count());
        assertEquals(50, agricultureFarmerProfileRepository.count());
        assertEquals(50, welfareBeneficiaryRecordRepository.count());
    }
}
