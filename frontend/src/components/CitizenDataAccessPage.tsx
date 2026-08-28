import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CitizenDataAccessItem } from '../types';
import { 
  Eye, 
  ShieldCheck, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Lock,
  Info
} from 'lucide-react';

export const CitizenDataAccessPage: React.FC = () => {
  const { token, user } = useAuth();
  const [logs, setLogs] = useState<CitizenDataAccessItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccessLogs = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8080/api/citizen/data-access', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch data access history');
      const data: CitizenDataAccessItem[] = await res.json();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Error loading access logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessLogs();
  }, [token]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-sky-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-500/40 mb-3">
              <Eye className="w-3.5 h-3.5" /> Full Transparency & Data Access Audit (Phase 6)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Personal Data Access Log
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">
              Every time a government official or departmental gateway queries your synthetic identity or departmental records, an immutable log entry is generated here for your transparency.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAccessLogs}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-black flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>
        </div>

        {/* Security & Ownership Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Access Events</span>
            <div className="text-2xl font-black text-sky-400 mt-0.5">{logs.length}</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Citizen Master ID</span>
            <div className="text-sm font-mono font-black text-amber-300 mt-1">{user?.citizenId || 'MH-CIT-10001'}</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Tamper Resistance</span>
            <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Immutable PostgreSQL Log
            </div>
          </div>
        </div>
      </div>

      {/* Access Log Timeline */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">Retrieving personal access history...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-900">No Data Access Records</h3>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto font-medium">
            No government departments have accessed your records recently. When an integration query executes with your active consent, audit events will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((item, idx) => {
            const isSuccess = item.status === 'SUCCESS' || item.status === 'PARTIAL_SUCCESS';
            const isRejected = item.status.includes('REJECTED');

            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSuccess 
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                        : isRejected 
                          ? 'bg-amber-100 text-amber-900 border-amber-300' 
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}>
                      {isSuccess ? <CheckCircle2 className="w-5 h-5 text-emerald-700" /> : <Lock className="w-5 h-5 text-amber-700" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-950">
                          {item.department}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isSuccess 
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                            : isRejected 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-sky-700" />
                        Purpose: <strong className="text-slate-900 font-black">{item.purpose}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-start sm:items-end justify-between text-xs text-slate-500 font-mono">
                    <span className="font-bold text-slate-700">{new Date(item.timestamp).toLocaleString('en-IN')}</span>
                    <span className="text-[11px] text-slate-400">{item.requestId}</span>
                  </div>
                </div>

                {/* Scopes Accessed */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500">Data Scopes:</span>
                    {item.dataAccessed?.split(',').map((sc, i) => (
                      <span 
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-800 border border-slate-200"
                      >
                        {sc.trim()}
                      </span>
                    ))}
                  </div>

                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Citizen Consent Verified
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
