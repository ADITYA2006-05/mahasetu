# MahaSetu (महासेतू) — Synthetic Dataset Specification

**Government of Maharashtra State Digital Interoperability Platform**  
**SIH26129 — Dataset Catalogue & Data Protection Declaration**

---

## 1. Synthetic Data & Privacy Protection Declaration

> [!IMPORTANT]
> **100% Synthetic Data Guarantee**:
> All citizen names, identifiers, Aadhaar numbers, mobile phone numbers, email addresses, land survey numbers, and bank account numbers contained within MahaSetu are **100% synthetically generated** for software testing and demonstration purposes only.
> 
> - **Zero Real Citizen PII**: No real Aadhaar data, citizen biometric records, or phone numbers are utilized or stored.
> - **Zero Production Access**: The prototype does not connect to live government databases.
> - **Compliance**: Fully conforms to Indian IT Act and Digital Personal Data Protection (DPDP) standards.

---

## 2. Dataset Overview & Distribution

| Entity / Domain | Seeded Records | Description |
| :--- | :--- | :--- |
| **Administrative Districts** | 10 Districts | Pune, Nagpur, Nashik, Aurangabad, Amravati, Kolhapur, Solapur, Thane, Nanded, Jalgaon |
| **Administrative Talukas** | 10 Talukas | Haveli, Nagpur Rural, Dindori, Aurangabad, Achalpur, Karveer, Solapur North, Kalyan, Nanded, Jalgaon |
| **Administrative Villages** | 20 Villages | Wagholi, Manjari, Koradi, Ozar, Chikalthana, etc. with verified PIN codes |
| **Master Citizens** | 50 Citizens | `MH-CIT-10001` through `MH-CIT-10050` with realistic demographic distributions |
| **Department Identifiers** | 150 Identifiers | 3 synthetic identifiers per citizen for Revenue, Agriculture, and Welfare |
| **7/12 Land Records** | 50 Records | Survey numbers, Gat numbers, Khata numbers, area in hectares/acres, land types |
| **Agriculture Profiles** | 50 Profiles | Farmer categories, primary crops (Cotton, Sugarcane, Soybean, Paddy), soil types |
| **Welfare Beneficiaries** | 50 Records | Schemes (Sanjay Gandhi Niradhar, PM-KISAN), monthly stipends, disbursement audits |
| **Service Registry** | 10 Services | Active departmental microservice definitions and endpoint paths |
| **Schema Mappings** | 15 Rules | Legacy field mappings to canonical MahaSetu models |
| **Demo User Accounts** | 5 Accounts | 1 State Admin, 3 Department Officers (Revenue, Agri, Welfare), 1 Citizen |

---

## 3. Key Synthetic Citizen Profiles for Demonstration

### Citizen 1: Ramesh Tukaram Shinde (`MH-CIT-10001`)
- **Profile**: Small farmer and pension beneficiary residing in Wagholi, Haveli, Pune.
- **Revenue Holding**: Survey No. `SN-101`, Khata No. `KH-8801`, Area `1.98 Acres` (`0.80 Ha`), Land Type `BAGAYAT` (Irrigated).
- **Agriculture Profile**: Small Holder (`SMALL_HOLDER`), Primary Crop `Cotton`, Season `Kharif`, Soil Health Card `SHC-PUN-01`, Subsidies Availed `₹12,000`.
- **Welfare Beneficiary**: `Sanjay Gandhi Niradhar`, Category `Destitute Pension`, Monthly Stipend `₹1,500/mo`, Masked Bank Account `MAHB-XXXX-3001`.
- **Linked Identifiers**:
  - Revenue: `MH-REV-KH-10001`
  - Agriculture: `MH-AGR-REG-10001`
  - Welfare: `MH-WEL-BR-10001`

### Citizen 2: Sunita Baburao Jadhav (`MH-CIT-10002`)
- **Profile**: Marginal farmer and destitute woman beneficiary residing in Manjari, Haveli, Pune.
- **Revenue Holding**: Survey No. `SN-102`, Khata No. `KH-8802`, Area `0.99 Acres` (`0.40 Ha`), Land Type `JIRAIT` (Dryland).
- **Agriculture Profile**: Marginal Farmer (`MARGINAL`), Primary Crop `Soybean`, Season `Kharif`, Subsidies Availed `₹6,000`.
- **Welfare Beneficiary**: `Indira Gandhi National Widow Pension`, Monthly Stipend `₹1,000/mo`.

### Citizen 3: Anand Dnyaneshwar More (`MH-CIT-10003`)
- **Profile**: Semi-medium farmer residing in Koradi, Nagpur Rural, Nagpur.
- **Revenue Holding**: Survey No. `SN-103`, Khata No. `KH-8803`, Area `3.71 Acres` (`1.50 Ha`), Land Type `BAGAYAT`.
- **Agriculture Profile**: Semi-Medium (`SEMI_MEDIUM`), Primary Crop `Sugarcane`, Season `Kharif`, Subsidies Availed `₹24,000`.
- **Welfare Beneficiary**: `State Crop Assistance Grant`, Monthly Stipend `₹2,500/mo`.
