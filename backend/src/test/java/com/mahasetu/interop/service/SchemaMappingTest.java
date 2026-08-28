package com.mahasetu.interop.service;

import com.mahasetu.interop.dto.canonical.*;
import com.mahasetu.interop.dto.integration.IntegrationRequestDto;
import com.mahasetu.interop.dto.integration.IntegrationResponseDto;
import com.mahasetu.interop.service.mock.DepartmentStateService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class SchemaMappingTest {

    @Autowired
    private SchemaMappingService schemaMappingService;

    @Autowired
    private IntegrationService integrationService;

    @Autowired
    private DepartmentStateService departmentStateService;

    @Test
    @DisplayName("Revenue Raw JSON is transformed into canonical citizen, location, and land models")
    void testRevenueTransformation() {
        Map<String, Object> rawRevenue = Map.of(
            "citizen_name", "Ramesh Tukaram Shinde",
            "district_name", "Pune",
            "taluka_name", "Haveli",
            "village_name", "Wagholi",
            "survey_no", "SN-101",
            "area_acres", 1.98
        );

        Map<String, Object> transformed = schemaMappingService.transformRawData("REV", rawRevenue);

        assertNotNull(transformed);
        assertTrue(transformed.containsKey("citizen"));
        assertTrue(transformed.containsKey("location"));
        assertTrue(transformed.containsKey("land"));

        Map<?, ?> citizen = (Map<?, ?>) transformed.get("citizen");
        assertEquals("Ramesh Tukaram Shinde", citizen.get("name"));

        Map<?, ?> location = (Map<?, ?>) transformed.get("location");
        assertEquals("Pune", location.get("district"));
        assertEquals("Haveli", location.get("taluka"));
        assertEquals("Wagholi", location.get("village"));

        Map<?, ?> land = (Map<?, ?>) transformed.get("land");
        assertEquals("SN-101", land.get("surveyNumber"));
        assertEquals(1.98, ((Number) land.get("areaAcres")).doubleValue(), 0.001);
    }

    @Test
    @DisplayName("Agriculture Raw JSON is transformed into canonical citizen, location, and agriculture models")
    void testAgricultureTransformation() {
        Map<String, Object> rawAgri = Map.of(
            "farmerName", "Ramesh Tukaram Shinde",
            "district", "Pune",
            "landSurveyNumber", "SN-101",
            "cropName", "Cotton",
            "season", "Kharif",
            "landUsage", "0.8000 Ha"
        );

        Map<String, Object> transformed = schemaMappingService.transformRawData("AGR", rawAgri);

        assertNotNull(transformed);
        assertTrue(transformed.containsKey("citizen"));
        assertTrue(transformed.containsKey("location"));
        assertTrue(transformed.containsKey("agriculture"));

        Map<?, ?> agriculture = (Map<?, ?>) transformed.get("agriculture");
        assertEquals("Cotton", agriculture.get("crop"));
        assertEquals("Kharif", agriculture.get("season"));
        assertEquals("0.8000 Ha", agriculture.get("landUsage"));
    }

    @Test
    @DisplayName("Welfare Raw JSON is transformed into canonical citizen and welfare models")
    void testWelfareTransformation() {
        Map<String, Object> rawWelfare = Map.of(
            "beneficiary_name", "Ramesh Tukaram Shinde",
            "scheme_code", "SCH-SGNY-01",
            "scheme_name", "Sanjay Gandhi Niradhar Anudan Yojana",
            "previous_benefit", true,
            "application_status", "APPROVED",
            "benefit_amount", 1500.0
        );

        Map<String, Object> transformed = schemaMappingService.transformRawData("WEL", rawWelfare);

        assertNotNull(transformed);
        assertTrue(transformed.containsKey("welfare"));

        Map<?, ?> welfare = (Map<?, ?>) transformed.get("welfare");
        assertEquals("SCH-SGNY-01", welfare.get("schemeCode"));
        assertEquals("Sanjay Gandhi Niradhar Anudan Yojana", welfare.get("schemeName"));
        assertEquals(true, welfare.get("previousBenefit"));
        assertEquals("APPROVED", welfare.get("applicationStatus"));
        assertEquals(1500.0, ((Number) welfare.get("benefitAmount")).doubleValue(), 0.001);
    }

    @Test
    @DisplayName("Type coercion properly handles String to Double, String to Boolean, and edge cases")
    void testTypeCoercion() {
        // String to Double
        Object doubleVal = schemaMappingService.coerceDataType(" 1250.75 ", "DOUBLE", "DIRECT_MAP");
        assertEquals(1250.75, (Double) doubleVal, 0.001);

        // String to Boolean
        Object boolValTrue = schemaMappingService.coerceDataType("yes", "BOOLEAN", "DIRECT_MAP");
        assertEquals(Boolean.TRUE, boolValTrue);

        Object boolValFalse = schemaMappingService.coerceDataType("no", "BOOLEAN", "DIRECT_MAP");
        assertEquals(Boolean.FALSE, boolValFalse);

        // Null safety
        assertNull(schemaMappingService.coerceDataType(null, "STRING", "DIRECT_MAP"));
    }

    @Test
    @DisplayName("Missing and null fields in raw department response do not throw exceptions")
    void testMissingAndNullFields() {
        Map<String, Object> sparseData = new HashMap<>();
        sparseData.put("survey_no", "SN-999");
        sparseData.put("area_acres", null);

        Map<String, Object> result = schemaMappingService.transformRawData("REV", sparseData);

        assertNotNull(result);
        assertTrue(result.containsKey("land"));
        Map<?, ?> land = (Map<?, ?>) result.get("land");
        assertEquals("SN-999", land.get("surveyNumber"));
        assertNull(land.get("areaAcres"));
    }

    @Test
    @DisplayName("Full integration request for MH-CIT-10001 builds complete Canonical Data Model with source tracking")
    void testUnifiedIntegrationCanonicalResponse() {
        // Ensure all departments ONLINE
        departmentStateService.setStatus("REV", "ONLINE");
        departmentStateService.setStatus("AGR", "ONLINE");
        departmentStateService.setStatus("WEL", "ONLINE");

        IntegrationRequestDto requestDto = IntegrationRequestDto.builder()
            .citizenId("MH-CIT-10001")
            .purpose("SUBSIDY_VERIFICATION")
            .requestedDepartments(List.of("REVENUE", "AGRICULTURE", "WELFARE"))
            .build();

        IntegrationResponseDto response = integrationService.processIntegrationRequest(requestDto, "officer.revenue");

        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertEquals("MH-CIT-10001", response.getCitizenId());

        // Assert Canonical Citizen
        assertNotNull(response.getCitizen());
        assertEquals("MH-CIT-10001", response.getCitizen().getId());
        assertEquals("Ramesh Tukaram Shinde", response.getCitizen().getName());

        // Assert Canonical Location
        assertNotNull(response.getLocation());
        assertEquals("Pune", response.getLocation().getDistrict());

        // Assert Canonical Land & Source Tracking
        assertNotNull(response.getLand());
        assertEquals("REVENUE", response.getLand().getSource());
        assertNotNull(response.getLand().getSurveyNumber());

        // Assert Canonical Agriculture & Source Tracking
        assertNotNull(response.getAgriculture());
        assertEquals("AGRICULTURE", response.getAgriculture().getSource());
        assertNotNull(response.getAgriculture().getCrop());

        // Assert Canonical Welfare & Source Tracking
        assertNotNull(response.getWelfare());
        assertEquals("WELFARE", response.getWelfare().getSource());
        assertNotNull(response.getWelfare().getSchemeCode());

        // Assert Sources List
        assertNotNull(response.getSources());
        assertTrue(response.getSources().contains("REV"));
        assertTrue(response.getSources().contains("AGR"));
        assertTrue(response.getSources().contains("WEL"));
    }

    @Test
    @DisplayName("Integration request with Agriculture OFFLINE returns PARTIAL_SUCCESS and maps available Revenue & Welfare")
    void testPartialSuccessIntegrationMapping() {
        departmentStateService.setStatus("REV", "ONLINE");
        departmentStateService.setStatus("AGR", "OFFLINE");
        departmentStateService.setStatus("WEL", "ONLINE");

        IntegrationRequestDto requestDto = IntegrationRequestDto.builder()
            .citizenId("MH-CIT-10001")
            .purpose("SUBSIDY_VERIFICATION")
            .requestedDepartments(List.of("REVENUE", "AGRICULTURE", "WELFARE"))
            .build();

        IntegrationResponseDto response = integrationService.processIntegrationRequest(requestDto, "officer.revenue");

        assertNotNull(response);
        assertEquals("PARTIAL_SUCCESS", response.getStatus());

        // Revenue Land is mapped
        assertNotNull(response.getLand());
        assertEquals("REVENUE", response.getLand().getSource());

        // Welfare is mapped
        assertNotNull(response.getWelfare());
        assertEquals("WELFARE", response.getWelfare().getSource());

        // Agriculture failed so canonicalAgriculture is null
        assertNull(response.getAgriculture());

        // Sources list contains only successful departments
        assertNotNull(response.getSources());
        assertTrue(response.getSources().contains("REV"));
        assertTrue(response.getSources().contains("WEL"));
        assertFalse(response.getSources().contains("AGR"));

        // Restore Agriculture ONLINE
        departmentStateService.setStatus("AGR", "ONLINE");
    }
}
