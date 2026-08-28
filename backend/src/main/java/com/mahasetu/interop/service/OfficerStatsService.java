package com.mahasetu.interop.service;

import com.mahasetu.interop.dto.integration.IntegrationResponseDto;
import com.mahasetu.interop.dto.officer.OfficerDashboardStatsDto;
import com.mahasetu.interop.entity.IntegrationRequest;
import com.mahasetu.interop.repository.IntegrationRequestRepository;
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
public class OfficerStatsService {

    private final IntegrationRequestRepository integrationRequestRepository;
    private final DepartmentStateService departmentStateService;
    private final IntegrationService integrationService;

    @Transactional(readOnly = true)
    public OfficerDashboardStatsDto getOfficerDashboardStats() {
        List<IntegrationRequest> allRequests = integrationRequestRepository.findAll();
        long total = allRequests.size();
        long success = allRequests.stream().filter(r -> "SUCCESS".equalsIgnoreCase(r.getStatus())).count();
        long partial = allRequests.stream().filter(r -> "PARTIAL_SUCCESS".equalsIgnoreCase(r.getStatus())).count();
        long failed = allRequests.stream().filter(r -> "FAILED".equalsIgnoreCase(r.getStatus()) || (r.getStatus() != null && r.getStatus().contains("REJECTED"))).count();

        // Calculate average response time
        long totalLatency = 0;
        int countWithResults = 0;
        for (IntegrationRequest req : allRequests) {
            if (req.getResults() != null && !req.getResults().isEmpty()) {
                long maxReqLatency = req.getResults().stream()
                        .mapToLong(r -> r.getResponseTimeMs() != null ? r.getResponseTimeMs() : 0L)
                        .max().orElse(0L);
                totalLatency += maxReqLatency;
                countWithResults++;
            }
        }
        long avgLatency = countWithResults > 0 ? (totalLatency / countWithResults) : 45L;

        // Department statuses
        Map<String, String> deptStatusMap = new LinkedHashMap<>();
        deptStatusMap.put("REV", departmentStateService.getStatus("REV"));
        deptStatusMap.put("AGR", departmentStateService.getStatus("AGR"));
        deptStatusMap.put("WEL", departmentStateService.getStatus("WEL"));

        int onlineDepts = (int) deptStatusMap.values().stream().filter(s -> "ONLINE".equalsIgnoreCase(s)).count();

        // Recent Requests
        List<IntegrationResponseDto> recent = integrationService.getRecentRequests();

        return OfficerDashboardStatsDto.builder()
                .totalRequests(total)
                .successfulRequests(success)
                .partialRequests(partial)
                .failedRequests(failed)
                .averageResponseTimeMs(avgLatency)
                .activeDepartmentsCount(onlineDepts)
                .departmentStatuses(deptStatusMap)
                .recentRequests(recent.stream().limit(8).toList())
                .timestamp(OffsetDateTime.now())
                .build();
    }
}
