import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IntegrationResponse } from '../../types';
import { 
  FileCheck, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  FileText, 
  Sprout, 
  HeartHandshake, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Database, 
  Sliders
} from 'lucide-react';

export const OfficerVerificationPage: React.FC = () => {
  const { token } = useAuth();

  const [citizenId, setCitizenId] = useState<string>('MH-CIT-10001');
  const [purpose, setPurpose] = useState<string>('SUBSIDY_VERIFICATION');
  const [selectedDepts, setSelectedDepts] = useState<{ [key: string]: boolean }>({
    REVENUE: true,
    AGRICULTURE: true,
    WELFARE: true,
  });

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0: idle, 1: identity, 2: consent, 3: depts, 4: schema, 5: result
  const [response, setResponse] = useState<IntegrationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presets = [
    { id: 'MH-CIT-10001', name: 'Ramesh T. Shinde' },
    { id: 'MH-CIT-10002', name: 'Sunita B. Jadhav' },
    { id: 'MH-CIT-10003', name: 'Anand D. More' },
  ];

  const purposeOptions = [
    'SUBSIDY_VERIFICATION',
    'DIRECT_BENEFIT_TRANSFER',
    'LAND_VERIFICATION',
    'BENEFIT_AUDIT',
    'SCHEME_ENROLLMENT'
  ];

  const handleExecute = async () => {
    if (!token) return;
    setErrorMsg(null);
    setResponse(null);
    setIsExecuting(true);
    setCurrentStep(1);

    const activeDepts = Object.keys(selectedDepts).filter(k => selectedDepts[k]);
    if (activeDepts.length === 0) {
      setErrorMsg('Please select at least one department to query.');
      setIsExecuting(false);
      setCurrentStep(0);
      return;
    }

    try {
      setTimeout(() => setCurrentStep(2), 250);
      setTimeout(() => setCurrentStep(3), 500);

      const res = await fetch('http://localhost:8080/api/integration/request', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          citizenId: citizenId.trim(),
          purpose: purpose.trim(),
          requestedDepartments: activeDepts,
        }),
      });

      setTimeout(() => setCurrentStep(4), 750);

      const data = await res.json();
      setTimeout(() => {
        setCurrentStep(5);
        if (res.ok) {
          setResponse(data);
        } else {
          setErrorMsg(data.message || `Request failed with status ${res.status}`);
        }
        setIsExecuting(false);
      }, 950);

    } catch (err: any) {
      setErrorMsg(err.message || 'Network error executing verification request');
      setIsExecuting(false);
      setCurrentStep(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 mb-2">
              <FileCheck className="w-3.5 h-3.5" /> Citizen Verification Console (Phase 7)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              End-to-End Interoperability Pipeline
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">
              Verify citizen identity, check privacy consent, query Revenue, Agriculture, and Welfare nodes, and generate a standardized canonical record in real time.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Verification Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-950 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Search className="w-4 h-4 text-amber-600" /> Verification Request Parameters
            </h2>

            {/* 1. Citizen Selection */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                1. Citizen Identifier <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={citizenId}
                onChange={e => setCitizenId(e.target.value)}
                placeholder="e.g. MH-CIT-10001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-black uppercase focus:ring-2 focus:ring-amber-500"
              />

              <div className="flex flex-wrap gap-1.5 mt-2">
                {presets.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCitizenId(p.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      citizenId === p.id 
                        ? 'bg-amber-100 text-amber-950 border-amber-400 font-black' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {p.id} ({p.name.split(' ')[0]})
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Target Departments */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-2">
                2. Target Department Gateways <span className="text-rose-600">*</span>
              </label>
              <div className="space-y-2 text-xs font-bold">
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedDepts['REVENUE']}
                      onChange={e => setSelectedDepts({ ...selectedDepts, REVENUE: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Revenue & Forest (7/12 Land Records)</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">REV</span>
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedDepts['AGRICULTURE']}
                      onChange={e => setSelectedDepts({ ...selectedDepts, AGRICULTURE: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <Sprout className="w-4 h-4 text-amber-600" />
                    <span>Dept of Agriculture (Farmer Profile)</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">AGR</span>
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedDepts['WELFARE']}
                      onChange={e => setSelectedDepts({ ...selectedDepts, WELFARE: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <HeartHandshake className="w-4 h-4 text-indigo-600" />
                    <span>Social Welfare (DBT Beneficiary)</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">WEL</span>
                </label>
              </div>
            </div>

            {/* 3. Authorized Purpose */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                3. Purpose of Verification <span className="text-rose-600">*</span>
              </label>
              <select
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-amber-500"
              >
                {purposeOptions.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Submit Action */}
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Federated Verification...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Execute Verification Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Visual Pipeline & Canonical Output */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Visual Pipeline Stepper */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" /> Pipeline Progression
            </h3>

            <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
              <div className={`p-2.5 rounded-xl border transition-all ${
                currentStep >= 1 ? 'bg-amber-100 border-amber-400 text-amber-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <Database className="w-4 h-4 mx-auto mb-1" />
                <span>1. Identity</span>
              </div>

              <div className={`p-2.5 rounded-xl border transition-all ${
                currentStep >= 2 ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <ShieldCheck className="w-4 h-4 mx-auto mb-1" />
                <span>2. Consent</span>
              </div>

              <div className={`p-2.5 rounded-xl border transition-all ${
                currentStep >= 3 ? 'bg-sky-100 border-sky-400 text-sky-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <Building2 className="w-4 h-4 mx-auto mb-1" />
                <span>3. Gateways</span>
              </div>

              <div className={`p-2.5 rounded-xl border transition-all ${
                currentStep >= 4 ? 'bg-indigo-100 border-indigo-400 text-indigo-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <Sliders className="w-4 h-4 mx-auto mb-1" />
                <span>4. Schema</span>
              </div>

              <div className={`p-2.5 rounded-xl border transition-all ${
                currentStep >= 5 ? 'bg-purple-100 border-purple-400 text-purple-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                <span>5. Unified</span>
              </div>
            </div>
          </div>

          {/* Pipeline Result View */}
          {errorMsg ? (
            <div className="bg-rose-50 border border-rose-300 text-rose-950 p-5 rounded-2xl text-xs space-y-2 shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-rose-950 text-sm">
                    Verification Query Blocked / Failed
                  </div>
                  <p className="font-bold text-rose-900 mt-1 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-rose-200 text-[11px] text-slate-700 font-medium">
                <strong className="text-slate-900">Privacy Gatekeeper:</strong> If this error indicates missing or revoked consent, the citizen must grant permission for purpose <strong>{purpose}</strong> in the Citizen Portal (<code className="font-mono text-emerald-800 font-bold">/citizen/consents</code>).
              </div>
            </div>
          ) : response ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-5 p-5">
              {/* Result Meta Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-950 font-mono">
                      {response.requestId}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      response.status === 'SUCCESS'
                        ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                        : response.status === 'PARTIAL_SUCCESS'
                          ? 'bg-amber-100 text-amber-950 border border-amber-300'
                          : 'bg-rose-100 text-rose-950 border border-rose-300'
                    }`}>
                      {response.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    Citizen: <strong className="text-slate-900">{response.citizen?.name || response.citizenId}</strong> ({response.citizenId})
                  </p>
                </div>

                <div className="text-xs text-slate-500 font-mono sm:text-right">
                  <div>Latency: <strong className="text-slate-900">{response.totalLatencyMs} ms</strong></div>
                  <div className="text-[11px]">Sources: {response.sources?.join(', ')}</div>
                </div>
              </div>

              {/* Department Execution Latencies */}
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 block mb-2">Department Gateway Telemetry</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  {response.departmentResponses?.map((d, i) => (
                    <div 
                      key={i}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        d.status === 'SUCCESS' ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-rose-50/60 border-rose-200 text-rose-950'
                      }`}
                    >
                      <span className="font-black text-[11px]">{d.department}</span>
                      <span className="text-[10px] font-bold">{d.responseTimeMs} ms • {d.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Structured Canonical Data Sections with Source Tracking */}
              <div className="space-y-4 pt-2">
                <span className="text-[10px] font-black uppercase text-slate-500 block">Unified Canonical Data Model (Standardized)</span>

                {/* LAND SECTION */}
                {response.land && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-black text-slate-950 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-emerald-600" /> LAND PARCEL RECORDS
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-black text-[10px] border border-emerald-300">
                        Source: {response.land.source || 'REVENUE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-bold text-slate-800">
                      <div>Survey Number: <span className="font-mono text-slate-950">{response.land.surveyNumber}</span></div>
                      <div>Area (Acres): <span className="font-mono text-slate-950">{response.land.areaAcres} Acres</span></div>
                      <div>Location: <span className="text-slate-950">{response.location?.village}, {response.location?.district}</span></div>
                    </div>
                  </div>
                )}

                {/* AGRICULTURE SECTION */}
                {response.agriculture && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-black text-slate-950 flex items-center gap-1.5">
                        <Sprout className="w-4 h-4 text-amber-600" /> AGRICULTURE & CROPS
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-black text-[10px] border border-amber-300">
                        Source: {response.agriculture.source || 'AGRICULTURE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-bold text-slate-800">
                      <div>Primary Crop: <span className="text-slate-950">{response.agriculture.crop}</span></div>
                      <div>Season: <span className="text-slate-950">{response.agriculture.season}</span></div>
                      <div>Land Usage: <span className="text-slate-950">{response.agriculture.landUsage}</span></div>
                    </div>
                  </div>
                )}

                {/* WELFARE SECTION */}
                {response.welfare && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-black text-slate-950 flex items-center gap-1.5">
                        <HeartHandshake className="w-4 h-4 text-indigo-600" /> SOCIAL WELFARE & DBT
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-black text-[10px] border border-indigo-300">
                        Source: {response.welfare.source || 'WELFARE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-bold text-slate-800">
                      <div>Scheme Code: <span className="font-mono text-slate-950">{response.welfare.schemeCode}</span></div>
                      <div>Scheme Name: <span className="text-slate-950">{response.welfare.schemeName}</span></div>
                      <div>Monthly Benefit: <span className="font-mono text-emerald-800 font-black">₹{response.welfare.benefitAmount}.00 / mo</span></div>
                      <div>Status: <span className="text-emerald-800 font-black">{response.welfare.applicationStatus}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
              <FileCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-black text-slate-900">Awaiting Verification Request</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto font-medium">
                Select citizen parameters on the left and click "Execute Verification Pipeline" to trigger cross-department query orchestration.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
