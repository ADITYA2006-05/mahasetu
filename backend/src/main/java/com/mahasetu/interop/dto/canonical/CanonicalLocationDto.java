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
@Schema(description = "Canonical Geographic Location")
public class CanonicalLocationDto {

    @Schema(description = "District Name", example = "Pune")
    private String district;

    @Schema(description = "Taluka / Sub-district Name", example = "Haveli")
    private String taluka;

    @Schema(description = "Village / Local body Name", example = "Wagholi")
    private String village;
}
