-- =====================================================================
-- MahaSetu - Government Digital Interoperability Platform (SIH26129)
-- Database DDL Schema (PostgreSQL)
-- Phase 1 & Phase 2: Core Entities + Auth & RBAC
-- =====================================================================

-- 1. Administrative Hierarchy: Districts
CREATE TABLE IF NOT EXISTS districts (
    id BIGSERIAL PRIMARY KEY,
    district_code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL DEFAULT 'Maharashtra',
    division VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Administrative Hierarchy: Talukas (Sub-districts)
CREATE TABLE IF NOT EXISTS talukas (
    id BIGSERIAL PRIMARY KEY,
    taluka_code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    district_id BIGINT NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Administrative Hierarchy: Villages
CREATE TABLE IF NOT EXISTS villages (
    id BIGSERIAL PRIMARY KEY,
    village_code VARCHAR(10) NOT NULL UNIQUE,
    census_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    taluka_id BIGINT NOT NULL REFERENCES talukas(id) ON DELETE RESTRICT,
    district_id BIGINT NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    pincode VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Citizen Registry (Synthetic Canonical Registry)
CREATE TABLE IF NOT EXISTS citizens (
    id BIGSERIAL PRIMARY KEY,
    citizen_id VARCHAR(30) NOT NULL UNIQUE, -- Synthetic ID e.g. MH-CIT-10001
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    date_of_birth DATE NOT NULL,
    masked_phone VARCHAR(20) NOT NULL,     -- Synthetic e.g. +91-XXXXX-12001
    masked_email VARCHAR(100) NOT NULL,    -- Synthetic e.g. m***1@gov-synthetic.in
    annual_income_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    occupation VARCHAR(100) NOT NULL,
    village_id BIGINT NOT NULL REFERENCES villages(id) ON DELETE RESTRICT,
    taluka_id BIGINT NOT NULL REFERENCES talukas(id) ON DELETE RESTRICT,
    district_id BIGINT NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Government Departments Registry
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    department_code VARCHAR(10) NOT NULL UNIQUE, -- REV, AGR, WEL
    name VARCHAR(150) NOT NULL,
    description TEXT,
    nodal_officer VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    portal_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Department Specific Identifiers (Federated Identity Mapping)
CREATE TABLE IF NOT EXISTS department_identifiers (
    id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
    department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    department_specific_id VARCHAR(50) NOT NULL, -- e.g. MH-REV-KH-10001, MH-AGR-REG-10001
    identifier_type VARCHAR(50) NOT NULL,        -- KHATA_7_12, FARMER_REGISTRATION, WELFARE_BENEFICIARY_ID
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, ARCHIVED
    issued_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_dept_citizen_identifier UNIQUE (department_id, department_specific_id),
    CONSTRAINT uq_citizen_dept_type UNIQUE (citizen_id, department_id, identifier_type)
);

-- 7. Revenue Department: Land Records (7/12 Extracts)
CREATE TABLE IF NOT EXISTS revenue_land_records (
    id BIGSERIAL PRIMARY KEY,
    record_id VARCHAR(50) NOT NULL UNIQUE,       -- e.g. MH-REV-LR-10001
    citizen_id BIGINT NOT NULL REFERENCES citizens(id) ON DELETE RESTRICT,
    department_identifier_id BIGINT REFERENCES department_identifiers(id) ON DELETE SET NULL,
    district_id BIGINT NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    taluka_id BIGINT NOT NULL REFERENCES talukas(id) ON DELETE RESTRICT,
    village_id BIGINT NOT NULL REFERENCES villages(id) ON DELETE RESTRICT,
    survey_number VARCHAR(30) NOT NULL,
    gat_number VARCHAR(30) NOT NULL,
    khata_number VARCHAR(30) NOT NULL,
    total_area_hectares NUMERIC(8, 4) NOT NULL,
    cultivable_area_hectares NUMERIC(8, 4) NOT NULL,
    uncultivable_area_hectares NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
    land_type VARCHAR(50) NOT NULL,              -- JIRAIT (Dry), BAGAYAT (Irrigated), TARI (Paddy)
    ownership_type VARCHAR(50) NOT NULL,         -- SINGLE, OCCUPANT_CLASS_1, OCCUPANT_CLASS_2
    encumbrance_status VARCHAR(50) NOT NULL DEFAULT 'NONE', -- NONE, MORTGAGED_BANK, LIEN
    registration_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Agriculture Department: Farmer Profiles & Soil Health
CREATE TABLE IF NOT EXISTS agriculture_farmer_profiles (
    id BIGSERIAL PRIMARY KEY,
    profile_id VARCHAR(50) NOT NULL UNIQUE,      -- e.g. MH-AGR-FP-10001
    citizen_id BIGINT NOT NULL REFERENCES citizens(id) ON DELETE RESTRICT,
    department_identifier_id BIGINT REFERENCES department_identifiers(id) ON DELETE SET NULL,
    farmer_category VARCHAR(50) NOT NULL,        -- MARGINAL (<1ha), SMALL (1-2ha), SEMI_MEDIUM (2-4ha), LARGE (>4ha)
    primary_crop VARCHAR(100) NOT NULL,          -- Cotton, Soybean, Sugarcane, Onion, Jowar, Tur
    secondary_crop VARCHAR(100),
    soil_type VARCHAR(50) NOT NULL,              -- Black Cotton, Loamy, Laterite, Alluvial
    irrigation_source VARCHAR(50) NOT NULL,      -- Drip, Canal, Well, Rainfed
    landholding_hectares NUMERIC(8, 4) NOT NULL,
    kisan_credit_card_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, APPLIED, NOT_ISSUED
    subsidy_availed_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    last_claim_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Social Welfare Department: Beneficiary Records
CREATE TABLE IF NOT EXISTS welfare_beneficiary_records (
    id BIGSERIAL PRIMARY KEY,
    beneficiary_record_id VARCHAR(50) NOT NULL UNIQUE, -- e.g. MH-WEL-BR-10001
    citizen_id BIGINT NOT NULL REFERENCES citizens(id) ON DELETE RESTRICT,
    department_identifier_id BIGINT REFERENCES department_identifiers(id) ON DELETE SET NULL,
    scheme_name VARCHAR(150) NOT NULL,          -- Sanjay Gandhi Niradhar Yojana, Shravanbal Seva, PM-KISAN State Top-up
    scheme_code VARCHAR(50) NOT NULL,
    beneficiary_category VARCHAR(50) NOT NULL,  -- SENIOR_CITIZEN, WIDOW, DISABLED, BPL_FARMER
    monthly_stipend_inr NUMERIC(10, 2) NOT NULL,
    bank_account_masked VARCHAR(30) NOT NULL,   -- e.g. SBIN-XXXXX-9801
    ifsc_code_masked VARCHAR(20) NOT NULL,      -- e.g. SBIN000XXXX
    disbursement_status VARCHAR(20) NOT NULL DEFAULT 'PROCESSED', -- PROCESSED, PENDING, REJECTED
    last_disbursement_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Service Registry (Interoperability Endpoints)
CREATE TABLE IF NOT EXISTS services (
    id BIGSERIAL PRIMARY KEY,
    service_code VARCHAR(50) NOT NULL UNIQUE,   -- e.g. REV_LAND_VERIFY_V1, AGR_FARMER_STATUS_V1
    name VARCHAR(150) NOT NULL,
    department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    endpoint_path VARCHAR(200) NOT NULL,
    request_method VARCHAR(10) NOT NULL DEFAULT 'GET',
    response_format VARCHAR(20) NOT NULL DEFAULT 'JSON',
    sla_seconds INTEGER NOT NULL DEFAULT 2,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Canonical Schema Mappings (Cross-Departmental Field Federation & Canonical Model)
CREATE TABLE IF NOT EXISTS schema_mappings (
    id BIGSERIAL PRIMARY KEY,
    source_department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    target_department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL DEFAULT 'CANONICAL_MAPPING', -- CANONICAL_MAPPING, LAND_TO_FARMER, etc.
    source_field VARCHAR(100) NOT NULL,
    target_field VARCHAR(100) NOT NULL,
    data_type VARCHAR(30) NOT NULL DEFAULT 'STRING',               -- STRING, NUMBER, DOUBLE, INTEGER, BOOLEAN
    transformation_rule VARCHAR(100) NOT NULL DEFAULT 'DIRECT_MAP',-- DIRECT_MAP, FEDERATED_KEY, etc.
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- Phase 2: Authentication & Role-Based Access Control (RBAC)
-- =====================================================================

-- 12. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- ROLE_CITIZEN, ROLE_DEPARTMENT_OFFICER, ROLE_ADMIN, ROLE_SYSTEM
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_masked VARCHAR(20),
    department_code VARCHAR(10), -- REV, AGR, WEL (for officers)
    citizen_id VARCHAR(30),      -- Synthetic ID e.g. MH-CIT-10001 (for citizens)
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. User Roles Join Table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- =====================================================================
-- Phase 4: Core Interoperability & Integration Engine
-- =====================================================================

-- 15. Integration Requests (Audit & Request Orchestration)
CREATE TABLE IF NOT EXISTS integration_requests (
    id BIGSERIAL PRIMARY KEY,
    request_id VARCHAR(50) NOT NULL UNIQUE,
    citizen_id VARCHAR(30) NOT NULL,
    requesting_user VARCHAR(100) NOT NULL,
    purpose VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- SUCCESS, PARTIAL_SUCCESS, FAILED, PENDING
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 16. Integration Request Results (Per-Department Execution Results)
CREATE TABLE IF NOT EXISTS integration_request_results (
    id BIGSERIAL PRIMARY KEY,
    request_id VARCHAR(50) NOT NULL REFERENCES integration_requests(request_id) ON DELETE CASCADE,
    department_code VARCHAR(20) NOT NULL,          -- REVENUE, AGRICULTURE, WELFARE
    status VARCHAR(30) NOT NULL,                   -- SUCCESS, FAILED
    response_time_ms BIGINT NOT NULL DEFAULT 0,
    error_code VARCHAR(50),                        -- SERVICE_UNAVAILABLE, TIMEOUT, NOT_FOUND, etc.
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- Phase 6: Consent Management & Audit Logging
-- =====================================================================

-- 17. Citizen Consents Table
CREATE TABLE IF NOT EXISTS consents (
    id BIGSERIAL PRIMARY KEY,
    consent_id VARCHAR(50) NOT NULL UNIQUE,
    citizen_id VARCHAR(30) NOT NULL REFERENCES citizens(citizen_id) ON DELETE CASCADE,
    requesting_department VARCHAR(30) NOT NULL,    -- AGRICULTURE, REVENUE, WELFARE, ALL
    purpose VARCHAR(100) NOT NULL,                 -- SUBSIDY_VERIFICATION, BENEFIT_DISBURSEMENT, etc.
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, REVOKED, EXPIRED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- 18. Consent Scopes Table
CREATE TABLE IF NOT EXISTS consent_scopes (
    id BIGSERIAL PRIMARY KEY,
    consent_id VARCHAR(50) NOT NULL REFERENCES consents(consent_id) ON DELETE CASCADE,
    data_scope VARCHAR(50) NOT NULL,               -- IDENTITY, LOCATION, LAND, AGRICULTURE, WELFARE
    CONSTRAINT uq_consent_scope UNIQUE (consent_id, data_scope)
);

-- 19. Immutable-Style Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    audit_id VARCHAR(50) NOT NULL UNIQUE,
    request_id VARCHAR(50) NOT NULL,
    citizen_id VARCHAR(30) NOT NULL,
    requesting_user VARCHAR(100) NOT NULL,
    requesting_department VARCHAR(50),
    target_department VARCHAR(50),
    target_service VARCHAR(150),
    purpose VARCHAR(100),
    data_scope VARCHAR(150),
    status VARCHAR(30) NOT NULL,                   -- SUCCESS, PARTIAL_SUCCESS, FAILED, CONSENT_REJECTED, SCOPE_REJECTED
    response_time_ms BIGINT DEFAULT 0,
    error_code VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Optimal Query Performance
CREATE INDEX IF NOT EXISTS idx_citizens_citizen_id ON citizens(citizen_id);
CREATE INDEX IF NOT EXISTS idx_citizens_district ON citizens(district_id);
CREATE INDEX IF NOT EXISTS idx_dept_ident_citizen ON department_identifiers(citizen_id);
CREATE INDEX IF NOT EXISTS idx_dept_ident_dept ON department_identifiers(department_id);
CREATE INDEX IF NOT EXISTS idx_rev_land_citizen ON revenue_land_records(citizen_id);
CREATE INDEX IF NOT EXISTS idx_rev_land_khata ON revenue_land_records(khata_number);
CREATE INDEX IF NOT EXISTS idx_agr_farmer_citizen ON agriculture_farmer_profiles(citizen_id);
CREATE INDEX IF NOT EXISTS idx_wel_beneficiary_citizen ON welfare_beneficiary_records(citizen_id);
CREATE INDEX IF NOT EXISTS idx_services_dept ON services(department_id);
CREATE INDEX IF NOT EXISTS idx_schema_map_entity ON schema_mappings(entity_type);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_dept ON users(department_code);
CREATE INDEX IF NOT EXISTS idx_integ_req_id ON integration_requests(request_id);
CREATE INDEX IF NOT EXISTS idx_integ_req_citizen ON integration_requests(citizen_id);
CREATE INDEX IF NOT EXISTS idx_integ_req_created ON integration_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integ_res_req_id ON integration_request_results(request_id);

-- Phase 6 Indexes
CREATE INDEX IF NOT EXISTS idx_consents_citizen ON consents(citizen_id);
CREATE INDEX IF NOT EXISTS idx_consents_id ON consents(consent_id);
CREATE INDEX IF NOT EXISTS idx_consents_status ON consents(status);
CREATE INDEX IF NOT EXISTS idx_consents_dept ON consents(requesting_department);
CREATE INDEX IF NOT EXISTS idx_consent_scopes_id ON consent_scopes(consent_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_citizen ON audit_logs(citizen_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request ON audit_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_dept ON audit_logs(requesting_department);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);


