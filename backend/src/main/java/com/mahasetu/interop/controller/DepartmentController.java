package com.mahasetu.interop.controller;

import com.mahasetu.interop.dto.DepartmentStatDto;
import com.mahasetu.interop.entity.Department;
import com.mahasetu.interop.repository.*;
import com.mahasetu.interop.service.mock.DepartmentStateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final ServiceRegistryRepository serviceRegistryRepository;
    private final RevenueLandRecordRepository revenueLandRecordRepository;
    private final AgricultureFarmerProfileRepository agricultureFarmerProfileRepository;
    private final WelfareBeneficiaryRecordRepository welfareBeneficiaryRecordRepository;
    private final DepartmentStateService departmentStateService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEPARTMENT_OFFICER', 'SYSTEM', 'CITIZEN')")
    public ResponseEntity<List<DepartmentStatDto>> getDepartments() {
        List<DepartmentStatDto> result = new ArrayList<>();
        List<Department> departments = departmentRepository.findAll();

        for (Department dept : departments) {
            String code = dept.getDepartmentCode();
            long servicesCount = serviceRegistryRepository.countByDepartmentId(dept.getId());
            long recCount = 0;
            String metricLabel = "";
            String metricValue = "";

            if ("REV".equals(code)) {
                recCount = revenueLandRecordRepository.count();
                BigDecimal totalArea = revenueLandRecordRepository.sumTotalAreaHectares();
                metricLabel = "Land Parcels Managed";
                metricValue = recCount + " Records (" + (totalArea != null ? totalArea : BigDecimal.ZERO) + " Ha)";
            } else if ("AGR".equals(code)) {
                recCount = agricultureFarmerProfileRepository.count();
                BigDecimal totalSubsidies = agricultureFarmerProfileRepository.sumTotalSubsidiesInr();
                metricLabel = "Registered Farmers";
                metricValue = recCount + " Profiles (₹" + (totalSubsidies != null ? totalSubsidies : BigDecimal.ZERO) + " Disbursed)";
            } else if ("WEL".equals(code)) {
                recCount = welfareBeneficiaryRecordRepository.count();
                BigDecimal monthlyDisb = welfareBeneficiaryRecordRepository.sumTotalMonthlyStipendInr();
                metricLabel = "Beneficiaries & DBT";
                metricValue = recCount + " Beneficiaries (₹" + (monthlyDisb != null ? monthlyDisb : BigDecimal.ZERO) + " / mo)";
            }

            result.add(DepartmentStatDto.builder()
                    .code(code)
                    .name(dept.getName())
                    .nodalOfficer(dept.getNodalOfficer())
                    .recordsCount(recCount)
                    .servicesCount(servicesCount)
                    .metricLabel(metricLabel)
                    .metricValue(metricValue)
                    .build());
        }

        return ResponseEntity.ok(result);
    }
}
