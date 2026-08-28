import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ServiceHealthItem } from '../../types';
import { 
  Cpu, 
  Search, 
  RefreshCw, 
  AlertTriangle 
} from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const { token } = useAuth();
  const [services, setServices] = useState<ServiceHealthItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  const fetchServices = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8080/api/services', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to load state service registry');
      const data: ServiceHealthItem[] = await res.json();
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  const filtered = services.filter(s => {
    const matchesSearch = s.serviceName.toLowerCase().includes(search.toLowerCase()) || 
                          s.endpoint.toLowerCase().includes(search.toLowerCase()) ||
                          s.serviceCode.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || s.departmentCode === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 mb-2">
              <Cpu className="w-3.5 h-3.5" /> State Microservice Registry (Phase 7)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Registered Microservices & Endpoints
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">
              Live status, schema versions, HTTP methods, and response SLAs across all integrated Maharashtra state department services.
            </p>
          </div>

          <button
            onClick={fetchServices}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Services</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search service name, code, or endpoint path..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Departments</option>
          <option value="REV">Revenue & Forest (REV)</option>
          <option value="AGR">Agriculture (AGR)</option>
          <option value="WEL">Social Welfare (WEL)</option>
        </select>
      </div>

      {/* Services Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">Retrieving service registry status...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <Cpu className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-900">No Services Found</h3>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto font-medium">
            No microservices matched your search criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Service Name / Code</th>
                  <th className="py-3 px-4">Endpoint Path</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Schema</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4 text-right">Last Checked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                {filtered.map(s => {
                  const isOnline = s.status === 'ONLINE' || s.status === 'ACTIVE';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-mono text-[10px] font-black border border-slate-200">
                          {s.departmentCode}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-950 font-black">{s.serviceName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{s.serviceCode}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-900 font-bold text-[11px]">
                        {s.endpoint}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-black border border-slate-200">
                          {s.httpMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-600">
                        {s.schemaVersion}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                          isOnline ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-600' : 'bg-rose-600 animate-pulse'}`} />
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        {s.responseTimeMs} ms
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400 text-[10px] whitespace-nowrap">
                        {new Date(s.lastChecked).toLocaleTimeString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
