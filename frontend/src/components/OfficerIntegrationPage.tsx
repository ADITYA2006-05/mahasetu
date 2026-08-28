import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { IntegrationResponse, DepartmentResponseItem } from '../types';
import { 
  Network, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Building2, 
  FileText, 
  Sprout, 
  HeartHandshake, 
  RefreshCw, 
  Activity,
  Power,
  Zap,
  Users,
  Sparkles
} from 'lucide-react';

export const OfficerIntegrationPage: React.FC = () => {
  const { token } = useAuth();

  // Form State
  const [citizenId, setCitizenId] = useState<string>('MH-CIT-10001');
  const [purpose, setPurpose] = useState<string>('SUBSIDY_VERIFICATION');
  const [selectedDepts, setSelectedDepts] = useState<{ [key: string]: boolean }>({
    REVENUE: true,
    AGRICULTURE: true,
    WELFARE: true
  });

  // Execution State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [currentResponse, setCurrentResponse] = useState<IntegrationResponse | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // History & Simulator State
  const [history, setHistory] = useState<IntegrationResponse[]>([]);
  const [deptStatus, setDeptStatus] = useState<{ [key: string]: string }>({
    REV: 'ONLINE',
    AGR: 'ONLINE',
    WEL: 'ONLINE'
  });
  const [togglingDept, setTogglingDept] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/integration/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch integration history:', err);
    }
  };

  const fetchDepartmentStatuses = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/mock/admin/departments/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const map: { [key: string]: string } = {};
        Object.keys(data).forEach(k => {
          map[k] = data[k].status;
        });
        setDeptStatus(map);
      }
    } catch (err) {
      console.error('Failed to fetch dept statuses:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchDepartmentStatuses();
  }, [token]);

  const handleToggleDeptStatus = async (deptCode: string) => {
    if (!token) return;
    const current = deptStatus[deptCode] || 'ONLINE';
    const nextStatus = current === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    setTogglingDept(deptCode);
    try {
      const res = await fetch(`/api/mock/admin/departments/${deptCode}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setDeptStatus(prev => ({ ...prev, [deptCode]: nextStatus }));
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setTogglingDept(null);
    }
  };

  const handleExecuteIntegration = async () => {
    if (!token) return;
    setExecutionError(null);
    setIsExecuting(true);

    const activeDepts = Object.keys(selectedDepts).filter(k => selectedDepts[k]);
    if (activeDepts.length === 0) {
      setExecutionError('Please select at least one department to query.');
      setIsExecuting(false);
      return;
    }

    try {
      const res = await fetch('/api/integration/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          citizenId: citizenId.trim(),
          purpose: purpose.trim(),
          requestedDepartments: activeDepts
        })
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentResponse(data);
        fetchHistory();
      } else {
        setExecutionError(data.message || `Request failed with HTTP status ${res.status}`);
        setCurrentResponse(null);
      }
    } catch (err: any) {
      setExecutionError(err.message || 'Network error executing integration request.');
      setCurrentResponse(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const syntheticCitizenPresets = [
    { id: 'MH-CIT-10001', name: 'Ramesh T. Shinde', role: 'Farmer' },
    { id: 'MH-CIT-10002', name: 'Sunita B. Jadhav', role: 'Weaver' },
    { id: 'MH-CIT-10003', name: 'Anand D. More', role: 'Farmer' },
    { id: 'MH-CIT-99999', name: 'Non-Existent Citizen', role: 'Test 404' }
  ];

  const purposePresets = [
    'SUBSIDY_VERIFICATION',
    'BENEFIT_AUDIT',
    'SCHEME_ENROLLMENT',
    'DISASTER_RELIEF_ASSESSMENT',
    'CROSS_DEPARTMENT_AUDIT'
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'SUCCESS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" /> SUCCESS
        </span>
      );
    }
    if (status === 'PARTIAL_SUCCESS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-400">
          <AlertTriangle className="w-4 h-4 text-amber-700" /> PARTIAL_SUCCESS
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-950 border border-rose-400">
        <XCircle className="w-4 h-4 text-rose-700" /> FAILED
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Engine Status */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Network className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Core Interoperability & Integration Engine
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Phase 4 Live
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                Federated cross-departmental orchestrator querying Revenue, Agriculture, and Welfare systems with zero data hoarding, SLA measurement, and outage resilience.
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 shrink-0 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">Target Departments</p>
              <p className="text-sm font-black text-amber-400">3 Sovereign Gateways</p>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">Max SLA SLA</p>
              <p className="text-sm font-black text-emerald-400">&lt; 200 ms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Config Panel + Right Results & Visual Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Request Configuration Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-600" /> Dispatch Request
              </h2>
              <span className="text-[11px] font-bold text-slate-500">POST /api/integration/request</span>
            </div>

            {/* 1. Citizen Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900">
                1. Target Citizen Synthetic ID <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                placeholder="e.g. MH-CIT-10001"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-950 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {syntheticCitizenPresets.map((cit) => (
                  <button
                    key={cit.id}
                    type="button"
                    onClick={() => setCitizenId(cit.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                      citizenId === cit.id 
                        ? 'bg-amber-100 text-amber-950 border-amber-400' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    }`}
                  >
                    {cit.id} ({cit.name})
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Target Departments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-900">
                  2. Select Target Departments <span className="text-rose-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const allSelected = Object.values(selectedDepts).every(v => v);
                    setSelectedDepts({
                      REVENUE: !allSelected,
                      AGRICULTURE: !allSelected,
                      WELFARE: !allSelected
                    });
                  }}
                  className="text-[11px] font-bold text-amber-700 hover:underline"
                >
                  Toggle All
                </button>
              </div>

              <div className="space-y-2">
                {/* Revenue Option */}
                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedDepts.REVENUE ? 'bg-amber-50/70 border-amber-400' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedDepts.REVENUE || false}
                      onChange={(e) => setSelectedDepts(prev => ({ ...prev, REVENUE: e.target.checked }))}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-slate-300"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-700" />
                        <span className="text-xs font-black text-slate-950">Revenue & Forest</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-950">REV</span>
                      </div>
                      <p className="text-[11px] text-slate-600">7/12 Land Records, Khata Numbers, Acreage</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    deptStatus.REV === 'ONLINE' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                  }`}>
                    {deptStatus.REV || 'ONLINE'}
                  </span>
                </label>

                {/* Agriculture Option */}
                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedDepts.AGRICULTURE ? 'bg-emerald-50/70 border-emerald-400' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedDepts.AGRICULTURE || false}
                      onChange={(e) => setSelectedDepts(prev => ({ ...prev, AGRICULTURE: e.target.checked }))}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-emerald-700" />
                        <span className="text-xs font-black text-slate-950">Agriculture Dept</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-950">AGR</span>
                      </div>
                      <p className="text-[11px] text-slate-600">Farmer Registration, Primary Crop, Land Usage</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    deptStatus.AGR === 'ONLINE' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                  }`}>
                    {deptStatus.AGR || 'ONLINE'}
                  </span>
                </label>

                {/* Welfare Option */}
                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedDepts.WELFARE ? 'bg-purple-50/70 border-purple-400' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedDepts.WELFARE || false}
                      onChange={(e) => setSelectedDepts(prev => ({ ...prev, WELFARE: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 border-slate-300"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4 text-purple-700" />
                        <span className="text-xs font-black text-slate-950">Social Welfare</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-200 text-purple-950">WEL</span>
                      </div>
                      <p className="text-[11px] text-slate-600">DBT Stipends, Scheme Eligibility, Beneficiary Status</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    deptStatus.WEL === 'ONLINE' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                  }`}>
                    {deptStatus.WEL || 'ONLINE'}
                  </span>
                </label>
              </div>
            </div>

            {/* 3. Request Purpose */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900">
                3. Purpose of Request <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. SUBSIDY_VERIFICATION"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-950 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {purposePresets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPurpose(p)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      purpose === p 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message & Consent Barrier */}
            {executionError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-xs space-y-2 shadow-xs">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black text-rose-950 text-sm">
                      {executionError.includes('consent') || executionError.includes('Consent') || executionError.includes('scope') || executionError.includes('Scope')
                        ? 'Privacy & Citizen Consent Gatekeeper Alert'
                        : 'Integration Request Failed'}
                    </div>
                    <p className="text-rose-900 mt-1 font-bold leading-relaxed">{executionError}</p>
                  </div>
                </div>

                {(executionError.includes('consent') || executionError.includes('Consent') || executionError.includes('scope') || executionError.includes('Scope')) && (
                  <div className="bg-white/80 p-2.5 rounded-lg border border-rose-200 text-[11px] text-slate-700 font-medium">
                    <span className="font-bold text-slate-900">Privacy Enforcement (Phase 6):</span> This query was rejected because the citizen has not authorized this specific department/purpose or the approved scope is insufficient. The citizen can manage active consents in the Citizen Portal (<code className="font-mono text-emerald-800 font-bold">/citizen/consents</code>).
                  </div>
                )}
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              onClick={handleExecuteIntegration}
              disabled={isExecuting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-slate-950 font-black text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Orchestrating Cross-Department Request...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-slate-950 fill-current" />
                  <span>Execute Integration Request</span>
                </>
              )}
            </button>
          </div>

          {/* Outage Simulation Quick-Bar */}
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Power className="w-3.5 h-3.5" /> Department Gateway Outage Controls
              </h3>
              <span className="text-[10px] text-slate-400">Live State Switch</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Toggle department gateways OFFLINE to test failover isolation & PARTIAL_SUCCESS behavior:
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {['REV', 'AGR', 'WEL'].map((dept) => {
                const isOnline = deptStatus[dept] === 'ONLINE';
                const isToggling = togglingDept === dept;
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleToggleDeptStatus(dept)}
                    disabled={isToggling}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isOnline 
                        ? 'bg-emerald-950/40 border-emerald-600/50 hover:bg-emerald-900/60 text-emerald-200' 
                        : 'bg-rose-950/40 border-rose-600/50 hover:bg-rose-900/60 text-rose-200'
                    }`}
                  >
                    <div className="text-xs font-black">{dept}</div>
                    <div className="text-[10px] font-bold mt-0.5 flex items-center justify-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      {isToggling ? 'Updating...' : (isOnline ? 'ONLINE' : 'OFFLINE')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Visual Architecture Flow & Live Execution Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Visual Architecture Flow Diagram */}
          <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" /> Visual Integration Pipeline Flow
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              {/* Flow Steps */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 text-center text-xs">
                
                {/* Step 1: MahaSetu Gateway */}
                <div className="p-3 rounded-xl bg-white border border-slate-300 shadow-xs flex-1">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 font-black text-xs mx-auto flex items-center justify-center mb-1">
                    1
                  </div>
                  <div className="font-black text-slate-950">MahaSetu Gateway</div>
                  <div className="text-[10px] text-slate-600">JWT & Citizen Check</div>
                </div>

                <div className="hidden md:flex text-slate-400 font-black">→</div>

                {/* Step 2: Crosswalk & Services */}
                <div className="p-3 rounded-xl bg-white border border-slate-300 shadow-xs flex-1">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 font-black text-xs mx-auto flex items-center justify-center mb-1">
                    2
                  </div>
                  <div className="font-black text-slate-950">Service Registry</div>
                  <div className="text-[10px] text-slate-600">ID Crosswalk & Routing</div>
                </div>

                <div className="hidden md:flex text-slate-400 font-black">→</div>

                {/* Step 3: Sovereign Nodes */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 shadow-xs flex-1">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-slate-950 font-black text-xs mx-auto flex items-center justify-center mb-1">
                    3
                  </div>
                  <div className="font-black text-amber-950">Parallel Dept Calls</div>
                  <div className="text-[10px] text-amber-800">REV • AGR • WEL</div>
                </div>

                <div className="hidden md:flex text-slate-400 font-black">→</div>

                {/* Step 4: Aggregation */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 shadow-xs flex-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs mx-auto flex items-center justify-center mb-1">
                    4
                  </div>
                  <div className="font-black text-emerald-950">Unified Response</div>
                  <div className="text-[10px] text-emerald-800">Audit Log Saved</div>
                </div>

              </div>
            </div>
          </div>

          {/* Current Response Viewer */}
          {currentResponse ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-sm space-y-5">
              
              {/* Header Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase text-slate-500">Request ID:</span>
                    <span className="text-sm font-mono font-black text-slate-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      {currentResponse.requestId}
                    </span>
                    {getStatusBadge(currentResponse.status)}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Citizen: <span className="font-black text-slate-900">{currentResponse.citizenId}</span> • Purpose: <span className="font-bold text-slate-800">{currentResponse.purpose}</span>
                  </p>
                </div>

                {currentResponse.totalLatencyMs && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-xs font-mono font-bold text-slate-800 self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Total: {currentResponse.totalLatencyMs} ms</span>
                  </div>
                )}
              </div>

              {/* Phase 5 Standardized Canonical Data Model Display */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>MahaSetu Standardized Canonical Data Model</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-300">
                      Phase 5 Unified
                    </span>
                  </h3>

                  {/* Active Sources Badges */}
                  {currentResponse.sources && currentResponse.sources.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-600">Active Sources:</span>
                      {currentResponse.sources.map((src: string, i: number) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-900 border border-indigo-300"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  
                  {/* Canonical Citizen Identity */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                    <div className="flex items-center justify-between text-slate-900">
                      <span className="text-xs font-black flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-600" /> Citizen Identity
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-900">
                        CANONICAL
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Master ID:</span>
                        <span className="font-mono font-black text-slate-900">{currentResponse.citizen?.id || currentResponse.citizenId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Full Name:</span>
                        <span className="font-black text-slate-900">{currentResponse.citizen?.name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Canonical Location */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                    <div className="flex items-center justify-between text-slate-900">
                      <span className="text-xs font-black flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Geographic Location
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900">
                        LOCATION
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">District:</span>
                        <span className="font-black text-slate-900">{currentResponse.location?.district || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Taluka / Village:</span>
                        <span className="font-black text-slate-900">
                          {currentResponse.location?.taluka || '—'} / {currentResponse.location?.village || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Canonical Land Records (Revenue) */}
                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-300 space-y-2">
                    <div className="flex items-center justify-between text-amber-950">
                      <span className="text-xs font-black flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-700" /> Land Record
                      </span>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                        {currentResponse.land?.source || 'REVENUE'}
                      </span>
                    </div>
                    {currentResponse.land ? (
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-bold">Survey / Gat No:</span>
                          <span className="font-mono font-black text-slate-900">{currentResponse.land.surveyNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-bold">Parcel Area:</span>
                          <span className="font-black text-slate-900">{currentResponse.land.areaAcres ? `${currentResponse.land.areaAcres} Acres` : 'N/A'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-rose-700 italic">Revenue data unavailable or offline</p>
                    )}
                  </div>

                  {/* Canonical Agriculture (Agriculture) */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-300 space-y-2">
                    <div className="flex items-center justify-between text-emerald-950">
                      <span className="text-xs font-black flex items-center gap-1.5">
                        <Sprout className="w-3.5 h-3.5 text-emerald-700" /> Agriculture & Crop
                      </span>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900">
                        {currentResponse.agriculture?.source || 'AGRICULTURE'}
                      </span>
                    </div>
                    {currentResponse.agriculture ? (
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-bold">Primary Crop:</span>
                          <span className="font-black text-slate-900">{currentResponse.agriculture.crop || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-bold">Season / Usage:</span>
                          <span className="font-black text-slate-900">
                            {currentResponse.agriculture.season || '—'} • {currentResponse.agriculture.landUsage || '—'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-rose-700 italic">Agriculture data unavailable or offline</p>
                    )}
                  </div>

                  {/* Canonical Welfare Profile (Welfare) */}
                  <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-300 space-y-2 md:col-span-2 lg:col-span-2">
                    <div className="flex items-center justify-between text-sky-950">
                      <span className="text-xs font-black flex items-center gap-1.5">
                        <HeartHandshake className="w-3.5 h-3.5 text-sky-700" /> Social Welfare & DBT Entitlement
                      </span>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-sky-200 text-sky-900">
                        {currentResponse.welfare?.source || 'WELFARE'}
                      </span>
                    </div>
                    {currentResponse.welfare ? (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-600 font-bold block text-[11px]">Scheme:</span>
                          <span className="font-black text-slate-900 truncate block">
                            {currentResponse.welfare.schemeName || currentResponse.welfare.schemeCode || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600 font-bold block text-[11px]">Monthly Benefit:</span>
                          <span className="font-mono font-black text-emerald-800">
                            {currentResponse.welfare.benefitAmount != null ? `₹${currentResponse.welfare.benefitAmount.toLocaleString('en-IN')}` : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600 font-bold block text-[11px]">Status:</span>
                          <span className="font-black text-slate-900">
                            {currentResponse.welfare.applicationStatus || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600 font-bold block text-[11px]">Previous Aid:</span>
                          <span className="font-black text-slate-900">
                            {currentResponse.welfare.previousBenefit ? 'YES (Active Beneficiary)' : 'NO'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-rose-700 italic">Welfare data unavailable or offline</p>
                    )}
                  </div>

                </div>
              </div>

              {/* Department Response Cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Department Node Execution Telemetry ({currentResponse.departmentResponses?.length || 0})
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {currentResponse.departmentResponses?.map((deptItem: DepartmentResponseItem, idx: number) => {
                    const isSuccess = deptItem.status === 'SUCCESS';
                    return (
                      <div 
                        key={idx}
                        className={`p-4 rounded-xl border transition-all ${
                          isSuccess 
                            ? 'bg-emerald-50/50 border-emerald-300' 
                            : 'bg-rose-50/60 border-rose-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-lg ${
                              isSuccess ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
                            }`}>
                              {deptItem.department === 'REVENUE' && <FileText className="w-4 h-4" />}
                              {deptItem.department === 'AGRICULTURE' && <Sprout className="w-4 h-4" />}
                              {deptItem.department === 'WELFARE' && <HeartHandshake className="w-4 h-4" />}
                              {!['REVENUE', 'AGRICULTURE', 'WELFARE'].includes(deptItem.department) && <Building2 className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-950">{deptItem.department}</span>
                                {isSuccess ? (
                                  <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-emerald-200 text-emerald-950">
                                    SUCCESS
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-rose-200 text-rose-950">
                                    FAILED
                                  </span>
                                )}
                              </div>
                              {deptItem.serviceEndpoint && (
                                <p className="text-[11px] font-mono text-slate-600 mt-0.5">{deptItem.serviceEndpoint}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-mono font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-xs">
                              {deptItem.responseTimeMs} ms
                            </span>
                          </div>
                        </div>

                        {/* Error info if failed */}
                        {!isSuccess && (
                          <div className="mt-3 p-2.5 rounded-lg bg-white/80 border border-rose-200 text-rose-900 text-xs font-medium space-y-0.5">
                            <div className="font-bold flex items-center gap-1.5 text-rose-950">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                              <span>Error Code: {deptItem.errorCode || 'UNKNOWN_ERROR'}</span>
                            </div>
                            <p className="text-[11px] text-rose-800 pl-5">{deptItem.errorMessage || 'No specific error message provided.'}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Raw JSON Payload Accordion */}
              <details className="text-xs border border-slate-200 rounded-xl bg-slate-50 p-3">
                <summary className="font-bold text-slate-700 cursor-pointer hover:text-slate-950">
                  View Unified JSON Response Payload
                </summary>
                <pre className="mt-3 p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(currentResponse, null, 2)}
                </pre>
              </details>

            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 border border-slate-300 shadow-sm text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center border border-amber-300">
                <Network className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-950">Ready to Orchestrate Federated Request</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Configure your target synthetic citizen ID, check required departments, and click <strong>Execute Integration Request</strong> to inspect live multi-system responses.
              </p>
            </div>
          )}

          {/* Recent History Table */}
          <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" /> Recent Integration Audit History ({history.length})
              </h3>
              <button
                type="button"
                onClick={fetchHistory}
                className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Refresh Logs
              </button>
            </div>

            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 uppercase text-[10px] font-black">
                      <th className="py-2.5 px-3">Request ID</th>
                      <th className="py-2.5 px-3">Citizen</th>
                      <th className="py-2.5 px-3">Purpose</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Departments</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                    {history.slice(0, 5).map((req) => (
                      <tr key={req.requestId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-950">{req.requestId}</td>
                        <td className="py-2.5 px-3 font-bold">{req.citizenId}</td>
                        <td className="py-2.5 px-3 text-slate-700">{req.purpose}</td>
                        <td className="py-2.5 px-3">{getStatusBadge(req.status)}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {req.departmentResponses?.map((d, i) => (
                              <span 
                                key={i}
                                className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                                  d.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-950' : 'bg-rose-100 text-rose-950'
                                }`}
                              >
                                {d.department.slice(0, 3)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentResponse(req);
                              setCitizenId(req.citizenId);
                              if (req.purpose) setPurpose(req.purpose);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-950 text-[11px] font-bold border border-slate-300"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">No prior integration requests found in audit ledger.</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
