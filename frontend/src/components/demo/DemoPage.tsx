import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IntegrationResponse } from '../../types';
import { API_BASE_URL } from '../../config/api';
import { 
  PlayCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  RefreshCw, 
  FileText, 
  Sprout, 
  HeartHandshake, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';

export const DemoPage: React.FC = () => {
  const { token } = useAuth();

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [agriOutage, setAgriOutage] = useState<boolean>(false);
  const [demoResult, setDemoResult] = useState<IntegrationResponse | null>(null);
  const [auditLogEntry, setAuditLogEntry] = useState<any | null>(null);

  const runEndToEndDemo = async (simulateFailure: boolean = false) => {
    if (!token) return;
    setIsRunning(true);
    setDemoStep(1);
    setDemoResult(null);
    setAuditLogEntry(null);
    setAgriOutage(simulateFailure);

    try {
      // 1. Configure Gateway Statuses
      if (simulateFailure) {
        await fetch(`${API_BASE_URL}/api/mock/admin/departments/AGR/status`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'OFFLINE' }),
        });
      } else {
        await Promise.all([
          fetch(`${API_BASE_URL}/api/mock/admin/departments/REV/status`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ONLINE' }),
          }),
          fetch(`${API_BASE_URL}/api/mock/admin/departments/AGR/status`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ONLINE' }),
          }),
          fetch(`${API_BASE_URL}/api/mock/admin/departments/WEL/status`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ONLINE' }),
          }),
        ]);
      }

      // Step 2: Citizen & Consent verification
      setTimeout(() => setDemoStep(2), 300);

      // Step 3: Federated Integration Dispatch
      setTimeout(() => setDemoStep(3), 600);

      const res = await fetch(`${API_BASE_URL}/api/integration/request`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          citizenId: 'MH-CIT-10001',
          purpose: 'SUBSIDY_VERIFICATION',
          requestedDepartments: ['REVENUE', 'AGRICULTURE', 'WELFARE'],
        }),
      });

      // Step 4: Schema Transformation Engine
      setTimeout(() => setDemoStep(4), 900);

      const data = await res.json();
      
      // Step 5: Audit Log & Canonical Output Finalized
      setTimeout(async () => {
        setDemoStep(5);
        if (res.ok) {
          setDemoResult(data);
          
          // Fetch latest audit record
          try {
            const auditRes = await fetch(`${API_BASE_URL}/api/audit-logs`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (auditRes.ok) {
              const logs = await auditRes.json();
              if (logs.length > 0) setAuditLogEntry(logs[0]);
            }
          } catch (e) {
            console.error('Audit fetch error:', e);
          }
        }
        setIsRunning(false);
      }, 1200);

    } catch (err: any) {
      console.error('Demo execution error:', err);
      setIsRunning(false);
      setDemoStep(0);
    }
  };

  const resetAllGatewaysOnline = async () => {
    if (!token) return;
    await fetch(`${API_BASE_URL}/api/mock/admin/departments/AGR/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ONLINE' }),
    });
    setAgriOutage(false);
  };

  return (
    <div className="space-y-6">
      {/* Demo Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-2xl p-6 text-slate-950 border border-amber-400 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-950 text-amber-300 border border-slate-800 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> End-to-End Live Interoperability Showcase
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              MahaSetu System Demonstration
            </h1>
            <p className="text-slate-900 text-sm mt-1 max-w-2xl font-bold">
              Run the full production lifecycle: Citizen Identity $\rightarrow$ Privacy Consent $\rightarrow$ Cross-Department Calls $\rightarrow$ Schema Mapping $\rightarrow$ Canonical Output $\rightarrow$ Fault-Tolerant Failover $\rightarrow$ Immutable Audit Ledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => runEndToEndDemo(false)}
              disabled={isRunning}
              className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs flex items-center gap-2 shadow-lg shadow-slate-950/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <span>Run Standard Flow (100% Online)</span>
            </button>

            <button
              onClick={() => runEndToEndDemo(true)}
              disabled={isRunning}
              className="px-5 py-3 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-200 font-black text-xs border border-rose-700 flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Run Outage Simulation (Agri Offline)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Execution Stepper Visualization */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
          <Layers className="w-4 h-4 text-amber-600" /> Live Orchestration Pipeline Steps
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className={`p-3.5 rounded-xl border transition-all ${
            demoStep >= 1 ? 'bg-amber-50 border-amber-400 text-amber-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Step 1</span>
            <div className="text-xs font-black text-slate-900 mt-1">Identity Resolution</div>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">Citizen MH-CIT-10001 (Ramesh Shinde)</p>
          </div>

          <div className={`p-3.5 rounded-xl border transition-all ${
            demoStep >= 2 ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Step 2</span>
            <div className="text-xs font-black text-slate-900 mt-1">Consent Validation</div>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">Active Consent CNS-XXXXX Verified</p>
          </div>

          <div className={`p-3.5 rounded-xl border transition-all ${
            demoStep >= 3 ? 'bg-sky-50 border-sky-400 text-sky-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Step 3</span>
            <div className="text-xs font-black text-slate-900 mt-1">Federated Gateways</div>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">Parallel calls: REV, AGR, WEL</p>
          </div>

          <div className={`p-3.5 rounded-xl border transition-all ${
            demoStep >= 4 ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Step 4</span>
            <div className="text-xs font-black text-slate-900 mt-1">Schema Mapping</div>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">JSON transformation to Canonical Model</p>
          </div>

          <div className={`p-3.5 rounded-xl border transition-all ${
            demoStep >= 5 ? 'bg-purple-50 border-purple-400 text-purple-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Step 5</span>
            <div className="text-xs font-black text-slate-900 mt-1">Audit Ledger</div>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">Immutable audit event recorded</p>
          </div>
        </div>
      </div>

      {/* Demo Results Panel */}
      {isRunning ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <RefreshCw className="w-10 h-10 text-amber-600 animate-spin mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-900">Executing MahaSetu Data Federation Pipeline...</h3>
          <p className="text-xs text-slate-600 mt-1 font-medium">Orchestrating microservices, verifying cryptographic consents, and building canonical response...</p>
        </div>
      ) : demoResult ? (
        <div className="space-y-6">
          {/* Status Alert Banner */}
          <div className={`p-5 rounded-2xl border text-xs shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            demoResult.status === 'SUCCESS' 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-center gap-3">
              {demoResult.status === 'SUCCESS' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0" />
              )}
              <div>
                <div className="text-sm font-black">
                  {demoResult.status === 'SUCCESS' 
                    ? '100% Interoperability Succeeded: All 3 Department Nodes Responded'
                    : 'Fault-Tolerant Failover Demonstrated: Partial Success Handled Gracefully'}
                </div>
                <p className="font-bold mt-0.5">
                  Request ID: <span className="font-mono">{demoResult.requestId}</span> • Latency: <span className="font-mono">{demoResult.totalLatencyMs} ms</span> • Overall Status: <span className="font-black">{demoResult.status}</span>
                </p>
              </div>
            </div>

            {agriOutage && (
              <button
                onClick={resetAllGatewaysOnline}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition-colors shrink-0 cursor-pointer"
              >
                Restore Agri Gateway Online
              </button>
            )}
          </div>

          {/* Canonical Transformed Data Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Revenue Land */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-black text-slate-950 text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" /> REVENUE & LAND (7/12)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-black text-[10px]">
                  {demoResult.land ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>

              {demoResult.land ? (
                <div className="space-y-1.5 text-xs font-bold text-slate-800">
                  <div>Survey No: <span className="font-mono text-slate-950">{demoResult.land.surveyNumber}</span></div>
                  <div>Area: <span className="font-mono text-slate-950">{demoResult.land.areaAcres} Acres</span></div>
                  <div>Village: <span className="text-slate-950">{demoResult.location?.village}, {demoResult.location?.district}</span></div>
                  <div className="pt-2 text-[10px] text-slate-500 font-mono">Source: REVENUE_7_12</div>
                </div>
              ) : (
                <div className="text-xs text-rose-700 font-bold p-3 bg-rose-50 rounded-xl">
                  Node unreachable
                </div>
              )}
            </div>

            {/* Agriculture */}
            <div className={`p-5 rounded-2xl border shadow-xs space-y-3 ${
              demoResult.agriculture ? 'bg-white border-slate-200' : 'bg-rose-50/40 border-rose-300'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-black text-slate-950 text-xs flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-amber-600" /> AGRICULTURE & CROPS
                </span>
                <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                  demoResult.agriculture ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}>
                  {demoResult.agriculture ? 'SUCCESS' : 'OFFLINE FAILOVER'}
                </span>
              </div>

              {demoResult.agriculture ? (
                <div className="space-y-1.5 text-xs font-bold text-slate-800">
                  <div>Primary Crop: <span className="text-slate-950">{demoResult.agriculture.crop}</span></div>
                  <div>Season: <span className="text-slate-950">{demoResult.agriculture.season}</span></div>
                  <div>Land Usage: <span className="text-slate-950">{demoResult.agriculture.landUsage}</span></div>
                  <div className="pt-2 text-[10px] text-slate-500 font-mono">Source: AGRI_FARMER_PROFILE</div>
                </div>
              ) : (
                <div className="space-y-1.5 text-xs text-rose-900 font-bold p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <div className="font-black">Simulated Department Outage:</div>
                  <p className="text-[11px] text-rose-800 font-medium">
                    Department of Agriculture API gateway is currently OFFLINE. MahaSetu gracefully returned Land & Welfare records without crashing.
                  </p>
                </div>
              )}
            </div>

            {/* Welfare */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-black text-slate-950 text-xs flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-indigo-600" /> SOCIAL WELFARE & DBT
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-black text-[10px]">
                  {demoResult.welfare ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>

              {demoResult.welfare ? (
                <div className="space-y-1.5 text-xs font-bold text-slate-800">
                  <div>Scheme: <span className="text-slate-950">{demoResult.welfare.schemeName}</span></div>
                  <div>Monthly DBT: <span className="font-mono text-emerald-800 font-black">₹{demoResult.welfare.benefitAmount}.00</span></div>
                  <div>Disbursement: <span className="text-emerald-800 font-black">{demoResult.welfare.applicationStatus}</span></div>
                  <div className="pt-2 text-[10px] text-slate-500 font-mono">Source: WELFARE_DBT_PORTAL</div>
                </div>
              ) : (
                <div className="text-xs text-rose-700 font-bold p-3 bg-rose-50 rounded-xl">
                  Node unreachable
                </div>
              )}
            </div>
          </div>

          {/* Audit Trail Verified Strip */}
          {auditLogEntry && (
            <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-mono text-amber-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Immutable Audit Trail Recorded
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  Audit ID: {auditLogEntry.auditId}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-slate-300">
                <div>Citizen: <strong className="text-white">{auditLogEntry.citizenId}</strong></div>
                <div>User: <strong className="text-white">{auditLogEntry.requestingUser}</strong></div>
                <div>Status: <strong className="text-amber-400">{auditLogEntry.status}</strong></div>
                <div>Latency: <strong className="text-white">{auditLogEntry.responseTimeMs} ms</strong></div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <PlayCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-900">Ready for Live Demonstration</h3>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto font-medium">
            Click "Run Standard Flow" or "Run Outage Simulation" in the banner above to trigger the live automated integration demonstration.
          </p>
        </div>
      )}
    </div>
  );
};
