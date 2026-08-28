package com.mahasetu.interop.dto.canonical;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Canonical Citizen Identity")
public class CanonicalCitizenDto {

    @Schema(description = "Master Synthetic Citizen ID", example = "MH-CIT-10001")
    private String id;

    @Schema(description = "Canonical Full Name", example = "Ramesh Tukaram Shinde")
    private String name;
}
