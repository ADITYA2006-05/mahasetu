package com.mahasetu.interop.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "BearerAuth";
        return new OpenAPI()
            .info(new Info()
                .title("MahaSetu (महासेतू) — Government Digital Interoperability Gateway API")
                .version("1.0.0-production")
                .description("Production-ready State Data Gateway API enabling zero-data-hoarding cross-departmental data exchange across Revenue, Agriculture, and Welfare departments (Government of Maharashtra). Built for SIH26129.")
                .contact(new Contact()
                    .name("MahaSetu State GovTech Interoperability Cell")
                    .email("support@mahasetu.gov.in")
                    .url("https://mahasetu.gov.in"))
                .license(new License()
                    .name("Government Open Technology License")
                    .url("https://data.gov.in")))
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                    .name(securitySchemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Enter your MahaSetu JWT Token (obtained via POST /api/auth/login) to authorize requests.")));
    }
}
