import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { OfficerStats } from '../../types';
import { API_BASE_URL } from '../../config/api';
import { 
  FileCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  RefreshCw, 
  ArrowRight
} from 'lucide-react';

interface OfficerDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const OfficerDashboardPage: React.FC<OfficerDashboardPageProps> = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<OfficerStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOfficerStats = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/officer/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch officer dashboard statistics');
      const data: OfficerStats = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error loading officer telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerStats();
  }, [token]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-600">Retrieving officer gateway operations...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-sm font-bold flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          <span>{error || 'Unable to retrieve officer data.'}</span>
        </div>
        <button
          onClick={fetchOfficerStats}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const successRate = stats.totalRequests > 0 
    ? Math.round(((stats.successfulRequests + stats.partialRequests) / stats.totalRequests) * 100) 
    : 100;

  return (
    <div className="space-y-6">
      {/* Officer Welcome Header */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-2xl p-6 text-slate-950 border border-amber-400 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-950 text-amber-300 border border-slate-800 mb-2">
              <Building2 className="w-3.5 h-3.5" /> Department Officer Desk ({user?.departmentCode || 'REV'})
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Cross-Department Verification Operations
            </h1>
            <p className="text-slate-950 text-sm mt-1 max-w-2xl font-bold">
              Execute privacy-gated data queries across Revenue, Agriculture, and Social Welfare nodes with zero-paperwork canonical transformation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/officer/citizen-verification')}
              className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs flex items-center gap-2 shadow-lg shadow-slate-950/30 transition-all cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Verify Citizen Record</span>
            </button>
            <button
              onClick={fetchOfficerStats}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-slate-950 font-black text-xs border border-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Department Gateways Status Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-amber-600/70 text-xs">
          {Object.entries(stats.departmentStatuses).map(([code, status]) => {
            const isOnline = status === 'ONLINE';
            const deptName = code === 'REV' ? 'Revenue & Forest' : code === 'AGR' ? 'Agriculture' : 'Social Welfare';

            return (
              <div 
                key={code} 
                className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-amber-300 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-600">{deptName} ({code})</span>
                  <div className="text-xs font-black text-slate-950 flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                    {status}
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                  isOnline ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}>
                  {isOnline ? 'ACTIVE' : 'OUTAGE'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Queries</span>
          <div className="text-2xl font-black text-slate-950 mt-1">{stats.totalRequests}</div>
          <span className="text-[11px] text-slate-500 font-bold mt-1 block">Federated integrations</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Successful Queries</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{stats.successfulRequests}</div>
          <span className="text-[11px] text-emerald-700 font-bold mt-1 block">{successRate}% Success SLA</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Partial Failovers</span>
          <div className="text-2xl font-black text-amber-700 mt-1">{stats.partialRequests}</div>
          <span className="text-[11px] text-amber-700 font-bold mt-1 block">Graceful degradation</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Gateway Latency</span>
          <div className="text-2xl font-black text-indigo-700 mt-1">{stats.averageResponseTimeMs} ms</div>
          <span className="text-[11px] text-slate-500 font-bold mt-1 block">High performance SLA</span>
        </div>
      </div>

      {/* Recent Integration Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-950">Recent Cross-Department Queries</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Audit log of recent data access transactions executed by department officers.</p>
          </div>
          <button
            onClick={() => onNavigate('/officer/integration')}
            className="text-xs font-black text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
          >
            Integration Console <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats.recentRequests.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 font-bold">
            No integration requests recorded yet. Run a verification query above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Citizen Target</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Departments</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                {stats.recentRequests.map((req, idx) => {
                  const isSuccess = req.status === 'SUCCESS';
                  const isPartial = req.status === 'PARTIAL_SUCCESS';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-indigo-900 font-black">
                        {req.requestId}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-slate-950">
                        {req.citizenId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-black border border-slate-200">
                          {req.purpose}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {req.departmentResponses?.map((d, i) => (
                            <span 
                              key={i}
                              className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                                d.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                              }`}
                            >
                              {d.department}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                          isSuccess 
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                            : isPartial 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}>
                          {isSuccess ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" /> : <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />}
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {req.createdAt ? new Date(req.createdAt).toLocaleString('en-IN') : 'Just now'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
