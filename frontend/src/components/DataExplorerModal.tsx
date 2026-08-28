import React, { useState } from 'react';
import { X, Search, Database, Landmark, Sprout, HeartHandshake, Layers, GitCompare } from 'lucide-react';

interface DataExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export const DataExplorerModal: React.FC<DataExplorerModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'citizens',
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  // Sample synthetic preview datasets
  const sampleCitizens = Array.from({ length: 50 }).map((_, i) => {
    const num = 10001 + i;
    const names = [
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
    ];
    const dists = ["Pune", "Nagpur", "Nashik", "Chhatrapati Sambhajinagar", "Thane", "Solapur", "Kolhapur", "Amravati", "Nanded", "Satara"];
    return {
      citizenId: `MH-CIT-${num}`,
      fullName: names[i] || `Citizen ${num}`,
      gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
      district: dists[i % dists.length],
      phone: `+91-XXXXX-${12001 + i}`,
      email: `${names[i].toLowerCase().charAt(0)}***${i + 1}@gov-synthetic.in`,
      revId: `MH-REV-KH-${10001 + i}`,
      agrId: `MH-AGR-REG-${20001 + i}`,
      welId: `MH-WEL-BEN-${30001 + i}`,
    };
  });

  const sampleLandRecords = Array.from({ length: 50 }).map((_, i) => ({
    recordId: `MH-REV-LR-${10001 + i}`,
    citizenId: `MH-CIT-${10001 + i}`,
    surveyNo: `SN-${101 + i}`,
    gatNo: `GAT-${201 + i}`,
    khataNo: `KH-${5001 + i}`,
    totalAreaHa: (0.8 + i * 0.05).toFixed(4),
    cultivableHa: (0.75 + i * 0.045).toFixed(4),
    landType: i % 3 === 0 ? 'BAGAYAT (Irrigated)' : i % 3 === 1 ? 'JIRAIT (Dry Crop)' : 'TARI (Paddy Wet)',
    encumbrance: i % 4 === 0 ? 'MORTGAGED_BANK' : 'NONE',
  }));

  const sampleAgriRecords = Array.from({ length: 50 }).map((_, i) => {
    const crops = ['Cotton', 'Soybean', 'Sugarcane', 'Onion', 'Grapes', 'Tur (Pigeon Pea)'];
    const soils = ['Black Cotton Soil', 'Loamy Soil', 'Alluvial Soil', 'Laterite Soil'];
    const categories = i < 15 ? 'MARGINAL (<1ha)' : i < 35 ? 'SMALL (1-2ha)' : i < 45 ? 'SEMI_MEDIUM (2-4ha)' : 'LARGE (>4ha)';
    return {
      profileId: `MH-AGR-FP-${10001 + i}`,
      citizenId: `MH-CIT-${10001 + i}`,
      category: categories,
      crop: crops[i % crops.length],
      soil: soils[i % soils.length],
      kccStatus: i % 5 === 0 ? 'APPLIED' : 'ACTIVE',
      subsidyInr: `₹${(15000 + i * 850).toLocaleString('en-IN')}`,
    };
  });

  const sampleWelfareRecords = Array.from({ length: 50 }).map((_, i) => {
    const schemes = [
      'Sanjay Gandhi Niradhar Anudan',
      'Shravanbal Seva Rajya Pension',
      'Indira Gandhi National Old Age',
      'Namo Shetkari Mahasanman Nidhi',
    ];
    const stipends = ['₹1,500.00', '₹1,500.00', '₹2,000.00', '₹2,000.00'];
    return {
      beneficiaryId: `MH-WEL-BR-${10001 + i}`,
      citizenId: `MH-CIT-${10001 + i}`,
      scheme: schemes[i % schemes.length],
      stipend: stipends[i % stipends.length],
      account: `MAHB-XXXXX-${3001 + i}`,
      status: i % 7 === 0 ? 'PENDING_AUDIT' : 'PROCESSED',
    };
  });

  const sampleServices = [
    { code: 'REV_712_EXTRACT_V1', dept: 'REV', name: '7/12 Land Record Verification', path: '/api/v1/revenue/records/7-12', method: 'GET', sla: '2s' },
    { code: 'REV_MUTATION_STATUS_V1', dept: 'REV', name: 'Land Mutation Ledger Status', path: '/api/v1/revenue/mutation/status', method: 'GET', sla: '3s' },
    { code: 'REV_ENCUMBRANCE_CHECK_V1', dept: 'REV', name: 'Bank Encumbrance / Lien Check', path: '/api/v1/revenue/encumbrance', method: 'GET', sla: '2s' },
    { code: 'AGR_FARMER_PROFILE_V1', dept: 'AGR', name: 'Farmer Profile & Crop Ledger', path: '/api/v1/agri/farmer/profile', method: 'GET', sla: '2s' },
    { code: 'AGR_SOIL_HEALTH_V1', dept: 'AGR', name: 'Soil Health Card & Nutrient Data', path: '/api/v1/agri/soil-health', method: 'GET', sla: '3s' },
    { code: 'AGR_SUBSIDY_ELIGIBILITY_V1', dept: 'AGR', name: 'DBT Subsidy Eligibility Check', path: '/api/v1/agri/subsidy/check', method: 'POST', sla: '2s' },
    { code: 'WEL_BENEFICIARY_STATUS_V1', dept: 'WEL', name: 'Welfare Scheme Beneficiary Query', path: '/api/v1/welfare/beneficiary/status', method: 'GET', sla: '2s' },
    { code: 'WEL_INCOME_CRITERIA_VERIFY_V1', dept: 'WEL', name: 'Income & BPL Eligibility Verification', path: '/api/v1/welfare/verify/criteria', method: 'POST', sla: '2s' },
    { code: 'WEL_DBT_DISBURSEMENT_LOG_V1', dept: 'WEL', name: 'Direct Benefit Transfer Audit Ledger', path: '/api/v1/welfare/dbt/ledger', method: 'GET', sla: '3s' },
    { code: 'INTEROP_CITIZEN_360_V1', dept: 'REV', name: 'MahaSetu Citizen 360 View', path: '/api/v1/interop/citizen-360', method: 'GET', sla: '1s' },
  ];

  const sampleSchemaMappings = [
    { source: 'REV', target: 'AGR', type: 'LAND_TO_FARMER', sourceField: 'revenue_land_records.total_area_ha', targetField: 'agriculture_farmer_profiles.landholding_ha', rule: 'DIRECT_MAP' },
    { source: 'REV', target: 'AGR', type: 'LAND_TO_FARMER', sourceField: 'revenue_land_records.khata_number', targetField: 'agriculture_farmer_profiles.revenue_khata_ref', rule: 'DIRECT_MAP' },
    { source: 'REV', target: 'WEL', type: 'LAND_TO_WELFARE', sourceField: 'revenue_land_records.total_area_ha', targetField: 'welfare_beneficiary_records.land_owned_ha', rule: 'DIRECT_MAP' },
    { source: 'AGR', target: 'REV', type: 'FARMER_TO_LAND', sourceField: 'agriculture_farmer_profiles.primary_crop', targetField: 'revenue_land_records.crop_season_record', rule: 'DIRECT_MAP' },
    { source: 'AGR', target: 'WEL', type: 'FARMER_TO_WELFARE', sourceField: 'agriculture_farmer_profiles.subsidy_availed_inr', targetField: 'welfare_beneficiary_records.existing_govt_aid_inr', rule: 'DIRECT_MAP' },
    { source: 'WEL', target: 'AGR', type: 'WELFARE_TO_FARMER', sourceField: 'welfare_beneficiary_records.disbursement_status', targetField: 'agriculture_farmer_profiles.pension_linkage_flag', rule: 'STATUS_BOOLEAN' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-300 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-300 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 border border-amber-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-950">
                MahaSetu Federated Records Explorer
              </h3>
              <p className="text-xs text-slate-800 font-bold">
                100% Synthetic Datasets • Verified Cross-Departmental Identity Crosswalk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="p-3 bg-slate-100 border-b border-slate-300 flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'citizens', label: 'Citizens (50)', icon: Database },
            { id: 'land', label: 'Land Records (50)', icon: Landmark },
            { id: 'agriculture', label: 'Agriculture (50)', icon: Sprout },
            { id: 'welfare', label: 'Welfare (50)', icon: HeartHandshake },
            { id: 'services', label: 'API Registry (10)', icon: Layers },
            { id: 'schemas', label: 'Schema Mappings (15)', icon: GitCompare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all border ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                    : 'bg-white text-slate-950 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-slate-950" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="p-3.5 px-5 bg-white border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-950 font-bold placeholder-slate-500 focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs">
          
          {/* 1. Citizens Table */}
          {activeTab === 'citizens' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-950 font-black uppercase text-[10px]">
                    <th className="pb-2">Citizen ID</th>
                    <th className="pb-2">Full Name</th>
                    <th className="pb-2">District</th>
                    <th className="pb-2">Revenue ID</th>
                    <th className="pb-2">Agri ID</th>
                    <th className="pb-2">Welfare ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sampleCitizens
                    .filter((c) => c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || c.citizenId.toLowerCase().includes(searchTerm.toLowerCase()))
                    .slice(0, 20)
                    .map((c) => (
                      <tr key={c.citizenId} className="hover:bg-slate-100">
                        <td className="py-2.5 font-mono font-black text-amber-800">{c.citizenId}</td>
                        <td className="py-2.5 font-black text-slate-950">{c.fullName}</td>
                        <td className="py-2.5 text-slate-900 font-bold">{c.district}</td>
                        <td className="py-2.5 font-mono text-slate-800 font-bold">{c.revId}</td>
                        <td className="py-2.5 font-mono text-slate-800 font-bold">{c.agrId}</td>
                        <td className="py-2.5 font-mono text-slate-800 font-bold">{c.welId}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. Land Records Table */}
          {activeTab === 'land' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-950 font-black uppercase text-[10px]">
                    <th className="pb-2">Record ID</th>
                    <th className="pb-2">Citizen Ref</th>
                    <th className="pb-2">Khata / Survey</th>
                    <th className="pb-2">Total Area</th>
                    <th className="pb-2">Land Type</th>
                    <th className="pb-2">Encumbrance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sampleLandRecords.slice(0, 20).map((l) => (
                    <tr key={l.recordId} className="hover:bg-slate-100">
                      <td className="py-2.5 font-mono font-black text-amber-800">{l.recordId}</td>
                      <td className="py-2.5 font-mono text-slate-950 font-bold">{l.citizenId}</td>
                      <td className="py-2.5 font-mono text-slate-950 font-bold">{l.khataNo} / {l.surveyNo}</td>
                      <td className="py-2.5 font-black text-slate-950">{l.totalAreaHa} Ha</td>
                      <td className="py-2.5 text-slate-900 font-bold">{l.landType}</td>
                      <td className="py-2.5 text-slate-900 font-bold">{l.encumbrance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. Agriculture Table */}
          {activeTab === 'agriculture' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-950 font-black uppercase text-[10px]">
                    <th className="pb-2">Profile ID</th>
                    <th className="pb-2">Citizen ID</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Primary Crop</th>
                    <th className="pb-2">KCC Status</th>
                    <th className="pb-2">Subsidy Availed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sampleAgriRecords.slice(0, 20).map((a) => (
                    <tr key={a.profileId} className="hover:bg-slate-100">
                      <td className="py-2.5 font-mono font-black text-emerald-800">{a.profileId}</td>
                      <td className="py-2.5 font-mono text-slate-950 font-bold">{a.citizenId}</td>
                      <td className="py-2.5 font-black text-slate-950">{a.category}</td>
                      <td className="py-2.5 text-slate-900 font-bold">{a.crop}</td>
                      <td className="py-2.5 font-black text-emerald-900">{a.kccStatus}</td>
                      <td className="py-2.5 font-mono text-slate-950 font-black">{a.subsidyInr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Welfare Table */}
          {activeTab === 'welfare' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-950 font-black uppercase text-[10px]">
                    <th className="pb-2">Beneficiary ID</th>
                    <th className="pb-2">Citizen ID</th>
                    <th className="pb-2">Enrolled Scheme</th>
                    <th className="pb-2">Monthly Stipend</th>
                    <th className="pb-2">Settlement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sampleWelfareRecords.slice(0, 20).map((w) => (
                    <tr key={w.beneficiaryId} className="hover:bg-slate-100">
                      <td className="py-2.5 font-mono font-black text-purple-800">{w.beneficiaryId}</td>
                      <td className="py-2.5 font-mono text-slate-950 font-bold">{w.citizenId}</td>
                      <td className="py-2.5 font-black text-slate-950">{w.scheme}</td>
                      <td className="py-2.5 font-mono font-black text-emerald-900">{w.stipend}</td>
                      <td className="py-2.5 font-black text-slate-950">{w.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. Services Table */}
          {activeTab === 'services' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-950 font-black uppercase text-[10px]">
                    <th className="pb-2">Service Code</th>
                    <th className="pb-2">Dept</th>
                    <th className="pb-2">Service Name</th>
                    <th className="pb-2">Endpoint Route</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2">SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sampleServices.map((s) => (
                    <tr key={s.code} className="hover:bg-slate-100">
                      <td className="py-2.5 font-mono font-black text-slate-950">{s.code}</td>
                      <td className="py-2.5 font-black text-amber-800">{s.dept}</td>
                      <td className="py-2.5 text-slate-950 font-black">{s.name}</td>
                      <td className="py-2.5 font-mono text-emerald-800 font-bold">{s.path}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200 text-slate-950 border border-slate-300">
                          {s.method}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-slate-800 font-bold">&lt; {s.sla}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 6. Schema Mappings */}
          {activeTab === 'schemas' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-950 font-black uppercase text-[10px]">
                    <th className="pb-2">Direction</th>
                    <th className="pb-2">Entity Type</th>
                    <th className="pb-2">Source Field</th>
                    <th className="pb-2">Target Field</th>
                    <th className="pb-2">Transformation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sampleSchemaMappings.map((sm, idx) => (
                    <tr key={idx} className="hover:bg-slate-100">
                      <td className="py-2.5 font-mono font-black text-amber-800">
                        {sm.source} &rarr; {sm.target}
                      </td>
                      <td className="py-2.5 font-black text-slate-950">{sm.type}</td>
                      <td className="py-2.5 font-mono text-slate-900 font-bold">{sm.sourceField}</td>
                      <td className="py-2.5 font-mono text-emerald-800 font-bold">{sm.targetField}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-slate-200 text-slate-950 border border-slate-300">
                          {sm.rule}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-6 border-t border-slate-300 bg-slate-50 flex items-center justify-between text-xs text-slate-800 font-bold">
          <span>Government of Maharashtra • MahaSetu Registry</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-950 font-black transition-all border border-slate-300"
          >
            Close Explorer
          </button>
        </div>

      </div>
    </div>
  );
};
