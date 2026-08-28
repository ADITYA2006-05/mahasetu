package com.mahasetu.interop.dto.mock;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentStatusUpdateDto {

    @NotBlank(message = "Status cannot be blank")
    @Pattern(regexp = "^(ONLINE|OFFLINE|DEGRADED)$", message = "Status must be ONLINE, OFFLINE, or DEGRADED")
    private String status;
}
