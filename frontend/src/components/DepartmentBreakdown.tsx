import React from 'react';
import { DepartmentStat, LandStats, AgricultureStats, WelfareStats } from '../types';
import { Landmark, Sprout, HeartHandshake, FileText, CheckCircle2, Layers } from 'lucide-react';

interface DepartmentBreakdownProps {
  departments: DepartmentStat[];
  landStats: LandStats | null;
  agricultureStats: AgricultureStats | null;
  welfareStats: WelfareStats | null;
  onSelectDepartment: (deptCode: string) => void;
}

export const DepartmentBreakdown: React.FC<DepartmentBreakdownProps> = ({
  departments,
  landStats,
  agricultureStats,
  welfareStats,
  onSelectDepartment,
}) => {
  const getDeptIcon = (code: string) => {
    switch (code) {
      case 'REV':
        return <Landmark className="w-5 h-5 text-amber-700" />;
      case 'AGR':
        return <Sprout className="w-5 h-5 text-emerald-700" />;
      case 'WEL':
        return <HeartHandshake className="w-5 h-5 text-purple-700" />;
      default:
        return <Layers className="w-5 h-5 text-slate-800" />;
    }
  };

  const getDeptBadgeColor = (code: string) => {
    switch (code) {
      case 'REV':
        return 'bg-amber-200 text-slate-950 border-amber-400';
      case 'AGR':
        return 'bg-emerald-200 text-slate-950 border-emerald-400';
      case 'WEL':
        return 'bg-purple-200 text-slate-950 border-purple-400';
      default:
        return 'bg-slate-200 text-slate-950 border-slate-300';
    }
  };

  return (
    <div className="mt-8">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
          <span>Sovereign Department Nodes</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 border border-slate-300 text-slate-950 font-bold">
            3 Connected Nodes
          </span>
        </h2>
        <p className="text-xs text-slate-800 mt-0.5 font-bold">
          Real-time federated data synchronization across Maharashtra state departments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {departments.map((dept) => (
          <div
            key={dept.code}
            className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-300">
                    {getDeptIcon(dept.code)}
                  </div>
                  <div>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${getDeptBadgeColor(dept.code)}`}>
                      {dept.code} NODE
                    </span>
                    <h4 className="text-sm font-black text-slate-950 mt-0.5">
                      {dept.name}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Nodal Officer & Stats */}
              <div className="mt-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-bold">Nodal Officer:</span>
                  <span className="font-black text-slate-950 truncate ml-2 max-w-[170px]">
                    {dept.nodalOfficer}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-bold">Active Records:</span>
                  <span className="font-black text-slate-950">
                    {dept.recordsCount} Active
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-bold">Published APIs:</span>
                  <span className="font-black text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{dept.servicesCount} Services (SLA &lt;3s)</span>
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-300 text-xs mt-2">
                  <span className="text-[10px] uppercase font-black text-slate-700 block">
                    {dept.metricLabel}
                  </span>
                  <span className="text-xs font-black text-slate-950">
                    {dept.metricValue}
                  </span>
                </div>
              </div>

              {/* Sub-breakdowns per department */}
              {dept.code === 'REV' && landStats && (
                <div className="mt-3 pt-2.5 border-t border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-700 block mb-1.5">
                    Land Type Distribution
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(landStats.landTypeBreakdown || {}).map(([type, count]) => (
                      <span
                        key={type}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-950 border border-slate-300 font-bold"
                      >
                        {type.split(' ')[0]}: <b className="text-amber-800 font-black">{count}</b>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {dept.code === 'AGR' && agricultureStats && (
                <div className="mt-3 pt-2.5 border-t border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-700 block mb-1.5">
                    Registered Crops
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(agricultureStats.cropBreakdown || {}).slice(0, 4).map(([crop, count]) => (
                      <span
                        key={crop}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-950 border border-slate-300 font-bold"
                      >
                        {crop}: <b className="text-emerald-800 font-black">{count}</b>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {dept.code === 'WEL' && welfareStats && (
                <div className="mt-3 pt-2.5 border-t border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-700 block mb-1.5">
                    DBT Settlement Status
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-slate-950 font-bold">
                      Processed: <b className="text-emerald-900 font-black">{welfareStats.disbursementStatusBreakdown['PROCESSED'] || 43}</b>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-slate-950 font-bold">
                      Audit Pending: <b className="text-amber-900 font-black">{welfareStats.disbursementStatusBreakdown['PENDING_AUDIT'] || 7}</b>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <button
                onClick={() => onSelectDepartment(dept.code)}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-950 border border-slate-300 text-xs font-black transition-all flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-amber-700" />
                <span>View {dept.code} Records</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
