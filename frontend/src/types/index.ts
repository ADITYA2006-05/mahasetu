export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneMasked?: string;
  departmentCode?: string;
  citizenId?: string;
  roles: string[];
  active: boolean;
}

export interface AuthResponse {
  status: string;
  message: string;
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
  user: UserProfile;
  timestamp: string;
}

export interface SystemHealth {
  status: string;
  service: string;
  version: string;
  environment: string;
  database: {
    status: string;
    dialect: string;
    entities_loaded: number;
    seeder_mode: string;
  };
  timestamp: string;
}

export interface DepartmentStat {
  code: string;
  name: string;
  nodalOfficer: string;
  recordsCount: number;
  servicesCount: number;
  metricLabel: string;
  metricValue: string;
}

export interface LandStats {
  totalAreaHectares: number;
  cultivableAreaHectares: number;
  totalRecords: number;
  landTypeBreakdown: Record<string, number>;
}

export interface AgricultureStats {
  totalFarmerProfiles: number;
  totalSubsidiesAvailedInr: number;
  farmerCategoryBreakdown: Record<string, number>;
  cropBreakdown: Record<string, number>;
}

export interface WelfareStats {
  totalBeneficiaries: number;
  totalMonthlyDisbursementInr: number;
  disbursementStatusBreakdown: Record<string, number>;
  schemesBreakdown: Record<string, number>;
}

export interface DistrictDistribution {
  code: string;
  name: string;
  citizensCount: number;
  villagesCount: number;
}

export interface DepartmentResponseItem {
  department: string;
  status: 'SUCCESS' | 'FAILED';
  responseTimeMs: number;
  departmentSpecificId?: string;
  serviceEndpoint?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface CanonicalCitizen {
  id?: string;
  name?: string;
}

export interface CanonicalLocation {
  district?: string;
  taluka?: string;
  village?: string;
}

export interface CanonicalLand {
  surveyNumber?: string;
  areaAcres?: number;
  source?: string;
}

export interface CanonicalAgriculture {
  crop?: string;
  season?: string;
  landUsage?: string;
  source?: string;
}

export interface CanonicalWelfare {
  schemeCode?: string;
  schemeName?: string;
  previousBenefit?: boolean;
  applicationStatus?: string;
  benefitAmount?: number;
  source?: string;
}

export interface SchemaMappingItem {
  id?: number;
  departmentCode: string;
  departmentName?: string;
  entityType?: string;
  sourceField: string;
  canonicalField: string;
  dataType?: 'STRING' | 'NUMBER' | 'DOUBLE' | 'INTEGER' | 'BOOLEAN';
  transformationRule?: string;
  version?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface IntegrationResponse {
  requestId: string;
  citizenId: string;
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  purpose?: string;
  requestingUser?: string;
  citizen?: CanonicalCitizen;
  location?: CanonicalLocation;
  land?: CanonicalLand;
  agriculture?: CanonicalAgriculture;
  welfare?: CanonicalWelfare;
  sources?: string[];
  departmentResponses: DepartmentResponseItem[];
  createdAt?: string;
  completedAt?: string;
  totalLatencyMs?: number;
}

export interface IntegrationRequestPayload {
  citizenId: string;
  purpose: string;
  requestedDepartments: string[];
}

export interface PlatformStats {
  status: string;
  summary: {
    totalCitizens: number;
    totalDepartments: number;
    totalDistricts: number;
    totalVillages: number;
    totalLandRecords: number;
    totalFarmerProfiles: number;
    totalWelfareRecords: number;
    totalDepartmentIdentifiers: number;
    totalServices: number;
    totalSchemaMappings: number;
  };
  departmentStats: DepartmentStat[];
  landStats: LandStats;
  agricultureStats: AgricultureStats;
  welfareStats: WelfareStats;
  districtDistribution: DistrictDistribution[];
  totalIntegrationRequests?: number;
  successfulRequests?: number;
  partialRequests?: number;
  failedRequests?: number;
  averageResponseTimeMs?: number;
  requestsByStatus?: Record<string, number>;
  requestsByDepartment?: Record<string, number>;
  latencyDistribution?: Record<string, number>;
  timestamp: string;
}

// Phase 6: Consent Management & Audit Logging
export interface ConsentItem {
  id: number;
  consentId: string;
  citizenId: string;
  citizenName?: string;
  requestingDepartment: string;
  purpose: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  scopes: string[];
  createdAt: string;
  expiresAt: string;
  revokedAt?: string;
}

export interface CreateConsentPayload {
  citizenId?: string;
  requestingDepartment: string;
  purpose: string;
  scopes: string[];
  validityDays: number;
}

export interface AuditLogItem {
  id: number;
  auditId: string;
  requestId: string;
  citizenId: string;
  requestingUser: string;
  requestingDepartment?: string;
  targetDepartment?: string;
  targetService?: string;
  purpose: string;
  dataScope: string;
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'CONSENT_REJECTED' | 'SCOPE_REJECTED';
  responseTimeMs: number;
  errorCode?: string;
  timestamp: string;
}

export interface CitizenDataAccessItem {
  timestamp: string;
  requestId: string;
  department: string;
  purpose: string;
  dataAccessed: string;
  status: string;
}

// Phase 7: Complete Dashboards + Monitoring
export interface DepartmentHealth {
  departmentCode: string;
  departmentName: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  responseTimeMs: number;
  endpoint: string;
  healthStatus: 'UP' | 'DOWN';
  details: string;
  lastChecked: string;
}

export interface SystemMonitoring {
  platformStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  totalDepartments: number;
  onlineDepartments: number;
  offlineDepartments: number;
  averageGatewayLatencyMs: number;
  databaseStatus: string;
  timestamp: string;
  departments: DepartmentHealth[];
  systemMetrics: Record<string, any>;
}

export interface ServiceHealthItem {
  id: number;
  departmentCode: string;
  departmentName: string;
  serviceName: string;
  serviceCode: string;
  endpoint: string;
  httpMethod: string;
  status: 'ONLINE' | 'OFFLINE' | 'ACTIVE';
  responseTimeMs: number;
  schemaVersion: string;
  lastChecked: string;
}

export interface CitizenProfileData {
  citizenId: string;
  fullName: string;
  aadhaarHash: string;
  dob: string;
  gender: string;
  mobileNumber: string;
  email: string;
  district: string;
  taluka: string;
  village: string;
  fullAddress: string;
  pincode: string;
  departmentIdentifiers: Record<string, string>;
  revenueLandPreview?: {
    surveyNumber?: string;
    areaHectares?: number;
    areaAcres?: number;
    landType?: string;
    khataNumber?: string;
    district?: string;
    taluka?: string;
    village?: string;
  };
  agricultureProfilePreview?: {
    farmerCategory?: string;
    primaryCrop?: string;
    cropSeason?: string;
    soilHealthCardNumber?: string;
    subsidiesAvailedInr?: number;
    pmKisanEligible?: boolean;
  };
  welfareBeneficiaryPreview?: {
    schemeCode?: string;
    schemeName?: string;
    beneficiaryCategory?: string;
    monthlyStipendInr?: number;
    disbursementStatus?: string;
    bankAccountNumber?: string;
    ifscCode?: string;
  };
  activeConsentsCount: number;
  totalAccessEventsCount: number;
  activeConsents: ConsentItem[];
  recentAccessLogs: CitizenDataAccessItem[];
}

export interface OfficerStats {
  totalRequests: number;
  successfulRequests: number;
  partialRequests: number;
  failedRequests: number;
  averageResponseTimeMs: number;
  activeDepartmentsCount: number;
  departmentStatuses: Record<string, string>;
  recentRequests: IntegrationResponse[];
  timestamp: string;
}



