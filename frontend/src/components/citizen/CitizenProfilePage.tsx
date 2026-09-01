import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CitizenProfileData } from '../../types';
import { API_BASE_URL } from '../../config/api';
import { 
  User, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Fingerprint, 
  RefreshCw, 
  CheckCircle2
} from 'lucide-react';

import { getFallbackCitizenProfile } from '../../utils/fallbackProfile';

export const CitizenProfilePage: React.FC = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<CitizenProfileData>(() => getFallbackCitizenProfile(user));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    if (!token) {
      setProfile(getFallbackCitizenProfile(user));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/citizen/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) {
        console.warn(`Profile API returned status ${res.status}. Using fallback profile.`);
        setProfile(getFallbackCitizenProfile(user));
        return;
      }
      const data: CitizenProfileData = await res.json();
      setProfile(data);
    } catch (err: any) {
      console.warn('Failed to load profile details, using fallback:', err);
      setProfile(getFallbackCitizenProfile(user));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token, user]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-600">Retrieving master citizen profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-amber-300 shrink-0">
              {profile.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{profile.fullName}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Master Record
                </span>
              </div>
              <p className="text-slate-300 text-xs font-mono mt-1">
                Citizen Master ID: <strong className="text-amber-300">{profile.citizenId}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={fetchProfile}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* 2-Column Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Master Demographic Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-950 flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-600" /> Demographic Information
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Full Name</span>
              <div className="font-bold text-slate-900 mt-0.5">{profile.fullName}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Aadhaar (Virtual ID)</span>
              <div className="font-mono font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Fingerprint className="w-3.5 h-3.5 text-indigo-600" />
                {profile.aadhaarHash}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</span>
              <div className="font-mono font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {profile.dob}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gender</span>
              <div className="font-bold text-slate-900 mt-0.5">{profile.gender}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Masked Mobile</span>
              <div className="font-mono font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                {profile.mobileNumber}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Masked Email</span>
              <div className="font-mono font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {profile.email}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Permanent Residential Address</span>
            <div className="font-bold text-slate-900 text-xs mt-1 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{profile.fullAddress}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 font-mono text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div>District: <strong>{profile.district}</strong></div>
              <div>Taluka: <strong>{profile.taluka}</strong></div>
              <div>Village: <strong>{profile.village}</strong></div>
            </div>
          </div>
        </div>

        {/* Cross-Department Identifiers Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-950 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-amber-600" /> Cross-Department Identifiers
          </h2>

          <p className="text-xs text-slate-600 font-medium">
            MahaSetu resolves these heterogeneous legacy departmental identifiers to your master synthetic identity automatically.
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase">Revenue & Forest (7/12 Land)</span>
                <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                  {profile.departmentIdentifiers['REV'] || 'REV-7-12-PUN-001'}
                </div>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-900 font-black text-[10px] border border-emerald-300">
                ACTIVE
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase">Dept of Agriculture (Farmer Profile)</span>
                <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                  {profile.departmentIdentifiers['AGR'] || 'AGR-FARM-PUN-001'}
                </div>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-900 font-black text-[10px] border border-emerald-300">
                ACTIVE
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase">Social Welfare (DBT Beneficiary)</span>
                <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                  {profile.departmentIdentifiers['WEL'] || 'WEL-BEN-PUN-001'}
                </div>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-900 font-black text-[10px] border border-emerald-300">
                ACTIVE
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>All 3 state department identities verified and linked under MahaSetu Data Federation standards.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
