import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuditLogItem } from '../types';
import { API_BASE_URL } from '../config/api';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Lock
} from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const { token } = useAuth();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [citizenFilter, setCitizenFilter] = useState<string>('');
  const [requestFilter, setRequestFilter] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Inspector Drawer State
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (citizenFilter.trim()) params.append('citizenId', citizenFilter.trim());
      if (requestFilter.trim()) params.append('requestId', requestFilter.trim());
      if (deptFilter !== 'ALL') params.append('department', deptFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const url = `${API_BASE_URL}/api/audit-logs${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch audit log telemetry');
      const data: AuditLogItem[] = await res.json();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Error loading audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token, deptFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleClearFilters = () => {
    setCitizenFilter('');
    setRequestFilter('');
    setDeptFilter('ALL');
    setStatusFilter('ALL');
  };

  // KPI Calculations
  const totalEvents = logs.length;
  const successEvents = logs.filter(l => l.status === 'SUCCESS' || l.status === 'PARTIAL_SUCCESS').length;
  const blockedEvents = logs.filter(l => l.status.includes('REJECTED')).length;
  const avgLatency = totalEvents > 0 
    ? Math.round(logs.reduce((acc, curr) => acc + (curr.responseTimeMs || 0), 0) / totalEvents) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 mb-3">
              <FileText className="w-3.5 h-3.5" /> State-wide Immutable Audit Trail (Phase 6)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Platform Audit & Privacy Oversight
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">
              Real-time, immutable audit record of all cross-department integration requests, citizen consent evaluations, and access attempts across Maharashtra state nodes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-950/40 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Logs</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Access Events</span>
            <div className="text-2xl font-black text-white mt-0.5">{totalEvents}</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Successful Queries</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{successEvents}</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Blocked / Violations</span>
            <div className="text-2xl font-black text-rose-400 mt-0.5">{blockedEvents}</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Gateway Latency</span>
            <div className="text-2xl font-black text-sky-400 mt-0.5">{avgLatency} ms</div>
          </div>
        </div>
      </div>

      {/* Multi-criteria Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          {/* Citizen Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={citizenFilter}
              onChange={e => setCitizenFilter(e.target.value)}
              placeholder="Filter by Citizen ID (e.g. MH-CIT-10001)"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 uppercase"
            />
          </div>

          {/* Request ID Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={requestFilter}
              onChange={e => setRequestFilter(e.target.value)}
              placeholder="Filter by Request ID (e.g. REQ-4B5DB3F0)"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 uppercase"
            />
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Departments</option>
            <option value="AGRICULTURE">Department of Agriculture (AGR)</option>
            <option value="REVENUE">Revenue & Forest (REV)</option>
            <option value="WELFARE">Social Welfare (WEL)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="PARTIAL_SUCCESS">PARTIAL_SUCCESS</option>
            <option value="CONSENT_REJECTED">CONSENT_REJECTED</option>
            <option value="SCOPE_REJECTED">SCOPE_REJECTED</option>
            <option value="FAILED">FAILED</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-colors cursor-pointer"
          >
            Search
          </button>

          {(citizenFilter || requestFilter || deptFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">Querying immutable state audit records...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-900">No Audit Records Found</h3>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto font-medium">
            No audit records match the current filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp (IST)</th>
                  <th className="py-3 px-4">Audit / Request ID</th>
                  <th className="py-3 px-4">Citizen ID</th>
                  <th className="py-3 px-4">User / Dept</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Data Scopes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                {logs.map(log => {
                  const isSuccess = log.status === 'SUCCESS' || log.status === 'PARTIAL_SUCCESS';
                  const isRejected = log.status.includes('REJECTED');

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="text-indigo-900 font-black text-[11px]">{log.auditId}</div>
                        <div className="text-[10px] text-slate-400">{log.requestId}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-900 font-black">
                        {log.citizenId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-900 font-black">{log.requestingUser}</div>
                        <div className="text-[10px] text-slate-500">{log.requestingDepartment || 'GATEWAY'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-black border border-slate-200">
                          {log.purpose}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[10px] text-slate-600 max-w-[150px] truncate">
                        {log.dataScope}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                          isSuccess 
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                            : isRejected 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}>
                          {isSuccess ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" /> : <Lock className="w-2.5 h-2.5 text-amber-700" />}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {log.responseTimeMs} ms
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-black text-[11px] border border-indigo-200 transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Inspector Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-300 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-900 border border-indigo-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">Audit Record Inspector</h3>
                  <p className="text-xs font-mono text-slate-500">{selectedLog.auditId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Request ID</span>
                  <div className="font-mono font-black text-slate-900">{selectedLog.requestId}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Citizen Target</span>
                  <div className="font-mono font-black text-slate-900">{selectedLog.citizenId}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Requesting Officer</span>
                  <div className="font-black text-slate-900">{selectedLog.requestingUser}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Timestamp</span>
                  <div className="font-mono text-slate-900">{new Date(selectedLog.timestamp).toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="bg-slate-900 text-emerald-400 rounded-xl p-4 font-mono text-[11px] overflow-x-auto max-h-60 border border-slate-800">
                <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
