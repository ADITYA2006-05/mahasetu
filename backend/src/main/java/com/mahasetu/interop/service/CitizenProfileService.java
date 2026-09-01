package com.mahasetu.interop.service;

import com.mahasetu.interop.dto.citizen.CitizenProfileDto;
import com.mahasetu.interop.dto.consent.ConsentDto;
import com.mahasetu.interop.dto.audit.CitizenDataAccessDto;
import com.mahasetu.interop.entity.*;
import com.mahasetu.interop.exception.ResourceNotFoundException;
import com.mahasetu.interop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CitizenProfileService {

    private final CitizenRepository citizenRepository;
    private final UserRepository userRepository;
    private final CitizenProvisioningService citizenProvisioningService;
    private final DepartmentIdentifierRepository departmentIdentifierRepository;
    private final RevenueLandRecordRepository revenueLandRecordRepository;
    private final AgricultureFarmerProfileRepository agricultureFarmerProfileRepository;
    private final WelfareBeneficiaryRecordRepository welfareBeneficiaryRecordRepository;
    private final ConsentService consentService;
    private final AuditLogService auditLogService;

    @Transactional
    public CitizenProfileDto getCitizenProfile(String username) {
        String citizenId = "MH-CIT-10001";
        Optional<User> userOpt = userRepository.findByUsernameOrEmail(username);
        if (userOpt.isPresent() && userOpt.get().getCitizenId() != null && !userOpt.get().getCitizenId().isBlank()) {
            citizenId = userOpt.get().getCitizenId();
        }

        return buildCitizenProfileByCitizenId(citizenId, username);
    }

    @Transactional
    public CitizenProfileDto getCitizenProfileById(String citizenId) {
        return buildCitizenProfileByCitizenId(citizenId, "admin");
    }

    private CitizenProfileDto buildCitizenProfileByCitizenId(String citizenId, String usernameForConsents) {
        String cleanId = (citizenId != null && !citizenId.isBlank()) ? citizenId.trim() : "MH-CIT-10001";
        Citizen citizen = citizenRepository.findByCitizenId(cleanId)
                .orElseGet(() -> citizenProvisioningService.getOrCreateCitizen(cleanId, null, null, null));

        String effectiveCitizenId = citizen.getCitizenId();

        // Department Identifiers
        Map<String, String> deptIdentifiers = new LinkedHashMap<>();
        if (citizen != null) {
            departmentIdentifierRepository.findByCitizenId(citizen.getId()).forEach(di -> {
                String deptCode = di.getDepartment() != null ? di.getDepartment().getDepartmentCode() : "DEPT";
                deptIdentifiers.put(deptCode, di.getDepartmentSpecificId());
            });
        }
        if (deptIdentifiers.isEmpty()) {
            deptIdentifiers.put("REV", "REV-7-12-001");
            deptIdentifiers.put("AGR", "AGR-FARM-001");
            deptIdentifiers.put("WEL", "WEL-BEN-001");
        }

        // Revenue Preview
        Map<String, Object> revPreview = new LinkedHashMap<>();
        revenueLandRecordRepository.findFirstByCitizen_CitizenId(effectiveCitizenId)
                .or(() -> revenueLandRecordRepository.findFirstByCitizen_CitizenId("MH-CIT-10001"))
                .ifPresent(l -> {
            revPreview.put("surveyNumber", l.getSurveyNumber());
            revPreview.put("areaHectares", l.getTotalAreaHectares());
            double acres = l.getTotalAreaHectares() != null ? Math.round(l.getTotalAreaHectares().doubleValue() * 2.47105 * 100.0) / 100.0 : 0.0;
            revPreview.put("areaAcres", acres);
            revPreview.put("landType", l.getLandType());
            revPreview.put("khataNumber", l.getKhataNumber());
            revPreview.put("district", l.getDistrict() != null ? l.getDistrict().getName() : "");
            revPreview.put("taluka", l.getTaluka() != null ? l.getTaluka().getName() : "");
            revPreview.put("village", l.getVillage() != null ? l.getVillage().getName() : "");
        });
        if (revPreview.isEmpty()) {
            revPreview.put("surveyNumber", "SN-101");
            revPreview.put("areaHectares", 0.80);
            revPreview.put("areaAcres", 1.98);
            revPreview.put("landType", "BAGAYAT");
            revPreview.put("khataNumber", "KH-8801");
            revPreview.put("district", "Pune");
            revPreview.put("taluka", "Haveli");
            revPreview.put("village", "Wagholi");
        }

        // Agriculture Preview
        Map<String, Object> agriPreview = new LinkedHashMap<>();
        agricultureFarmerProfileRepository.findFirstByCitizen_CitizenId(effectiveCitizenId)
                .or(() -> agricultureFarmerProfileRepository.findFirstByCitizen_CitizenId("MH-CIT-10001"))
                .ifPresent(a -> {
            agriPreview.put("farmerCategory", a.getFarmerCategory());
            agriPreview.put("primaryCrop", a.getPrimaryCrop());
            agriPreview.put("cropSeason", "Kharif");
            agriPreview.put("soilHealthCardNumber", "SHC-PUN-" + (citizen != null ? citizen.getId() : 1));
            agriPreview.put("subsidiesAvailedInr", a.getSubsidyAvailedInr());
            agriPreview.put("pmKisanEligible", true);
        });
        if (agriPreview.isEmpty()) {
            agriPreview.put("farmerCategory", "SMALL_HOLDER");
            agriPreview.put("primaryCrop", "Cotton");
            agriPreview.put("cropSeason", "Kharif");
            agriPreview.put("soilHealthCardNumber", "SHC-PUN-1");
            agriPreview.put("subsidiesAvailedInr", 12000);
            agriPreview.put("pmKisanEligible", true);
        }

        // Welfare Preview
        Map<String, Object> welPreview = new LinkedHashMap<>();
        welfareBeneficiaryRecordRepository.findFirstByCitizen_CitizenId(effectiveCitizenId)
                .or(() -> welfareBeneficiaryRecordRepository.findFirstByCitizen_CitizenId("MH-CIT-10001"))
                .ifPresent(w -> {
            welPreview.put("schemeCode", w.getSchemeCode());
            welPreview.put("schemeName", w.getSchemeName());
            welPreview.put("beneficiaryCategory", w.getBeneficiaryCategory());
            welPreview.put("monthlyStipendInr", w.getMonthlyStipendInr());
            welPreview.put("disbursementStatus", w.getDisbursementStatus());
            welPreview.put("bankAccountNumber", w.getBankAccountMasked());
            welPreview.put("ifscCode", w.getIfscCodeMasked());
        });
        if (welPreview.isEmpty()) {
            welPreview.put("schemeCode", "SCH_WEL_01");
            welPreview.put("schemeName", "Sanjay Gandhi Niradhar Anudan Yojana");
            welPreview.put("beneficiaryCategory", "DESTITUTE");
            welPreview.put("monthlyStipendInr", 1500);
            welPreview.put("disbursementStatus", "PROCESSED");
            welPreview.put("bankAccountNumber", "MAHB-XXXX-3001");
            welPreview.put("ifscCode", "MAHB0000123");
        }

        // Active Consents
        List<ConsentDto> consents = Collections.emptyList();
        try {
            consents = consentService.getConsentsForUser(usernameForConsents);
        } catch (Exception e) {
            log.warn("Could not retrieve consents for citizen {}: {}", usernameForConsents, e.getMessage());
        }
        List<ConsentDto> activeConsents = consents.stream()
                .filter(c -> "ACTIVE".equalsIgnoreCase(c.getStatus()))
                .toList();

        // Recent Access Logs
        List<CitizenDataAccessDto> accessLogs = Collections.emptyList();
        try {
            accessLogs = auditLogService.getCitizenDataAccessHistory(effectiveCitizenId);
        } catch (Exception e) {
            log.warn("Could not retrieve access logs for citizen {}: {}", effectiveCitizenId, e.getMessage());
        }

        String distName = (citizen != null && citizen.getDistrict() != null) ? citizen.getDistrict().getName() : "Pune";
        String talName = (citizen != null && citizen.getTaluka() != null) ? citizen.getTaluka().getName() : "Haveli";
        String vilName = (citizen != null && citizen.getVillage() != null) ? citizen.getVillage().getName() : "Wagholi";
        String fullAddress = "House No. 104, " + vilName + ", Taluka " + talName + ", District " + distName + ", Maharashtra";
        String syntheticAadhaar = (citizen != null && citizen.getAadhaarMasked() != null && !citizen.getAadhaarMasked().isBlank())
                ? citizen.getAadhaarMasked()
                : "XXXX-XXXX-" + (effectiveCitizenId.length() >= 4 ? effectiveCitizenId.substring(effectiveCitizenId.length() - 4) : "1001");

        String fullName = citizen != null ? citizen.getFullName() : userRepository.findByUsernameOrEmail(usernameForConsents).map(User::getFullName).orElse("Citizen Beneficiary");

        return CitizenProfileDto.builder()
                .citizenId(effectiveCitizenId)
                .fullName(fullName)
                .aadhaarHash(syntheticAadhaar)
                .dob(citizen != null ? citizen.getDateOfBirth() : java.time.LocalDate.of(1982, 5, 14))
                .gender(citizen != null ? citizen.getGender() : "MALE")
                .mobileNumber(citizen != null ? citizen.getMaskedPhone() : "+91-XXXXX-12001")
                .email(citizen != null ? citizen.getMaskedEmail() : "citizen@gov-synthetic.in")
                .district(distName)
                .taluka(talName)
                .village(vilName)
                .fullAddress(fullAddress)
                .pincode("412207")
                .departmentIdentifiers(deptIdentifiers)
                .revenueLandPreview(revPreview)
                .agricultureProfilePreview(agriPreview)
                .welfareBeneficiaryPreview(welPreview)
                .activeConsentsCount(activeConsents.size())
                .totalAccessEventsCount(accessLogs.size())
                .activeConsents(activeConsents)
                .recentAccessLogs(accessLogs.stream().limit(10).toList())
                .build();
    }
}
