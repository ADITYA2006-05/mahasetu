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
@Schema(description = "Canonical Land Record (Revenue)")
public class CanonicalLandDto {

    @Schema(description = "Land Survey / Gat Number", example = "SN-101")
    private String surveyNumber;

    @Schema(description = "Land Parcel Area in Acres", example = "1.98")
    private Double areaAcres;

    @Schema(description = "Originating Department Source", example = "REVENUE")
    @Builder.Default
    private String source = "REVENUE";
}
