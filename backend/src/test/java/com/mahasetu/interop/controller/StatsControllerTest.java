package com.mahasetu.interop.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StatsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/stats returns 200 OK and complete interoperability metrics for ADMIN")
    void testGetStats() throws Exception {
        mockMvc.perform(get("/api/stats")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.summary.totalCitizens", is(50)))
                .andExpect(jsonPath("$.summary.totalDepartments", is(3)))
                .andExpect(jsonPath("$.summary.totalDistricts", is(10)))
                .andExpect(jsonPath("$.summary.totalVillages", is(20)))
                .andExpect(jsonPath("$.summary.totalLandRecords", is(50)))
                .andExpect(jsonPath("$.summary.totalFarmerProfiles", is(50)))
                .andExpect(jsonPath("$.summary.totalWelfareRecords", is(50)))
                .andExpect(jsonPath("$.summary.totalDepartmentIdentifiers", is(150)))
                .andExpect(jsonPath("$.summary.totalServices", is(10)))
                .andExpect(jsonPath("$.summary.totalSchemaMappings", greaterThanOrEqualTo(15)))
                .andExpect(jsonPath("$.departmentStats", hasSize(3)))
                .andExpect(jsonPath("$.districtDistribution", hasSize(10)));
    }
}
