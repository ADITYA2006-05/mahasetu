import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/LoginPage';
import { CitizenDashboardPage } from './components/citizen/CitizenDashboardPage';
import { CitizenProfilePage } from './components/citizen/CitizenProfilePage';
import { CitizenConsentsPage } from './components/CitizenConsentsPage';
import { CitizenDataAccessPage } from './components/CitizenDataAccessPage';
import { OfficerDashboardPage } from './components/officer/OfficerDashboardPage';
import { OfficerVerificationPage } from './components/officer/OfficerVerificationPage';
import { OfficerIntegrationPage } from './components/OfficerIntegrationPage';
import { AdminDashboardPage } from './components/admin/AdminDashboardPage';
import { AdminDepartmentsPage } from './components/admin/AdminDepartmentsPage';
import { AdminServicesPage } from './components/admin/AdminServicesPage';
import { AdminSchemaMappingsPage } from './components/AdminSchemaMappingsPage';
import { AdminAuditLogsPage } from './components/AdminAuditLogsPage';
import { AdminApiHealthPage } from './components/admin/AdminApiHealthPage';
import { DemoPage } from './components/demo/DemoPage';
import { DataExplorerModal } from './components/DataExplorerModal';
import { ApiInspectorModal } from './components/ApiInspectorModal';
import { PlatformStats } from './types';
import { API_BASE_URL } from './config/api';
import { 
  Menu, 
  ShieldAlert, 
  ArrowLeft 
} from 'lucide-react';

const MainApplication: React.FC = () => {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(false);
  const [isApiOpen, setIsApiOpen] = useState<boolean>(false);
  const [initialExplorerTab] = useState<string>('land');
  const [statsData, setStatsData] = useState<PlatformStats | null>(null);

  // Sync with browser URL
  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState(null, '', path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch background platform stats for modals
  useEffect(() => {
    if (!token || !isAuthenticated) return;
    fetch(`${API_BASE_URL}/api/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setStatsData(data); })
      .catch(() => {});
  }, [token, isAuthenticated]);

  // Redirect when user logs in
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const isCitizen = user.roles?.includes('ROLE_CITIZEN');
    const isOfficer = user.roles?.some(r => r === 'ROLE_DEPARTMENT_OFFICER');
    const isAdmin = user.roles?.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_SYSTEM');

    if (currentPath === '/' || currentPath === '/login') {
      if (isCitizen) navigate('/citizen/dashboard');
      else if (isOfficer) navigate('/officer/dashboard');
      else if (isAdmin) navigate('/admin/dashboard');
    }
  }, [isAuthenticated, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-300">Initializing MahaSetu Data Gateway...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => {
      // Handled by reactive useEffect
    }} />;
  }

  const isCitizen = user?.roles?.includes('ROLE_CITIZEN');
  const isOfficer = user?.roles?.some(r => r === 'ROLE_DEPARTMENT_OFFICER');
  const isAdmin = user?.roles?.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_SYSTEM');

  // Determine active component based on currentPath and user roles
  const renderContent = () => {
    // Root default redirection
    if (currentPath === '/') {
      if (isCitizen) return <CitizenDashboardPage onNavigate={navigate} />;
      if (isOfficer) return <OfficerDashboardPage onNavigate={navigate} />;
      return <AdminDashboardPage onNavigate={navigate} />;
    }

    // Citizen Routes
    if (currentPath === '/citizen/dashboard') {
      return <CitizenDashboardPage onNavigate={navigate} />;
    }
    if (currentPath === '/citizen/consents') {
      return <CitizenConsentsPage />;
    }
    if (currentPath === '/citizen/data-access') {
      return <CitizenDataAccessPage />;
    }
    if (currentPath === '/citizen/profile') {
      return <CitizenProfilePage />;
    }

    // Officer Routes
    if (currentPath === '/officer/dashboard') {
      if (!isOfficer && !isAdmin) return <AccessDenied onNavigate={navigate} />;
      return <OfficerDashboardPage onNavigate={navigate} />;
    }
    if (currentPath === '/officer/citizen-verification') {
      if (!isOfficer && !isAdmin) return <AccessDenied onNavigate={navigate} />;
      return <OfficerVerificationPage />;
    }
    if (currentPath === '/officer/integration') {
      if (!isOfficer && !isAdmin) return <AccessDenied onNavigate={navigate} />;
      return <OfficerIntegrationPage />;
    }

    // Admin Routes
    if (currentPath === '/admin/dashboard') {
      if (!isAdmin) return <AccessDenied onNavigate={navigate} />;
      return <AdminDashboardPage onNavigate={navigate} />;
    }
    if (currentPath === '/admin/departments') {
      if (!isAdmin) return <AccessDenied onNavigate={navigate} />;
      return <AdminDepartmentsPage />;
    }
    if (currentPath === '/admin/services') {
      if (!isAdmin) return <AccessDenied onNavigate={navigate} />;
      return <AdminServicesPage />;
    }
    if (currentPath === '/admin/schema-mappings') {
      if (!isAdmin) return <AccessDenied onNavigate={navigate} />;
      return <AdminSchemaMappingsPage />;
    }
    if (currentPath === '/admin/audit-logs') {
      if (!isAdmin) return <AccessDenied onNavigate={navigate} />;
      return <AdminAuditLogsPage />;
    }
    if (currentPath === '/admin/api-health') {
      if (!isAdmin) return <AccessDenied onNavigate={navigate} />;
      return <AdminApiHealthPage />;
    }

    // Demo Route
    if (currentPath === '/demo') {
      return <DemoPage />;
    }

    // 404 Fallback
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
        <h2 className="text-xl font-black text-slate-900">404 - Page Not Found</h2>
        <p className="text-xs text-slate-600 mt-2">The requested route does not exist.</p>
        <button
          onClick={() => navigate(isCitizen ? '/citizen/dashboard' : isOfficer ? '/officer/dashboard' : '/admin/dashboard')}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-amber-400 text-xs font-black"
        >
          Return to Dashboard
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={navigate}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenApiModal={() => setIsApiOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Mobile Top Header */}
        <header className="lg:hidden bg-slate-950 text-white p-3.5 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-black text-sm text-white">MahaSetu</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {user?.username}
            </span>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>

        {/* Minimal Footer */}
        <footer className="p-4 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
          MahaSetu Interoperability & Privacy Gateway • Government of Maharashtra • Phase 7 Production
        </footer>
      </div>

      {/* Shared Modals */}
      <DataExplorerModal
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        initialTab={initialExplorerTab}
      />

      <ApiInspectorModal
        isOpen={isApiOpen}
        onClose={() => setIsApiOpen(false)}
        statsData={statsData}
      />
    </div>
  );
};

const AccessDenied: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const isCitizen = user?.roles?.includes('ROLE_CITIZEN');

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-10 text-center max-w-lg mx-auto my-12 shadow-xs">
      <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-3" />
      <h2 className="text-lg font-black text-rose-950">Access Denied (RBAC Enforced)</h2>
      <p className="text-xs text-rose-800 mt-2 font-medium">
        Your authenticated identity does not possess the required departmental or administrative clearance to access this ledger.
      </p>
      <button
        onClick={() => onNavigate(isCitizen ? '/citizen/dashboard' : '/officer/dashboard')}
        className="mt-5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Return to Authorized Area
      </button>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApplication />
    </AuthProvider>
  );
}

export default App;
