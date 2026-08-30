import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DepartmentStat } from '../../types';
import { API_BASE_URL } from '../../config/api';
import { 
  Building2, 
  FileText, 
  Sprout, 
  HeartHandshake, 
  AlertTriangle, 
  RefreshCw, 
  Power 
} from 'lucide-react';

export const AdminDepartmentsPage: React.FC = () => {
  const { token } = useAuth();
  const [departments, setDepartments] = useState<DepartmentStat[]>([]);
  const [statuses, setStatuses] = useState<{ [key: string]: string }>({
    REV: 'ONLINE',
    AGR: 'ONLINE',
    WEL: 'ONLINE'
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartmentsData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [deptRes, statusRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/departments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/mock/admin/departments/status`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(data);
      }
      if (statusRes.ok) {
        const data = await statusRes.json();
        const map: { [key: string]: string } = {};
        Object.keys(data).forEach(k => {
          map[k] = data[k].status;
        });
        setStatuses(map);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching department records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsData();
  }, [token]);

  const handleToggleStatus = async (deptCode: string) => {
    if (!token) return;
    const current = statuses[deptCode] || 'ONLINE';
    const nextStatus = current === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    setToggling(deptCode);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mock/admin/departments/${deptCode}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setStatuses(prev => ({ ...prev, [deptCode]: nextStatus }));
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 mb-2">
              <Building2 className="w-3.5 h-3.5" /> Department Nodes Management (Phase 7)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              State Department Gateways
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">
              Oversee the 3 core state department nodes, nodal officer details, data holdings, and simulate live failovers.
            </p>
          </div>

          <button
            onClick={fetchDepartmentsData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Nodes</span>
          </button>
        </div>
      </div>

      {/* Departments Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">Loading department status...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departments.map(dept => {
            const currentStatus = statuses[dept.code] || 'ONLINE';
            const isOnline = currentStatus === 'ONLINE';

            return (
              <div 
                key={dept.code}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${
                        dept.code === 'REV' 
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                          : dept.code === 'AGR'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                      }`}>
                        {dept.code === 'REV' ? <FileText className="w-5 h-5" /> : dept.code === 'AGR' ? <Sprout className="w-5 h-5" /> : <HeartHandshake className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-950">{dept.name}</h3>
                        <span className="font-mono text-xs font-bold text-slate-500">{dept.code} Node</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                      isOnline ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-600' : 'bg-rose-600 animate-pulse'}`} />
                      {currentStatus}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-bold">Nodal Officer:</span>
                      <span className="font-black text-slate-950">{dept.nodalOfficer}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-bold">Managed Holding:</span>
                      <span className="font-black text-slate-950">{dept.metricValue}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-bold">Registered Services:</span>
                      <span className="font-mono font-black text-slate-950">{dept.servicesCount} Microservices</span>
                    </div>
                  </div>
                </div>

                {/* Simulation Control Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Live Outage Simulation:</span>
                  <button
                    onClick={() => handleToggleStatus(dept.code)}
                    disabled={toggling === dept.code}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isOnline 
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200' 
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isOnline ? 'Simulate Outage' : 'Restore Online'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
