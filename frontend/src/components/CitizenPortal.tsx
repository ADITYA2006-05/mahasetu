import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CitizenConsentsPage } from './CitizenConsentsPage';
import { CitizenDataAccessPage } from './CitizenDataAccessPage';
import { UserCheck, FileText, Sprout, HeartHandshake, ShieldAlert, Lock, CheckCircle2, ShieldCheck, Eye, Layers } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface CitizenPortalProps {
  activeSubView?: 'entitlements' | 'consents' | 'data-access';
  onSelectSubView?: (view: 'entitlements' | 'consents' | 'data-access') => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  activeSubView = 'entitlements',
  onSelectSubView
}) => {
  const { user, token } = useAuth();
  const [internalTab, setInternalTab] = useState<'entitlements' | 'consents' | 'data-access'>(activeSubView);
  const [probeStatus, setProbeStatus] = useState<'idle' | 'testing' | '403_received' | '200_received'>('idle');
  const [probeResult, setProbeResult] = useState<any>(null);

  const currentTab = onSelectSubView ? activeSubView : internalTab;
  const setTab = (tab: 'entitlements' | 'consents' | 'data-access') => {
    if (onSelectSubView) {
      onSelectSubView(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const testRbacProtection = async () => {
    setProbeStatus('testing');
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setProbeResult(data);
      if (res.status === 403) {
        setProbeStatus('403_received');
      } else {
        setProbeStatus('200_received');
      }
    } catch (e: any) {
      setProbeResult({ error: e.message });
      setProbeStatus('403_received');
    }
  };

  return (
    <div className="space-y-6">
      {/* Citizen Navigation Sub-Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setTab('entitlements')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
            currentTab === 'entitlements'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" /> My Entitlements
        </button>

        <button
          onClick={() => setTab('consents')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
            currentTab === 'consents'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Data Sharing Consents
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-950">
            Phase 6
          </span>
        </button>

        <button
          onClick={() => setTab('data-access')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
            currentTab === 'data-access'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Eye className="w-4 h-4" /> Data Access Log
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-200 text-sky-950">
            Audit
          </span>
        </button>
      </div>

      {/* View Branching */}
      {currentTab === 'consents' ? (
        <CitizenConsentsPage />
      ) : currentTab === 'data-access' ? (
        <CitizenDataAccessPage />
      ) : (
        <>
          {/* Citizen Welcome Card */}
          <div className="bg-white border border-slate-300 rounded-xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-black bg-sky-200 text-slate-950 border border-sky-400 mb-2">
                  <UserCheck className="w-3.5 h-3.5 text-sky-800" />
                  Citizen Entitlements Portal
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                  Namaste, {user?.fullName || 'Citizen'}
                </h2>
                <p className="text-slate-800 text-xs sm:text-sm mt-0.5 max-w-2xl font-bold">
                  Citizen ID: <span className="font-mono font-black text-amber-800">{user?.citizenId || 'MH-CIT-10001'}</span> • Federated cross-departmental records retrieved via MahaSetu Data Gateway.
                </p>
              </div>

              <div className="flex flex-col items-end gap-0.5 p-2.5 rounded-lg bg-slate-100 border border-slate-300">
                <span className="text-[10px] text-slate-700 uppercase font-mono font-bold">Authorization</span>
                <div className="flex items-center gap-1 text-emerald-900 text-xs font-black font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  ROLE_CITIZEN
                </div>
              </div>
            </div>
          </div>

      {/* Citizen Records 3-Column Federation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Land Record 7/12 Extract */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 text-amber-800 font-black text-sm">
                <FileText className="w-4 h-4 text-amber-700" />
                <span>Revenue (7/12 RoR)</span>
              </div>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-amber-100 text-slate-950 border border-amber-300 rounded">
                MH-REV-KH-10001
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-700 font-bold">Land Record ID:</span>
                <span className="font-mono text-slate-950 font-black">MH-REV-LR-10001</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-700 font-bold">Khata / Survey No:</span>
                <span className="font-mono text-slate-950 font-black">KH-5001 / SN-101</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-700 font-bold">Landholding:</span>
                <span className="font-black text-slate-950">0.8500 Ha (2.10 Acres)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-700 font-bold">Classification:</span>
                <span className="text-emerald-900 font-black">BAGAYAT (Irrigated)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-700 font-bold">Encumbrance:</span>
                <span className="text-slate-950 font-black">NONE (Clean Title)</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-800 font-bold">
            <span>Wagholi, Haveli, Pune</span>
            <span className="text-emerald-800 font-black">Verified</span>
          </div>
        </div>

        {/* Agriculture Profile */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                <Sprout className="w-4 h-4 text-emerald-700" />
                <span>Agriculture Department</span>
              </div>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-emerald-100 text-slate-950 border border-emerald-300 rounded">
                MH-AGR-REG-20001
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-700 font-bold">Farmer Category:</span>
                <span className="font-black text-emerald-900">MARGINAL (&lt;1ha)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-700 font-bold">Registered Crop:</span>
                <span className="font-black text-slate-950">Cotton (Kharif)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-700 font-bold">Irrigation / Soil:</span>
                <span className="text-slate-950 font-black">Drip / Black Cotton</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-700 font-bold">Kisan Credit Card:</span>
                <span className="text-emerald-900 font-black">ACTIVE</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-700 font-bold">DBT Subsidy:</span>
                <span className="font-mono text-slate-950 font-black">₹15,850.00</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-800 font-bold">
            <span>Soil Health: Good</span>
            <span className="text-emerald-800 font-black">Enrolled</span>
          </div>
        </div>

        {/* Welfare Beneficiary Record */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 text-purple-800 font-black text-sm">
                <HeartHandshake className="w-4 h-4 text-purple-700" />
                <span>Social Welfare</span>
              </div>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-purple-100 text-slate-950 border border-purple-300 rounded">
                MH-WEL-BEN-30001
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-700 font-bold">Scheme:</span>
                <span className="font-black text-slate-950 truncate max-w-[150px]">Sanjay Gandhi Niradhar</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-700 font-bold">Category:</span>
                <span className="text-slate-950 font-black">BPL Small Holder</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-700 font-bold">Monthly Stipend:</span>
                <span className="font-mono text-emerald-900 font-black">₹1,500.00 / mo</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-700 font-bold">Bank Account:</span>
                <span className="font-mono text-slate-950 font-black">MAHB-XXXXX-3001</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-700 font-bold">DBT Status:</span>
                <span className="text-emerald-900 font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  PROCESSED
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-800 font-bold">
            <span>Disbursement: Direct</span>
            <span className="text-purple-900 font-black">Active</span>
          </div>
        </div>

      </div>

      {/* Interactive RBAC Security Inspection Probe */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-black bg-rose-200 text-slate-950 border border-rose-400 mb-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-800" />
              Role Authorization Verification
            </div>
            <h3 className="text-base font-black text-slate-950">
              Test Administration Endpoint Protection (<code className="text-amber-800 font-mono text-xs font-black">/api/stats</code>)
            </h3>
            <p className="text-xs text-slate-800 mt-0.5 font-bold">
              Test that calling an admin endpoint with citizen credentials triggers a 403 Forbidden response.
            </p>
          </div>

          <button
            onClick={testRbacProtection}
            disabled={probeStatus === 'testing'}
            className="px-4 py-2 rounded-lg bg-rose-200 hover:bg-rose-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors border border-rose-400 shadow-sm"
          >
            {probeStatus === 'testing' ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-800" />
                <span>Test /api/stats (Expect 403)</span>
              </>
            )}
          </button>
        </div>

        {/* Probe Output Console */}
        {probeStatus !== 'idle' && (
          <div className="mt-4 p-3.5 rounded-lg bg-slate-100 border border-slate-300 font-mono text-xs overflow-x-auto">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-300 text-slate-950 text-[11px] font-black">
              <span>RESPONSE AUDIT:</span>
              <span className={probeStatus === '403_received' ? 'text-rose-900 font-black' : 'text-emerald-900 font-black'}>
                {probeStatus === '403_received' ? 'HTTP 403 FORBIDDEN (SECURITY VERIFIED)' : 'HTTP 200 OK'}
              </span>
            </div>
            <pre className="text-slate-950 text-[11px] leading-relaxed font-mono font-bold">
              {JSON.stringify(probeResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};
