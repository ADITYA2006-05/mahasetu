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
class MockAgricultureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DepartmentStateService departmentStateService;

    @BeforeEach
    void setUp() {
        departmentStateService.setStatus("AGR", "ONLINE");
    }

    @Test
    @DisplayName("GET /api/mock/agriculture/farmers/MH-CIT-10001 returns 200 OK and valid farmer schema")
    void testGetFarmerProfileSuccess() throws Exception {
        mockMvc.perform(get("/api/mock/agriculture/farmers/MH-CIT-10001")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.farmerName", is("Ramesh Tukaram Shinde")))
                .andExpect(jsonPath("$.district", is("Pune")))
                .andExpect(jsonPath("$.landSurveyNumber", startsWith("SN-")))
                .andExpect(jsonPath("$.cropName", notNullValue()))
                .andExpect(jsonPath("$.season", is("Kharif")))
                .andExpect(jsonPath("$.landUsage", containsString("Ha")));
    }

    @Test
    @DisplayName("GET /api/mock/agriculture/farmers/MH-CIT-99999 returns 404 Not Found for unknown citizen")
    void testGetFarmerProfileNotFound() throws Exception {
        mockMvc.perform(get("/api/mock/agriculture/farmers/MH-CIT-99999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message", containsString("not found in Agriculture Department")));
    }

    @Test
    @DisplayName("GET /api/mock/agriculture/health returns 200 OK with UP status when department is ONLINE")
    void testGetAgricultureHealthOnline() throws Exception {
        mockMvc.perform(get("/api/mock/agriculture/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.department", is("AGR")))
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.gateway_state", is("ONLINE")));
    }

    @Test
    @DisplayName("GET /api/mock/agriculture/farmers/MH-CIT-10001 returns 503 Service Unavailable when department is OFFLINE")
    void testGetFarmerProfileOfflineOutage() throws Exception {
        // 1. Simulate department going OFFLINE
        departmentStateService.setStatus("AGR", "OFFLINE");

        // 2. Query data API
        mockMvc.perform(get("/api/mock/agriculture/farmers/MH-CIT-10001"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status", is(503)))
                .andExpect(jsonPath("$.error", is("Service Unavailable")))
                .andExpect(jsonPath("$.message", containsString("OFFLINE")));

        // 3. Query health API
        mockMvc.perform(get("/api/mock/agriculture/health"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.department", is("AGR")))
                .andExpect(jsonPath("$.status", is("DOWN")))
                .andExpect(jsonPath("$.gateway_state", is("OFFLINE")));
    }
}
