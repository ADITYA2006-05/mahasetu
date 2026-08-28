package com.mahasetu.interop.controller.mock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahasetu.interop.dto.mock.DepartmentStatusUpdateDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MockDepartmentAdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Admin PUT /api/mock/admin/departments/REV/status changes status to OFFLINE successfully")
    void testAdminUpdateDepartmentStatusOffline() throws Exception {
        DepartmentStatusUpdateDto request = DepartmentStatusUpdateDto.builder()
                .status("OFFLINE")
                .build();

        mockMvc.perform(put("/api/mock/admin/departments/REV/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.departmentCode", is("REV")))
                .andExpect(jsonPath("$.status", is("OFFLINE")))
                .andExpect(jsonPath("$.message", is("Department gateway status successfully updated to OFFLINE")))
                .andExpect(jsonPath("$.updatedAt", notNullValue()));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Admin GET /api/mock/admin/departments/status returns statuses for all 3 departments")
    void testAdminGetAllDepartmentStatuses() throws Exception {
        mockMvc.perform(get("/api/mock/admin/departments/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.REV", notNullValue()))
                .andExpect(jsonPath("$.AGR", notNullValue()))
                .andExpect(jsonPath("$.WEL", notNullValue()));
    }

    @Test
    @WithMockUser(roles = "CITIZEN")
    @DisplayName("Citizen PUT /api/mock/admin/departments/REV/status is rejected with 403 Forbidden")
    void testCitizenForbiddenFromUpdatingDepartmentStatus() throws Exception {
        DepartmentStatusUpdateDto request = DepartmentStatusUpdateDto.builder()
                .status("OFFLINE")
                .build();

        mockMvc.perform(put("/api/mock/admin/departments/REV/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)))
                .andExpect(jsonPath("$.error", is("Forbidden")));
    }

    @Test
    @DisplayName("Unauthenticated PUT /api/mock/admin/departments/REV/status is rejected with 401 Unauthorized")
    void testUnauthenticatedForbiddenFromUpdatingStatus() throws Exception {
        DepartmentStatusUpdateDto request = DepartmentStatusUpdateDto.builder()
                .status("OFFLINE")
                .build();

        mockMvc.perform(put("/api/mock/admin/departments/REV/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")));
    }
}
