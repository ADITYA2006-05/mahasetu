package com.mahasetu.interop.dto.canonical;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for live schema mapping simulation test")
public class TransformTestRequestDto {

    @NotBlank(message = "Department code is required (REV, AGR, or WEL)")
    @Schema(description = "Department Code (REV, AGR, or WEL)", example = "REV")
    private String departmentCode;

    @NotNull(message = "Raw source JSON payload is required")
    @Schema(description = "Raw JSON key-value pairs from department API", example = "{\"citizen_name\": \"Ramesh Shinde\", \"survey_no\": \"SN-101\", \"area_acres\": 1.98}")
    private Map<String, Object> rawData;
}
