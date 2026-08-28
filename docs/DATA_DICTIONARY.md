# MahaSetu Data Dictionary (Phase 1)

This data dictionary outlines the 11 core database tables and JPA entities within MahaSetu.

---

## 1. `districts`
Administrative districts in Maharashtra.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | Internal primary key |
| `district_code` | VARCHAR(10) | UNIQUE, NOT NULL | District code (e.g. `MH-PUN`, `MH-NAG`) |
| `name` | VARCHAR(100) | NOT NULL | Name of district (e.g. Pune, Nagpur, Nashik) |
| `state` | VARCHAR(50) | NOT NULL | State name (Default: `Maharashtra`) |
| `division` | VARCHAR(50) | NOT NULL | Administrative division (e.g. Pune Division) |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |

---

## 2. `talukas`
Sub-district administrative divisions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | Internal primary key |
| `taluka_code` | VARCHAR(10) | UNIQUE, NOT NULL | Taluka code (e.g. `TAL-HAV`, `TAL-BAR`) |
| `name` | VARCHAR(100) | NOT NULL | Taluka name (e.g. Haveli, Baramati) |
| `district_id` | BIGINT | FK -> `districts(id)` | Parent district identifier |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |

---

## 3. `villages`
Rural local body units.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | Internal primary key |
| `village_code` | VARCHAR(10) | UNIQUE, NOT NULL | Village code (e.g. `VIL-WAG`, `VIL-HAD`) |
| `census_code` | VARCHAR(20) | UNIQUE, NOT NULL | Census code (e.g. `CEN-553101`) |
| `name` | VARCHAR(100) | NOT NULL | Village name (e.g. Wagholi, Hadapsar Rural) |
| `taluka_id` | BIGINT | FK -> `talukas(id)` | Parent taluka identifier |
| `district_id` | BIGINT | FK -> `districts(id)` | Parent district identifier |
| `pincode` | VARCHAR(10) | NOT NULL | Postal PIN code (e.g. `412207`) |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |

---

## 4. `citizens`
Canonical citizen registry holding synthetic citizen records.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | Internal primary key |
| `citizen_id` | VARCHAR(30) | UNIQUE, NOT NULL | Synthetic Citizen ID (`MH-CIT-10001` .. `50`) |
| `full_name` | VARCHAR(150) | NOT NULL | Synthetic citizen name |
| `gender` | VARCHAR(10) | NOT NULL | `MALE` or `FEMALE` |
| `date_of_birth` | DATE | NOT NULL | Birth date |
| `masked_phone` | VARCHAR(20) | NOT NULL | Masked phone (e.g. `+91-XXXXX-12001`) |
| `masked_email` | VARCHAR(100) | NOT NULL | Masked email (e.g. `r***1@gov-synthetic.in`) |
| `annual_income_inr` | NUMERIC(12,2) | NOT NULL | Annual household income in INR |
| `occupation` | VARCHAR(100) | NOT NULL | Primary livelihood |
| `village_id` | BIGINT | FK -> `villages(id)` | Registered village |
| `taluka_id` | BIGINT | FK -> `talukas(id)` | Registered taluka |
| `district_id` | BIGINT | FK -> `districts(id)` | Registered district |
| `is_active` | BOOLEAN | NOT NULL DEFAULT TRUE| Active status flag |
| `created_at` | TIMESTAMP | DEFAULT NOW | Record creation timestamp |

---

## 5. `departments`
Participating government departments.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | Internal primary key |
| `department_code` | VARCHAR(10) | UNIQUE, NOT NULL | Department code (`REV`, `AGR`, `WEL`) |
| `name` | VARCHAR(150) | NOT NULL | Full department title |
| `description` | TEXT | NULLABLE | Department mandate |
| `nodal_officer` | VARCHAR(100) | NOT NULL | Nodal officer in charge |
| `contact_email` | VARCHAR(100) | NOT NULL | Official departmental email |
| `portal_url` | VARCHAR(255) | NULLABLE | Departmental web portal URL |
| `is_active` | BOOLEAN | NOT NULL DEFAULT TRUE| Operational status |

---

## 6. `department_identifiers`
Federated identity crosswalk linking citizens to department-specific legacy IDs.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | Internal primary key |
| `citizen_id` | BIGINT | FK -> `citizens(id)` | Canonical citizen reference |
| `department_id` | BIGINT | FK -> `departments(id)`| Issuing department reference |
| `department_specific_id`| VARCHAR(50)| NOT NULL | Department ID (e.g. `MH-REV-KH-10001`) |
| `identifier_type` | VARCHAR(50) | NOT NULL | Type (`KHATA_7_12`, `FARMER_REGISTRATION`, `WELFARE_BENEFICIARY_ID`) |
| `status` | VARCHAR(20) | NOT NULL DEFAULT 'ACTIVE'| Identifier state |
| `issued_date` | DATE | NOT NULL | Date of issuance |

---

## 7. `revenue_land_records`
Land ownership records managed by Revenue & Forest Department.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | Internal primary key |
| `record_id` | VARCHAR(50) | UNIQUE, NOT NULL | Land record identifier (`MH-REV-LR-10001`) |
| `citizen_id` | BIGINT | FK -> `citizens(id)` | Land title holder |
| `department_identifier_id`| BIGINT | FK -> `department_identifiers(id)` | 7/12 Khata link |
| `survey_number` | VARCHAR(30) | NOT NULL | Cadastral survey plot number |
| `gat_number` | VARCHAR(30) | NOT NULL | Group / Gat number |
| `khata_number` | VARCHAR(30) | NOT NULL | Revenue ledger number |
| `total_area_hectares` | NUMERIC(8,4)| NOT NULL | Total land plot area |
| `cultivable_area_hectares`| NUMERIC(8,4)| NOT NULL | Farmable land area |
| `land_type` | VARCHAR(50) | NOT NULL | `BAGAYAT`, `JIRAIT`, `TARI` |
| `ownership_type` | VARCHAR(50) | NOT NULL | `SINGLE`, `OCCUPANT_CLASS_1` |
| `encumbrance_status` | VARCHAR(50) | NOT NULL | `NONE`, `MORTGAGED_BANK` |
| `registration_date` | DATE | NOT NULL | Date of registration |

---

## 8. `agriculture_farmer_profiles`
Farmer profiles and cultivation records managed by Department of Agriculture.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | Internal primary key |
| `profile_id` | VARCHAR(50) | UNIQUE, NOT NULL | Profile ID (`MH-AGR-FP-10001`) |
| `citizen_id` | BIGINT | FK -> `citizens(id)` | Registered farmer |
| `farmer_category` | VARCHAR(50) | NOT NULL | `MARGINAL`, `SMALL`, `SEMI_MEDIUM`, `LARGE` |
| `primary_crop` | VARCHAR(100) | NOT NULL | Primary crop (Cotton, Soybean, Sugarcane, Onion, Grapes, Tur) |
| `soil_type` | VARCHAR(50) | NOT NULL | Soil categorization (Black Cotton, Loamy, Alluvial) |
| `irrigation_source` | VARCHAR(50) | NOT NULL | Irrigation infrastructure (Drip, Canal, Borewell, Rainfed) |
| `landholding_hectares`| NUMERIC(8,4)| NOT NULL | Cultivated area in hectares |
| `kisan_credit_card_status`| VARCHAR(20)| NOT NULL | `ACTIVE`, `APPLIED` |
| `subsidy_availed_inr` | NUMERIC(12,2)| NOT NULL | Total DBT subsidies received |

---

## 9. `welfare_beneficiary_records`
Direct Benefit Transfer & pension records managed by Social Welfare Department.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | Internal primary key |
| `beneficiary_record_id` | VARCHAR(50)| UNIQUE, NOT NULL | Record ID (`MH-WEL-BR-10001`) |
| `citizen_id` | BIGINT | FK -> `citizens(id)` | Beneficiary citizen |
| `scheme_name` | VARCHAR(150)| NOT NULL | Scheme title (Sanjay Gandhi Niradhar, Shravanbal, etc.) |
| `scheme_code` | VARCHAR(50) | NOT NULL | Scheme code (e.g. `SCH-SGNY-01`) |
| `beneficiary_category` | VARCHAR(50) | NOT NULL | Vulnerability category |
| `monthly_stipend_inr` | NUMERIC(10,2)| NOT NULL | Monthly disbursement amount |
| `bank_account_masked` | VARCHAR(30) | NOT NULL | Masked bank account |
| `ifsc_code_masked` | VARCHAR(20) | NOT NULL | Masked bank IFSC |
| `disbursement_status` | VARCHAR(20) | NOT NULL | `PROCESSED`, `PENDING_AUDIT` |

---

## 10. `services`
Interoperability service registry endpoints.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | Internal primary key |
| `service_code` | VARCHAR(50) | UNIQUE, NOT NULL | Unique service code (`REV_712_EXTRACT_V1`, etc.) |
| `name` | VARCHAR(150) | NOT NULL | Service display title |
| `department_id` | BIGINT | FK -> `departments(id)`| Owning department |
| `endpoint_path` | VARCHAR(200) | NOT NULL | Relative REST endpoint route |
| `request_method` | VARCHAR(10) | NOT NULL | HTTP Method (`GET`, `POST`) |
| `response_format` | VARCHAR(20) | NOT NULL | Format (Default: `JSON`) |
| `sla_seconds` | INTEGER | NOT NULL | Max target response latency |

---

## 11. `schema_mappings`
Cross-departmental semantic field mapping rules.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | Internal primary key |
| `source_department_id`| BIGINT | FK -> `departments(id)`| Originating department |
| `target_department_id`| BIGINT | FK -> `departments(id)`| Consuming department |
| `entity_type` | VARCHAR(50) | NOT NULL | Entity context (`LAND_TO_FARMER`, `LAND_TO_WELFARE`, etc.) |
| `source_field` | VARCHAR(100) | NOT NULL | Origin attribute path |
| `target_field` | VARCHAR(100) | NOT NULL | Target attribute path |
| `transformation_rule` | VARCHAR(100) | NOT NULL | Transformation strategy (`DIRECT_MAP`, `FEDERATED_KEY`, etc.) |
