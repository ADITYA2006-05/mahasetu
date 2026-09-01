# MahaSetu (महासेतू) — Complete Platform Guide & User Manual

**Government of Maharashtra Cross-Departmental Interoperability Platform**  
*Smart India Hackathon (SIH26129)*

---

## Table of Contents

1. [Why This Platform Was Built (Problem & Purpose)](#1-why-this-platform-was-built-problem--purpose)
2. [What MahaSetu Is For (Core Objectives & Stakeholders)](#2-what-mahasetu-is-for-core-objectives--stakeholders)
3. [Core Functionality & Architecture](#3-core-functionality--architecture)
4. [Step-by-Step User Guide (How to Use Each Portal)](#4-step-by-step-user-guide-how-to-use-each-portal)
   - [A. Creating an Account / Role Selection](#a-creating-an-account--role-selection)
   - [B. Citizen Self-Service Portal](#b-citizen-self-service-portal)
   - [C. Department Officer Console](#c-department-officer-console)
   - [D. State Administrator Telemetry Dashboard](#d-state-administrator-telemetry-dashboard)
   - [E. Live Interactive Showcase (`/demo`)](#e-live-interactive-showcase-demo)
5. [Pre-configured Demo Accounts & Credentials](#5-pre-configured-demo-accounts--credentials)
6. [How to Run the Application Locally](#6-how-to-run-the-application-locally)

---

## 1. Why This Platform Was Built (Problem & Purpose)

### The Real-World Dilemma in State Governance

In state governance (specifically in Maharashtra), different government departments operate as **isolated data silos**:
- **Revenue & Forest Department**: Custodians of land title extracts (7/12 records, 8-A khata ledgers, mutation entries).
- **Department of Agriculture**: Maintains farmer crop declarations, soil health card registries, and PM-KISAN subsidy databases.
- **Social Justice & Welfare Department**: Oversees Direct Benefit Transfer (DBT) beneficiary lists, pension rolls, and disability allowances.

Each department operates its own legacy systems, database formats, and APIs. 

### What Goes Wrong Without Interoperability?

1. **Massive Citizen Burden & Delays**:
   When a farmer in Maharashtra applies for a drip-irrigation subsidy or drought compensation, the Agriculture Department requires a certified 7/12 land extract from Revenue and an income certificate from Welfare. The citizen must visit multiple Taluka/Tehsil offices, stand in queues, and wait weeks for physical attestations.

2. **Counterfeits & Subsidy Leakages**:
   Physical paper documents and forged rubber stamps result in ineligible beneficiaries draining state welfare coffers.

3. **The Data Hoarding Trap**:
   Past attempts to solve this involved building a **centralized "mega-database"** that copies and pools all citizen data into one place. This creates:
   - **Severe security vulnerabilities**: A single data breach exposes the entire state's population.
   - **Stale data**: Central copies quickly get out of sync with authoritative local department databases.
   - **Departmental resistance**: Sovereign departments resist handing over ownership of their authoritative ledgers.

4. **Incompatible Schemas & Field Names**:
   Revenue uses `snake_case` (e.g. `khata_no`, `survey_no`), Agriculture uses `camelCase` (e.g. `farmerId`, `cropName`), and Welfare uses deeply nested structures. Systems cannot talk to each other without standard translation.

### The MahaSetu Vision

**MahaSetu (महासेतू — "The Great Bridge")** solves this through a **Zero-Data-Hoarding, Privacy-First Federated Gateway**:
- **No Central Data Storage**: MahaSetu does **not** store or hoard citizen records. It acts as an intelligent transit bridge.
- **On-Demand Federation**: When an authorized officer needs to verify a beneficiary, MahaSetu queries the authoritative departments in parallel in real time, normalizes the data, and delivers it immediately.
- **DPDP Act Compliance**: Citizen privacy is guaranteed by a cryptographic consent gatekeeper. No officer can pull data without active citizen consent and purpose limitation.

---

## 2. What MahaSetu Is For (Core Objectives & Stakeholders)

MahaSetu is designed for three primary stakeholders:

```
+-------------------------------------------------------------------------------+
|                                MAHASETU ROLES                                 |
+-----------------------+-------------------------------+-----------------------+
|  1. THE CITIZEN       |  2. THE DEPARTMENT OFFICER    |  3. THE STATE ADMIN   |
|  (Beneficiary)        |  (Verification Official)      |  (Platform Governor)  |
|                       |                               |                       |
|  - View 360 profile   |  - Verify citizen subsidy     |  - System telemetry   |
|  - Manage consents    |    applications in seconds    |  - Outage simulation  |
|  - Audit access logs  |  - Zero paper collection      |  - Tamper-proof logs  |
+-----------------------+-------------------------------+-----------------------+
```

### Key Real-World Use Cases

1. **Instant Farmer Subsidy Clearance**:
   An Agriculture Officer can enter a citizen's ID to simultaneously fetch their 7/12 land ownership, crop history, and DBT bank account in under 60 milliseconds.
2. **Citizen Privacy Dashboard**:
   Citizens log into their self-service portal to see exactly which departments have their records, grant time-bound consent to specific officers, and view an audit trail of every time their data was accessed.
3. **Statewide Telemetry & Service Resilience**:
   State IT administrators monitor the uptime, average latency, and health of every department's gateway, with automated failover if an external department goes offline.

---

## 3. Core Functionality & Architecture

```
                                  [ Citizen / Officer / Admin ]
                                                │
                                    (JWT / RBAC Authorization)
                                                ▼
                        ┌──────────────────────────────────────────────┐
                        │               MAHASETU GATEWAY               │
                        ├──────────────────────────────────────────────┤
                        │ 1. Privacy Consent Gatekeeper (DPDP 2023)    │
                        │ 2. Canonical Schema Normalization Engine     │
                        │ 3. Parallel Async Department Dispatcher      │
                        │ 4. Fault-Tolerant Circuit Breaker            │
                        │ 5. Immutable Audit Compliance Ledger         │
                        └──────────────────────┬───────────────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
     ┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
     │  REVENUE DEPT    │            │ AGRICULTURE DEPT │            │   WELFARE DEPT   │
     │ 7/12 Land Title  │            │ Crop & Subsidy   │            │ DBT & Pension    │
     │ (REST / JSON)    │            │ (REST / JSON)    │            │ (REST / JSON)    │
     └──────────────────┘            └──────────────────┘            └──────────────────┘
```

### 1. Dynamic Citizen Provisioning & Crosswalk
- The platform supports pre-seeded synthetic citizens (`MH-CIT-10001` through `MH-CIT-10050`) representing real Maharashtra demographics across Pune, Nagpur, Nashik, and Chhatrapati Sambhajinagar.
- **On-Demand Auto-Provisioning**: If an officer or citizen registers or queries with any custom Citizen ID (e.g. `MH-CIT-12345`), the system automatically provisions synthetic departmental records on the fly so the platform never halts or crashes.

### 2. DPDP-Compliant Consent Gatekeeper
- Implements India's **Digital Personal Data Protection (DPDP) Act 2023**.
- Every cross-department integration request requires an **active, non-expired citizen consent**.
- Consents enforce **Purpose Limitation** (`SUBSIDY_VERIFICATION`, `WELFARE_DISBURSEMENT`, `DISASTER_RELIEF`) and **Data Scopes** (`7/12 Land Record`, `Crop Profile`, `DBT Beneficiary Details`).
- If an officer queries a citizen without active consent, the gateway rejects the request with HTTP 403 `CONSENT_REQUIRED`.

### 3. Canonical Schema Normalization
- Departments store data in disparate field formats (`total_area_hectares` vs `landholdingHectares` vs `stipendAmount`).
- MahaSetu dynamically maps heterogeneous inputs into a clean **Canonical Data Model**:
  - `revenueLand`: Survey No, Gat No, Khata No, Total Area (Hectares & Acres), Land Type.
  - `agriculture`: Farmer Category, Primary Crop, Soil Health Card, PM-KISAN Eligibility.
  - `welfare`: Scheme Code, Scheme Name, Monthly Stipend (INR), Masked Bank Account, IFSC.

### 4. High Availability & Fault Tolerance (`PARTIAL_SUCCESS`)
- What happens if the Department of Agriculture server crashes?
- Instead of throwing a 500 error or hanging indefinitely, MahaSetu's circuit breaker marks the offline department as `FAILED` while returning the available Revenue and Welfare records with an overall status of **`PARTIAL_SUCCESS`**.

### 5. Immutable Audit Ledger
- Every transaction, login, consent modification, and data query is logged with:
  - Unique Request ID (`REQ-XXXXXXXX`) & Audit ID (`AUD-XXXXXXXX`)
  - Timestamp, Requesting Officer, Target Citizen, Purpose, Status, and Latency (ms).

---

## 4. Step-by-Step User Guide (How to Use Each Portal)

---

### A. Creating an Account / Role Selection

1. Navigate to the login page: [http://localhost:5173/login](http://localhost:5173/login) (or your deployment URL).
2. Click the **Register Account** tab at the top.
3. Select your intended **Account Classification (RBAC Role)**:
   - **Citizen Beneficiary**: Regular citizen seeking self-service access.
     - You can leave the Citizen ID blank to link to default seeded records (`MH-CIT-10001`), or enter any custom ID (e.g. `MH-CIT-12345`).
   - **Department Officer**: Verification officer.
     - Select your assigned department: **REV** (Revenue), **AGR** (Agriculture), or **WEL** (Social Welfare).
   - **State Administrator**: Full administrative authority over platform telemetry and audits.
4. Enter your Full Name, Email, Username, Phone Number, and Password (minimum 8 characters).
5. Click **Register Account**. The platform immediately provisions your account and routes you to your authorized dashboard.

---

### B. Citizen Self-Service Portal

**Navigation Path**: Sidebar &rarr; `Citizen Portal`

#### 1. Citizen Dashboard (`/citizen/dashboard`)
- **Namaste Banner**: Displays your Citizen ID, synthetic Aadhaar Hash, and District.
- **Unified Department Records**:
  - **Revenue Card**: Displays your active 7/12 Land Record, Survey Number, Total Area (in Hectares and Acres), Khata Number, and Village/Taluka.
  - **Agriculture Card**: Displays your PM-KISAN eligibility, Farmer Category (e.g. Small Holder), Soil Health Card Number, and Subsidies Availed.
  - **Social Welfare Card**: Displays enrolled schemes (e.g. *Sanjay Gandhi Niradhar Anudan Yojana*), Monthly Stipend (INR), Disbursement Status, and Masked Bank Account.
- **Quick Stat Counters**: Active Consents, Data Access Events, and Linked Department Status (3 / 3).

#### 2. Master Profile (`/citizen/profile`)
- View full demographic information: Date of Birth, Gender, Masked Phone, Masked Email, Full Address, and Pincode.
- Inspect department-specific unique identifiers (`MH-REV-KH-...`, `MH-AGR-REG-...`, `MH-WEL-BEN-...`).

#### 3. Privacy & Consents (`/citizen/consents`)
- **Active Consents List**: View all active data-sharing authorizations granted to departments.
- **Grant New Consent**:
  - Click **Grant New Consent**.
  - Choose the requesting department, intended purpose (`SUBSIDY_VERIFICATION`, etc.), and authorized scopes.
  - Set validity duration (e.g. 30 days, 90 days, 1 year).
  - Submit to immediately issue the consent.
- **Revoke Consent**: Click **Revoke Consent** on any active entry to instantly prevent further departmental access.

#### 4. Data Access History (`/citizen/data-access`)
- Displays an immutable audit trail of every officer or department that accessed your personal data.
- Shows Request ID, Accessing Department, Purpose, Accessed Scopes, and Exact Timestamp.

---

### C. Department Officer Console

**Navigation Path**: Sidebar &rarr; `Officer Portal`  
*Demo Account*: `officer.revenue` / `Officer@Revenue2026`

#### 1. Officer Dashboard (`/officer/dashboard`)
- High-level KPIs: Total Verifications Completed, Success Rate, Average Gateway Latency (ms), and Pending Verifications.
- Quick Verification search bar for rapid citizen lookup.

#### 2. Citizen Verification Pipeline (`/officer/citizen-verification`)
- Select a citizen from the pre-populated table or search by Citizen ID (e.g. `MH-CIT-10001`).
- Click **Verify & Inspect** to view cross-department records consolidated in real time.
- Review eligibility badges: Land Ownership verified, Crop declaration active, DBT account active.

#### 3. Federated Cross-Department Query (`/officer/integration`)
1. **Enter Citizen ID**: Type or select any citizen (e.g. `MH-CIT-10001` or `MH-CIT-12345`).
2. **Select Verification Purpose**:
   - `SUBSIDY_VERIFICATION` (Input subsidies, solar pump schemes)
   - `WELFARE_DISBURSEMENT` (Pensions, disability stipends)
   - `DISASTER_RELIEF` (Crop damage relief, drought compensation)
3. **Select Target Departments**: Check Revenue (`REV`), Agriculture (`AGR`), and/or Social Welfare (`WEL`).
4. **Click "Execute Federated Query"**:
   - MahaSetu verifies active citizen consent.
   - Dispatches asynchronous parallel calls to each department node.
   - Returns normalized canonical results with per-department response latencies (e.g. 28ms, 34ms, 19ms).
5. **Inspect Live JSON Payload**: Toggle between clean visual cards and raw canonical JSON for developer auditing.

---

### D. State Administrator Telemetry Dashboard

**Navigation Path**: Sidebar &rarr; `Admin Console`  
*Demo Account*: `admin` / `Admin@MahaSetu2026`

#### 1. System Overview (`/admin/dashboard`)
- **Key Metrics**: Total Transactions, Active Citizen Records, Registered Departments, and Interoperability Success Rate.
- **Real-Time Visualizations**:
  - Verification volume trends by department.
  - Latency breakdown and response time distributions.
  - Geographic distribution across Maharashtra districts (Pune, Nagpur, Nashik, etc.).

#### 2. Department Registry (`/admin/departments`)
- Lists all enrolled sovereign department nodes.
- Shows Nodal Officer names, contact emails, portal URLs, and registered services.

#### 3. Service Catalog (`/admin/services`)
- Catalog of all 10 registered interoperability endpoints (e.g. `GET /api/v1/revenue/records/7-12/{id}`, `GET /api/v1/agri/farmer/profile/{id}`).
- Inspect HTTP methods, schema versions, and endpoint URLs.

#### 4. API & Gateway Health Telemetry (`/admin/api-health`)
- Live health indicators for each departmental node (`ONLINE`, `OFFLINE`, `DEGRADED`).
- Average latency tracker with visual pulse animations.
- **Outage Simulation Switch**: Simulate a department outage (e.g. toggle Agriculture to `OFFLINE`) to test how the platform handles partial failures gracefully.

#### 5. Compliance & Audit Logs (`/admin/audit-logs`)
- Filter and search through state-wide audit logs.
- Search by Request ID, Citizen ID, Officer Username, or Status (`SUCCESS`, `PARTIAL_SUCCESS`, `CONSENT_REJECTED`).
- Export compliance reports for government auditors.

---

### E. Live Interactive Showcase (`/demo`)

**Navigation Path**: Sidebar &rarr; `Interactive Demo`

The **Live Showcase** is a single-screen demonstration tool designed for hackathon judges and evaluators:
1. **Scenario 1: Happy Path Verification**: Shows instant verification across 3 departments with valid consent.
2. **Scenario 2: Consent Revocation Rejection**: Revokes consent and shows how the gateway strictly enforces privacy with HTTP 403.
3. **Scenario 3: Simulated Department Outage**: Disables Agriculture and proves the system gracefully delivers `PARTIAL_SUCCESS`.
4. **Scenario 4: Schema Transformation**: Visualizes legacy `snake_case` input turning into clean canonical JSON.

---

## 5. Pre-configured Demo Accounts & Credentials

For evaluation and testing, the platform includes pre-seeded demo accounts (passwords use BCrypt 12 rounds):

| Role | Username | Password | Purpose / Testing Focus |
| :--- | :--- | :--- | :--- |
| **State Super Admin** | `admin` | `Admin@MahaSetu2026` | Telemetry, audit ledger, chaos engineering outage simulation |
| **Revenue Officer** | `officer.revenue` | `Officer@Revenue2026` | Citizen verification pipeline, federated queries |
| **Agriculture Officer** | `officer.agri` | `Officer@Agri2026` | Farmer profile verification, crop subsidy checks |
| **Welfare Officer** | `officer.welfare` | `Officer@Welfare2026` | DBT pension eligibility and beneficiary validation |
| **Citizen Beneficiary** | `ramesh.shinde` | `Citizen@Maha2026` | Citizen self-service portal (`MH-CIT-10001`), privacy & consents |

*Note: You can also register any new account on the Register page.*

---

## 6. How to Run the Application Locally

### Prerequisites
- **Java**: JDK 21 (LTS)
- **Node.js**: Node 18+ and `npm`

### Step 1: Start the Backend (Spring Boot)
Open a terminal in the project root:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*The Spring Boot server will start on port `8080` with in-memory PostgreSQL compatibility and automatically seed all synthetic demo data.*

### Step 2: Start the Frontend (React + Vite)
Open a second terminal in the project root:
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
*Vite will start the frontend on [http://localhost:5173](http://localhost:5173).*

### Step 3: Run Automated Test Suites
To verify all security, RBAC, and integration tests:
```powershell
cd backend
.\mvnw.cmd test
```
*Runs all 13 Phase 8 integration tests and security authorization checks.*
