package com.mahasetu.interop.service;

import com.mahasetu.interop.dto.monitoring.DepartmentHealthDto;
import com.mahasetu.interop.dto.monitoring.ServiceHealthDto;
import com.mahasetu.interop.dto.monitoring.SystemMonitoringResponseDto;
import com.mahasetu.interop.entity.Department;
import com.mahasetu.interop.entity.ServiceRegistry;
import com.mahasetu.interop.repository.DepartmentRepository;
import com.mahasetu.interop.repository.ServiceRegistryRepository;
import com.mahasetu.interop.service.mock.DepartmentStateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MonitoringService {

    private final DepartmentRepository departmentRepository;
    private final ServiceRegistryRepository serviceRegistryRepository;
    private final DepartmentStateService departmentStateService;

    @Transactional(readOnly = true)
    public SystemMonitoringResponseDto getSystemHealth() {
        OffsetDateTime now = OffsetDateTime.now();
        List<DepartmentHealthDto> deptHealthList = new ArrayList<>();

        long totalLatency = 0;
        int onlineCount = 0;
        int offlineCount = 0;

        List<Department> departments = departmentRepository.findAll();
        for (Department dept : departments) {
            String code = dept.getDepartmentCode();
            String currentStatus = departmentStateService.getStatus(code);
            boolean isOnline = "ONLINE".equalsIgnoreCase(currentStatus);

            long latencyMs = isOnline ? (20 + (Math.abs(code.hashCode()) % 30)) : 0L;
            if (isOnline) {
                onlineCount++;
                totalLatency += latencyMs;
            } else {
                offlineCount++;
            }

            String endpoint = switch (code) {
                case "REV" -> "/api/mock/revenue/health";
                case "AGR" -> "/api/mock/agriculture/health";
                case "WEL" -> "/api/mock/welfare/health";
                default -> "/api/mock/" + code.toLowerCase() + "/health";
            };

            deptHealthList.add(DepartmentHealthDto.builder()
                    .departmentCode(code)
                    .departmentName(dept.getName())
                    .status(currentStatus)
                    .responseTimeMs(latencyMs)
                    .endpoint(endpoint)
                    .healthStatus(isOnline ? "UP" : "DOWN")
                    .details(isOnline ? "Gateway responding normally with standard SLA." : "Simulated Gateway Outage.")
                    .lastChecked(now)
                    .build());
        }

        String platformStatus = "HEALTHY";
        if (offlineCount == departments.size()) {
            platformStatus = "CRITICAL";
        } else if (offlineCount > 0) {
            platformStatus = "DEGRADED";
        }

        long avgLatency = onlineCount > 0 ? (totalLatency / onlineCount) : 0L;

        Map<String, Object> systemMetrics = new LinkedHashMap<>();
        systemMetrics.put("jvmUptimeSeconds", java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime() / 1000);
        systemMetrics.put("activeThreads", Thread.activeCount());
        systemMetrics.put("availableProcessors", Runtime.getRuntime().availableProcessors());
        systemMetrics.put("databaseStatus", "CONNECTED");
        systemMetrics.put("databaseEngine", "PostgreSQL 16 (Interoperability Cluster)");

        return SystemMonitoringResponseDto.builder()
                .platformStatus(platformStatus)
                .totalDepartments(departments.size())
                .onlineDepartments(onlineCount)
                .offlineDepartments(offlineCount)
                .averageGatewayLatencyMs(avgLatency)
                .databaseStatus("CONNECTED")
                .timestamp(now)
                .departments(deptHealthList)
                .systemMetrics(systemMetrics)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ServiceHealthDto> getServiceHealthList() {
        OffsetDateTime now = OffsetDateTime.now();
        List<ServiceRegistry> services = serviceRegistryRepository.findAll();
        List<ServiceHealthDto> result = new ArrayList<>();

        for (ServiceRegistry s : services) {
            String deptCode = s.getDepartment() != null ? s.getDepartment().getDepartmentCode() : "GATEWAY";
            String deptName = s.getDepartment() != null ? s.getDepartment().getName() : "Central MahaSetu Gateway";
            String currentDeptStatus = departmentStateService.getStatus(deptCode);
            boolean isOnline = "ONLINE".equalsIgnoreCase(currentDeptStatus);

            long latencyMs = isOnline ? (15 + (Math.abs(s.getServiceCode().hashCode()) % 40)) : 0L;

            result.add(ServiceHealthDto.builder()
                    .id(s.getId())
                    .departmentCode(deptCode)
                    .departmentName(deptName)
                    .serviceName(s.getName())
                    .serviceCode(s.getServiceCode())
                    .endpoint(s.getEndpointPath())
                    .httpMethod(s.getRequestMethod())
                    .status(isOnline ? "ONLINE" : "OFFLINE")
                    .responseTimeMs(latencyMs)
                    .schemaVersion("v1.0")
                    .lastChecked(now)
                    .build());
        }

        return result;
    }
}
