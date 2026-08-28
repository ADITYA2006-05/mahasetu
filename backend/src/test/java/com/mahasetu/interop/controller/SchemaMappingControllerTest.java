package com.mahasetu.interop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahasetu.interop.dto.canonical.SchemaMappingDto;
import com.mahasetu.interop.dto.canonical.TransformTestRequestDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SchemaMappingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/schema-mappings returns 200 OK with list of all mappings for ADMIN")
    void testAdminCanListMappings() throws Exception {
        mockMvc.perform(get("/api/schema-mappings")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(18))))
                .andExpect(jsonPath("$[0].sourceField", notNullValue()))
                .andExpect(jsonPath("$[0].canonicalField", notNullValue()));
    }

    @Test
    @WithMockUser(roles = "DEPARTMENT_OFFICER")
    @DisplayName("GET /api/schema-mappings?departmentCode=REV returns 200 OK with Revenue mappings for OFFICER")
    void testOfficerCanFilterMappingsByDepartment() throws Exception {
        mockMvc.perform(get("/api/schema-mappings")
                .param("departmentCode", "REV")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(6))))
                .andExpect(jsonPath("$[0].departmentCode", is("REV")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/schema-mappings creates new mapping successfully for ADMIN")
    void testAdminCanCreateMapping() throws Exception {
        SchemaMappingDto newDto = SchemaMappingDto.builder()
            .departmentCode("REV")
            .sourceField("tax_assessment_ref")
            .canonicalField("land.taxAssessment")
            .dataType("STRING")
            .transformationRule("DIRECT_MAP")
            .version("1.0")
            .description("Maps tax assessment reference to land tax canonical model")
            .isActive(true)
            .build();

        mockMvc.perform(post("/api/schema-mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.sourceField", is("tax_assessment_ref")))
                .andExpect(jsonPath("$.canonicalField", is("land.taxAssessment")));
    }

    @Test
    @WithMockUser(roles = "DEPARTMENT_OFFICER")
    @DisplayName("POST /api/schema-mappings returns 403 FORBIDDEN when attempted by DEPARTMENT_OFFICER")
    void testOfficerForbiddenFromCreatingMapping() throws Exception {
        SchemaMappingDto dto = SchemaMappingDto.builder()
            .departmentCode("REV")
            .sourceField("unauthorized_field")
            .canonicalField("land.unauthorized")
            .build();

        mockMvc.perform(post("/api/schema-mappings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/schema-mappings/transform executes live transformation sandbox for ADMIN & OFFICER")
    void testTransformSandbox() throws Exception {
        TransformTestRequestDto testRequest = TransformTestRequestDto.builder()
            .departmentCode("REV")
            .rawData(Map.of(
                "citizen_name", "Kailas Salunkhe",
                "survey_no", "SN-502",
                "area_acres", 3.45,
                "district_name", "Nashik"
            ))
            .build();

        mockMvc.perform(post("/api/schema-mappings/transform")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.citizen.name", is("Kailas Salunkhe")))
                .andExpect(jsonPath("$.land.surveyNumber", is("SN-502")))
                .andExpect(jsonPath("$.land.areaAcres", is(3.45)))
                .andExpect(jsonPath("$.location.district", is("Nashik")));
    }
}
