import { CitizenProfileData, UserProfile } from '../types';

export const getFallbackCitizenProfile = (user: UserProfile | null): CitizenProfileData => {
  const effectiveId = user?.citizenId || 'MH-CIT-10001';
  const cleanNum = effectiveId.replace(/[^0-9]/g, '') || '10001';
  const name = user?.fullName || 'Ramesh Tukaram Shinde';

  return {
    citizenId: effectiveId,
    fullName: name,
    aadhaarHash: `XXXX-XXXX-${cleanNum.slice(-4) || '1001'}`,
    dob: '1982-05-14',
    gender: 'MALE',
    mobileNumber: user?.phoneMasked || '+91-XXXXX-12001',
    email: user?.email || 'citizen@gov-synthetic.in',
    district: 'Pune',
    taluka: 'Haveli',
    village: 'Wagholi',
    fullAddress: 'House No. 104, Wagholi, Taluka Haveli, District Pune, Maharashtra',
    pincode: '412207',
    departmentIdentifiers: {
      REV: `MH-REV-KH-${cleanNum}`,
      AGR: `MH-AGR-REG-${cleanNum}`,
      WEL: `MH-WEL-BEN-${cleanNum}`,
    },
    revenueLandPreview: {
      surveyNumber: 'SN-108/2',
      areaHectares: 1.25,
      areaAcres: 3.09,
      landType: 'BAGAYAT (Irrigated)',
      khataNumber: `KH-${cleanNum}`,
      district: 'Pune',
      taluka: 'Haveli',
      village: 'Wagholi',
    },
    agricultureProfilePreview: {
      farmerCategory: 'SMALL_HOLDER',
      primaryCrop: 'Cotton',
      cropSeason: 'Kharif',
      soilHealthCardNumber: `SHC-PUN-${cleanNum}`,
      subsidiesAvailedInr: 18500,
      pmKisanEligible: true,
    },
    welfareBeneficiaryPreview: {
      schemeCode: 'SCH_WEL_01',
      schemeName: 'Sanjay Gandhi Niradhar Anudan Yojana',
      beneficiaryCategory: 'DESTITUTE',
      monthlyStipendInr: 1500,
      disbursementStatus: 'PROCESSED',
      bankAccountNumber: 'MAHB-XXXX-3001',
      ifscCode: 'MAHB0000123',
    },
    activeConsentsCount: 1,
    totalAccessEventsCount: 3,
    activeConsents: [
      {
        id: 1,
        consentId: 'CNS-DEMO-001',
        citizenId: effectiveId,
        citizenName: name,
        requestingDepartment: 'Revenue & Agriculture',
        purpose: 'SUBSIDY_VERIFICATION',
        status: 'ACTIVE',
        scopes: ['REV_LAND_RECORD', 'AGR_FARMER_PROFILE'],
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
      }
    ],
    recentAccessLogs: [
      {
        requestId: 'REQ-DEMO-801',
        department: 'Revenue Department (REV)',
        purpose: 'SUBSIDY_VERIFICATION',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        dataAccessed: '7/12 Land Record, Survey Coordinates',
        status: 'SUCCESS',
      }
    ],
  };
};
