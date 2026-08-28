package com.mahasetu.interop.service.mock;

import com.mahasetu.interop.dto.mock.DepartmentStatusResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class DepartmentStateService {

    private final Map<String, String> departmentStatusMap = new ConcurrentHashMap<>();
    private final Map<String, OffsetDateTime> statusUpdatedMap = new ConcurrentHashMap<>();

    private static final Map<String, String> DEPARTMENT_NAMES = Map.of(
        "REV", "Revenue & Forest Department",
        "AGR", "Department of Agriculture",
        "WEL", "Social Justice & Welfare Department"
    );

    public DepartmentStateService() {
        // Default state: all departments are ONLINE
        departmentStatusMap.put("REV", "ONLINE");
        departmentStatusMap.put("AGR", "ONLINE");
        departmentStatusMap.put("WEL", "ONLINE");

        OffsetDateTime now = OffsetDateTime.now();
        statusUpdatedMap.put("REV", now);
        statusUpdatedMap.put("AGR", now);
        statusUpdatedMap.put("WEL", now);
    }

    public boolean isOnline(String departmentCode) {
        String status = getStatus(departmentCode);
        return "ONLINE".equalsIgnoreCase(status);
    }

    public String getStatus(String departmentCode) {
        if (departmentCode == null) return "ONLINE";
        return departmentStatusMap.getOrDefault(departmentCode.toUpperCase(), "ONLINE");
    }

    public DepartmentStatusResponseDto setStatus(String departmentCode, String status) {
        String code = departmentCode.toUpperCase();
        String normalizedStatus = status.toUpperCase();

        departmentStatusMap.put(code, normalizedStatus);
        OffsetDateTime now = OffsetDateTime.now();
        statusUpdatedMap.put(code, now);

        String deptName = DEPARTMENT_NAMES.getOrDefault(code, code + " Department");
        log.info("Department [{}] status updated to: {}", code, normalizedStatus);

        return DepartmentStatusResponseDto.builder()
            .departmentCode(code)
            .departmentName(deptName)
            .status(normalizedStatus)
            .message("Department gateway status successfully updated to " + normalizedStatus)
            .updatedAt(now)
            .build();
    }

    public Map<String, DepartmentStatusResponseDto> getAllStatuses() {
        Map<String, DepartmentStatusResponseDto> result = new ConcurrentHashMap<>();
        for (String code : departmentStatusMap.keySet()) {
            result.put(code, DepartmentStatusResponseDto.builder()
                .departmentCode(code)
                .departmentName(DEPARTMENT_NAMES.getOrDefault(code, code + " Department"))
                .status(departmentStatusMap.get(code))
                .message("Gateway is " + departmentStatusMap.get(code))
                .updatedAt(statusUpdatedMap.get(code))
                .build());
        }
        return result;
    }
}
