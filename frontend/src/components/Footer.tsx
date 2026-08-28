import React from 'react';
import { Shield, Database, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-300 bg-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center border border-amber-600">
              MS
            </div>
            <div>
              <p className="text-xs font-black text-slate-950">
                MahaSetu Platform
              </p>
              <p className="text-[11px] text-slate-800 font-bold">
                Government of Maharashtra State Data Interoperability Gateway
              </p>
            </div>
          </div>

          {/* Center Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-950 border border-slate-300 font-bold">
              <Shield className="w-3 h-3 text-emerald-800" />
              <span>Spring Security 6 (RBAC)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-950 border border-slate-300 font-bold">
              <Database className="w-3 h-3 text-amber-800" />
              <span>PostgreSQL Architecture</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-950 border border-slate-300 font-bold">
              <Lock className="w-3 h-3 text-sky-800" />
              <span>Zero-PII Storage</span>
            </span>
          </div>

          {/* Right copyright */}
          <div className="text-[11px] text-slate-900 font-bold text-center md:text-right">
            <span>© {new Date().getFullYear()} Government of Maharashtra</span>
          </div>

        </div>
      </div>
    </footer>
  );
};
