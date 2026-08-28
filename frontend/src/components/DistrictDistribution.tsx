import React from 'react';
import { DistrictDistribution as DistrictType } from '../types';
import { Users, Building2 } from 'lucide-react';

interface DistrictDistributionProps {
  districts: DistrictType[];
}

export const DistrictDistribution: React.FC<DistrictDistributionProps> = ({ districts }) => {
  const maxCitizens = Math.max(...districts.map((d) => d.citizensCount), 1);

  return (
    <div className="mt-8">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
          <span>District Coverage</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 border border-slate-300 text-slate-950 font-bold">
            10 Maharashtra Districts
          </span>
        </h2>
        <p className="text-xs text-slate-800 mt-0.5 font-bold">
          Synthetic citizen and village distribution across administrative divisions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {districts.map((district) => {
          const percentage = Math.round((district.citizensCount / maxCitizens) * 100);
          return (
            <div
              key={district.code}
              className="bg-white border border-slate-300 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    {district.code}
                  </span>
                  <div className="flex items-center gap-1 text-slate-800 text-xs font-bold">
                    <Building2 className="w-3 h-3 text-slate-600" />
                    <span>{district.villagesCount} Vil</span>
                  </div>
                </div>

                <h4 className="text-sm font-black text-slate-950 mt-2 truncate">
                  {district.name}
                </h4>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-800 flex items-center gap-1 font-bold">
                    <Users className="w-3 h-3 text-slate-600" />
                    <span>Citizens:</span>
                  </span>
                  <span className="font-black text-slate-950 text-sm">
                    {district.citizensCount}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-700 font-bold text-right">
                Interoperability Active
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
