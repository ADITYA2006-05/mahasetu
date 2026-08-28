# MahaSetu (महासेतू) — State Digital Interoperability Gateway

**Smart India Hackathon 2024 / SIH26129**  
**Government of Maharashtra Cross-Departmental Interoperability Platform**

---

## Synthetic Data & System Simulation Disclaimer

> [!IMPORTANT]
> **SYNTHETIC DATA DECLARATION**:
> Government department systems shown in this prototype are simulated/mock systems using synthetic data. No real government API, Aadhaar data, citizen PII, or government credentials are used.
> 
> All 50 citizen identities, land records (7/12 extracts), farmer crop profiles, and welfare direct benefit transfer (DBT) records are **100% synthetically generated** for software testing and demonstration purposes.

---

## 1. Problem Statement (SIH26129)

State government departments (such as Revenue & Forest, Agriculture, and Social Justice & Welfare) maintain separate, siloed databases with conflicting schemas and data formats. When citizens apply for subsidies or government welfare schemes, officers are forced to demand physical paper certificates (7/12 land extracts, income certificates, caste declarations), leading to:
- **Severe Verification Delays**: Weeks spent manually attesting physical land and farmer records.
- **Document Forgery Risks**: Counterfeit seals and paper certificates causing subsidy leakages.
- **Data Hoarding Vulnerabilities**: Creating monolithic databases exposes citizen PII to central data breaches.
- **Incompatible Schemas**: Department systems use inconsistent naming conventions (Revenue uses `snake_case`, Agriculture uses `camelCase`, Welfare uses nested formats).

---

## 2. The MahaSetu Solution

**MahaSetu (महासेतू)** is a zero-data-hoarding, privacy-first state digital interoperability gateway. It connects sovereign departmental systems in real-time, executing automated cross-departmental verification without permanently centralizing or storing citizen records.

```
+-----------------------------------------------------------------------------------+
|                        MahaSetu Platform Architecture                             |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [Citizen Portal]              [Officer Console]              [Admin Telemetry]   |
|  - /citizen/dashboard          - /officer/dashboard           - /admin/dashboard  |
|  - /citizen/profile            - /officer/citizen-verification- /admin/departments|
|  - /citizen/consents           - /officer/integration         - /admin/services   |
|  - /citizen/data-access                                       - /admin/api-health |
|                                                               - /admin/audit-logs |
|                                                                                   |
|  ============================== [Interactive Showcase] ========================  |
|                                       /demo                                       |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|                                 MahaSetu Gateway                                  |
|  1. HMAC-SHA256 JWT & BCrypt Security (12 rounds)                                 |
|  2. DPDP Consent Gatekeeper (Purpose Limitation & Scope Authorization)            |
|  3. Synthetic Identity Crosswalk (Zero PII Exposure)                              |
|  4. Asynchronous Parallel Gateway Dispatcher                                     |
|  5. Semantic Schema Mapping Engine & Canonical Model Builder                      |
|  6. Fault-Tolerant Outage Failover (Graceful PARTIAL_SUCCESS)                     |
|  7. Immutable-Style Compliance Audit Trail                                        |
+-----------------------------------------------------------------------------------+
|                               Sovereign Department Nodes                          |
|   Revenue (7/12 Land)  |   Agriculture (Crops/Farmer)   |   Social Welfare (DBT)  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Key Features

- **Zero Data Hoarding**: Citizen data remains strictly in departmental source systems; MahaSetu processes records in memory and returns them directly to authorized clients.
- **DPDP Act Compliance & Consent Gatekeeper**: No officer query can execute without active, scoped citizen consent.
- **Dynamic Semantic Schema Mapping**: Automatically normalizes legacy departmental schemas (`snake_case`, `camelCase`, nested JSON) into a unified MahaSetu canonical model.
- **Fault-Tolerant High Availability**: In the event of a departmental outage (e.g. Agriculture gateway offline), MahaSetu returns available records with a structured `PARTIAL_SUCCESS` status rather than crashing.
- **Immutable Audit Trail**: Captures an immutable compliance record for every data-sharing transaction with timestamps, user IDs, purposes, and execution latencies.
- **Role-Based Portals**: Dedicated portals for Citizens, Department Nodal Officers, and State Administrators with real-time Recharts analytics and live gateway health telemetry.

---

## 4. Technology Stack

- **Backend**: Java 21 LTS + Spring Boot 3.3.3 + Spring Security 6 + Maven
- **Security**: HMAC-SHA256 Signed JWT (JJWT 0.12.5) + BCrypt Password Hashing (12 rounds)
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts
- **Database**: PostgreSQL 16 (with automated embedded PostgreSQL-compatibility fallback)
- **API Documentation**: OpenAPI 3.0 (SpringDoc OpenAPI / Swagger UI)
- **No Heavy Infrastructure**: Strictly runs with `mvn` and `npm` — **NO Docker, Kubernetes, Firebase, Supabase, or MongoDB required**.

---

## 5. Demo Accounts & Credentials (100% Synthetic)

| Account Role | Username | Password | Scope & Permitted Actions |
| :--- | :--- | :--- | :--- |
| **State Super Admin** | `admin` | `Admin@MahaSetu2026` | Full platform telemetry, audit ledger, service registry, outage simulation |
| **Revenue Officer** | `officer.revenue` | `Officer@Revenue2026` | Citizen verification pipeline, federated queries (`REV`, `AGR`, `WEL`) |
| **Agriculture Officer** | `officer.agri` | `Officer@Agri2026` | Farmer profile verification, crop subsidy eligibility checks |
| **Welfare Officer** | `officer.welfare` | `Officer@Welfare2026` | DBT pension eligibility and beneficiary status verification |
| **Citizen Beneficiary** | `ramesh.shinde` | `Citizen@Maha2026` | Citizen self-service portal (`MH-CIT-10001`), consents & access history |

---

## 6. Quick Start Guide

### Prerequisites
- **Java JDK 21+**
- **Apache Maven 3.9+**
- **Node.js 18+ & npm**

### 1. Backend Startup
```bash
cd backend
mvn clean test
mvn spring-boot:run
```
- **Backend API Base**: `http://localhost:8080`
- **Interactive Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI 3.0 JSON**: `http://localhost:8080/v3/api-docs`

### 2. Frontend Startup
```bash
cd frontend
npm install
npm run build
npm run dev
```
- **Web Application Base**: `http://localhost:5173`
- **Interactive SIH Demo Showcase**: `http://localhost:5173/demo`

---

## 7. Application Route Map

| User Role | Route | Description |
| :--- | :--- | :--- |
| **Citizen** | `/citizen/dashboard` | Overview, Aadhaar VID, Active Consents & Entitlements |
| **Citizen** | `/citizen/profile` | Master Demographic Profile & Synthetic IDs |
| **Citizen** | `/citizen/consents` | Privacy Consent Granting & Instant Revocation |
| **Citizen** | `/citizen/data-access` | Transparency Audit Log of Officer Queries |
| **Officer** | `/officer/dashboard` | Operations Metrics, Gateway SLA & Recent Queries |
| **Officer** | `/officer/citizen-verification` | 5-Step Interoperability Verification Pipeline |
| **Officer** | `/officer/integration` | Direct Federated Integration Console |
| **Admin** | `/admin/dashboard` | State Telemetry Dashboard & Recharts Analytics |
| **Admin** | `/admin/departments` | Department Nodes & Outage Simulation Controls |
| **Admin** | `/admin/services` | Service Registry Catalogue & Schema Versions |
| **Admin** | `/admin/schema-mappings` | Schema Mapping Engine & Live Visual Transformer |
| **Admin** | `/admin/audit-logs` | Immutable Compliance Audit Ledger |
| **Admin** | `/admin/api-health` | Live Gateway Health Probes & JVM Metrics |
| **All** | `/demo` | Interactive 15-Step SIH Live Demonstration Showcase |

---

## 8. Complete API Specification

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns signed JWT token |
| `POST` | `/api/auth/register` | Public | Registers a new synthetic citizen account |
| `GET` | `/api/auth/me` | Authenticated | Retrieves current authenticated user profile & roles |
| `GET` | `/api/health` | Public | Core platform health & persistence status |
| `GET` | `/api/monitoring/health` | Authenticated | Live department gateway probes and JVM metrics |
| `GET` | `/api/monitoring/services` | Authenticated | Registered microservices status and schema versions |
| `GET` | `/api/citizen/profile` | `CITIZEN`, `ADMIN` | Master demographic profile and federated holdings |
| `GET` | `/api/officer/stats` | `OFFICER`, `ADMIN` | Officer query telemetry and recent transactions |
| `GET` | `/api/departments` | Authenticated | State department registry and nodal officers |
| `GET` | `/api/services` | `OFFICER`, `ADMIN` | Microservices catalog with SLAs and endpoints |
| `POST` | `/api/integration/request` | `OFFICER`, `ADMIN` | Privacy-gated federated integration query |
| `GET` | `/api/integration/history` | `OFFICER`, `ADMIN` | Recent integration queries for telemetry |
| `GET` | `/api/schema-mappings` | Authenticated | Schema mapping rules list |
| `POST` | `/api/schema-mappings/transform`| Authenticated | Live schema transformer simulator |
| `POST` | `/api/consents` | `CITIZEN`, `ADMIN`, `OFFICER` | Grant citizen data-sharing consent agreement |
| `GET` | `/api/consents` | Authenticated | List consents (isolated by ownership) |
| `PUT` | `/api/consents/{id}/revoke` | `CITIZEN`, `ADMIN` | Cryptographically revoke citizen consent |
| `GET` | `/api/citizen/data-access` | `CITIZEN`, `ADMIN` | Citizen personal transparency access log |
| `GET` | `/api/audit-logs` | `ADMIN`, `SYSTEM` | State-wide immutable compliance audit ledger |
| `PUT` | `/api/mock/admin/departments/{code}/status` | `ADMIN` | Interactive outage simulation toggle |

---

## 9. 5-Minute SIH Presentation Workflow

1. **Step 1**: Login as Department Officer (`officer.revenue` / `Officer@Revenue2026`).
2. **Step 2**: Open Citizen Verification (`/officer/citizen-verification`) $\rightarrow$ Select `MH-CIT-10001` (Ramesh Shinde).
3. **Step 3**: Confirm active citizen consent for `SUBSIDY_VERIFICATION`.
4. **Step 4**: Click "Initiate Verification Pipeline".
5. **Step 5**: Watch the 5-step visual pipeline dispatch parallel queries to Revenue, Agriculture, and Welfare.
6. **Step 6**: Inspect disparate legacy schemas (snake_case in Revenue, camelCase in Agriculture, nested in Welfare).
7. **Step 7**: Observe Schema Mapping Engine dynamically normalizing fields.
8. **Step 8**: View single unified MahaSetu Canonical Model with verified land (`1.98 Acres`), crop (`Cotton`), and pension (`SGN-01`).
9. **Step 9**: Verify explicit source attribution tags (`LAND` $\rightarrow$ Revenue, `CROP` $\rightarrow$ Agriculture, `WELFARE` $\rightarrow$ Welfare).
10. **Step 10**: Confirm instant eligibility sanctioning.
11. **Step 11**: Open Audit Ledger (`/admin/audit-logs`) to display immutable compliance record.
12. **Step 12**: Open Live API Health (`/admin/api-health`) $\rightarrow$ Click "Simulate Outage" on Agriculture.
13. **Step 13**: Re-run verification to demonstrate resilient failover: Revenue `SUCCESS`, Agriculture `FAILED`, Welfare `SUCCESS` $\rightarrow$ Overall `PARTIAL_SUCCESS`.
14. **Step 14**: Login as Citizen `ramesh.shinde` (`/citizen/consents`) $\rightarrow$ Click "Revoke Consent".
15. **Step 15**: Repeat officer query to prove privacy gatekeeper blocking with `CONSENT_REQUIRED`.

---

## 10. Future Scope & Limitations

### Limitations of the Prototype
- Designed as a state-level demonstration prototype with simulated mock gateways querying PostgreSQL synthetic data.
- Departmental APIs operate on simulated network latency (10–50ms) rather than real production government wide-area networks.

### Future Scope
- **Blockchain Integration**: Integration with Hyperledger Fabric for cross-state immutable consent anchoring.
- **DigiLocker Integration**: Direct binding with National DigiLocker API gateways for document credential verification.
- **Multilingual Support**: Expanding Marathi (मराठी) and Hindi (हिंदी) natural language localisation across all portal views.
