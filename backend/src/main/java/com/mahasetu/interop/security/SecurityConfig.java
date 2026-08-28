package com.mahasetu.interop.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(unauthorizedHandler)
                .accessDeniedHandler(accessDeniedHandler)
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // Public Health & Pre-flight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/error", "/error/**").permitAll()
                .requestMatchers("/api/health", "/api/health/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                
                // Public Swagger UI & OpenAPI Docs
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/api-docs/**").permitAll()

                // Public Auth Endpoints
                .requestMatchers("/api/auth/**").permitAll()
                
                // Mock Department Health & APIs
                .requestMatchers("/api/mock/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/mock/*/health").permitAll()
                .requestMatchers("/api/mock/**").permitAll()

                // Core Integration Engine (Phase 4)
                .requestMatchers("/api/integration/**").hasAnyRole("DEPARTMENT_OFFICER", "ADMIN", "SYSTEM")

                // Schema Mappings Management (Phase 5)
                .requestMatchers(HttpMethod.GET, "/api/schema-mappings", "/api/schema-mappings/**").hasAnyRole("ADMIN", "DEPARTMENT_OFFICER", "SYSTEM")
                .requestMatchers(HttpMethod.POST, "/api/schema-mappings/transform").hasAnyRole("ADMIN", "DEPARTMENT_OFFICER", "SYSTEM")
                .requestMatchers("/api/schema-mappings", "/api/schema-mappings/**").hasRole("ADMIN")

                // Consent Management (Phase 6)
                .requestMatchers("/api/consents", "/api/consents/**").hasAnyRole("CITIZEN", "DEPARTMENT_OFFICER", "ADMIN", "SYSTEM")

                // Citizen Data Access Log (Phase 6)
                .requestMatchers("/api/citizen", "/api/citizen/**").hasAnyRole("CITIZEN", "ADMIN", "SYSTEM")

                // Audit Trail Oversight (Phase 6)
                .requestMatchers("/api/audit-logs", "/api/audit-logs/**").hasAnyRole("ADMIN", "SYSTEM")

                // Protected Administrative Stats
                .requestMatchers("/api/stats", "/api/stats/**").hasAnyRole("ADMIN", "SYSTEM")

                // Phase 7: Monitoring & Service Health
                .requestMatchers("/api/monitoring/**").hasAnyRole("ADMIN", "DEPARTMENT_OFFICER", "SYSTEM", "CITIZEN")

                // Phase 7: Officer Dashboard & Stats
                .requestMatchers("/api/officer/**").hasAnyRole("DEPARTMENT_OFFICER", "ADMIN", "SYSTEM")

                // Phase 7: Departments & Services Registry
                .requestMatchers("/api/departments", "/api/departments/**").hasAnyRole("ADMIN", "DEPARTMENT_OFFICER", "SYSTEM", "CITIZEN")
                .requestMatchers("/api/services", "/api/services/**").hasAnyRole("ADMIN", "DEPARTMENT_OFFICER", "SYSTEM")
                
                // All other endpoints require authentication
                .anyRequest().authenticated()
            );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:5174",
            "http://127.0.0.1:*",
            "http://localhost:*"
        ));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        config.setExposedHeaders(List.of("Authorization", "Link", "X-Total-Count"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
