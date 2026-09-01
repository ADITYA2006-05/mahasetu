package com.mahasetu.interop.service;

import com.mahasetu.interop.entity.*;
import com.mahasetu.interop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CitizenProvisioningService {

    private final CitizenRepository citizenRepository;
    private final DistrictRepository districtRepository;
    private final TalukaRepository talukaRepository;
    private final VillageRepository villageRepository;
    private final DepartmentRepository departmentRepository;
    private final DepartmentIdentifierRepository departmentIdentifierRepository;
    private final RevenueLandRecordRepository revenueLandRecordRepository;
    private final AgricultureFarmerProfileRepository agricultureFarmerProfileRepository;
    private final WelfareBeneficiaryRecordRepository welfareBeneficiaryRecordRepository;

    @Transactional
    public Citizen getOrCreateCitizen(String citizenId, String fullName, String email, String phone) {
        if (citizenId == null || citizenId.isBlank()) {
            citizenId = "MH-CIT-10001";
        }
        final String effectiveCitizenId = citizenId.trim();

        Optional<Citizen> existing = citizenRepository.findByCitizenId(effectiveCitizenId);
        if (existing.isPresent()) {
            return existing.get();
        }

        log.info("Auto-provisioning synthetic citizen record for ID: [{}]", effectiveCitizenId);

        // Fetch or create district, taluka, village
        District district = districtRepository.findAll().stream().findFirst().orElseGet(() -> 
            districtRepository.save(District.builder().districtCode("MH-PUN").name("Pune").division("Pune Division").build())
        );

        Taluka taluka = talukaRepository.findAll().stream().findFirst().orElseGet(() -> 
            talukaRepository.save(Taluka.builder().talukaCode("TAL-HAV").name("Haveli").district(district).build())
        );

        Village village = villageRepository.findAll().stream().findFirst().orElseGet(() -> 
            villageRepository.save(Village.builder().villageCode("VIL-WAG").censusCode("CEN-WAG-412").name("Wagholi").district(district).taluka(taluka).pincode("412207").build())
        );

        String cleanName = (fullName != null && !fullName.isBlank()) ? fullName.trim() : "Citizen " + effectiveCitizenId;
        String cleanEmail = (email != null && !email.isBlank()) ? email.trim() : "citizen." + effectiveCitizenId.toLowerCase() + "@gov-synthetic.in";
        String cleanPhone = (phone != null && !phone.isBlank()) ? phone.trim() : "+91-XXXXX-12001";

        Citizen citizen = Citizen.builder()
                .citizenId(effectiveCitizenId)
                .fullName(cleanName)
                .gender("MALE")
                .dateOfBirth(LocalDate.of(1985, 6, 15))
                .maskedPhone(cleanPhone)
                .maskedEmail(cleanEmail)
                .annualIncomeInr(BigDecimal.valueOf(75000.00))
                .occupation("Farmer / Entrepreneur")
                .village(village)
                .taluka(taluka)
                .district(district)
                .isActive(true)
                .build();

        citizen = citizenRepository.save(citizen);

        // Provision department identifiers
        List<Department> departments = departmentRepository.findAll();
        Department rev = departments.stream().filter(d -> "REV".equalsIgnoreCase(d.getDepartmentCode())).findFirst().orElse(null);
        Department agr = departments.stream().filter(d -> "AGR".equalsIgnoreCase(d.getDepartmentCode())).findFirst().orElse(null);
        Department wel = departments.stream().filter(d -> "WEL".equalsIgnoreCase(d.getDepartmentCode())).findFirst().orElse(null);

        DepartmentIdentifier revId = null;
        if (rev != null) {
            revId = departmentIdentifierRepository.save(DepartmentIdentifier.builder()
                    .citizen(citizen)
                    .department(rev)
                    .departmentSpecificId("MH-REV-KH-" + effectiveCitizenId.replace("MH-CIT-", ""))
                    .identifierType("KHATA_7_12")
                    .status("ACTIVE")
                    .issuedDate(LocalDate.of(2018, 6, 15))
                    .build());
        }

        if (agr != null) {
            departmentIdentifierRepository.save(DepartmentIdentifier.builder()
                    .citizen(citizen)
                    .department(agr)
                    .departmentSpecificId("MH-AGR-REG-" + effectiveCitizenId.replace("MH-CIT-", ""))
                    .identifierType("FARMER_REGISTRATION")
                    .status("ACTIVE")
                    .issuedDate(LocalDate.of(2019, 8, 20))
                    .build());
        }

        if (wel != null) {
            departmentIdentifierRepository.save(DepartmentIdentifier.builder()
                    .citizen(citizen)
                    .department(wel)
                    .departmentSpecificId("MH-WEL-BEN-" + effectiveCitizenId.replace("MH-CIT-", ""))
                    .identifierType("WELFARE_BENEFICIARY_ID")
                    .status("ACTIVE")
                    .issuedDate(LocalDate.of(2020, 1, 10))
                    .build());
        }

        // Provision 7/12 Land Record
        revenueLandRecordRepository.save(RevenueLandRecord.builder()
                .recordId("MH-REV-LR-" + effectiveCitizenId.replace("MH-CIT-", ""))
                .citizen(citizen)
                .departmentIdentifier(revId)
                .district(district)
                .taluka(taluka)
                .village(village)
                .surveyNumber("SN-108")
                .gatNumber("GAT-208")
                .khataNumber("KH-5088")
                .totalAreaHectares(BigDecimal.valueOf(1.2500))
                .cultivableAreaHectares(BigDecimal.valueOf(1.1800))
                .uncultivableAreaHectares(BigDecimal.valueOf(0.0700))
                .landType("BAGAYAT (Irrigated)")
                .ownershipType("SINGLE")
                .encumbranceStatus("NONE")
                .registrationDate(LocalDate.of(2017, 3, 20))
                .build());

        // Provision Agriculture Farmer Profile
        agricultureFarmerProfileRepository.save(AgricultureFarmerProfile.builder()
                .profileId("MH-AGR-FP-" + effectiveCitizenId.replace("MH-CIT-", ""))
                .citizen(citizen)
                .farmerCategory("SMALL_HOLDER")
                .primaryCrop("Cotton")
                .secondaryCrop("Soybean")
                .soilType("Black Cotton Soil")
                .irrigationSource("Drip Irrigation")
                .landholdingHectares(BigDecimal.valueOf(1.2500))
                .kisanCreditCardStatus("ACTIVE")
                .subsidyAvailedInr(BigDecimal.valueOf(18500.00))
                .build());

        // Provision Welfare Beneficiary Record
        welfareBeneficiaryRecordRepository.save(WelfareBeneficiaryRecord.builder()
                .beneficiaryRecordId("MH-WEL-BR-" + effectiveCitizenId.replace("MH-CIT-", ""))
                .citizen(citizen)
                .schemeCode("SCH_WEL_01")
                .schemeName("Sanjay Gandhi Niradhar Anudan Yojana")
                .beneficiaryCategory("DESTITUTE")
                .monthlyStipendInr(BigDecimal.valueOf(1500.00))
                .disbursementStatus("PROCESSED")
                .lastDisbursementDate(LocalDate.of(2024, 8, 1))
                .bankAccountMasked("MAHB-XXXX-3001")
                .ifscCodeMasked("MAHB0000123")
                .build());

        log.info("Synthetic citizen [{}] provisioned with full departmental ledgers.", effectiveCitizenId);
        return citizen;
    }
}
