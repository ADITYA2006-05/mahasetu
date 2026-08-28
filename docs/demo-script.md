# MahaSetu (महासेतू) — SIH Demo Presentation Script (5-Minute Walkthrough)

**Government of Maharashtra State Digital Interoperability Platform**  
**SIH26129 — Live Demonstration Playbook for Evaluation Jury**

---

## Presentation Overview
- **Duration**: 5 Minutes
- **Key Message**: MahaSetu enables secure, zero-data-hoarding cross-department data interoperability with DPDP consent compliance, semantic schema normalization, fault tolerance, and immutable audit trails.

---

## 15-Step Exact Demonstration Flow

| Step | Action & Route | What to Show the Jury | Presenter Talking Point |
| :---: | :--- | :--- | :--- |
| **1** | **Login as Department Officer**<br/>`http://localhost:5173/login`<br/>`officer.revenue` / `Officer@Revenue2026` | Officer Dashboard (`/officer/dashboard`) with live gateway status strip and operational metrics. | *"MahaSetu secures government access with role-based JWT authentication and department-specific credentials."* |
| **2** | **Select Target Citizen**<br/>`/officer/citizen-verification` | Select preset `MH-CIT-10001` (Ramesh Tukaram Shinde). | *"Instead of exposing citizen PII, MahaSetu resolves requests using privacy-preserving synthetic identifiers."* |
| **3** | **Consent Verification** | System confirms active consent granted for `SUBSIDY_VERIFICATION`. | *"Under DPDP principles, no officer query can proceed without verified citizen consent."* |
| **4** | **Start Verification** | Click "Initiate Verification Pipeline". | *"The officer initiates automated cross-departmental verification with a single click."* |
| **5** | **Gateway Dispatch** | 5-step visual pipeline animating through `Identity` $\rightarrow$ `Consent` $\rightarrow$ `Gateways` $\rightarrow$ `Schema` $\rightarrow$ `Unified Response`. | *"MahaSetu dispatches asynchronous parallel queries to Revenue, Agriculture, and Welfare gateways."* |
| **6** | **Disparate Legacy Schemas** | Click "Inspect Raw Gateway Responses" in modal / demo page. | *"Notice how Revenue returns snake_case, Agriculture returns camelCase, and Welfare returns nested legacy schemas."* |
| **7** | **Schema Mapping Engine** | Highlight semantic rule mapping (`survey_no` $\rightarrow$ `land.surveyNumber`, `cropName` $\rightarrow$ `agriculture.crop`). | *"Our in-memory schema mapping engine translates heterogeneous departmental formats on the fly."* |
| **8** | **Unified Canonical Response** | Display single unified MahaSetu Canonical Card. | *"The officer receives one clean, standardized canonical record without manual data entry."* |
| **9** | **Source Attribution Tracking** | Point out explicit tags: `LAND` (Revenue), `CROP` (Agriculture), `WELFARE` (Welfare). | *"Every data point retains strict source provenance back to its sovereign department."* |
| **10** | **Eligibility Confirmation** | Verified land ownership (`1.98 Acres`), active crop (`Cotton`), and pension status (`SGN-01`). | *"Instant verification replaces weeks of manual physical document attestation."* |
| **11** | **Audit Trail Oversight** | Navigate to `/admin/audit-logs`. | *"Every data transaction is immutably logged with timestamp, user ID, purpose, and latency for state compliance."* |
| **12** | **Simulate Gateway Outage** | Navigate to `/admin/api-health` $\rightarrow$ Click "Simulate Outage" on Agriculture. | *"Let's test platform resilience: Agriculture gateway is now simulated as OFFLINE."* |
| **13** | **Fault-Tolerant Partial Failover** | Re-run verification in `/officer/citizen-verification`. | *"Revenue and Welfare return SUCCESS, Agriculture returns OFFLINE, and overall status is PARTIAL_SUCCESS without system crash."* |
| **14** | **Citizen Consent Revocation** | Login as Citizen `ramesh.shinde` (`/citizen/consents`) $\rightarrow$ Click "Revoke Consent". | *"The citizen holds total sovereignty over their data and can revoke consent in real time."* |
| **15** | **Privacy Gatekeeper Enforcement** | Re-run officer query $\rightarrow$ Blocked with `CONSENT_REQUIRED`. | *"With consent revoked, MahaSetu's privacy gatekeeper immediately denies access."* |

---

## 3. Summary of Demonstrated Capabilities

$$\text{Interoperability} + \text{Schema Standardization} + \text{DPDP Consent} + \text{Fault Tolerance} + \text{Auditability}$$
