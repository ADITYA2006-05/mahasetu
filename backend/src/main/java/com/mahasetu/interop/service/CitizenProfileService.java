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
    private final DepartmentIdentifierRepository departmentIdentifierRepository;
    private final RevenueLandRecordRepository revenueLandRecordRepository;
    private final AgricultureFarmerProfileRepository agricultureFarmerProfileRepository;
    private final WelfareBeneficiaryRecordRepository welfareBeneficiaryRecordRepository;
    private final ConsentService consentService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public CitizenProfileDto getCitizenProfile(String username) {
        String citizenId = "MH-CIT-10001";
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent() && userOpt.get().getCitizenId() != null && !userOpt.get().getCitizenId().isBlank()) {
            citizenId = userOpt.get().getCitizenId();
        }

        return buildCitizenProfileByCitizenId(citizenId, username);
    }

    @Transactional(readOnly = true)
    public CitizenProfileDto getCitizenProfileById(String citizenId) {
        return buildCitizenProfileByCitizenId(citizenId, "admin");
    }

    private CitizenProfileDto buildCitizenProfileByCitizenId(String citizenId, String usernameForConsents) {
        Citizen citizen = citizenRepository.findByCitizenId(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen with ID '" + citizenId + "' was not found."));

        // Department Identifiers
        Map<String, String> deptIdentifiers = new LinkedHashMap<>();
        departmentIdentifierRepository.findByCitizenId(citizen.getId()).forEach(di -> {
            String deptCode = di.getDepartment() != null ? di.getDepartment().getDepartmentCode() : "DEPT";
            deptIdentifiers.put(deptCode, di.getDepartmentSpecificId());
        });

        // Revenue Preview
        Map<String, Object> revPreview = new LinkedHashMap<>();
        revenueLandRecordRepository.findFirstByCitizen_CitizenId(citizenId).ifPresent(l -> {
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

        // Agriculture Preview
        Map<String, Object> agriPreview = new LinkedHashMap<>();
        agricultureFarmerProfileRepository.findFirstByCitizen_CitizenId(citizenId).ifPresent(a -> {
            agriPreview.put("farmerCategory", a.getFarmerCategory());
            agriPreview.put("primaryCrop", a.getPrimaryCrop());
            agriPreview.put("cropSeason", "Kharif");
            agriPreview.put("soilHealthCardNumber", "SHC-PUN-" + citizen.getId());
            agriPreview.put("subsidiesAvailedInr", a.getSubsidyAvailedInr());
            agriPreview.put("pmKisanEligible", true);
        });

        // Welfare Preview
        Map<String, Object> welPreview = new LinkedHashMap<>();
        welfareBeneficiaryRecordRepository.findFirstByCitizen_CitizenId(citizenId).ifPresent(w -> {
            welPreview.put("schemeCode", w.getSchemeCode());
            welPreview.put("schemeName", w.getSchemeName());
            welPreview.put("beneficiaryCategory", w.getBeneficiaryCategory());
            welPreview.put("monthlyStipendInr", w.getMonthlyStipendInr());
            welPreview.put("disbursementStatus", w.getDisbursementStatus());
            welPreview.put("bankAccountNumber", w.getBankAccountMasked());
            welPreview.put("ifscCode", w.getIfscCodeMasked());
        });

        // Active Consents
        List<ConsentDto> consents = consentService.getConsentsForUser(usernameForConsents);
        List<ConsentDto> activeConsents = consents.stream()
                .filter(c -> "ACTIVE".equalsIgnoreCase(c.getStatus()))
                .toList();

        // Recent Access Logs
        List<CitizenDataAccessDto> accessLogs = auditLogService.getCitizenDataAccessHistory(citizenId);

        String distName = citizen.getDistrict() != null ? citizen.getDistrict().getName() : "Pune";
        String talName = citizen.getTaluka() != null ? citizen.getTaluka().getName() : "Haveli";
        String vilName = citizen.getVillage() != null ? citizen.getVillage().getName() : "Wagholi";
        String fullAddress = "House No. 104, " + vilName + ", Taluka " + talName + ", District " + distName + ", Maharashtra";
        String syntheticAadhaar = "XXXX-XXXX-" + (citizen.getCitizenId().length() >= 4 ? citizen.getCitizenId().substring(citizen.getCitizenId().length() - 4) : "1001");

        return CitizenProfileDto.builder()
                .citizenId(citizen.getCitizenId())
                .fullName(citizen.getFullName())
                .aadhaarHash(syntheticAadhaar)
                .dob(citizen.getDateOfBirth())
                .gender(citizen.getGender())
                .mobileNumber(citizen.getMaskedPhone())
                .email(citizen.getMaskedEmail())
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
