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
@Schema(description = "Canonical Agriculture & Crop Profile")
public class CanonicalAgricultureDto {

    @Schema(description = "Primary Cultivated Crop", example = "Cotton")
    private String crop;

    @Schema(description = "Agricultural Season", example = "Kharif")
    private String season;

    @Schema(description = "Acreage / Land Usage", example = "0.8000 Ha")
    private String landUsage;

    @Schema(description = "Originating Department Source", example = "AGRICULTURE")
    @Builder.Default
    private String source = "AGRICULTURE";
}
