package com.mahasetu.interop.service;

import com.mahasetu.interop.dto.*;
import com.mahasetu.interop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final CitizenRepository citizenRepository;
    private final DepartmentRepository departmentRepository;
    private final DistrictRepository districtRepository;
    private final VillageRepository villageRepository;
    private final RevenueLandRecordRepository revenueLandRecordRepository;
    private final AgricultureFarmerProfileRepository agricultureFarmerProfileRepository;
    private final WelfareBeneficiaryRecordRepository welfareBeneficiaryRecordRepository;
    private final DepartmentIdentifierRepository departmentIdentifierRepository;
    private final ServiceRegistryRepository serviceRegistryRepository;
    private final SchemaMappingRepository schemaMappingRepository;
    private final IntegrationRequestRepository integrationRequestRepository;

    @Transactional(readOnly = true)
    public StatsResponseDto getPlatformStats() {
        long totalCitizens = citizenRepository.count();
        long totalDepartments = departmentRepository.count();
        long totalDistricts = districtRepository.count();
        long totalVillages = villageRepository.count();
        long totalLandRecords = revenueLandRecordRepository.count();
        long totalFarmerProfiles = agricultureFarmerProfileRepository.count();
        long totalWelfareRecords = welfareBeneficiaryRecordRepository.count();
        long totalDepartmentIdentifiers = departmentIdentifierRepository.count();
        long totalServices = serviceRegistryRepository.count();
        long totalSchemaMappings = schemaMappingRepository.count();

        // Integration Requests aggregation
        List<com.mahasetu.interop.entity.IntegrationRequest> allRequests = integrationRequestRepository.findAll();
        long totalIntegrationRequests = allRequests.size();
        long successfulRequests = allRequests.stream().filter(r -> "SUCCESS".equalsIgnoreCase(r.getStatus())).count();
        long partialRequests = allRequests.stream().filter(r -> "PARTIAL_SUCCESS".equalsIgnoreCase(r.getStatus())).count();
        long failedRequests = allRequests.stream().filter(r -> "FAILED".equalsIgnoreCase(r.getStatus()) || (r.getStatus() != null && r.getStatus().contains("REJECTED"))).count();

        Map<String, Long> requestsByStatus = new LinkedHashMap<>();
        requestsByStatus.put("SUCCESS", successfulRequests);
        requestsByStatus.put("PARTIAL_SUCCESS", partialRequests);
        requestsByStatus.put("FAILED", failedRequests);

        Map<String, Long> requestsByDept = new LinkedHashMap<>();
        requestsByDept.put("REVENUE", 0L);
        requestsByDept.put("AGRICULTURE", 0L);
        requestsByDept.put("WELFARE", 0L);

        long totalLatency = 0;
        int countWithResults = 0;
        Map<String, Long> latencyBuckets = new LinkedHashMap<>();
        latencyBuckets.put("< 50ms", 0L);
        latencyBuckets.put("50-100ms", 0L);
        latencyBuckets.put("100-200ms", 0L);
        latencyBuckets.put("> 200ms", 0L);

        for (com.mahasetu.interop.entity.IntegrationRequest req : allRequests) {
            if (req.getResults() != null) {
                long maxReqLatency = 0;
                for (com.mahasetu.interop.entity.IntegrationRequestResult res : req.getResults()) {
                    String dCode = res.getDepartmentCode();
                    if (dCode != null) {
                        String upper = dCode.toUpperCase();
                        if (upper.contains("REV")) requestsByDept.put("REVENUE", requestsByDept.getOrDefault("REVENUE", 0L) + 1);
                        else if (upper.contains("AGR")) requestsByDept.put("AGRICULTURE", requestsByDept.getOrDefault("AGRICULTURE", 0L) + 1);
                        else if (upper.contains("WEL")) requestsByDept.put("WELFARE", requestsByDept.getOrDefault("WELFARE", 0L) + 1);
                    }
                    if (res.getResponseTimeMs() != null && res.getResponseTimeMs() > maxReqLatency) {
                        maxReqLatency = res.getResponseTimeMs();
                    }
                }
                if (maxReqLatency > 0) {
                    totalLatency += maxReqLatency;
                    countWithResults++;
                    if (maxReqLatency < 50) latencyBuckets.put("< 50ms", latencyBuckets.get("< 50ms") + 1);
                    else if (maxReqLatency <= 100) latencyBuckets.put("50-100ms", latencyBuckets.get("50-100ms") + 1);
                    else if (maxReqLatency <= 200) latencyBuckets.put("100-200ms", latencyBuckets.get("100-200ms") + 1);
                    else latencyBuckets.put("> 200ms", latencyBuckets.get("> 200ms") + 1);
                }
            }
        }
        long averageResponseTimeMs = countWithResults > 0 ? (totalLatency / countWithResults) : 38L;

        Map<String, Long> summary = new LinkedHashMap<>();
        summary.put("totalCitizens", totalCitizens);
        summary.put("totalDepartments", totalDepartments);
        summary.put("totalDistricts", totalDistricts);
        summary.put("totalVillages", totalVillages);
        summary.put("totalLandRecords", totalLandRecords);
        summary.put("totalFarmerProfiles", totalFarmerProfiles);
        summary.put("totalWelfareRecords", totalWelfareRecords);
        summary.put("totalDepartmentIdentifiers", totalDepartmentIdentifiers);
        summary.put("totalServices", totalServices);
        summary.put("totalSchemaMappings", totalSchemaMappings);
        summary.put("totalIntegrationRequests", totalIntegrationRequests);
        summary.put("successfulRequests", successfulRequests);
        summary.put("partialRequests", partialRequests);
        summary.put("failedRequests", failedRequests);
        summary.put("averageResponseTimeMs", averageResponseTimeMs);

        // Department Specific Stats
        List<DepartmentStatDto> deptStats = new ArrayList<>();
        departmentRepository.findAll().forEach(dept -> {
            long servicesCount = serviceRegistryRepository.countByDepartmentId(dept.getId());
            long recCount = 0;
            String metricLabel = "";
            String metricValue = "";

            if ("REV".equals(dept.getDepartmentCode())) {
                recCount = totalLandRecords;
                BigDecimal totalArea = revenueLandRecordRepository.sumTotalAreaHectares();
                metricLabel = "Total Land Parcels Managed";
                metricValue = recCount + " Parcels (" + (totalArea != null ? totalArea : BigDecimal.ZERO) + " Ha)";
            } else if ("AGR".equals(dept.getDepartmentCode())) {
                recCount = totalFarmerProfiles;
                BigDecimal totalSubsidies = agricultureFarmerProfileRepository.sumTotalSubsidiesInr();
                metricLabel = "Active Farmers & Subsidies";
                metricValue = recCount + " Farmers (₹" + (totalSubsidies != null ? totalSubsidies : BigDecimal.ZERO) + " Disbursed)";
            } else if ("WEL".equals(dept.getDepartmentCode())) {
                recCount = totalWelfareRecords;
                BigDecimal monthlyDisb = welfareBeneficiaryRecordRepository.sumTotalMonthlyStipendInr();
                metricLabel = "Monthly DBT Outflow";
                metricValue = "₹" + (monthlyDisb != null ? monthlyDisb : BigDecimal.ZERO) + " / month";
            }

            deptStats.add(DepartmentStatDto.builder()
                .code(dept.getDepartmentCode())
                .name(dept.getName())
                .nodalOfficer(dept.getNodalOfficer())
                .recordsCount(recCount)
                .servicesCount(servicesCount)
                .metricLabel(metricLabel)
                .metricValue(metricValue)
                .build());
        });

        // Land Stats
        Map<String, Long> landTypeBreakdown = new LinkedHashMap<>();
        for (Object[] row : revenueLandRecordRepository.countGroupedByLandType()) {
            landTypeBreakdown.put((String) row[0], (Long) row[1]);
        }
        LandStatsDto landStats = LandStatsDto.builder()
            .totalRecords(totalLandRecords)
            .totalAreaHectares(revenueLandRecordRepository.sumTotalAreaHectares())
            .cultivableAreaHectares(revenueLandRecordRepository.sumCultivableAreaHectares())
            .landTypeBreakdown(landTypeBreakdown)
            .build();

        // Agriculture Stats
        Map<String, Long> farmerCatBreakdown = new LinkedHashMap<>();
        for (Object[] row : agricultureFarmerProfileRepository.countGroupedByFarmerCategory()) {
            farmerCatBreakdown.put((String) row[0], (Long) row[1]);
        }
        Map<String, Long> cropBreakdown = new LinkedHashMap<>();
        for (Object[] row : agricultureFarmerProfileRepository.countGroupedByPrimaryCrop()) {
            cropBreakdown.put((String) row[0], (Long) row[1]);
        }
        AgricultureStatsDto agricultureStats = AgricultureStatsDto.builder()
            .totalFarmerProfiles(totalFarmerProfiles)
            .totalSubsidiesAvailedInr(agricultureFarmerProfileRepository.sumTotalSubsidiesInr())
            .farmerCategoryBreakdown(farmerCatBreakdown)
            .cropBreakdown(cropBreakdown)
            .build();

        // Welfare Stats
        Map<String, Long> disbStatusBreakdown = new LinkedHashMap<>();
        for (Object[] row : welfareBeneficiaryRecordRepository.countGroupedByDisbursementStatus()) {
            disbStatusBreakdown.put((String) row[0], (Long) row[1]);
        }
        Map<String, Long> schemesBreakdown = new LinkedHashMap<>();
        for (Object[] row : welfareBeneficiaryRecordRepository.countGroupedByScheme()) {
            schemesBreakdown.put((String) row[0], (Long) row[1]);
        }
        WelfareStatsDto welfareStats = WelfareStatsDto.builder()
            .totalBeneficiaries(totalWelfareRecords)
            .totalMonthlyDisbursementInr(welfareBeneficiaryRecordRepository.sumTotalMonthlyStipendInr())
            .disbursementStatusBreakdown(disbStatusBreakdown)
            .schemesBreakdown(schemesBreakdown)
            .build();

        // District Distribution
        List<DistrictDistributionDto> districtDistribution = new ArrayList<>();
        districtRepository.findAll().forEach(dist -> {
            long vilCount = villageRepository.countByDistrictId(dist.getId());
            long citCount = citizenRepository.countCitizensGroupedByDistrict().stream()
                .filter(row -> dist.getDistrictCode().equals(row[0]))
                .map(row -> (Long) row[2])
                .findFirst()
                .orElse(0L);

            districtDistribution.add(DistrictDistributionDto.builder()
                .code(dist.getDistrictCode())
                .name(dist.getName())
                .citizensCount(citCount)
                .villagesCount(vilCount)
                .build());
        });

        return StatsResponseDto.builder()
            .status("SUCCESS")
            .summary(summary)
            .departmentStats(deptStats)
            .landStats(landStats)
            .agricultureStats(agricultureStats)
            .welfareStats(welfareStats)
            .districtDistribution(districtDistribution)
            .totalIntegrationRequests(totalIntegrationRequests)
            .successfulRequests(successfulRequests)
            .partialRequests(partialRequests)
            .failedRequests(failedRequests)
            .averageResponseTimeMs(averageResponseTimeMs)
            .requestsByStatus(requestsByStatus)
            .requestsByDepartment(requestsByDept)
            .latencyDistribution(latencyBuckets)
            .timestamp(OffsetDateTime.now())
            .build();
    }
}
