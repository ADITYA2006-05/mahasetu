import React, { useState, useEffect } from 'react';
import { LogOut, Database, Key, Shield, Building2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenExplorer: () => void;
  onOpenApi: () => void;
  activeView?: 'dashboard' | 'integration' | 'schema-mappings' | 'audit-logs' | 'citizen-entitlements' | 'citizen-consents' | 'citizen-data-access';
  onSelectView?: (view: 'dashboard' | 'integration' | 'schema-mappings' | 'audit-logs' | 'citizen-entitlements' | 'citizen-consents' | 'citizen-data-access') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenExplorer, 
  onOpenApi, 
  activeView = 'dashboard', 
  onSelectView 
}) => {
  const { user, logout } = useAuth();
  const [timeString, setTimeString] = useState<string>('');

  const isOfficerOrAdmin = user?.roles?.some(r => r === 'ROLE_DEPARTMENT_OFFICER' || r === 'ROLE_ADMIN' || r === 'ROLE_SYSTEM');
  const isAdmin = user?.roles?.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_SYSTEM');
  const isCitizen = user?.roles?.some(r => r === 'ROLE_CITIZEN');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadge = () => {
    if (!user || !user.roles || user.roles.length === 0) return null;
    const role = user.roles[0];
    if (role === 'ROLE_ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black bg-rose-200 text-slate-950 border border-rose-400">
          <Shield className="w-3 h-3 text-rose-800" /> State Admin
        </span>
      );
    }
    if (role === 'ROLE_DEPARTMENT_OFFICER') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black bg-amber-200 text-slate-950 border border-amber-400">
          <Building2 className="w-3 h-3 text-amber-800" /> Officer {user.departmentCode ? `(${user.departmentCode})` : ''}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black bg-sky-200 text-slate-950 border border-sky-400">
        <UserCheck className="w-3 h-3 text-sky-800" /> Citizen
      </span>
    );
  };

  return (
    <header className="bg-white border-b border-slate-300 sticky top-0 z-30 transition-colors shadow-sm">
      {/* Official Government Tricolor Top Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-[#ff9933] via-slate-300 to-[#138808]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Official Government Logo & Title + Navigation */}
          <div className="flex items-center gap-6">
            <div 
              onClick={() => onSelectView?.(isCitizen ? 'citizen-entitlements' : 'dashboard')}
              className="flex items-center gap-3.5 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center shadow-sm shrink-0 border border-amber-600">
                MS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
                    MahaSetu
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-950 border border-slate-300">
                    State Data Gateway
                  </span>
                </div>
                <p className="text-[11px] text-slate-800 font-bold hidden md:block">
                  Government of Maharashtra • Interoperability Platform
                </p>
              </div>
            </div>

            {/* Officer / Admin View Switcher Navigation */}
            {isOfficerOrAdmin && (
              <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-slate-300">
                <button
                  type="button"
                  onClick={() => onSelectView?.('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
                    activeView === 'dashboard'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => onSelectView?.('integration')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors ${
                    activeView === 'integration'
                      ? 'bg-amber-600 text-slate-950 shadow-xs border border-amber-500'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <span>Integration Engine</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-300 text-amber-950 border border-amber-400">
                    Phase 4
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectView?.('schema-mappings')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors ${
                    activeView === 'schema-mappings'
                      ? 'bg-indigo-600 text-white shadow-xs border border-indigo-500'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <span>Schema Mappings</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-200 text-indigo-950 border border-indigo-300">
                    Phase 5
                  </span>
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onSelectView?.('audit-logs')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors ${
                      activeView === 'audit-logs'
                        ? 'bg-slate-950 text-white shadow-xs border border-slate-800'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <span>Audit Logs</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-200 text-rose-950 border border-rose-300">
                      Phase 6
                    </span>
                  </button>
                )}
              </nav>
            )}

            {/* Citizen View Switcher Navigation */}
            {isCitizen && (
              <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-slate-300">
                <button
                  type="button"
                  onClick={() => onSelectView?.('citizen-entitlements')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
                    activeView === 'citizen-entitlements' || activeView === 'dashboard'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  My Entitlements
                </button>
                <button
                  type="button"
                  onClick={() => onSelectView?.('citizen-consents')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors ${
                    activeView === 'citizen-consents'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <span>Data Consents</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-950">
                    Phase 6
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectView?.('citizen-data-access')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors ${
                    activeView === 'citizen-data-access'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <span>Access History</span>
                </button>
              </nav>
            )}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            
            {/* Live Clock (Desktop) */}
            <div className="hidden lg:flex flex-col items-end mr-1 text-right">
              <span className="text-xs font-mono font-bold text-slate-950">{timeString}</span>
              <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Gateway Online
              </span>
            </div>

            {/* Quick Tools */}
            <button
              onClick={onOpenExplorer}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Records Explorer</span>
            </button>

            <button
              onClick={onOpenApi}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-sky-700" />
              <span className="hidden sm:inline">API Specs</span>
            </button>

            {/* User Profile & Logout */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-300">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-black text-slate-950 max-w-[120px] truncate">
                    {user.fullName}
                  </span>
                  <div className="mt-0.5">{getRoleBadge()}</div>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-950 hover:text-rose-900 border border-slate-300 hover:border-rose-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
