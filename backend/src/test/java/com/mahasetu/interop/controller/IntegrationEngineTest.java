package com.mahasetu.interop.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahasetu.interop.dto.AuthRequest;
import com.mahasetu.interop.dto.integration.IntegrationRequestDto;
import com.mahasetu.interop.entity.IntegrationRequest;
import com.mahasetu.interop.entity.IntegrationRequestResult;
import com.mahasetu.interop.repository.IntegrationRequestRepository;
import com.mahasetu.interop.repository.IntegrationRequestResultRepository;
import com.mahasetu.interop.service.mock.DepartmentStateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class IntegrationEngineTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DepartmentStateService departmentStateService;

    @Autowired
    private IntegrationRequestRepository integrationRequestRepository;

    @Autowired
    private IntegrationRequestResultRepository integrationRequestResultRepository;

    private String officerToken;
    private String adminToken;
    private String citizenToken;

    @BeforeEach
    void setUp() throws Exception {
        // Reset all department gateways to ONLINE
        departmentStateService.setStatus("REV", "ONLINE");
        departmentStateService.setStatus("AGR", "ONLINE");
        departmentStateService.setStatus("WEL", "ONLINE");

        // Obtain Officer Token
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

    @Test
    @DisplayName("Phase 4 Flow: All 3 Departments ONLINE -> Status SUCCESS with persistence")
    void testAllDepartmentsSuccessful() throws Exception {
        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("SUBSIDY_VERIFICATION")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE", "WELFARE"))
                .build();

        MvcResult result = mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + officerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.citizenId", is("MH-CIT-10001")))
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.requestId", startsWith("REQ-")))
                .andExpect(jsonPath("$.departmentResponses", hasSize(3)))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='REVENUE')].status", contains("SUCCESS")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='AGRICULTURE')].status", contains("SUCCESS")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='WELFARE')].status", contains("SUCCESS")))
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        String reqId = responseNode.get("requestId").asText();

        // Verify Database Persistence
        assertThat(integrationRequestRepository.findByRequestId(reqId)).isPresent();
        IntegrationRequest saved = integrationRequestRepository.findByRequestId(reqId).get();
        assertThat(saved.getStatus()).isEqualTo("SUCCESS");
        assertThat(saved.getCitizenId()).isEqualTo("MH-CIT-10001");
        assertThat(saved.getRequestingUser()).isEqualTo("officer.revenue");

        List<IntegrationRequestResult> results = integrationRequestResultRepository.findByIntegrationRequest_RequestId(reqId);
        assertThat(results).hasSize(3);
        assertThat(results).allMatch(r -> "SUCCESS".equals(r.getStatus()));
    }

    @Test
    @DisplayName("Phase 4 Error Handling: Unknown citizen returns 404 NOT_FOUND")
    void testUnknownCitizen() throws Exception {
        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-99999")
                .purpose("LAND_AUDIT")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE"))
                .build();

        mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + officerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", containsString("MH-CIT-99999")));
    }

    @Test
    @DisplayName("Phase 4 Security: Citizen role is FORBIDDEN from calling integration engine")
    void testUnauthorizedUserCitizen() throws Exception {
        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("UNAUTHORIZED_ACCESS")
                .requestedDepartments(List.of("REVENUE"))
                .build();

        mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + citizenToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("Phase 4 Security: Unauthenticated request returns 401 UNAUTHORIZED")
    void testUnauthenticatedUser() throws Exception {
        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("SUBSIDY_VERIFICATION")
                .requestedDepartments(List.of("REVENUE"))
                .build();

        mockMvc.perform(post("/api/integration/request")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("Phase 4 Resilience: Agriculture OFFLINE -> PARTIAL_SUCCESS")
    void testAgricultureOfflinePartialSuccess() throws Exception {
        // Set Agriculture OFFLINE
        departmentStateService.setStatus("AGR", "OFFLINE");

        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("SUBSIDY_VERIFICATION")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE", "WELFARE"))
                .build();

        mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + officerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PARTIAL_SUCCESS")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='REVENUE')].status", contains("SUCCESS")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='AGRICULTURE')].status", contains("FAILED")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='AGRICULTURE')].errorCode", contains("SERVICE_UNAVAILABLE")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='WELFARE')].status", contains("SUCCESS")));
    }

    @Test
    @DisplayName("Phase 4 Resilience: Revenue OFFLINE -> PARTIAL_SUCCESS")
    void testRevenueOfflinePartialSuccess() throws Exception {
        // Set Revenue OFFLINE
        departmentStateService.setStatus("REV", "OFFLINE");

        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("LAND_VERIFICATION")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE", "WELFARE"))
                .build();

        mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + officerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PARTIAL_SUCCESS")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='REVENUE')].status", contains("FAILED")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='REVENUE')].errorCode", contains("SERVICE_UNAVAILABLE")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='AGRICULTURE')].status", contains("SUCCESS")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='WELFARE')].status", contains("SUCCESS")));
    }

    @Test
    @DisplayName("Phase 4 Resilience: Welfare OFFLINE -> PARTIAL_SUCCESS")
    void testWelfareOfflinePartialSuccess() throws Exception {
        // Set Welfare OFFLINE
        departmentStateService.setStatus("WEL", "OFFLINE");

        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("BENEFIT_AUDIT")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE", "WELFARE"))
                .build();

        mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + officerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PARTIAL_SUCCESS")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='REVENUE')].status", contains("SUCCESS")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='AGRICULTURE')].status", contains("SUCCESS")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='WELFARE')].status", contains("FAILED")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='WELFARE')].errorCode", contains("SERVICE_UNAVAILABLE")));
    }

    @Test
    @DisplayName("Phase 4 Resilience: Multiple Departments OFFLINE (REV & AGR) -> PARTIAL_SUCCESS")
    void testMultipleDepartmentsOfflinePartialSuccess() throws Exception {
        departmentStateService.setStatus("REV", "OFFLINE");
        departmentStateService.setStatus("AGR", "OFFLINE");

        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("MULTI_DEPT_TEST")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE", "WELFARE"))
                .build();

        mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + officerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PARTIAL_SUCCESS")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='REVENUE')].status", contains("FAILED")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='AGRICULTURE')].status", contains("FAILED")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='WELFARE')].status", contains("SUCCESS")));
    }

    @Test
    @DisplayName("Phase 4 Failure: All 3 Departments OFFLINE -> Status FAILED")
    void testAllDepartmentsOfflineFailed() throws Exception {
        departmentStateService.setStatus("REV", "OFFLINE");
        departmentStateService.setStatus("AGR", "OFFLINE");
        departmentStateService.setStatus("WEL", "OFFLINE");

        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("ALL_OFFLINE_TEST")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE", "WELFARE"))
                .build();

        mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + officerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("FAILED")))
                .andExpect(jsonPath("$.departmentResponses", hasSize(3)))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='REVENUE')].status", contains("FAILED")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='AGRICULTURE')].status", contains("FAILED")))
                .andExpect(jsonPath("$.departmentResponses[?(@.department=='WELFARE')].status", contains("FAILED")));
    }

    @Test
    @DisplayName("Phase 4 Validation: Missing citizen ID returns 400 BAD_REQUEST")
    void testInvalidRequestMissingCitizen() throws Exception {
        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("")
                .purpose("TEST")
                .requestedDepartments(List.of("REVENUE"))
                .build();

        mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + officerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
    }

    @Test
    @DisplayName("Phase 4 Validation: Empty departments list returns 400 BAD_REQUEST")
    void testInvalidRequestEmptyDepartments() throws Exception {
        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10001")
                .purpose("TEST")
                .requestedDepartments(List.of())
                .build();

        mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + officerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
    }

    @Test
    @DisplayName("Phase 4 History & Query: GET /api/integration/history and GET /api/integration/requests/{id}")
    void testHistoryAndSingleRequestQuery() throws Exception {
        // 1. Create a request
        IntegrationRequestDto request = IntegrationRequestDto.builder()
                .citizenId("MH-CIT-10002")
                .purpose("SCHEME_VERIFY")
                .requestedDepartments(List.of("REVENUE", "AGRICULTURE"))
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/integration/request")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        String reqId = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("requestId").asText();

        // 2. Query by requestId
        mockMvc.perform(get("/api/integration/requests/" + reqId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId", is(reqId)))
                .andExpect(jsonPath("$.citizenId", is("MH-CIT-10002")))
                .andExpect(jsonPath("$.status", is("SUCCESS")));

        // 3. Query history
        mockMvc.perform(get("/api/integration/history")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())));
    }
}
