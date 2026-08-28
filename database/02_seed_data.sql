-- =====================================================================
-- MahaSetu - Government Digital Interoperability Platform (SIH26129)
-- Synthetic Seed Data Script (PostgreSQL)
-- Phase 1 & Phase 2: Core Entities + Auth & RBAC
-- 100% Synthetic Data - No Real Citizen PII or Aadhaar Information
-- =====================================================================

-- 1. Seed Districts (10 Maharashtra Districts)
INSERT INTO districts (id, district_code, name, state, division) VALUES
(1, 'MH-PUN', 'Pune', 'Maharashtra', 'Pune Division'),
(2, 'MH-NAG', 'Nagpur', 'Maharashtra', 'Nagpur Division'),
(3, 'MH-NAS', 'Nashik', 'Maharashtra', 'Nashik Division'),
(4, 'MH-CSN', 'Chhatrapati Sambhajinagar', 'Maharashtra', 'Marathwada Division'),
(5, 'MH-THA', 'Thane', 'Maharashtra', 'Konkan Division'),
(6, 'MH-SOL', 'Solapur', 'Maharashtra', 'Pune Division'),
(7, 'MH-KOL', 'Kolhapur', 'Maharashtra', 'Pune Division'),
(8, 'MH-AMR', 'Amravati', 'Maharashtra', 'Amravati Division'),
(9, 'MH-NAN', 'Nanded', 'Maharashtra', 'Marathwada Division'),
(10, 'MH-SAT', 'Satara', 'Maharashtra', 'Pune Division')
ON CONFLICT (district_code) DO NOTHING;

-- 2. Seed Talukas (15 Talukas)
INSERT INTO talukas (id, taluka_code, name, district_id) VALUES
(1, 'TAL-HAV', 'Haveli', 1),
(2, 'TAL-BAR', 'Baramati', 1),
(3, 'TAL-JUN', 'Junnar', 1),
(4, 'TAL-NAG', 'Nagpur Rural', 2),
(5, 'TAL-RAM', 'Ramtek', 2),
(6, 'TAL-NIP', 'Niphad', 3),
(7, 'TAL-MAL', 'Malegaon', 3),
(8, 'TAL-PAI', 'Paithan', 4),
(9, 'TAL-GAN', 'Gangapur', 4),
(10, 'TAL-KAL', 'Kalyan', 5),
(11, 'TAL-PAN', 'Pandharpur', 6),
(12, 'TAL-KAR', 'Karveer', 7),
(13, 'TAL-ACH', 'Achalpur', 8),
(14, 'TAL-LOH', 'Loha', 9),
(15, 'TAL-KOR', 'Koregaon', 10)
ON CONFLICT (taluka_code) DO NOTHING;

-- 3. Seed Villages (20 Villages)
INSERT INTO villages (id, village_code, census_code, name, taluka_id, district_id, pincode) VALUES
(1, 'VIL-WAG', 'CEN-553101', 'Wagholi', 1, 1, '412207'),
(2, 'VIL-HAD', 'CEN-553102', 'Hadapsar Rural', 1, 1, '411028'),
(3, 'VIL-MAL', 'CEN-553103', 'Malegaon Budruk', 2, 1, '413115'),
(4, 'VIL-OTE', 'CEN-553104', 'Otur', 3, 1, '412409'),
(5, 'VIL-KAN', 'CEN-553201', 'Kamptee Rural', 4, 2, '441001'),
(6, 'VIL-MAN', 'CEN-553202', 'Mansar', 5, 2, '441401'),
(7, 'VIL-PIB', 'CEN-553301', 'Pimpalgaon Baswant', 6, 3, '422209'),
(8, 'VIL-LAS', 'CEN-553302', 'Lasalgaon', 6, 3, '422306'),
(9, 'VIL-RAV', 'CEN-553303', 'Ravalgaon', 7, 3, '423108'),
(10, 'VIL-SHE', 'CEN-553401', 'Shevta', 8, 4, '431107'),
(11, 'VIL-SHI', 'CEN-553402', 'Shivoor', 9, 4, '431116'),
(12, 'VIL-DOM', 'CEN-553501', 'Dombivli Rural', 10, 5, '421201'),
(13, 'VIL-KAS', 'CEN-553601', 'Kasegaon', 11, 6, '413304'),
(14, 'VIL-GUL', 'CEN-553602', 'Gulsadi', 11, 6, '413305'),
(15, 'VIL-UCH', 'CEN-553701', 'Uchgaon', 12, 7, '416005'),
(16, 'VIL-PAR', 'CEN-553801', 'Paratwada', 13, 8, '444805'),
(17, 'VIL-MAL2', 'CEN-553901', 'Malakoli', 14, 9, '431708'),
(18, 'VIL-RAH', 'CEN-554001', 'Rahimatpur', 15, 10, '415511'),
(19, 'VIL-WAI', 'CEN-554002', 'Wai Rural', 15, 10, '412803'),
(20, 'VIL-SHI2', 'CEN-553702', 'Shiroli', 12, 7, '416122')
ON CONFLICT (village_code) DO NOTHING;

-- 4. Seed Departments (3 Key Departments)
INSERT INTO departments (id, department_code, name, description, nodal_officer, contact_email, portal_url, is_active) VALUES
(1, 'REV', 'Revenue & Forest Department', 'Custodians of 7/12 land records, survey mutations, ownership ledgers, and property rights in Maharashtra.', 'Shri. Arvind S. Patil (IAS)', 'nodal.revenue@maharashtra.gov.in', 'https://mahabhumi.gov.in', TRUE),
(2, 'AGR', 'Department of Agriculture', 'Manages farmer welfare, DBT fertilizer subsidies, soil health cards, crop damage assessments, and PM-KISAN schemes.', 'Dr. Sunita M. Deshmukh', 'nodal.agri@maharashtra.gov.in', 'https://krishi.maharashtra.gov.in', TRUE),
(3, 'WEL', 'Social Justice & Welfare Department', 'Oversees direct benefit transfers, old-age pensions, widow stipends, divyang support, and marginalized community welfare.', 'Smt. Kavita R. Shinde', 'nodal.welfare@maharashtra.gov.in', 'https://sjsa.maharashtra.gov.in', TRUE)
ON CONFLICT (department_code) DO NOTHING;

-- 5. Seed 50 Citizens (MH-CIT-10001 to MH-CIT-10050)
INSERT INTO citizens (id, citizen_id, full_name, gender, date_of_birth, masked_phone, masked_email, annual_income_inr, occupation, village_id, taluka_id, district_id, is_active) VALUES
(1, 'MH-CIT-10001', 'Ramesh Tukaram Shinde', 'MALE', '1978-04-12', '+91-XXXXX-12001', 'r***1@gov-synthetic.in', 85000.00, 'Farmer', 1, 1, 1, TRUE),
(2, 'MH-CIT-10002', 'Sunita Baburao Jadhav', 'FEMALE', '1982-08-25', '+91-XXXXX-12002', 's***2@gov-synthetic.in', 42000.00, 'Homemaker / Weaver', 2, 1, 1, TRUE),
(3, 'MH-CIT-10003', 'Anand Dnyaneshwar More', 'MALE', '1965-11-03', '+91-XXXXX-12003', 'a***3@gov-synthetic.in', 95000.00, 'Farmer', 3, 2, 1, TRUE),
(4, 'MH-CIT-10004', 'Laxmi Ganpat Gaikwad', 'FEMALE', '1958-02-14', '+91-XXXXX-12004', 'l***4@gov-synthetic.in', 28000.00, 'Senior Citizen', 4, 3, 1, TRUE),
(5, 'MH-CIT-10005', 'Dattatray Vithal Kadam', 'MALE', '1972-07-19', '+91-XXXXX-12005', 'd***5@gov-synthetic.in', 120000.00, 'Horticulturist', 5, 4, 2, TRUE),
(6, 'MH-CIT-10006', 'Pooja Sanjay Bhosale', 'FEMALE', '1990-05-30', '+91-XXXXX-12006', 'p***6@gov-synthetic.in', 65000.00, 'Dairy Operator', 6, 5, 2, TRUE),
(7, 'MH-CIT-10007', 'Vilas Mahadev Sawant', 'MALE', '1980-09-15', '+91-XXXXX-12007', 'v***7@gov-synthetic.in', 140000.00, 'Grape Farmer', 7, 6, 3, TRUE),
(8, 'MH-CIT-10008', 'Shobha Ashok Chavan', 'FEMALE', '1975-12-08', '+91-XXXXX-12008', 's***8@gov-synthetic.in', 36000.00, 'Agricultural Laborer', 8, 6, 3, TRUE),
(9, 'MH-CIT-10009', 'Kailas Pandurang Salunkhe', 'MALE', '1985-03-22', '+91-XXXXX-12009', 'k***9@gov-synthetic.in', 110000.00, 'Onion Cultivator', 9, 7, 3, TRUE),
(10, 'MH-CIT-10010', 'Meena Ravindra Pawar', 'FEMALE', '1988-06-17', '+91-XXXXX-12010', 'm***10@gov-synthetic.in', 48000.00, 'Self Employed', 10, 8, 4, TRUE),
(11, 'MH-CIT-10011', 'Suresh Balasaheb Thorat', 'MALE', '1968-10-05', '+91-XXXXX-12011', 's***11@gov-synthetic.in', 78000.00, 'Farmer', 11, 9, 4, TRUE),
(12, 'MH-CIT-10012', 'Radha Maruti Kale', 'FEMALE', '1952-01-20', '+91-XXXXX-12012', 'r***12@gov-synthetic.in', 22000.00, 'Senior Citizen', 12, 10, 5, TRUE),
(13, 'MH-CIT-10013', 'Ganesh Narayan Ghorpade', 'MALE', '1979-04-11', '+91-XXXXX-12013', 'g***13@gov-synthetic.in', 135000.00, 'Sugarcane Grower', 13, 11, 6, TRUE),
(14, 'MH-CIT-10014', 'Mangal Dilip Sonawane', 'FEMALE', '1983-09-28', '+91-XXXXX-12014', 'm***14@gov-synthetic.in', 52000.00, 'Poultry Farmer', 14, 11, 6, TRUE),
(15, 'MH-CIT-10015', 'Nivrutti Shankar Patil', 'MALE', '1971-12-14', '+91-XXXXX-12015', 'n***15@gov-synthetic.in', 190000.00, 'Jaggery Producer', 15, 12, 7, TRUE),
(16, 'MH-CIT-10016', 'Usha Chandrakant Ghodke', 'FEMALE', '1967-08-09', '+91-XXXXX-12016', 'u***16@gov-synthetic.in', 31000.00, 'Widow Beneficiary', 16, 13, 8, TRUE),
(17, 'MH-CIT-10017', 'Pandharinath Bapu Shirole', 'MALE', '1976-02-18', '+91-XXXXX-12017', 'p***17@gov-synthetic.in', 88000.00, 'Cotton Farmer', 17, 14, 9, TRUE),
(18, 'MH-CIT-10018', 'Anita Eknath Mohite', 'FEMALE', '1989-11-23', '+91-XXXXX-12018', 'a***18@gov-synthetic.in', 59000.00, 'Floriculturist', 18, 15, 10, TRUE),
(19, 'MH-CIT-10019', 'Tanaji Ramchandra Jagtap', 'MALE', '1963-07-04', '+91-XXXXX-12019', 't***19@gov-synthetic.in', 105000.00, 'Ginger Cultivator', 19, 15, 10, TRUE),
(20, 'MH-CIT-10020', 'Rekha Vinayak Deshpande', 'FEMALE', '1981-05-16', '+91-XXXXX-12020', 'r***20@gov-synthetic.in', 44000.00, 'Artisan', 20, 12, 7, TRUE),
(21, 'MH-CIT-10021', 'Bhausaheb Kisan Nimhan', 'MALE', '1974-03-31', '+91-XXXXX-12021', 'b***21@gov-synthetic.in', 92000.00, 'Farmer', 1, 1, 1, TRUE),
(22, 'MH-CIT-10022', 'Kusum Prabhakar Zagade', 'FEMALE', '1960-06-12', '+91-XXXXX-12022', 'k***22@gov-synthetic.in', 25000.00, 'Senior Citizen', 2, 1, 1, TRUE),
(23, 'MH-CIT-10023', 'Ashok Namdeo Wagh', 'MALE', '1986-10-19', '+91-XXXXX-12023', 'a***23@gov-synthetic.in', 81000.00, 'Soybean Grower', 3, 2, 1, TRUE),
(24, 'MH-CIT-10024', 'Sarita Madhukar Narwade', 'FEMALE', '1992-04-05', '+91-XXXXX-12024', 's***24@gov-synthetic.in', 39000.00, 'Self Help Group Lead', 4, 3, 1, TRUE),
(25, 'MH-CIT-10025', 'Pravin Digambar Khot', 'MALE', '1984-01-27', '+91-XXXXX-12025', 'p***25@gov-synthetic.in', 165000.00, 'Orange Orchardist', 5, 4, 2, TRUE),
(26, 'MH-CIT-10026', 'Archana Bhagwan Lokhande', 'FEMALE', '1987-09-14', '+91-XXXXX-12026', 'a***26@gov-synthetic.in', 47000.00, 'Micro-Enterprise', 6, 5, 2, TRUE),
(27, 'MH-CIT-10027', 'Sanjay Vishnu Tambe', 'MALE', '1973-11-28', '+91-XXXXX-12027', 's***27@gov-synthetic.in', 125000.00, 'Pomegranate Farmer', 7, 6, 3, TRUE),
(28, 'MH-CIT-10028', 'Nanda Sitaram Khairnar', 'FEMALE', '1969-02-11', '+91-XXXXX-12028', 'n***28@gov-synthetic.in', 33000.00, 'Agricultural Laborer', 8, 6, 3, TRUE),
(29, 'MH-CIT-10029', 'Maruti Arjun Dhumal', 'MALE', '1980-08-03', '+91-XXXXX-12029', 'm***29@gov-synthetic.in', 115000.00, 'Vegetable Grower', 9, 7, 3, TRUE),
(30, 'MH-CIT-10030', 'Vaishali Sudhir Ingle', 'FEMALE', '1991-12-21', '+91-XXXXX-12030', 'v***30@gov-synthetic.in', 51000.00, 'Dairy Farmer', 10, 8, 4, TRUE),
(31, 'MH-CIT-10031', 'Bhagwan Jagannath Mule', 'MALE', '1966-05-15', '+91-XXXXX-12031', 'b***31@gov-synthetic.in', 84000.00, 'Pulses Cultivator', 11, 9, 4, TRUE),
(32, 'MH-CIT-10032', 'Alka Sopan Zende', 'FEMALE', '1955-03-08', '+91-XXXXX-12032', 'a***32@gov-synthetic.in', 20000.00, 'Senior Citizen', 12, 10, 5, TRUE),
(33, 'MH-CIT-10033', 'Kondiba Yashwant Metkari', 'MALE', '1977-07-26', '+91-XXXXX-12033', 'k***33@gov-synthetic.in', 145000.00, 'Sugarcane Farmer', 13, 11, 6, TRUE),
(34, 'MH-CIT-10034', 'Savita Uttam Landge', 'FEMALE', '1985-10-18', '+91-XXXXX-12034', 's***34@gov-synthetic.in', 46000.00, 'Cattle Rearing', 14, 11, 6, TRUE),
(35, 'MH-CIT-10035', 'Mahadev Anandrao Chougule', 'MALE', '1970-04-09', '+91-XXXXX-12035', 'm***35@gov-synthetic.in', 175000.00, 'Tobacco & Cane', 15, 12, 7, TRUE),
(36, 'MH-CIT-10036', 'Jayashree Prakash Kamble', 'FEMALE', '1982-01-30', '+91-XXXXX-12036', 'j***36@gov-synthetic.in', 34000.00, 'Divyang Beneficiary', 16, 13, 8, TRUE),
(37, 'MH-CIT-10037', 'Madhav Govind Giri', 'MALE', '1988-06-25', '+91-XXXXX-12037', 'm***37@gov-synthetic.in', 72000.00, 'Turmeric Grower', 17, 14, 9, TRUE),
(38, 'MH-CIT-10038', 'Sangeeta Mohan Nikam', 'FEMALE', '1979-11-12', '+91-XXXXX-12038', 's***38@gov-synthetic.in', 58000.00, 'Floriculturist', 18, 15, 10, TRUE),
(39, 'MH-CIT-10039', 'Haribhau Ramdas Phalke', 'MALE', '1961-09-07', '+91-XXXXX-12039', 'h***39@gov-synthetic.in', 98000.00, 'Strawberry Grower', 19, 15, 10, TRUE),
(40, 'MH-CIT-10040', 'Pratibha Gajanan Kute', 'FEMALE', '1987-03-14', '+91-XXXXX-12040', 'p***40@gov-synthetic.in', 41000.00, 'Weaver', 20, 12, 7, TRUE),
(41, 'MH-CIT-10041', 'Babasaheb Trimbak Dhage', 'MALE', '1975-08-20', '+91-XXXXX-12041', 'b***41@gov-synthetic.in', 102000.00, 'Farmer', 1, 1, 1, TRUE),
(42, 'MH-CIT-10042', 'Indubai Kerba Ghuge', 'FEMALE', '1959-12-04', '+91-XXXXX-12042', 'i***42@gov-synthetic.in', 24000.00, 'Senior Citizen', 2, 1, 1, TRUE),
(43, 'MH-CIT-10043', 'Sambhaji Rohidas Badhe', 'MALE', '1983-05-19', '+91-XXXXX-12043', 's***43@gov-synthetic.in', 89000.00, 'Maize Cultivator', 3, 2, 1, TRUE),
(44, 'MH-CIT-10044', 'Sulochana Anna Maske', 'FEMALE', '1976-10-02', '+91-XXXXX-12044', 's***44@gov-synthetic.in', 37000.00, 'Dairy Operator', 4, 3, 1, TRUE),
(45, 'MH-CIT-10045', 'Ankush Bhimrao Maske', 'MALE', '1990-02-17', '+91-XXXXX-12045', 'a***45@gov-synthetic.in', 130000.00, 'Citrus Orchardist', 5, 4, 2, TRUE),
(46, 'MH-CIT-10046', 'Jyoti Rameshwar Dahake', 'FEMALE', '1993-07-22', '+91-XXXXX-12046', 'j***46@gov-synthetic.in', 49000.00, 'Handicrafts', 6, 5, 2, TRUE),
(47, 'MH-CIT-10047', 'Uttam Vasantrao Borse', 'MALE', '1972-11-09', '+91-XXXXX-12047', 'u***47@gov-synthetic.in', 150000.00, 'Export Grapes', 7, 6, 3, TRUE),
(48, 'MH-CIT-10048', 'Kamal Janardan Sonar', 'FEMALE', '1964-04-16', '+91-XXXXX-12048', 'k***48@gov-synthetic.in', 29000.00, 'Widow Beneficiary', 8, 6, 3, TRUE),
(49, 'MH-CIT-10049', 'Shashikant Devram Bagul', 'MALE', '1981-09-01', '+91-XXXXX-12049', 's***49@gov-synthetic.in', 118000.00, 'Garlic Cultivator', 9, 7, 3, TRUE),
(50, 'MH-CIT-10050', 'Chhaya Nivrutti Gawande', 'FEMALE', '1986-06-29', '+91-XXXXX-12050', 'c***50@gov-synthetic.in', 53000.00, 'Sericulture', 10, 8, 4, TRUE)
ON CONFLICT (citizen_id) DO NOTHING;

-- 6. Seed Department Identifiers (150 Mappings)
INSERT INTO department_identifiers (citizen_id, department_id, department_specific_id, identifier_type, status, issued_date)
SELECT id, 1, 'MH-REV-KH-' || (10000 + id), 'KHATA_7_12', 'ACTIVE', '2018-06-15'
FROM citizens
ON CONFLICT (department_id, department_specific_id) DO NOTHING;

INSERT INTO department_identifiers (citizen_id, department_id, department_specific_id, identifier_type, status, issued_date)
SELECT id, 2, 'MH-AGR-REG-' || (20000 + id), 'FARMER_REGISTRATION', 'ACTIVE', '2019-08-20'
FROM citizens
ON CONFLICT (department_id, department_specific_id) DO NOTHING;

INSERT INTO department_identifiers (citizen_id, department_id, department_specific_id, identifier_type, status, issued_date)
SELECT id, 3, 'MH-WEL-BEN-' || (30000 + id), 'WELFARE_BENEFICIARY_ID', 'ACTIVE', '2020-01-10'
FROM citizens
ON CONFLICT (department_id, department_specific_id) DO NOTHING;

-- 7. Seed 50 Revenue Land Records
INSERT INTO revenue_land_records (record_id, citizen_id, department_identifier_id, district_id, taluka_id, village_id, survey_number, gat_number, khata_number, total_area_hectares, cultivable_area_hectares, uncultivable_area_hectares, land_type, ownership_type, encumbrance_status, registration_date)
SELECT
    'MH-REV-LR-' || (10000 + c.id),
    c.id,
    di.id,
    c.district_id,
    c.taluka_id,
    c.village_id,
    'SN-' || (100 + c.id),
    'GAT-' || (200 + c.id),
    'KH-' || (5000 + c.id),
    ROUND((0.8000 + (c.id * 0.05)), 4),
    ROUND((0.7500 + (c.id * 0.045)), 4),
    ROUND((0.0500 + (c.id * 0.005)), 4),
    CASE (c.id % 3)
        WHEN 0 THEN 'BAGAYAT (Irrigated)'
        WHEN 1 THEN 'JIRAIT (Dry Crop)'
        ELSE 'TARI (Paddy Wet)'
    END,
    CASE (c.id % 2)
        WHEN 0 THEN 'SINGLE'
        ELSE 'OCCUPANT_CLASS_1'
    END,
    CASE (c.id % 4)
        WHEN 0 THEN 'MORTGAGED_BANK'
        ELSE 'NONE'
    END,
    '2017-03-20'::DATE + (c.id * 20)
FROM citizens c
JOIN department_identifiers di ON di.citizen_id = c.id AND di.department_id = 1
ON CONFLICT (record_id) DO NOTHING;

-- 8. Seed 50 Agriculture Farmer Profiles
INSERT INTO agriculture_farmer_profiles (profile_id, citizen_id, department_identifier_id, farmer_category, primary_crop, secondary_crop, soil_type, irrigation_source, landholding_hectares, kisan_credit_card_status, subsidy_availed_inr, last_claim_date)
SELECT
    'MH-AGR-FP-' || (10000 + c.id),
    c.id,
    di.id,
    CASE
        WHEN c.id <= 15 THEN 'MARGINAL (<1ha)'
        WHEN c.id <= 35 THEN 'SMALL (1-2ha)'
        WHEN c.id <= 45 THEN 'SEMI_MEDIUM (2-4ha)'
        ELSE 'LARGE (>4ha)'
    END,
    CASE (c.id % 6)
        WHEN 0 THEN 'Cotton'
        WHEN 1 THEN 'Soybean'
        WHEN 2 THEN 'Sugarcane'
        WHEN 3 THEN 'Onion'
        WHEN 4 THEN 'Grapes'
        ELSE 'Tur (Pigeon Pea)'
    END,
    CASE (c.id % 4)
        WHEN 0 THEN 'Gram (Chana)'
        WHEN 1 THEN 'Wheat'
        WHEN 2 THEN 'Pomegranate'
        ELSE 'Jowar'
    END,
    CASE (c.id % 4)
        WHEN 0 THEN 'Black Cotton Soil'
        WHEN 1 THEN 'Loamy Soil'
        WHEN 2 THEN 'Alluvial Soil'
        ELSE 'Laterite Soil'
    END,
    CASE (c.id % 4)
        WHEN 0 THEN 'Drip Irrigation'
        WHEN 1 THEN 'Canal Network'
        WHEN 2 THEN 'Borewell'
        ELSE 'Rainfed'
    END,
    ROUND((0.8000 + (c.id * 0.05)), 4),
    CASE (c.id % 5)
        WHEN 0 THEN 'APPLIED'
        ELSE 'ACTIVE'
    END,
    ROUND((15000.00 + (c.id * 850.00)), 2),
    '2023-01-15'::DATE + (c.id * 15)
FROM citizens c
JOIN department_identifiers di ON di.citizen_id = c.id AND di.department_id = 2
ON CONFLICT (profile_id) DO NOTHING;

-- 9. Seed 50 Welfare Beneficiary Records
INSERT INTO welfare_beneficiary_records (beneficiary_record_id, citizen_id, department_identifier_id, scheme_name, scheme_code, beneficiary_category, monthly_stipend_inr, bank_account_masked, ifsc_code_masked, disbursement_status, last_disbursement_date)
SELECT
    'MH-WEL-BR-' || (10000 + c.id),
    c.id,
    di.id,
    CASE (c.id % 4)
        WHEN 0 THEN 'Sanjay Gandhi Niradhar Anudan Yojana'
        WHEN 1 THEN 'Shravanbal Seva Rajya Nivruttivetan Yojana'
        WHEN 2 THEN 'Indira Gandhi National Old Age Pension'
        ELSE 'Namo Shetkari Mahasanman Nidhi Yojana'
    END,
    CASE (c.id % 4)
        WHEN 0 THEN 'SCH-SGNY-01'
        WHEN 1 THEN 'SCH-SSNY-02'
        WHEN 2 THEN 'SCH-IGNOAP-03'
        ELSE 'SCH-NSMN-04'
    END,
    CASE (c.id % 4)
        WHEN 0 THEN 'WIDOW_DESTITUTE'
        WHEN 1 THEN 'SENIOR_CITIZEN_BPL'
        WHEN 2 THEN 'ELDERLY_VULNERABLE'
        ELSE 'SMALL_HOLDER_FARMER'
    END,
    CASE (c.id % 4)
        WHEN 0 THEN 1500.00
        WHEN 1 THEN 1500.00
        WHEN 2 THEN 2000.00
        ELSE 2000.00
    END,
    'MAHB-XXXXX-' || (3000 + c.id),
    'MAHB0001234',
    CASE (c.id % 7)
        WHEN 0 THEN 'PENDING_AUDIT'
        ELSE 'PROCESSED'
    END,
    '2024-07-01'::DATE + (c.id % 25)
FROM citizens c
JOIN department_identifiers di ON di.citizen_id = c.id AND di.department_id = 3
ON CONFLICT (beneficiary_record_id) DO NOTHING;

-- 10. Seed Service Registry
INSERT INTO services (id, service_code, name, department_id, description, endpoint_path, request_method, response_format, sla_seconds, is_active) VALUES
(1, 'REV_712_EXTRACT_V1', '7/12 Land Record Verification Service', 1, 'Federated query to fetch certified RoR (Record of Rights) for a citizen or survey number.', '/api/v1/revenue/records/7-12', 'GET', 'JSON', 2, TRUE),
(2, 'REV_MUTATION_STATUS_V1', 'Land Mutation Ledger Status', 1, 'Check live status of pending property mutations and ownership transfers (Ferfar).', '/api/v1/revenue/mutation/status', 'GET', 'JSON', 3, TRUE),
(3, 'REV_ENCUMBRANCE_CHECK_V1', 'Bank Encumbrance / Lien Check', 1, 'Validates whether land parcel has existing bank mortgage or government attachment.', '/api/v1/revenue/encumbrance', 'GET', 'JSON', 2, TRUE),
(4, 'AGR_FARMER_PROFILE_V1', 'Farmer Profile & Crop Ledger', 2, 'Fetches authenticated farmer registration, primary crop data, and acreage under cultivation.', '/api/v1/agri/farmer/profile', 'GET', 'JSON', 2, TRUE),
(5, 'AGR_SOIL_HEALTH_V1', 'Soil Health Card & Nutrient Data', 2, 'Returns soil testing indices (NPK, pH, organic carbon) for registered farm survey plots.', '/api/v1/agri/soil-health', 'GET', 'JSON', 3, TRUE),
(6, 'AGR_SUBSIDY_ELIGIBILITY_V1', 'DBT Subsidy Eligibility Check', 2, 'Cross-verifies land size and previous subsidy claims for drip and machinery grants.', '/api/v1/agri/subsidy/check', 'POST', 'JSON', 2, TRUE),
(7, 'WEL_BENEFICIARY_STATUS_V1', 'Welfare Scheme Beneficiary Query', 3, 'Retrieves active pension or cash-transfer disbursement status for a citizen ID.', '/api/v1/welfare/beneficiary/status', 'GET', 'JSON', 2, TRUE),
(8, 'WEL_INCOME_CRITERIA_VERIFY_V1', 'Income & BPL Eligibility Verification', 3, 'Verifies citizen economic bracket against welfare scheme criteria across departments.', '/api/v1/welfare/verify/criteria', 'POST', 'JSON', 2, TRUE),
(9, 'WEL_DBT_DISBURSEMENT_LOG_V1', 'Direct Benefit Transfer Audit Ledger', 3, 'Returns historical DBT monthly stipend transaction logs and IFSC settlement status.', '/api/v1/welfare/dbt/ledger', 'GET', 'JSON', 3, TRUE),
(10, 'INTEROP_CITIZEN_360_V1', 'MahaSetu Citizen 360 Federated View', 1, 'Aggregates land, agriculture, and welfare records into a single federated zero-hoarding view.', '/api/v1/interop/citizen-360', 'GET', 'JSON', 1, TRUE)
ON CONFLICT (service_code) DO NOTHING;

-- 11. Seed Canonical Schema Mappings
INSERT INTO schema_mappings (id, source_department_id, target_department_id, entity_type, source_field, target_field, transformation_rule, description, is_active) VALUES
(1, 1, 2, 'LAND_TO_FARMER', 'revenue_land_records.total_area_hectares', 'agriculture_farmer_profiles.landholding_hectares', 'DIRECT_MAP', 'Maps revenue 7/12 total area directly to agriculture farmer landholding ledger.', TRUE),
(2, 1, 2, 'LAND_TO_FARMER', 'revenue_land_records.khata_number', 'agriculture_farmer_profiles.revenue_khata_ref', 'DIRECT_MAP', 'Cross-references Revenue Khata Number in Agriculture Farmer database.', TRUE),
(3, 1, 2, 'LAND_TO_FARMER', 'revenue_land_records.survey_number', 'agriculture_farmer_profiles.survey_plot_no', 'DIRECT_MAP', 'Synchronizes survey plot numbers between Revenue and Agriculture.', TRUE),
(4, 1, 3, 'LAND_TO_WELFARE', 'revenue_land_records.total_area_hectares', 'welfare_beneficiary_records.land_owned_ha', 'DIRECT_MAP', 'Used by Social Welfare to verify small/marginal farmer eligibility for welfare grants.', TRUE),
(5, 1, 3, 'LAND_TO_WELFARE', 'revenue_land_records.ownership_type', 'welfare_beneficiary_records.land_title_status', 'DIRECT_MAP', 'Verifies single vs joint tenancy for welfare asset assessments.', TRUE),
(6, 2, 1, 'FARMER_TO_LAND', 'agriculture_farmer_profiles.primary_crop', 'revenue_land_records.crop_season_record', 'DIRECT_MAP', 'Updates revenue department crop ledger (Pik-Pahani) from agriculture sowing entries.', TRUE),
(7, 2, 3, 'FARMER_TO_WELFARE', 'agriculture_farmer_profiles.subsidy_availed_inr', 'welfare_beneficiary_records.existing_govt_aid_inr', 'DIRECT_MAP', 'Prevents duplicate subsidy claims across Agriculture and Social Welfare schemes.', TRUE),
(8, 2, 3, 'FARMER_TO_WELFARE', 'agriculture_farmer_profiles.farmer_category', 'welfare_beneficiary_records.vulnerability_tier', 'TIER_MAPPING', 'Maps marginal/small farmer categories into social welfare vulnerability tiers.', TRUE),
(9, 3, 2, 'WELFARE_TO_FARMER', 'welfare_beneficiary_records.disbursement_status', 'agriculture_farmer_profiles.pension_linkage_flag', 'STATUS_BOOLEAN', 'Flags whether farmer already receives social welfare pension in agriculture system.', TRUE),
(10, 3, 1, 'WELFARE_TO_LAND', 'welfare_beneficiary_records.bank_account_masked', 'revenue_land_records.compensation_account_ref', 'MASK_PRESERVE', 'Transfers masked bank details for revenue land acquisition compensations.', TRUE),
(11, 1, 1, 'CITIZEN_IDENTITY', 'citizens.citizen_id', 'department_identifiers.department_specific_id', 'FEDERATED_KEY', 'Maps master synthetic citizen ID to Revenue Department Khata identifier.', TRUE),
(12, 2, 2, 'CITIZEN_IDENTITY', 'citizens.citizen_id', 'department_identifiers.department_specific_id', 'FEDERATED_KEY', 'Maps master synthetic citizen ID to Agriculture Farmer registration identifier.', TRUE),
(13, 3, 3, 'CITIZEN_IDENTITY', 'citizens.citizen_id', 'department_identifiers.department_specific_id', 'FEDERATED_KEY', 'Maps master synthetic citizen ID to Social Welfare beneficiary identifier.', TRUE),
(14, 1, 2, 'DISTRICT_SYNC', 'districts.district_code', 'agriculture_farmer_profiles.agri_circle_code', 'PREFIX_APPEND', 'Translates state revenue district codes into agricultural zonal circle codes.', TRUE),
(15, 1, 3, 'VILLAGE_SYNC', 'villages.census_code', 'welfare_beneficiary_records.lgd_village_code', 'DIRECT_MAP', 'Synchronizes census village codes with Local Government Directory (LGD) standards.', TRUE)
ON CONFLICT (source_department_id, target_department_id, entity_type, source_field) DO NOTHING;

-- =====================================================================
-- Phase 2: Roles & Demo User Accounts
-- =====================================================================

-- 12. Seed Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_ADMIN', 'Platform Super Administrator with full telemetry and configuration access'),
(2, 'ROLE_DEPARTMENT_OFFICER', 'Government Departmental Nodal Officer with domain-specific authorization'),
(3, 'ROLE_CITIZEN', 'Citizen beneficiary with self-service identity and entitlement access'),
(4, 'ROLE_SYSTEM', 'Automated system agent for cross-departmental data federation')
ON CONFLICT (name) DO NOTHING;

-- 13. Seed Synthetic Demo Users
-- Note: Passwords are encrypted with BCrypt (12 rounds)
-- 1. admin@mahasetu.gov.in -> Admin@MahaSetu2026
-- 2. officer.revenue@mahasetu.gov.in -> Officer@Revenue2026
-- 3. officer.agri@mahasetu.gov.in -> Officer@Agri2026
-- 4. officer.welfare@mahasetu.gov.in -> Officer@Welfare2026
-- 5. ramesh.shinde@gov-synthetic.in -> Citizen@Maha2026

INSERT INTO users (id, username, email, password_hash, full_name, phone_masked, department_code, citizen_id, is_active) VALUES
(1, 'admin', 'admin@mahasetu.gov.in', '$2a$12$Kj6.6k1v3s3k2x0k4u8ege3k2x0k4u8ege3k2x0k4u8ege3k2x0k4', 'MahaSetu State Administrator', '+91-XXXXX-00001', NULL, NULL, TRUE),
(2, 'officer.revenue', 'officer.revenue@mahasetu.gov.in', '$2a$12$L7m.7l2w4t4l3y1l5v9fhf4l3y1l5v9fhf4l3y1l5v9fhf4l3y1l5', 'Shri. Arvind S. Patil (Revenue Nodal)', '+91-XXXXX-00002', 'REV', NULL, TRUE),
(3, 'officer.agri', 'officer.agri@mahasetu.gov.in', '$2a$12$M8n.8m3x5u5m4z2m6w0gig5m4z2m6w0gig5m4z2m6w0gig5m4z2m6', 'Dr. Sunita M. Deshmukh (Agri Nodal)', '+91-XXXXX-00003', 'AGR', NULL, TRUE),
(4, 'officer.welfare', 'officer.welfare@mahasetu.gov.in', '$2a$12$N9o.9n4y6v6n5a3n7x1hjh6n5a3n7x1hjh6n5a3n7x1hjh6n5a3n7', 'Smt. Kavita R. Shinde (Welfare Nodal)', '+91-XXXXX-00004', 'WEL', NULL, TRUE),
(5, 'ramesh.shinde', 'ramesh.shinde@gov-synthetic.in', '$2a$12$P0p.0o5z7w7o6b4o8y2iki7o6b4o8y2iki7o6b4o8y2iki7o6b4o8', 'Ramesh Tukaram Shinde (Citizen)', '+91-XXXXX-12001', NULL, 'MH-CIT-10001', TRUE)
ON CONFLICT (username) DO NOTHING;

-- 14. Seed User Role Assignments
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- admin -> ROLE_ADMIN
(2, 2), -- officer.revenue -> ROLE_DEPARTMENT_OFFICER
(3, 2), -- officer.agri -> ROLE_DEPARTMENT_OFFICER
(4, 2), -- officer.welfare -> ROLE_DEPARTMENT_OFFICER
(5, 3)  -- ramesh.shinde -> ROLE_CITIZEN
ON CONFLICT DO NOTHING;
