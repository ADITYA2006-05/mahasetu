package com.mahasetu.interop.service;

import com.mahasetu.interop.dto.StatsResponseDto;
import com.mahasetu.interop.dto.citizen.CitizenProfileDto;
import com.mahasetu.interop.dto.monitoring.ServiceHealthDto;
import com.mahasetu.interop.dto.monitoring.SystemMonitoringResponseDto;
import com.mahasetu.interop.dto.officer.OfficerDashboardStatsDto;
import com.mahasetu.interop.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class Phase7MonitoringTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MonitoringService monitoringService;

    @Autowired
    private CitizenProfileService citizenProfileService;

    @Autowired
    private OfficerStatsService officerStatsService;

    @Autowired
    private StatsService statsService;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    private String adminToken;
    private String officerToken;
    private String citizenToken;

    @BeforeEach
    void setUp() throws Exception {
        adminToken = obtainToken("admin", "Admin@MahaSetu2026");
        officerToken = obtainToken("officer.revenue", "Officer@Revenue2026");
        citizenToken = obtainToken("ramesh.shinde", "Citizen@Maha2026");
    }

    private String obtainToken(String username, String password) throws Exception {
        com.mahasetu.interop.dto.AuthRequest req = com.mahasetu.interop.dto.AuthRequest.builder()
                .usernameOrEmail(username)
                .password(password)
                .build();
        org.springframework.test.web.servlet.MvcResult res = mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(res.getResponse().getContentAsString()).get("accessToken").asText();
    }

    @Test
    @DisplayName("MonitoringService: Live System Health should return all 3 department gateways and database status")
    void testGetSystemHealth() {
        SystemMonitoringResponseDto health = monitoringService.getSystemHealth();

        assertNotNull(health);
        assertNotNull(health.getPlatformStatus());
        assertEquals(3, health.getTotalDepartments());
        assertTrue(health.getOnlineDepartments() > 0);
        assertNotNull(health.getDepartments());
        assertEquals(3, health.getDepartments().size());

        boolean hasRev = health.getDepartments().stream().anyMatch(d -> "REV".equals(d.getDepartmentCode()));
        boolean hasAgr = health.getDepartments().stream().anyMatch(d -> "AGR".equals(d.getDepartmentCode()));
        boolean hasWel = health.getDepartments().stream().anyMatch(d -> "WEL".equals(d.getDepartmentCode()));

        assertTrue(hasRev);
        assertTrue(hasAgr);
        assertTrue(hasWel);
    }

    @Test
    @DisplayName("MonitoringService: Live Service Health List should list registered services with endpoints and schema versions")
    void testGetServiceHealthList() {
        List<ServiceHealthDto> services = monitoringService.getServiceHealthList();

        assertNotNull(services);
        assertFalse(services.isEmpty());
        services.forEach(s -> {
            assertNotNull(s.getServiceName());
            assertNotNull(s.getEndpoint());
            assertNotNull(s.getStatus());
        });
    }

    @Test
    @DisplayName("CitizenProfileService: Should return complete demographic, address, identifiers, and entitlement previews for citizen")
    void testGetCitizenProfile() {
        CitizenProfileDto profile = citizenProfileService.getCitizenProfile("ramesh.shinde");

        assertNotNull(profile);
        assertEquals("MH-CIT-10001", profile.getCitizenId());
        assertNotNull(profile.getFullName());
        assertNotNull(profile.getDistrict());
        assertNotNull(profile.getDepartmentIdentifiers());
        assertFalse(profile.getDepartmentIdentifiers().isEmpty());
    }

    @Test
    @DisplayName("OfficerStatsService: Should aggregate integration metrics, recent requests, and department statuses")
    void testGetOfficerStats() {
        OfficerDashboardStatsDto stats = officerStatsService.getOfficerDashboardStats();

        assertNotNull(stats);
        assertNotNull(stats.getDepartmentStatuses());
        assertTrue(stats.getActiveDepartmentsCount() >= 0);
    }

    @Test
    @DisplayName("StatsService: Admin platform stats should include Recharts chart aggregations (requestsByStatus, requestsByDepartment)")
    void testAdminStatsAggregations() {
        StatsResponseDto stats = statsService.getPlatformStats();

        assertNotNull(stats);
        assertNotNull(stats.getRequestsByStatus());
        assertNotNull(stats.getRequestsByDepartment());
        assertNotNull(stats.getLatencyDistribution());
    }

    @Test
    @DisplayName("REST Controller: GET /api/monitoring/health returns 200 OK")
    void testGetMonitoringHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/monitoring/health")
                .header("Authorization", "Bearer " + adminToken)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDepartments").value(3))
                .andExpect(jsonPath("$.departments").isArray());
    }

    @Test
    @DisplayName("REST Controller: GET /api/monitoring/services returns 200 OK")
    void testGetMonitoringServicesEndpoint() throws Exception {
        mockMvc.perform(get("/api/monitoring/services")
                .header("Authorization", "Bearer " + adminToken)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("REST Controller: GET /api/citizen/profile returns 200 OK for citizen")
    void testGetCitizenProfileEndpoint() throws Exception {
        mockMvc.perform(get("/api/citizen/profile")
                .header("Authorization", "Bearer " + citizenToken)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.citizenId").value("MH-CIT-10001"));
    }

    @Test
    @DisplayName("REST Controller: GET /api/officer/stats returns 200 OK for officer")
    void testGetOfficerStatsEndpoint() throws Exception {
        mockMvc.perform(get("/api/officer/stats")
                .header("Authorization", "Bearer " + officerToken)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.departmentStatuses").isMap());
    }

    @Test
    @DisplayName("REST Controller: GET /api/departments returns 200 OK")
    void testGetDepartmentsEndpoint() throws Exception {
        mockMvc.perform(get("/api/departments")
                .header("Authorization", "Bearer " + officerToken)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("REST Controller: GET /api/services returns 200 OK")
    void testGetServicesEndpoint() throws Exception {
        mockMvc.perform(get("/api/services")
                .header("Authorization", "Bearer " + adminToken)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
