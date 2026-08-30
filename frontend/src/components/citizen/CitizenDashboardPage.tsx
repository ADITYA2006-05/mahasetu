import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CitizenProfileData } from '../../types';
import { API_BASE_URL } from '../../config/api';
import { 
  UserCheck, 
  ShieldCheck, 
  Eye, 
  FileText, 
  Sprout, 
  HeartHandshake, 
  CheckCircle2, 
  RefreshCw, 
  AlertTriangle,
  Layers,
  ChevronRight
} from 'lucide-react';

interface CitizenDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const CitizenDashboardPage: React.FC<CitizenDashboardPageProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<CitizenProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/citizen/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch citizen profile and entitlements');
      const data: CitizenProfileData = await res.json();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-700">Loading citizen profile & federated records...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-sm font-bold flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          <span>{error || 'Unable to retrieve citizen profile.'}</span>
        </div>
        <button
          onClick={fetchProfile}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-2xl p-6 text-slate-950 shadow-lg relative overflow-hidden border border-amber-400">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-950 text-amber-400 border border-slate-800 mb-2">
              <UserCheck className="w-3.5 h-3.5" /> Citizen Self-Service Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Namaste, {profile.fullName}
            </h1>
            <p className="text-slate-900 text-sm mt-1 max-w-2xl font-bold">
              Citizen ID: <span className="font-mono font-black text-slate-950">{profile.citizenId}</span> • Aadhaar: <span className="font-mono">{profile.aadhaarHash}</span> • District: <strong>{profile.district}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProfile}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-amber-600/60 text-xs">
          <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-amber-300">
            <span className="text-[10px] uppercase font-bold text-slate-600">Active Consents</span>
            <div className="text-xl font-black text-slate-950 mt-0.5">{profile.activeConsentsCount}</div>
          </div>
          <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-amber-300">
            <span className="text-[10px] uppercase font-bold text-slate-600">Data Access Events</span>
            <div className="text-xl font-black text-slate-950 mt-0.5">{profile.totalAccessEventsCount}</div>
          </div>
          <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-amber-300">
            <span className="text-[10px] uppercase font-bold text-slate-600">Linked Departments</span>
            <div className="text-xl font-black text-slate-950 mt-0.5">3 / 3</div>
          </div>
          <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-amber-300">
            <span className="text-[10px] uppercase font-bold text-slate-600">Gateway Status</span>
            <div className="text-xs font-black text-emerald-800 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> All Gateways Active
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => onNavigate('/citizen/consents')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-emerald-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Manage <ChevronRight className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-base font-black text-slate-950 mt-3">Data Sharing Consents</h3>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Review active data sharing agreements, grant new permissions, or revoke access anytime.
          </p>
          <div className="mt-3 text-xs font-black text-emerald-800">
            {profile.activeConsentsCount} Active Agreements
          </div>
        </div>

        <div 
          onClick={() => onNavigate('/citizen/data-access')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-sky-100 text-sky-900 border border-sky-300">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-sky-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              View Log <ChevronRight className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-base font-black text-slate-950 mt-3">Data Access History</h3>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Full transparency audit of every government officer query to your personal records.
          </p>
          <div className="mt-3 text-xs font-black text-sky-800">
            {profile.totalAccessEventsCount} Access Records Logged
          </div>
        </div>

        <div 
          onClick={() => onNavigate('/citizen/profile')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-900 border border-indigo-300">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-indigo-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Full Profile <ChevronRight className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-base font-black text-slate-950 mt-3">Identity & Department IDs</h3>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Synthetic master identity, residential address, and linked departmental account numbers.
          </p>
          <div className="mt-3 text-xs font-black text-indigo-800">
            REV, AGR, WEL Linked
          </div>
        </div>
      </div>

      {/* Federated Records 3-Column Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" /> Federated Department Entitlements
          </h2>
          <span className="text-xs font-bold text-slate-500">Live Gateway Query</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Revenue Land Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-950">Revenue & Forest</h3>
                    <p className="text-[10px] text-slate-500">7/12 Land Registry</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded">
                  {profile.departmentIdentifiers['REV'] || 'REV-7-12-001'}
                </span>
              </div>

              <div className="space-y-2 mt-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600 font-bold">Survey Number:</span>
                  <span className="font-mono font-black text-slate-950">{profile.revenueLandPreview?.surveyNumber || 'SN-101'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600 font-bold">Total Area:</span>
                  <span className="font-mono font-black text-slate-950">{profile.revenueLandPreview?.areaAcres || 1.98} Acres ({profile.revenueLandPreview?.areaHectares || 0.80} Ha)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600 font-bold">Land Type:</span>
                  <span className="font-black text-slate-950">{profile.revenueLandPreview?.landType || 'BAGAYAT'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600 font-bold">Location:</span>
                  <span className="font-bold text-slate-950 text-right">{profile.revenueLandPreview?.village || 'Wagholi'}, {profile.revenueLandPreview?.district || 'Pune'}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-bold">
              <span>Khata: {profile.revenueLandPreview?.khataNumber || 'KH-8801'}</span>
              <span className="text-emerald-700 font-black">Verified Owner</span>
            </div>
          </div>

          {/* Agriculture Profile Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-950">Dept of Agriculture</h3>
                    <p className="text-[10px] text-slate-500">Farmer Registration</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded">
                  {profile.departmentIdentifiers['AGR'] || 'AGR-FARM-001'}
                </span>
              </div>

              <div className="space-y-2 mt-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600 font-bold">Category:</span>
                  <span className="font-black text-slate-950">{profile.agricultureProfilePreview?.farmerCategory || 'SMALL_HOLDER'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600 font-bold">Primary Crop:</span>
                  <span className="font-black text-slate-950">{profile.agricultureProfilePreview?.primaryCrop || 'Cotton'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600 font-bold">Crop Season:</span>
                  <span className="font-black text-slate-950">{profile.agricultureProfilePreview?.cropSeason || 'Kharif'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600 font-bold">Subsidies Availed:</span>
                  <span className="font-mono text-emerald-800 font-black">₹{Number(profile.agricultureProfilePreview?.subsidiesAvailedInr || 12000).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-bold">
              <span>PM-KISAN: Eligible</span>
              <span className="text-amber-800 font-black">Active KCC</span>
            </div>
          </div>

          {/* Welfare Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-300">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-950">Social Welfare</h3>
                    <p className="text-[10px] text-slate-500">DBT & Social Security</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-300 rounded">
                  {profile.departmentIdentifiers['WEL'] || 'WEL-BEN-001'}
                </span>
              </div>

              <div className="space-y-2 mt-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600 font-bold">Scheme Name:</span>
                  <span className="font-black text-slate-950 truncate max-w-[150px]">{profile.welfareBeneficiaryPreview?.schemeName || 'Sanjay Gandhi Niradhar'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600 font-bold">Monthly Stipend:</span>
                  <span className="font-mono text-emerald-800 font-black">₹{profile.welfareBeneficiaryPreview?.monthlyStipendInr || 1500}.00 / mo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600 font-bold">Bank Account:</span>
                  <span className="font-mono text-slate-950 font-bold">{profile.welfareBeneficiaryPreview?.bankAccountNumber || 'MAHB-XXXX-3001'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600 font-bold">DBT Status:</span>
                  <span className="text-emerald-800 font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    {profile.welfareBeneficiaryPreview?.disbursementStatus || 'PROCESSED'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-bold">
              <span>Disbursement: Direct</span>
              <span className="text-indigo-800 font-black">Beneficiary Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Citizen Services Catalogue */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-base font-black text-slate-950 mb-1">
          Integrated Government Services Catalogue
        </h3>
        <p className="text-xs text-slate-600 font-medium mb-4">
          Services integrated with MahaSetu State Data Gateway for instant zero-paperwork verification.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-black text-slate-950 block">7/12 Land Mutation</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Revenue & Forest Dept</span>
            <span className="inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
              Active Integration
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-black text-slate-950 block">PM-KISAN e-KYC</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Agriculture Dept</span>
            <span className="inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
              Active Integration
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-black text-slate-950 block">Sanjay Gandhi Niradhar</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Social Welfare Dept</span>
            <span className="inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
              Active Integration
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-black text-slate-950 block">Crop Loan Subsidy</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Agri & Revenue Joint</span>
            <span className="inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
              Active Integration
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
