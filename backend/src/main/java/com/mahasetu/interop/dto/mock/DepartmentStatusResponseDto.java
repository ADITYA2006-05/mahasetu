package com.mahasetu.interop.dto.mock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentStatusResponseDto {
    private String departmentCode;
    private String departmentName;
    private String status; // ONLINE, OFFLINE, DEGRADED
    private String message;
    private OffsetDateTime updatedAt;
}
