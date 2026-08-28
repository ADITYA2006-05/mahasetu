package com.mahasetu.interop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentStatDto {
    private String code;
    private String name;
    private String nodalOfficer;
    private long recordsCount;
    private long servicesCount;
    private String metricLabel;
    private String metricValue;
}
