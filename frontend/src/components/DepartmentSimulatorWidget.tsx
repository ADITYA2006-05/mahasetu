import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Power, RefreshCw, Play, Landmark, Sprout, HeartHandshake } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface DeptStatus {
  departmentCode: string;
  departmentName: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  message: string;
  updatedAt: string;
}

export const DepartmentSimulatorWidget: React.FC = () => {
  const { token, user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const [statuses, setStatuses] = useState<Record<string, DeptStatus>>({
    REV: { departmentCode: 'REV', departmentName: 'Revenue & Forest Department', status: 'ONLINE', message: 'Online', updatedAt: '' },
    AGR: { departmentCode: 'AGR', departmentName: 'Department of Agriculture', status: 'ONLINE', message: 'Online', updatedAt: '' },
    WEL: { departmentCode: 'WEL', departmentName: 'Social Justice & Welfare Department', status: 'ONLINE', message: 'Online', updatedAt: '' },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testedDept, setTestedDept] = useState<string | null>(null);
  const [testHttpCode, setTestHttpCode] = useState<number | null>(null);

  const fetchStatuses = async () => {
    if (!token || !isAdmin) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/mock/admin/departments/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStatuses(data);
      }
    } catch (e) {
      console.error('Failed to fetch gateway statuses:', e);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStatuses();
    }
  }, [isAdmin, token]);

  const toggleStatus = async (deptCode: string) => {
    if (!token || !isAdmin) return;
    const current = statuses[deptCode]?.status || 'ONLINE';
    const nextStatus = current === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/mock/admin/departments/${deptCode}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        const updated: DeptStatus = await res.json();
        setStatuses(prev => ({ ...prev, [deptCode]: updated }));
      }
    } catch (e) {
      console.error(`Failed to update ${deptCode} status:`, e);
    } finally {
      setLoading(false);
    }
  };

  const testQuery = async (deptCode: string) => {
    setTestedDept(deptCode);
    setTestResult(null);
    setTestHttpCode(null);

    let url = '';
    if (deptCode === 'REV') url = `${API_BASE_URL}/api/mock/revenue/citizens/MH-CIT-10001`;
    else if (deptCode === 'AGR') url = `${API_BASE_URL}/api/mock/agriculture/farmers/MH-CIT-10001`;
    else if (deptCode === 'WEL') url = `${API_BASE_URL}/api/mock/welfare/beneficiaries/MH-CIT-10001`;

    try {
      const res = await fetch(url);
      setTestHttpCode(res.status);
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestHttpCode(500);
      setTestResult({ error: e.message });
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-white border border-slate-300 rounded-xl p-5 sm:p-6 shadow-sm transition-colors">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-950 flex items-center gap-1.5">
              <Power className="w-4 h-4 text-amber-700" />
              Department Gateway Status Simulator
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-200 text-slate-950 border border-rose-400">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-800 mt-0.5 font-bold">
            Simulate live department outages to verify error handling and 503 fallback responses.
          </p>
        </div>

        <button
          onClick={fetchStatuses}
          disabled={loading}
          className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black border border-slate-300 flex items-center gap-1 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Status</span>
        </button>
      </div>

      {/* 3 Department Simulator Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        
        {/* Revenue, Agri, Welfare Nodes */}
        {['REV', 'AGR', 'WEL'].map((code) => {
          const st = statuses[code] || { status: 'ONLINE', departmentName: code };
          const isOnline = st.status === 'ONLINE';
          const deptName = code === 'REV' ? 'Revenue (7/12)' : code === 'AGR' ? 'Agriculture' : 'Social Welfare';
          const Icon = code === 'REV' ? Landmark : code === 'AGR' ? Sprout : HeartHandshake;

          return (
            <div
              key={code}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isOnline
                  ? 'bg-slate-50 border-slate-300'
                  : 'bg-rose-100 border-rose-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isOnline ? 'text-amber-700' : 'text-rose-700'}`} />
                    <span className="font-black text-sm text-slate-950">{deptName}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                    isOnline
                      ? 'bg-emerald-200 text-slate-950 border-emerald-400'
                      : 'bg-rose-200 text-slate-950 border-rose-400'
                  }`}>
                    {st.status}
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed mb-3 font-bold">
                  {isOnline ? 'Gateway responding normally (200 OK).' : 'Gateway is offline (503 Service Unavailable).'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-300 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleStatus(code)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors border shadow-sm ${
                    isOnline
                      ? 'bg-rose-200 hover:bg-rose-300 text-slate-950 border-rose-400'
                      : 'bg-emerald-200 hover:bg-emerald-300 text-slate-950 border-emerald-400'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{isOnline ? 'Turn Offline' : 'Turn Online'}</span>
                </button>

                <button
                  onClick={() => testQuery(code)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black border border-slate-300 flex items-center gap-1"
                  title="Query Mock API"
                >
                  <Play className="w-3 h-3 text-sky-700" />
                  <span>Test API</span>
                </button>
              </div>
            </div>
          );
        })}

      </div>

      {/* Live Test Response Console */}
      {testedDept && (
        <div className="mt-5 p-4 rounded-xl bg-slate-100 border border-slate-300 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-300 text-slate-950 font-black">
            <span>MOCK API QUERY RESULT ({testedDept}):</span>
            <span className={testHttpCode === 200 ? 'text-emerald-900 font-black' : 'text-rose-900 font-black'}>
              {testHttpCode === 200 ? 'HTTP 200 OK' : `HTTP ${testHttpCode} SERVICE UNAVAILABLE`}
            </span>
          </div>
          <pre className="text-slate-950 text-[11px] leading-relaxed overflow-x-auto font-mono font-bold">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
};
