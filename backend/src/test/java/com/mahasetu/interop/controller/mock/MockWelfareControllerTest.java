package com.mahasetu.interop.controller.mock;

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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MockWelfareControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DepartmentStateService departmentStateService;

    @BeforeEach
    void setUp() {
        departmentStateService.setStatus("WEL", "ONLINE");
    }

    @Test
    @DisplayName("GET /api/mock/welfare/beneficiaries/MH-CIT-10001 returns 200 OK and valid beneficiary schema")
    void testGetBeneficiaryRecordSuccess() throws Exception {
        mockMvc.perform(get("/api/mock/welfare/beneficiaries/MH-CIT-10001")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.beneficiary_name", is("Ramesh Tukaram Shinde")))
                .andExpect(jsonPath("$.scheme_code", startsWith("SCH-")))
                .andExpect(jsonPath("$.scheme_name", notNullValue()))
                .andExpect(jsonPath("$.previous_benefit", is(true)))
                .andExpect(jsonPath("$.application_status", is("APPROVED")))
                .andExpect(jsonPath("$.benefit_amount", greaterThan(0.0)));
    }

    @Test
    @DisplayName("GET /api/mock/welfare/beneficiaries/MH-CIT-99999 returns 404 Not Found for unknown citizen")
    void testGetBeneficiaryRecordNotFound() throws Exception {
        mockMvc.perform(get("/api/mock/welfare/beneficiaries/MH-CIT-99999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message", containsString("not found in Social Justice & Welfare Department")));
    }

    @Test
    @DisplayName("GET /api/mock/welfare/health returns 200 OK with UP status when department is ONLINE")
    void testGetWelfareHealthOnline() throws Exception {
        mockMvc.perform(get("/api/mock/welfare/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.department", is("WEL")))
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.gateway_state", is("ONLINE")));
    }

    @Test
    @DisplayName("GET /api/mock/welfare/beneficiaries/MH-CIT-10001 returns 503 Service Unavailable when department is OFFLINE")
    void testGetBeneficiaryRecordOfflineOutage() throws Exception {
        // 1. Simulate department going OFFLINE
        departmentStateService.setStatus("WEL", "OFFLINE");

        // 2. Query data API
        mockMvc.perform(get("/api/mock/welfare/beneficiaries/MH-CIT-10001"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status", is(503)))
                .andExpect(jsonPath("$.error", is("Service Unavailable")))
                .andExpect(jsonPath("$.message", containsString("OFFLINE")));

        // 3. Query health API
        mockMvc.perform(get("/api/mock/welfare/health"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.department", is("WEL")))
                .andExpect(jsonPath("$.status", is("DOWN")))
                .andExpect(jsonPath("$.gateway_state", is("OFFLINE")));
    }
}
