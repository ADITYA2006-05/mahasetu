package com.mahasetu.interop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahasetu.interop.dto.AuthRequest;
import com.mahasetu.interop.dto.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/auth/login succeeds with valid Admin credentials")
    void testLoginSuccess() throws Exception {
        AuthRequest loginRequest = AuthRequest.builder()
                .usernameOrEmail("admin")
                .password("Admin@MahaSetu2026")
                .build();

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.user.username", is("admin")))
                .andExpect(jsonPath("$.user.roles", hasItem("ROLE_ADMIN")));
    }

    @Test
    @DisplayName("POST /api/auth/login fails with 401 when given wrong password")
    void testLoginWrongPassword() throws Exception {
        AuthRequest loginRequest = AuthRequest.builder()
                .usernameOrEmail("admin")
                .password("WrongPassword123!")
                .build();

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")))
                .andExpect(jsonPath("$.message", containsString("Invalid username/email or password")));
    }

    @Test
    @DisplayName("POST /api/auth/register creates new citizen user and returns JWT token")
    void testRegisterNewCitizen() throws Exception {
        String uniqueUser = "testcitizen_" + System.currentTimeMillis();
        RegisterRequest registerRequest = RegisterRequest.builder()
                .username(uniqueUser)
                .email(uniqueUser + "@gov-synthetic.in")
                .password("SecurePassword@2026")
                .fullName("Test Citizen Beneficiary")
                .phone("9876543210")
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.user.username", is(uniqueUser)))
                .andExpect(jsonPath("$.user.roles", hasItem("ROLE_CITIZEN")));
    }

    @Test
    @DisplayName("GET /api/auth/me returns current user profile with valid JWT")
    void testGetAuthMeWithToken() throws Exception {
        // 1. Login to get token
        AuthRequest loginRequest = AuthRequest.builder()
                .usernameOrEmail("officer.revenue")
                .password("Officer@Revenue2026")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseBody).get("accessToken").asText();

        // 2. Fetch /api/auth/me with Bearer token
        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is("officer.revenue")))
                .andExpect(jsonPath("$.departmentCode", is("REV")))
                .andExpect(jsonPath("$.roles", hasItem("ROLE_DEPARTMENT_OFFICER")));
    }

    @Test
    @DisplayName("GET /api/auth/me returns 401 Unauthorized when token is missing")
    void testGetAuthMeWithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")));
    }
}
