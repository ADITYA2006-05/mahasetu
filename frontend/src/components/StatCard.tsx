import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  badge?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  badge,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-300 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-sm ${
        onClick ? 'cursor-pointer hover:border-amber-600 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {value}
            </h3>
            {badge && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-200 text-slate-950 border border-emerald-400">
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className={`p-2.5 rounded-lg bg-slate-100 ${iconColor} shrink-0 border border-slate-200`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-800">
        <span className="truncate font-bold">{subtitle}</span>
        {onClick && (
          <span className="font-black text-amber-800 shrink-0 ml-1">
            View &rarr;
          </span>
        )}
      </div>
    </div>
  );
};
