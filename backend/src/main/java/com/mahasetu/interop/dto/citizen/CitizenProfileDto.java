package com.mahasetu.interop.dto.citizen;

import com.mahasetu.interop.dto.consent.ConsentDto;
import com.mahasetu.interop.dto.audit.CitizenDataAccessDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitizenProfileDto {
    private String citizenId;
    private String fullName;
    private String aadhaarHash;
    private LocalDate dob;
    private String gender;
    private String mobileNumber;
    private String email;
    
    // Address Details
    private String district;
    private String taluka;
    private String village;
    private String fullAddress;
    private String pincode;

    // Cross-department Synthetic Identifiers
    private Map<String, String> departmentIdentifiers;

    // Entitlement Previews
    private Map<String, Object> revenueLandPreview;
    private Map<String, Object> agricultureProfilePreview;
    private Map<String, Object> welfareBeneficiaryPreview;

    // Stats & Summaries
    private int activeConsentsCount;
    private int totalAccessEventsCount;
    private List<ConsentDto> activeConsents;
    private List<CitizenDataAccessDto> recentAccessLogs;
}
