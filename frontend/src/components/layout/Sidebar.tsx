import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Eye, 
  User, 
  FileCheck, 
  Layers, 
  Building2, 
  Cpu, 
  Sliders, 
  Activity, 
  PlayCircle, 
  LogOut, 
  FileText,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenApiModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  onOpenApiModal
}) => {
  const { user, logout } = useAuth();

  const isCitizen = user?.roles?.includes('ROLE_CITIZEN');
  const isOfficer = user?.roles?.some(r => r === 'ROLE_DEPARTMENT_OFFICER');
  const isAdmin = user?.roles?.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_SYSTEM');

  const handleNavClick = (path: string) => {
    onNavigate(path);
    onCloseMobile();
  };

  const getRoleLabel = () => {
    if (isAdmin) return 'State Administrator';
    if (isOfficer) return `Department Officer (${user?.departmentCode || 'REV'})`;
    return 'Registered Citizen';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sticky Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-950 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0
        ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Official Seal & Platform Title */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div 
            onClick={() => handleNavClick(isCitizen ? '/citizen/dashboard' : isOfficer ? '/officer/dashboard' : '/admin/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 border border-amber-400 group-hover:scale-105 transition-transform">
              MS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  MahaSetu
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
                Govt. of Maharashtra
              </p>
            </div>
          </div>

          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 text-xs custom-scrollbar">
          
          {/* CITIZEN MENU */}
          {isCitizen && (
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Citizen Services
              </div>

              <button
                onClick={() => handleNavClick('/citizen/dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                  currentPath === '/citizen/dashboard' || currentPath === '/'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>My Overview</span>
                </div>
                {currentPath === '/citizen/dashboard' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => handleNavClick('/citizen/consents')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                  currentPath === '/citizen/consents'
                    ? 'bg-emerald-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Data Consents</span>
                </div>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-500/30">
                  Phase 6
                </span>
              </button>

              <button
                onClick={() => handleNavClick('/citizen/data-access')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                  currentPath === '/citizen/data-access'
                    ? 'bg-sky-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4" />
                  <span>Access History</span>
                </div>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-sky-400/20 text-sky-300 border border-sky-500/30">
                  Audit
                </span>
              </button>

              <button
                onClick={() => handleNavClick('/citizen/profile')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                  currentPath === '/citizen/profile'
                    ? 'bg-indigo-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>My Profile & Identifiers</span>
                </div>
              </button>
            </div>
          )}

          {/* OFFICER MENU */}
          {(isOfficer || isAdmin) && (
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Officer Operations
              </div>

              <button
                onClick={() => handleNavClick('/officer/dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                  currentPath === '/officer/dashboard' || (currentPath === '/' && isOfficer)
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Officer Dashboard</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('/officer/citizen-verification')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                  currentPath === '/officer/citizen-verification'
                    ? 'bg-indigo-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4" />
                  <span>Citizen Verification</span>
                </div>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-indigo-400/20 text-indigo-300 border border-indigo-500/30">
                  Pipeline
                </span>
              </button>

              <button
                onClick={() => handleNavClick('/officer/integration')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                  currentPath === '/officer/integration'
                    ? 'bg-amber-600 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4" />
                  <span>Integration Engine</span>
                </div>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-500/30">
                  Phase 4
                </span>
              </button>
            </div>
          )}

          {/* ADMIN MENU */}
          {isAdmin && (
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                State Administration
              </div>

              <button
                onClick={() => handleNavClick('/admin/dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                  currentPath === '/admin/dashboard' || (currentPath === '/' && isAdmin)
                    ? 'bg-indigo-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>State Telemetry</span>
                </div>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-400/20 text-rose-300 border border-rose-500/30">
                  Charts
                </span>
              </button>

              <button
                onClick={() => handleNavClick('/admin/departments')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                  currentPath === '/admin/departments'
                    ? 'bg-slate-800 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4" />
                  <span>Departments</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('/admin/services')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                  currentPath === '/admin/services'
                    ? 'bg-slate-800 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4" />
                  <span>Services Registry</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('/admin/schema-mappings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                  currentPath === '/admin/schema-mappings'
                    ? 'bg-indigo-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4" />
                  <span>Schema Mappings</span>
                </div>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-indigo-400/20 text-indigo-300 border border-indigo-500/30">
                  Phase 5
                </span>
              </button>

              <button
                onClick={() => handleNavClick('/admin/audit-logs')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                  currentPath === '/admin/audit-logs'
                    ? 'bg-rose-950 text-rose-200 border border-rose-700 shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>Audit Ledger</span>
                </div>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-400/20 text-rose-300 border border-rose-500/30">
                  Immutable
                </span>
              </button>

              <button
                onClick={() => handleNavClick('/admin/api-health')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                  currentPath === '/admin/api-health'
                    ? 'bg-emerald-950 text-emerald-200 border border-emerald-700 shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4" />
                  <span>API Health</span>
                </div>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-500/30">
                  Live
                </span>
              </button>
            </div>
          )}

          {/* INTEROPERABILITY SHOWCASE (Available to all) */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Interactive Showcase
            </div>

            <button
              onClick={() => handleNavClick('/demo')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                currentPath === '/demo'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PlayCircle className="w-4 h-4" />
                <span>End-to-End Demo</span>
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400/30 text-amber-200 border border-amber-400/40">
                Phase 7
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Profile Badge & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50 space-y-2">
          <div className="flex items-center justify-between px-2 py-1.5 bg-slate-900 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                {user?.fullName ? user.fullName.charAt(0) : 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-black text-white truncate max-w-[120px]">
                  {user?.fullName || 'User'}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {getRoleLabel()}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenApiModal}
              title="API Specs & Inspector"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              logout();
              onNavigate('/');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/50 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
