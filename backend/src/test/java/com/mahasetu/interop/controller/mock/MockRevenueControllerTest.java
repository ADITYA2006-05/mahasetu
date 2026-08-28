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
class MockRevenueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DepartmentStateService departmentStateService;

    @BeforeEach
    void setUp() {
        departmentStateService.setStatus("REV", "ONLINE");
    }

    @Test
    @DisplayName("GET /api/mock/revenue/citizens/MH-CIT-10001 returns 200 OK and valid land record schema")
    void testGetCitizenLandRecordSuccess() throws Exception {
        mockMvc.perform(get("/api/mock/revenue/citizens/MH-CIT-10001")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.citizen_name", is("Ramesh Tukaram Shinde")))
                .andExpect(jsonPath("$.district_name", is("Pune")))
                .andExpect(jsonPath("$.taluka_name", notNullValue()))
                .andExpect(jsonPath("$.village_name", notNullValue()))
                .andExpect(jsonPath("$.survey_no", startsWith("SN-")))
                .andExpect(jsonPath("$.area_acres", greaterThan(0.0)));
    }

    @Test
    @DisplayName("GET /api/mock/revenue/citizens/MH-CIT-99999 returns 404 Not Found for unknown citizen")
    void testGetCitizenLandRecordNotFound() throws Exception {
        mockMvc.perform(get("/api/mock/revenue/citizens/MH-CIT-99999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message", containsString("not found in Revenue Department")));
    }

    @Test
    @DisplayName("GET /api/mock/revenue/health returns 200 OK with UP status when department is ONLINE")
    void testGetRevenueHealthOnline() throws Exception {
        mockMvc.perform(get("/api/mock/revenue/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.department", is("REV")))
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.gateway_state", is("ONLINE")));
    }

    @Test
    @DisplayName("GET /api/mock/revenue/citizens/MH-CIT-10001 returns 503 Service Unavailable when department is OFFLINE")
    void testGetCitizenLandRecordOfflineOutage() throws Exception {
        // 1. Simulate department going OFFLINE
        departmentStateService.setStatus("REV", "OFFLINE");

        // 2. Query data API
        mockMvc.perform(get("/api/mock/revenue/citizens/MH-CIT-10001"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status", is(503)))
                .andExpect(jsonPath("$.error", is("Service Unavailable")))
                .andExpect(jsonPath("$.message", containsString("OFFLINE")));

        // 3. Query health API
        mockMvc.perform(get("/api/mock/revenue/health"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.department", is("REV")))
                .andExpect(jsonPath("$.status", is("DOWN")))
                .andExpect(jsonPath("$.gateway_state", is("OFFLINE")));
    }
}
