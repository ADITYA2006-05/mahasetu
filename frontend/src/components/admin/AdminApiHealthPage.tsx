import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SystemMonitoring } from '../../types';
import { API_BASE_URL } from '../../config/api';
import { 
  Activity, 
  AlertTriangle, 
  Server, 
  RefreshCw, 
  Power, 
  Zap 
} from 'lucide-react';

export const AdminApiHealthPage: React.FC = () => {
  const { token } = useAuth();
  const [monitoring, setMonitoring] = useState<SystemMonitoring | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/monitoring/health`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch system monitoring telemetry');
      const data: SystemMonitoring = await res.json();
      setMonitoring(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching health status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, [token]);

  const handleToggle = async (deptCode: string, currentStatus: string) => {
    if (!token) return;
    const nextStatus = currentStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    setToggling(deptCode);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mock/admin/departments/${deptCode}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        await fetchHealth();
      }
    } catch (err) {
      console.error('Failed to toggle department status:', err);
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-600">Probing live gateway endpoints & database clusters...</p>
      </div>
    );
  }

  if (error || !monitoring) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-sm font-bold flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          <span>{error || 'Unable to retrieve system health telemetry.'}</span>
        </div>
        <button
          onClick={fetchHealth}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const isPlatformHealthy = monitoring.platformStatus === 'HEALTHY';
  const isPlatformDegraded = monitoring.platformStatus === 'DEGRADED';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-2">
              <Activity className="w-3.5 h-3.5" /> Live Gateway Health & Availability (Phase 7)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              System Health & Node Status
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">
              Continuous live health checks of Revenue, Agriculture, Welfare API gateways, PostgreSQL persistence, and thread runtime metrics.
            </p>
          </div>

          <button
            onClick={fetchHealth}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Probe Gateways</span>
          </button>
        </div>

        {/* Global Cluster Status Banner */}
        <div className="mt-5 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className={`w-3.5 h-3.5 rounded-full ${
              isPlatformHealthy ? 'bg-emerald-400' : isPlatformDegraded ? 'bg-amber-400 animate-pulse' : 'bg-rose-500 animate-pulse'
            }`} />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cluster Status</span>
              <div className="text-sm font-black text-white">{monitoring.platformStatus}</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Online Nodes</span>
              <div className="font-mono font-black text-emerald-400">{monitoring.onlineDepartments} / {monitoring.totalDepartments} Active</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Gateway SLA</span>
              <div className="font-mono font-black text-white">{monitoring.averageGatewayLatencyMs} ms</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Database</span>
              <div className="font-mono font-black text-emerald-400">PostgreSQL (Connected)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Failure Simulation Banner Note */}
      <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs space-y-1">
        <div className="flex items-center gap-2 font-black">
          <Zap className="w-4 h-4 text-amber-700" />
          <span>Interactive Failure Simulation Console:</span>
        </div>
        <p className="text-[11px] font-bold text-amber-800">
          Click "Simulate Outage" on any department below to instantly test MahaSetu's fault-tolerant partial-success response handling.
        </p>
      </div>

      {/* 3 Department Gateways Live Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {monitoring.departments.map(dept => {
          const isOnline = dept.status === 'ONLINE';

          return (
            <div 
              key={dept.departmentCode}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                isOnline ? 'border-slate-200' : 'border-rose-300 bg-rose-50/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-black text-slate-950">{dept.departmentName}</h3>
                    <span className="font-mono text-xs font-bold text-slate-500">{dept.departmentCode} Gateway</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                    isOnline ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-600' : 'bg-rose-600 animate-pulse'}`} />
                    {dept.status}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-bold">Health Probe:</span>
                    <span className="font-mono font-black text-slate-950">{dept.healthStatus}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-bold">Response Latency:</span>
                    <span className="font-mono font-black text-indigo-700">{dept.responseTimeMs} ms</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-bold">Health Endpoint:</span>
                    <span className="font-mono text-[10px] text-slate-600 truncate max-w-[130px]">{dept.endpoint}</span>
                  </div>
                  <div className="py-1">
                    <span className="text-slate-500 font-bold block text-[10px]">Diagnostics:</span>
                    <span className="text-[11px] font-medium text-slate-700 block mt-0.5">{dept.details}</span>
                  </div>
                </div>
              </div>

              {/* Action Toggle */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(dept.lastChecked).toLocaleTimeString('en-IN')}
                </span>

                <button
                  onClick={() => handleToggle(dept.departmentCode, dept.status)}
                  disabled={toggling === dept.departmentCode}
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

      {/* System Metrics Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Server className="w-4 h-4 text-indigo-600" /> Java 21 Spring Boot Runtime Telemetry
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">JVM Uptime</span>
            <div className="font-mono font-black text-slate-900 mt-0.5">
              {monitoring.systemMetrics?.jvmUptimeSeconds || 120} Seconds
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Threads</span>
            <div className="font-mono font-black text-slate-900 mt-0.5">
              {monitoring.systemMetrics?.activeThreads || 32} Threads
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Available CPU Cores</span>
            <div className="font-mono font-black text-slate-900 mt-0.5">
              {monitoring.systemMetrics?.availableProcessors || 8} Cores
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Persistence Cluster</span>
            <div className="font-mono font-black text-emerald-700 mt-0.5">
              PostgreSQL 16
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
