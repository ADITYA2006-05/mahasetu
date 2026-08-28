package com.mahasetu.interop.service;

import com.mahasetu.interop.entity.*;
import com.mahasetu.interop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataSeederService implements CommandLineRunner {

    private final DistrictRepository districtRepository;
    private final TalukaRepository talukaRepository;
    private final VillageRepository villageRepository;
    private final DepartmentRepository departmentRepository;
    private final CitizenRepository citizenRepository;
    private final DepartmentIdentifierRepository departmentIdentifierRepository;
    private final RevenueLandRecordRepository revenueLandRecordRepository;
    private final AgricultureFarmerProfileRepository agricultureFarmerProfileRepository;
    private final WelfareBeneficiaryRecordRepository welfareBeneficiaryRecordRepository;
    private final ServiceRegistryRepository serviceRegistryRepository;
    private final SchemaMappingRepository schemaMappingRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ConsentRepository consentRepository;
    private final ConsentScopeRepository consentScopeRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking MahaSetu synthetic datasets & authentication seeding...");

        // 1. Seed Roles & Demo Accounts (Phase 2)
        seedRolesAndUsers();

        // 2. Seed Phase 6 Consents & Audit Logs
        seedConsents();
        seedAuditLogs();

        if (citizenRepository.count() >= 50) {
            log.info("MahaSetu core records already present ({} citizens). Initial data seeding complete.", citizenRepository.count());
            return;
        }

        log.info("Seeding Phase 1 & 2 Synthetic Entities (100% Synthetic - Zero Real PII)...");

        // 2. Seed Administrative Hierarchy
        List<District> districts = seedDistricts();
        List<Taluka> talukas = seedTalukas(districts);
        List<Village> villages = seedVillages(talukas, districts);

        // 3. Seed Departments
        List<Department> departments = seedDepartments();

        // 4. Seed 50 Citizens
        List<Citizen> citizens = seedCitizens(villages, talukas, districts);

        // 5. Seed 150 Department Identifiers
        List<DepartmentIdentifier> identifiers = seedDepartmentIdentifiers(citizens, departments);

        // 6. Seed Departmental Records
        seedRevenueLandRecords(citizens, identifiers, districts, talukas, villages);
        seedAgricultureFarmerProfiles(citizens, identifiers);
        seedWelfareBeneficiaryRecords(citizens, identifiers);

        // 7. Seed Registry & Mappings
        seedServiceRegistry(departments);
        seedSchemaMappings(departments);

        log.info("MahaSetu Seeding Completed: 50 citizens, 3 departments, 10 districts, 20 villages, 150 ID mappings, 50 land, 50 agri, 50 welfare records, 10 services, 15 schema mappings, 4 roles, 5 demo accounts.");
    }

    private void seedRolesAndUsers() {
        Role roleAdmin = roleRepository.findByName(RoleType.ROLE_ADMIN)
            .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_ADMIN).description("Platform Administrator").build()));

        Role roleOfficer = roleRepository.findByName(RoleType.ROLE_DEPARTMENT_OFFICER)
            .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_DEPARTMENT_OFFICER).description("Department Nodal Officer").build()));

        Role roleCitizen = roleRepository.findByName(RoleType.ROLE_CITIZEN)
            .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_CITIZEN).description("Citizen Beneficiary").build()));

        roleRepository.findByName(RoleType.ROLE_SYSTEM)
            .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_SYSTEM).description("Automated Federation System").build()));

        // Demo User 1: Admin
        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(User.builder()
                .username("admin")
                .email("admin@mahasetu.gov.in")
                .passwordHash(passwordEncoder.encode("Admin@MahaSetu2026"))
                .fullName("MahaSetu State Administrator")
                .phoneMasked("+91-XXXXX-00001")
                .isActive(true)
                .roles(Set.of(roleAdmin))
                .build());
        }

        // Demo User 2: Revenue Officer
        if (!userRepository.existsByUsername("officer.revenue")) {
            userRepository.save(User.builder()
                .username("officer.revenue")
                .email("officer.revenue@mahasetu.gov.in")
                .passwordHash(passwordEncoder.encode("Officer@Revenue2026"))
                .fullName("Shri. Arvind S. Patil (Revenue Nodal)")
                .phoneMasked("+91-XXXXX-00002")
                .departmentCode("REV")
                .isActive(true)
                .roles(Set.of(roleOfficer))
                .build());
        }

        // Demo User 3: Agriculture Officer
        if (!userRepository.existsByUsername("officer.agri")) {
            userRepository.save(User.builder()
                .username("officer.agri")
                .email("officer.agri@mahasetu.gov.in")
                .passwordHash(passwordEncoder.encode("Officer@Agri2026"))
                .fullName("Dr. Sunita M. Deshmukh (Agri Nodal)")
                .phoneMasked("+91-XXXXX-00003")
                .departmentCode("AGR")
                .isActive(true)
                .roles(Set.of(roleOfficer))
                .build());
        }

        // Demo User 4: Welfare Officer
        if (!userRepository.existsByUsername("officer.welfare")) {
            userRepository.save(User.builder()
                .username("officer.welfare")
                .email("officer.welfare@mahasetu.gov.in")
                .passwordHash(passwordEncoder.encode("Officer@Welfare2026"))
                .fullName("Smt. Kavita R. Shinde (Welfare Nodal)")
                .phoneMasked("+91-XXXXX-00004")
                .departmentCode("WEL")
                .isActive(true)
                .roles(Set.of(roleOfficer))
                .build());
        }

        // Demo User 5: Citizen
        if (!userRepository.existsByUsername("ramesh.shinde")) {
            userRepository.save(User.builder()
                .username("ramesh.shinde")
                .email("ramesh.shinde@gov-synthetic.in")
                .passwordHash(passwordEncoder.encode("Citizen@Maha2026"))
                .fullName("Ramesh Tukaram Shinde")
                .phoneMasked("+91-XXXXX-12001")
                .citizenId("MH-CIT-10001")
                .isActive(true)
                .roles(Set.of(roleCitizen))
                .build());
        }
    }

    private List<District> seedDistricts() {
        if (districtRepository.count() > 0) return districtRepository.findAll();
        List<District> list = List.of(
            District.builder().districtCode("MH-PUN").name("Pune").division("Pune Division").build(),
            District.builder().districtCode("MH-NAG").name("Nagpur").division("Nagpur Division").build(),
            District.builder().districtCode("MH-NAS").name("Nashik").division("Nashik Division").build(),
            District.builder().districtCode("MH-CSN").name("Chhatrapati Sambhajinagar").division("Marathwada Division").build(),
            District.builder().districtCode("MH-THA").name("Thane").division("Konkan Division").build(),
            District.builder().districtCode("MH-SOL").name("Solapur").division("Pune Division").build(),
            District.builder().districtCode("MH-KOL").name("Kolhapur").division("Pune Division").build(),
            District.builder().districtCode("MH-AMR").name("Amravati").division("Amravati Division").build(),
            District.builder().districtCode("MH-NAN").name("Nanded").division("Marathwada Division").build(),
            District.builder().districtCode("MH-SAT").name("Satara").division("Pune Division").build()
        );
        return districtRepository.saveAll(list);
    }

    private List<Taluka> seedTalukas(List<District> d) {
        if (talukaRepository.count() > 0) return talukaRepository.findAll();
        List<Taluka> list = List.of(
            Taluka.builder().talukaCode("TAL-HAV").name("Haveli").district(d.get(0)).build(),
            Taluka.builder().talukaCode("TAL-BAR").name("Baramati").district(d.get(0)).build(),
            Taluka.builder().talukaCode("TAL-JUN").name("Junnar").district(d.get(0)).build(),
            Taluka.builder().talukaCode("TAL-NAG").name("Nagpur Rural").district(d.get(1)).build(),
            Taluka.builder().talukaCode("TAL-RAM").name("Ramtek").district(d.get(1)).build(),
            Taluka.builder().talukaCode("TAL-NIP").name("Niphad").district(d.get(2)).build(),
            Taluka.builder().talukaCode("TAL-MAL").name("Malegaon").district(d.get(2)).build(),
            Taluka.builder().talukaCode("TAL-PAI").name("Paithan").district(d.get(3)).build(),
            Taluka.builder().talukaCode("TAL-GAN").name("Gangapur").district(d.get(3)).build(),
            Taluka.builder().talukaCode("TAL-KAL").name("Kalyan").district(d.get(4)).build(),
            Taluka.builder().talukaCode("TAL-PAN").name("Pandharpur").district(d.get(5)).build(),
            Taluka.builder().talukaCode("TAL-KAR").name("Karveer").district(d.get(6)).build(),
            Taluka.builder().talukaCode("TAL-ACH").name("Achalpur").district(d.get(7)).build(),
            Taluka.builder().talukaCode("TAL-LOH").name("Loha").district(d.get(8)).build(),
            Taluka.builder().talukaCode("TAL-KOR").name("Koregaon").district(d.get(9)).build()
        );
        return talukaRepository.saveAll(list);
    }

    private List<Village> seedVillages(List<Taluka> t, List<District> d) {
        if (villageRepository.count() > 0) return villageRepository.findAll();
        List<Village> list = List.of(
            Village.builder().villageCode("VIL-WAG").censusCode("CEN-553101").name("Wagholi").taluka(t.get(0)).district(d.get(0)).pincode("412207").build(),
            Village.builder().villageCode("VIL-HAD").censusCode("CEN-553102").name("Hadapsar Rural").taluka(t.get(0)).district(d.get(0)).pincode("411028").build(),
            Village.builder().villageCode("VIL-MAL").censusCode("CEN-553103").name("Malegaon Budruk").taluka(t.get(1)).district(d.get(0)).pincode("413115").build(),
            Village.builder().villageCode("VIL-OTE").censusCode("CEN-553104").name("Otur").taluka(t.get(2)).district(d.get(0)).pincode("412409").build(),
            Village.builder().villageCode("VIL-KAN").censusCode("CEN-553201").name("Kamptee Rural").taluka(t.get(3)).district(d.get(1)).pincode("441001").build(),
            Village.builder().villageCode("VIL-MAN").censusCode("CEN-553202").name("Mansar").taluka(t.get(4)).district(d.get(1)).pincode("441401").build(),
            Village.builder().villageCode("VIL-PIB").censusCode("CEN-553301").name("Pimpalgaon Baswant").taluka(t.get(5)).district(d.get(2)).pincode("422209").build(),
            Village.builder().villageCode("VIL-LAS").censusCode("CEN-553302").name("Lasalgaon").taluka(t.get(5)).district(d.get(2)).pincode("422306").build(),
            Village.builder().villageCode("VIL-RAV").censusCode("CEN-553303").name("Ravalgaon").taluka(t.get(6)).district(d.get(2)).pincode("423108").build(),
            Village.builder().villageCode("VIL-SHE").censusCode("CEN-553401").name("Shevta").taluka(t.get(7)).district(d.get(3)).pincode("431107").build(),
            Village.builder().villageCode("VIL-SHI").censusCode("CEN-553402").name("Shivoor").taluka(t.get(8)).district(d.get(3)).pincode("431116").build(),
            Village.builder().villageCode("VIL-DOM").censusCode("CEN-553501").name("Dombivli Rural").taluka(t.get(9)).district(d.get(4)).pincode("421201").build(),
            Village.builder().villageCode("VIL-KAS").censusCode("CEN-553601").name("Kasegaon").taluka(t.get(10)).district(d.get(5)).pincode("413304").build(),
            Village.builder().villageCode("VIL-GUL").censusCode("CEN-553602").name("Gulsadi").taluka(t.get(10)).district(d.get(5)).pincode("413305").build(),
            Village.builder().villageCode("VIL-UCH").censusCode("CEN-553701").name("Uchgaon").taluka(t.get(11)).district(d.get(6)).pincode("416005").build(),
            Village.builder().villageCode("VIL-PAR").censusCode("CEN-553801").name("Paratwada").taluka(t.get(12)).district(d.get(7)).pincode("444805").build(),
            Village.builder().villageCode("VIL-MAL2").censusCode("CEN-553901").name("Malakoli").taluka(t.get(13)).district(d.get(8)).pincode("431708").build(),
            Village.builder().villageCode("VIL-RAH").censusCode("CEN-554001").name("Rahimatpur").taluka(t.get(14)).district(d.get(9)).pincode("415511").build(),
            Village.builder().villageCode("VIL-WAI").censusCode("CEN-554002").name("Wai Rural").taluka(t.get(14)).district(d.get(9)).pincode("412803").build(),
            Village.builder().villageCode("VIL-SHI2").censusCode("CEN-553702").name("Shiroli").taluka(t.get(11)).district(d.get(6)).pincode("416122").build()
        );
        return villageRepository.saveAll(list);
    }

    private List<Department> seedDepartments() {
        if (departmentRepository.count() > 0) return departmentRepository.findAll();
        List<Department> list = List.of(
            Department.builder().departmentCode("REV").name("Revenue & Forest Department").description("Custodians of 7/12 land records, survey mutations, ownership ledgers, and property rights in Maharashtra.").nodalOfficer("Shri. Arvind S. Patil (IAS)").contactEmail("nodal.revenue@maharashtra.gov.in").portalUrl("https://mahabhumi.gov.in").build(),
            Department.builder().departmentCode("AGR").name("Department of Agriculture").description("Manages farmer welfare, DBT fertilizer subsidies, soil health cards, crop damage assessments, and PM-KISAN schemes.").nodalOfficer("Dr. Sunita M. Deshmukh").contactEmail("nodal.agri@maharashtra.gov.in").portalUrl("https://krishi.maharashtra.gov.in").build(),
            Department.builder().departmentCode("WEL").name("Social Justice & Welfare Department").description("Oversees direct benefit transfers, old-age pensions, widow stipends, divyang support, and marginalized community welfare.").nodalOfficer("Smt. Kavita R. Shinde").contactEmail("nodal.welfare@maharashtra.gov.in").portalUrl("https://sjsa.maharashtra.gov.in").build()
        );
        return departmentRepository.saveAll(list);
    }

    private List<Citizen> seedCitizens(List<Village> v, List<Taluka> t, List<District> d) {
        if (citizenRepository.count() > 0) return citizenRepository.findAll();
        List<Citizen> list = new ArrayList<>();
        String[] names = {
            "Ramesh Tukaram Shinde", "Sunita Baburao Jadhav", "Anand Dnyaneshwar More", "Laxmi Ganpat Gaikwad",
            "Dattatray Vithal Kadam", "Pooja Sanjay Bhosale", "Vilas Mahadev Sawant", "Shobha Ashok Chavan",
            "Kailas Pandurang Salunkhe", "Meena Ravindra Pawar", "Suresh Balasaheb Thorat", "Radha Maruti Kale",
            "Ganesh Narayan Ghorpade", "Mangal Dilip Sonawane", "Nivrutti Shankar Patil", "Usha Chandrakant Ghodke",
            "Pandharinath Bapu Shirole", "Anita Eknath Mohite", "Tanaji Ramchandra Jagtap", "Rekha Vinayak Deshpande",
            "Bhausaheb Kisan Nimhan", "Kusum Prabhakar Zagade", "Ashok Namdeo Wagh", "Sarita Madhukar Narwade",
            "Pravin Digambar Khot", "Archana Bhagwan Lokhande", "Sanjay Vishnu Tambe", "Nanda Sitaram Khairnar",
            "Maruti Arjun Dhumal", "Vaishali Sudhir Ingle", "Bhagwan Jagannath Mule", "Alka Sopan Zende",
            "Kondiba Yashwant Metkari", "Savita Uttam Landge", "Mahadev Anandrao Chougule", "Jayashree Prakash Kamble",
            "Madhav Govind Giri", "Sangeeta Mohan Nikam", "Haribhau Ramdas Phalke", "Pratibha Gajanan Kute",
            "Babasaheb Trimbak Dhage", "Indubai Kerba Ghuge", "Sambhaji Rohidas Badhe", "Sulochana Anna Maske",
            "Ankush Bhimrao Maske", "Jyoti Rameshwar Dahake", "Uttam Vasantrao Borse", "Kamal Janardan Sonar",
            "Shashikant Devram Bagul", "Chhaya Nivrutti Gawande"
        };
        String[] occupations = {
            "Farmer", "Homemaker / Weaver", "Farmer", "Senior Citizen", "Horticulturist", "Dairy Operator",
            "Grape Farmer", "Agricultural Laborer", "Onion Cultivator", "Self Employed", "Farmer", "Senior Citizen",
            "Sugarcane Grower", "Poultry Farmer", "Jaggery Producer", "Widow Beneficiary", "Cotton Farmer",
            "Floriculturist", "Ginger Cultivator", "Artisan", "Farmer", "Senior Citizen", "Soybean Grower",
            "Self Help Group Lead", "Orange Orchardist", "Micro-Enterprise", "Pomegranate Farmer", "Agricultural Laborer",
            "Vegetable Grower", "Dairy Farmer", "Pulses Cultivator", "Senior Citizen", "Sugarcane Farmer", "Cattle Rearing",
            "Tobacco & Cane", "Divyang Beneficiary", "Turmeric Grower", "Floriculturist", "Strawberry Grower", "Weaver",
            "Farmer", "Senior Citizen", "Maize Cultivator", "Dairy Operator", "Citrus Orchardist", "Handicrafts",
            "Export Grapes", "Widow Beneficiary", "Garlic Cultivator", "Sericulture"
        };

        for (int i = 0; i < 50; i++) {
            int num = 10001 + i;
            String gender = (i % 2 == 0) ? "MALE" : "FEMALE";
            Village vil = v.get(i % v.size());
            Taluka tal = vil.getTaluka();
            District dis = vil.getDistrict();
            BigDecimal income = BigDecimal.valueOf(30000 + (i * 2800L));

            Citizen c = Citizen.builder()
                .citizenId("MH-CIT-" + num)
                .fullName(names[i])
                .gender(gender)
                .dateOfBirth(LocalDate.of(1955 + (i % 40), 1 + (i % 12), 1 + (i % 28)))
                .maskedPhone("+91-XXXXX-" + (12000 + i + 1))
                .maskedEmail(names[i].toLowerCase().charAt(0) + "***" + (i + 1) + "@gov-synthetic.in")
                .annualIncomeInr(income)
                .occupation(occupations[i])
                .village(vil)
                .taluka(tal)
                .district(dis)
                .isActive(true)
                .build();
            list.add(c);
        }
        return citizenRepository.saveAll(list);
    }

    private List<DepartmentIdentifier> seedDepartmentIdentifiers(List<Citizen> citizens, List<Department> departments) {
        if (departmentIdentifierRepository.count() > 0) return departmentIdentifierRepository.findAll();
        List<DepartmentIdentifier> list = new ArrayList<>();
        Department rev = departments.stream().filter(d -> "REV".equals(d.getDepartmentCode())).findFirst().orElse(departments.get(0));
        Department agr = departments.stream().filter(d -> "AGR".equals(d.getDepartmentCode())).findFirst().orElse(departments.get(1));
        Department wel = departments.stream().filter(d -> "WEL".equals(d.getDepartmentCode())).findFirst().orElse(departments.get(2));

        for (int i = 0; i < citizens.size(); i++) {
            Citizen c = citizens.get(i);
            int idNum = 10001 + i;

            list.add(DepartmentIdentifier.builder()
                .citizen(c)
                .department(rev)
                .departmentSpecificId("MH-REV-KH-" + idNum)
                .identifierType("KHATA_7_12")
                .status("ACTIVE")
                .issuedDate(LocalDate.of(2018, 6, 15))
                .build());

            list.add(DepartmentIdentifier.builder()
                .citizen(c)
                .department(agr)
                .departmentSpecificId("MH-AGR-REG-" + (20000 + (i + 1)))
                .identifierType("FARMER_REGISTRATION")
                .status("ACTIVE")
                .issuedDate(LocalDate.of(2019, 8, 20))
                .build());

            list.add(DepartmentIdentifier.builder()
                .citizen(c)
                .department(wel)
                .departmentSpecificId("MH-WEL-BEN-" + (30000 + (i + 1)))
                .identifierType("WELFARE_BENEFICIARY_ID")
                .status("ACTIVE")
                .issuedDate(LocalDate.of(2020, 1, 10))
                .build());
        }
        return departmentIdentifierRepository.saveAll(list);
    }

    private void seedRevenueLandRecords(List<Citizen> citizens, List<DepartmentIdentifier> identifiers, List<District> d, List<Taluka> t, List<Village> v) {
        if (revenueLandRecordRepository.count() > 0) return;
        List<RevenueLandRecord> list = new ArrayList<>();
        String[] landTypes = {"BAGAYAT (Irrigated)", "JIRAIT (Dry Crop)", "TARI (Paddy Wet)"};

        for (int i = 0; i < citizens.size(); i++) {
            Citizen c = citizens.get(i);
            final int index = i;
            DepartmentIdentifier revIdent = identifiers.stream()
                .filter(di -> di.getCitizen().getId().equals(c.getId()) && "REV".equals(di.getDepartment().getDepartmentCode()))
                .findFirst()
                .orElse(null);

            BigDecimal totalArea = BigDecimal.valueOf(0.8000 + (index * 0.05)).setScale(4, RoundingMode.HALF_UP);
            BigDecimal cultivableArea = BigDecimal.valueOf(0.7500 + (index * 0.045)).setScale(4, RoundingMode.HALF_UP);
            BigDecimal uncultivableArea = totalArea.subtract(cultivableArea).setScale(4, RoundingMode.HALF_UP);

            list.add(RevenueLandRecord.builder()
                .recordId("MH-REV-LR-" + (10001 + i))
                .citizen(c)
                .departmentIdentifier(revIdent)
                .district(c.getDistrict())
                .taluka(c.getTaluka())
                .village(c.getVillage())
                .surveyNumber("SN-" + (101 + i))
                .gatNumber("GAT-" + (201 + i))
                .khataNumber("KH-" + (5001 + i))
                .totalAreaHectares(totalArea)
                .cultivableAreaHectares(cultivableArea)
                .uncultivableAreaHectares(uncultivableArea)
                .landType(landTypes[i % landTypes.length])
                .ownershipType((i % 2 == 0) ? "SINGLE" : "OCCUPANT_CLASS_1")
                .encumbranceStatus((i % 4 == 0) ? "MORTGAGED_BANK" : "NONE")
                .registrationDate(LocalDate.of(2017, 3, 20).plusDays(i * 20L))
                .build());
        }
        revenueLandRecordRepository.saveAll(list);
    }

    private void seedAgricultureFarmerProfiles(List<Citizen> citizens, List<DepartmentIdentifier> identifiers) {
        if (agricultureFarmerProfileRepository.count() > 0) return;
        List<AgricultureFarmerProfile> list = new ArrayList<>();
        String[] primaryCrops = {"Cotton", "Soybean", "Sugarcane", "Onion", "Grapes", "Tur (Pigeon Pea)"};
        String[] secondaryCrops = {"Gram (Chana)", "Wheat", "Pomegranate", "Jowar"};
        String[] soilTypes = {"Black Cotton Soil", "Loamy Soil", "Alluvial Soil", "Laterite Soil"};
        String[] irrigationSources = {"Drip Irrigation", "Canal Network", "Borewell", "Rainfed"};

        for (int i = 0; i < citizens.size(); i++) {
            Citizen c = citizens.get(i);
            DepartmentIdentifier agrIdent = identifiers.stream()
                .filter(di -> di.getCitizen().getId().equals(c.getId()) && "AGR".equals(di.getDepartment().getDepartmentCode()))
                .findFirst()
                .orElse(null);

            String category = (i < 15) ? "MARGINAL (<1ha)" : (i < 35) ? "SMALL (1-2ha)" : (i < 45) ? "SEMI_MEDIUM (2-4ha)" : "LARGE (>4ha)";
            BigDecimal landHolding = BigDecimal.valueOf(0.8000 + (i * 0.05)).setScale(4, RoundingMode.HALF_UP);
            BigDecimal subsidy = BigDecimal.valueOf(15000.00 + (i * 850.00)).setScale(2, RoundingMode.HALF_UP);

            list.add(AgricultureFarmerProfile.builder()
                .profileId("MH-AGR-FP-" + (10001 + i))
                .citizen(c)
                .departmentIdentifier(agrIdent)
                .farmerCategory(category)
                .primaryCrop(primaryCrops[i % primaryCrops.length])
                .secondaryCrop(secondaryCrops[i % secondaryCrops.length])
                .soilType(soilTypes[i % soilTypes.length])
                .irrigationSource(irrigationSources[i % irrigationSources.length])
                .landholdingHectares(landHolding)
                .kisanCreditCardStatus((i % 5 == 0) ? "APPLIED" : "ACTIVE")
                .subsidyAvailedInr(subsidy)
                .lastClaimDate(LocalDate.of(2023, 1, 15).plusDays(i * 15L))
                .build());
        }
        agricultureFarmerProfileRepository.saveAll(list);
    }

    private void seedWelfareBeneficiaryRecords(List<Citizen> citizens, List<DepartmentIdentifier> identifiers) {
        if (welfareBeneficiaryRecordRepository.count() > 0) return;
        List<WelfareBeneficiaryRecord> list = new ArrayList<>();
        String[] schemes = {
            "Sanjay Gandhi Niradhar Anudan Yojana",
            "Shravanbal Seva Rajya Nivruttivetan Yojana",
            "Indira Gandhi National Old Age Pension",
            "Namo Shetkari Mahasanman Nidhi Yojana"
        };
        String[] schemeCodes = {"SCH-SGNY-01", "SCH-SSNY-02", "SCH-IGNOAP-03", "SCH-NSMN-04"};
        String[] categories = {"WIDOW_DESTITUTE", "SENIOR_CITIZEN_BPL", "ELDERLY_VULNERABLE", "SMALL_HOLDER_FARMER"};
        BigDecimal[] stipends = {
            BigDecimal.valueOf(1500.00), BigDecimal.valueOf(1500.00), BigDecimal.valueOf(2000.00), BigDecimal.valueOf(2000.00)
        };

        for (int i = 0; i < citizens.size(); i++) {
            Citizen c = citizens.get(i);
            DepartmentIdentifier welIdent = identifiers.stream()
                .filter(di -> di.getCitizen().getId().equals(c.getId()) && "WEL".equals(di.getDepartment().getDepartmentCode()))
                .findFirst()
                .orElse(null);

            int sIndex = i % 4;
            list.add(WelfareBeneficiaryRecord.builder()
                .beneficiaryRecordId("MH-WEL-BR-" + (10001 + i))
                .citizen(c)
                .departmentIdentifier(welIdent)
                .schemeName(schemes[sIndex])
                .schemeCode(schemeCodes[sIndex])
                .beneficiaryCategory(categories[sIndex])
                .monthlyStipendInr(stipends[sIndex])
                .bankAccountMasked("MAHB-XXXXX-" + (3001 + i))
                .ifscCodeMasked("MAHB0001234")
                .disbursementStatus((i % 7 == 0) ? "PENDING_AUDIT" : "PROCESSED")
                .lastDisbursementDate(LocalDate.of(2024, 7, 1).plusDays(i % 25))
                .build());
        }
        welfareBeneficiaryRecordRepository.saveAll(list);
    }

    private void seedServiceRegistry(List<Department> departments) {
        if (serviceRegistryRepository.count() > 0) return;
        Department rev = departments.stream().filter(d -> "REV".equals(d.getDepartmentCode())).findFirst().orElse(departments.get(0));
        Department agr = departments.stream().filter(d -> "AGR".equals(d.getDepartmentCode())).findFirst().orElse(departments.get(1));
        Department wel = departments.stream().filter(d -> "WEL".equals(d.getDepartmentCode())).findFirst().orElse(departments.get(2));

        List<ServiceRegistry> list = List.of(
            ServiceRegistry.builder().serviceCode("REV_712_EXTRACT_V1").name("7/12 Land Record Verification Service").department(rev).description("Federated query to fetch certified RoR (Record of Rights) for a citizen or survey number.").endpointPath("/api/v1/revenue/records/7-12").requestMethod("GET").responseFormat("JSON").slaSeconds(2).isActive(true).build(),
            ServiceRegistry.builder().serviceCode("REV_MUTATION_STATUS_V1").name("Land Mutation Ledger Status").department(rev).description("Check live status of pending property mutations and ownership transfers (Ferfar).").endpointPath("/api/v1/revenue/mutation/status").requestMethod("GET").responseFormat("JSON").slaSeconds(3).isActive(true).build(),
            ServiceRegistry.builder().serviceCode("REV_ENCUMBRANCE_CHECK_V1").name("Bank Encumbrance / Lien Check").department(rev).description("Validates whether land parcel has existing bank mortgage or government attachment.").endpointPath("/api/v1/revenue/encumbrance").requestMethod("GET").responseFormat("JSON").slaSeconds(2).isActive(true).build(),
            ServiceRegistry.builder().serviceCode("AGR_FARMER_PROFILE_V1").name("Farmer Profile & Crop Ledger").department(agr).description("Fetches authenticated farmer registration, primary crop data, and acreage under cultivation.").endpointPath("/api/v1/agri/farmer/profile").requestMethod("GET").responseFormat("JSON").slaSeconds(2).isActive(true).build(),
            ServiceRegistry.builder().serviceCode("AGR_SOIL_HEALTH_V1").name("Soil Health Card & Nutrient Data").department(agr).description("Returns soil testing indices (NPK, pH, organic carbon) for registered farm survey plots.").endpointPath("/api/v1/agri/soil-health").requestMethod("GET").responseFormat("JSON").slaSeconds(3).isActive(true).build(),
            ServiceRegistry.builder().serviceCode("AGR_SUBSIDY_ELIGIBILITY_V1").name("DBT Subsidy Eligibility Check").department(agr).description("Cross-verifies land size and previous subsidy claims for drip and machinery grants.").endpointPath("/api/v1/agri/subsidy/check").requestMethod("POST").responseFormat("JSON").slaSeconds(2).isActive(true).build(),
            ServiceRegistry.builder().serviceCode("WEL_BENEFICIARY_STATUS_V1").name("Welfare Scheme Beneficiary Query").department(wel).description("Retrieves active pension or cash-transfer disbursement status for a citizen ID.").endpointPath("/api/v1/welfare/beneficiary/status").requestMethod("GET").responseFormat("JSON").slaSeconds(2).isActive(true).build(),
            ServiceRegistry.builder().serviceCode("WEL_INCOME_CRITERIA_VERIFY_V1").name("Income & BPL Eligibility Verification").department(wel).description("Verifies citizen economic bracket against welfare scheme criteria across departments.").endpointPath("/api/v1/welfare/verify/criteria").requestMethod("POST").responseFormat("JSON").slaSeconds(2).isActive(true).build(),
            ServiceRegistry.builder().serviceCode("WEL_DBT_DISBURSEMENT_LOG_V1").name("Direct Benefit Transfer Audit Ledger").department(wel).description("Returns historical DBT monthly stipend transaction logs and IFSC settlement status.").endpointPath("/api/v1/welfare/dbt/ledger").requestMethod("GET").responseFormat("JSON").slaSeconds(3).isActive(true).build(),
            ServiceRegistry.builder().serviceCode("INTEROP_CITIZEN_360_V1").name("MahaSetu Citizen 360 Federated View").department(rev).description("Aggregates land, agriculture, and welfare records into a single federated zero-hoarding view.").endpointPath("/api/v1/interop/citizen-360").requestMethod("GET").responseFormat("JSON").slaSeconds(1).isActive(true).build()
        );
        serviceRegistryRepository.saveAll(list);
    }

    private void seedSchemaMappings(List<Department> departments) {
        if (schemaMappingRepository.count() > 0) return;
        Department rev = departments.stream().filter(d -> "REV".equals(d.getDepartmentCode())).findFirst().orElse(departments.get(0));
        Department agr = departments.stream().filter(d -> "AGR".equals(d.getDepartmentCode())).findFirst().orElse(departments.get(1));
        Department wel = departments.stream().filter(d -> "WEL".equals(d.getDepartmentCode())).findFirst().orElse(departments.get(2));

        List<SchemaMapping> list = new ArrayList<>(List.of(
            // Phase 1 Inter-department Federation Mappings
            SchemaMapping.builder().sourceDepartment(rev).targetDepartment(agr).entityType("LAND_TO_FARMER").sourceField("revenue_land_records.total_area_hectares").targetField("agriculture_farmer_profiles.landholding_hectares").dataType("DOUBLE").transformationRule("DIRECT_MAP").description("Maps revenue 7/12 total area directly to agriculture farmer landholding ledger.").build(),
            SchemaMapping.builder().sourceDepartment(rev).targetDepartment(agr).entityType("LAND_TO_FARMER").sourceField("revenue_land_records.khata_number").targetField("agriculture_farmer_profiles.revenue_khata_ref").dataType("STRING").transformationRule("DIRECT_MAP").description("Cross-references Revenue Khata Number in Agriculture Farmer database.").build(),
            SchemaMapping.builder().sourceDepartment(rev).targetDepartment(agr).entityType("LAND_TO_FARMER").sourceField("revenue_land_records.survey_number").targetField("agriculture_farmer_profiles.survey_plot_no").dataType("STRING").transformationRule("DIRECT_MAP").description("Synchronizes survey plot numbers between Revenue and Agriculture.").build(),
            SchemaMapping.builder().sourceDepartment(rev).targetDepartment(wel).entityType("LAND_TO_WELFARE").sourceField("revenue_land_records.total_area_hectares").targetField("welfare_beneficiary_records.land_owned_ha").dataType("DOUBLE").transformationRule("DIRECT_MAP").description("Used by Social Welfare to verify small/marginal farmer eligibility for welfare grants.").build(),
            SchemaMapping.builder().sourceDepartment(rev).targetDepartment(wel).entityType("LAND_TO_WELFARE").sourceField("revenue_land_records.ownership_type").targetField("welfare_beneficiary_records.land_title_status").dataType("STRING").transformationRule("DIRECT_MAP").description("Verifies single vs joint tenancy for welfare asset assessments.").build(),
            SchemaMapping.builder().sourceDepartment(agr).targetDepartment(rev).entityType("FARMER_TO_LAND").sourceField("agriculture_farmer_profiles.primary_crop").targetField("revenue_land_records.crop_season_record").dataType("STRING").transformationRule("DIRECT_MAP").description("Updates revenue department crop ledger (Pik-Pahani) from agriculture sowing entries.").build(),
            SchemaMapping.builder().sourceDepartment(agr).targetDepartment(wel).entityType("FARMER_TO_WELFARE").sourceField("agriculture_farmer_profiles.subsidy_availed_inr").targetField("welfare_beneficiary_records.existing_govt_aid_inr").dataType("DOUBLE").transformationRule("DIRECT_MAP").description("Prevents duplicate subsidy claims across Agriculture and Social Welfare schemes.").build(),
            SchemaMapping.builder().sourceDepartment(agr).targetDepartment(wel).entityType("FARMER_TO_WELFARE").sourceField("agriculture_farmer_profiles.farmer_category").targetField("welfare_beneficiary_records.vulnerability_tier").dataType("STRING").transformationRule("TIER_MAPPING").description("Maps marginal/small farmer categories into social welfare vulnerability tiers.").build(),
            SchemaMapping.builder().sourceDepartment(wel).targetDepartment(agr).entityType("WELFARE_TO_FARMER").sourceField("welfare_beneficiary_records.disbursement_status").targetField("agriculture_farmer_profiles.pension_linkage_flag").dataType("BOOLEAN").transformationRule("STATUS_BOOLEAN").description("Flags whether farmer already receives social welfare pension in agriculture system.").build(),
            SchemaMapping.builder().sourceDepartment(wel).targetDepartment(rev).entityType("WELFARE_TO_LAND").sourceField("welfare_beneficiary_records.bank_account_masked").targetField("revenue_land_records.compensation_account_ref").dataType("STRING").transformationRule("MASK_PRESERVE").description("Transfers masked bank details for revenue land acquisition compensations.").build(),
            SchemaMapping.builder().sourceDepartment(rev).targetDepartment(rev).entityType("CITIZEN_IDENTITY").sourceField("citizens.citizen_id").targetField("department_identifiers.department_specific_id").dataType("STRING").transformationRule("FEDERATED_KEY").description("Maps master synthetic citizen ID to Revenue Department Khata identifier.").build(),
            SchemaMapping.builder().sourceDepartment(agr).targetDepartment(agr).entityType("CITIZEN_IDENTITY").sourceField("citizens.citizen_id").targetField("department_identifiers.department_specific_id").dataType("STRING").transformationRule("FEDERATED_KEY").description("Maps master synthetic citizen ID to Agriculture Farmer registration identifier.").build(),
            SchemaMapping.builder().sourceDepartment(wel).targetDepartment(wel).entityType("CITIZEN_IDENTITY").sourceField("citizens.citizen_id").targetField("department_identifiers.department_specific_id").dataType("STRING").transformationRule("FEDERATED_KEY").description("Maps master synthetic citizen ID to Social Welfare beneficiary identifier.").build(),
            SchemaMapping.builder().sourceDepartment(rev).targetDepartment(agr).entityType("DISTRICT_SYNC").sourceField("districts.district_code").targetField("agriculture_farmer_profiles.agri_circle_code").dataType("STRING").transformationRule("PREFIX_APPEND").description("Translates state revenue district codes into agricultural zonal circle codes.").build(),
            SchemaMapping.builder().sourceDepartment(rev).targetDepartment(wel).entityType("VILLAGE_SYNC").sourceField("villages.census_code").targetField("welfare_beneficiary_records.lgd_village_code").dataType("STRING").transformationRule("DIRECT_MAP").description("Synchronizes census village codes with Local Government Directory (LGD) standards.").build(),

            // Phase 5 Canonical Data Model Transformations (Revenue: 6 Mappings)
            SchemaMapping.builder().sourceDepartment(rev).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("citizen_name").targetField("citizen.name").dataType("STRING").transformationRule("DIRECT_MAP").version("1.0").description("Maps Revenue citizen_name to canonical citizen.name").build(),
            SchemaMapping.builder().sourceDepartment(rev).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("district_name").targetField("location.district").dataType("STRING").transformationRule("DIRECT_MAP").version("1.0").description("Maps Revenue district_name to canonical location.district").build(),
            SchemaMapping.builder().sourceDepartment(rev).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("taluka_name").targetField("location.taluka").dataType("STRING").transformationRule("DIRECT_MAP").version("1.0").description("Maps Revenue taluka_name to canonical location.taluka").build(),
            SchemaMapping.builder().sourceDepartment(rev).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("village_name").targetField("location.village").dataType("STRING").transformationRule("DIRECT_MAP").version("1.0").description("Maps Revenue village_name to canonical location.village").build(),
            SchemaMapping.builder().sourceDepartment(rev).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("survey_no").targetField("land.surveyNumber").dataType("STRING").transformationRule("DIRECT_MAP").version("1.0").description("Maps Revenue survey_no to canonical land.surveyNumber").build(),
            SchemaMapping.builder().sourceDepartment(rev).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("area_acres").targetField("land.areaAcres").dataType("DOUBLE").transformationRule("DIRECT_MAP").version("1.0").description("Maps Revenue area_acres to canonical land.areaAcres").build(),

            // Phase 5 Canonical Data Model Transformations (Agriculture: 6 Mappings)
            SchemaMapping.builder().sourceDepartment(agr).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("farmerName").targetField("citizen.name").dataType("STRING").transformationRule("DIRECT_MAP").version("1.0").description("Maps Agriculture farmerName to canonical citizen.name").build(),
            SchemaMapping.builder().sourceDepartment(agr).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("district").targetField("location.district").dataType("STRING").transformationRule("DIRECT_MAP").version("1.0").description("Maps Agriculture district to canonical location.district").build(),
            SchemaMapping.builder().sourceDepartment(agr).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("landSurveyNumber").targetField("land.surveyNumber").dataType("STRING").transformationRule("DIRECT_MAP").version("1.0").description("Maps Agriculture landSurveyNumber to canonical land.surveyNumber").build(),
            SchemaMapping.builder().sourceDepartment(agr).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("cropName").targetField("agriculture.crop").dataType("STRING").transformationRule("DIRECT_MAP").version("1.0").description("Maps Agriculture cropName to canonical agriculture.crop").build(),
            SchemaMapping.builder().sourceDepartment(agr).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("season").targetField("agriculture.season").dataType("STRING").transformationRule("DIRECT_MAP").version("1.0").description("Maps Agriculture season to canonical agriculture.season").build(),
            SchemaMapping.builder().sourceDepartment(agr).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("landUsage").targetField("agriculture.landUsage").dataType("STRING").transformationRule("DIRECT_MAP").version("1.0").description("Maps Agriculture landUsage to canonical agriculture.landUsage").build(),

            // Phase 5 Canonical Data Model Transformations (Welfare: 6 Mappings)
            SchemaMapping.builder().sourceDepartment(wel).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("beneficiary_name").targetField("citizen.name").dataType("STRING").transformationRule("DIRECT_MAP").version("1.0").description("Maps Welfare beneficiary_name to canonical citizen.name").build(),
            SchemaMapping.builder().sourceDepartment(wel).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("scheme_code").targetField("welfare.schemeCode").dataType("STRING").transformationRule("DIRECT_MAP").version("1.0").description("Maps Welfare scheme_code to canonical welfare.schemeCode").build(),
            SchemaMapping.builder().sourceDepartment(wel).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("scheme_name").targetField("welfare.schemeName").dataType("STRING").transformationRule("DIRECT_MAP").version("1.0").description("Maps Welfare scheme_name to canonical welfare.schemeName").build(),
            SchemaMapping.builder().sourceDepartment(wel).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("previous_benefit").targetField("welfare.previousBenefit").dataType("BOOLEAN").transformationRule("DIRECT_MAP").version("1.0").description("Maps Welfare previous_benefit to canonical welfare.previousBenefit").build(),
            SchemaMapping.builder().sourceDepartment(wel).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("application_status").targetField("welfare.applicationStatus").dataType("STRING").transformationRule("DIRECT_MAP").version("1.0").description("Maps Welfare application_status to canonical welfare.applicationStatus").build(),
            SchemaMapping.builder().sourceDepartment(wel).targetDepartment(null).entityType("CANONICAL_MAPPING").sourceField("benefit_amount").targetField("welfare.benefitAmount").dataType("DOUBLE").transformationRule("DIRECT_MAP").version("1.0").description("Maps Welfare benefit_amount to canonical welfare.benefitAmount").build()
        ));
        schemaMappingRepository.saveAll(list);
    }

    private void seedConsents() {
        if (consentRepository.count() > 0) return;
        log.info("Seeding Phase 6 Citizen Consent Agreements & Authorized Scopes...");

        java.time.OffsetDateTime now = java.time.OffsetDateTime.now();
        List<String> demoCitizenIds = List.of("MH-CIT-10001", "MH-CIT-10002", "MH-CIT-10003", "MH-CIT-10004", "MH-CIT-10005");
        List<String> purposes = List.of(
                "SUBSIDY_VERIFICATION",
                "DIRECT_BENEFIT_TRANSFER",
                "LAND_VERIFICATION",
                "BENEFIT_AUDIT",
                "MULTI_DEPT_TEST",
                "OFFLINE_TEST",
                "ALL_OFFLINE_TEST",
                "SCHEME_VERIFY",
                "GENERAL_INTEGRATION"
        );

        for (String citId : demoCitizenIds) {
            for (String purp : purposes) {
                Consent c = Consent.builder()
                        .consentId("CNS-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase())
                        .citizenId(citId)
                        .requestingDepartment("ALL")
                        .purpose(purp)
                        .status("ACTIVE")
                        .createdAt(now.minusDays(5))
                        .expiresAt(now.plusDays(180))
                        .build();

                List<ConsentScope> scopes = List.of(
                        ConsentScope.builder().consent(c).dataScope("IDENTITY").build(),
                        ConsentScope.builder().consent(c).dataScope("LOCATION").build(),
                        ConsentScope.builder().consent(c).dataScope("LAND").build(),
                        ConsentScope.builder().consent(c).dataScope("AGRICULTURE").build(),
                        ConsentScope.builder().consent(c).dataScope("WELFARE").build()
                );
                c.setScopes(scopes);
                consentRepository.save(c);
            }
        }
    }

    private void seedAuditLogs() {
        if (auditLogRepository.count() > 0) return;
        log.info("Seeding Initial State-wide Immutable Audit Logs...");

        java.time.OffsetDateTime now = java.time.OffsetDateTime.now();
        List<AuditLog> list = List.of(
                AuditLog.builder()
                        .auditId("AUD-A91B2C3D")
                        .requestId("REQ-7E1A2B3C")
                        .citizenId("MH-CIT-10001")
                        .requestingUser("officer.revenue")
                        .requestingDepartment("REVENUE")
                        .targetDepartment("REVENUE, AGRICULTURE, WELFARE")
                        .targetService("/api/integration/request")
                        .purpose("SUBSIDY_VERIFICATION")
                        .dataScope("IDENTITY, LOCATION, LAND, AGRICULTURE, WELFARE")
                        .status("SUCCESS")
                        .responseTimeMs(45L)
                        .timestamp(now.minusHours(3))
                        .build(),
                AuditLog.builder()
                        .auditId("AUD-B82C3D4E")
                        .requestId("REQ-8F2B3C4D")
                        .citizenId("MH-CIT-10001")
                        .requestingUser("officer.agri")
                        .requestingDepartment("AGRICULTURE")
                        .targetDepartment("REVENUE, AGRICULTURE, WELFARE")
                        .targetService("/api/integration/request")
                        .purpose("SUBSIDY_VERIFICATION")
                        .dataScope("IDENTITY, LAND, AGRICULTURE")
                        .status("SUCCESS")
                        .responseTimeMs(38L)
                        .timestamp(now.minusHours(1))
                        .build(),
                AuditLog.builder()
                        .auditId("AUD-C73D4E5F")
                        .requestId("REQ-9C3D4E5F")
                        .citizenId("MH-CIT-10002")
                        .requestingUser("officer.welfare")
                        .requestingDepartment("WELFARE")
                        .targetDepartment("WELFARE")
                        .targetService("/api/integration/request")
                        .purpose("DIRECT_BENEFIT_TRANSFER")
                        .dataScope("IDENTITY, WELFARE")
                        .status("SUCCESS")
                        .responseTimeMs(24L)
                        .timestamp(now.minusMinutes(30))
                        .build()
        );
        auditLogRepository.saveAll(list);
    }
}
