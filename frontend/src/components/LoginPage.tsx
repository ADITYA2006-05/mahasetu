import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Key, UserCheck, AlertCircle, ArrowRight, Building2, UserPlus, Lock, User, CheckCircle2, Shield } from 'lucide-react';

interface LoginPageProps {
  onSuccess?: (targetRole?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, register, error, clearError, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'demo' | 'login' | 'register'>('demo');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regRole, setRegRole] = useState<'ROLE_CITIZEN' | 'ROLE_DEPARTMENT_OFFICER' | 'ROLE_ADMIN'>('ROLE_CITIZEN');
  const [regDeptCode, setRegDeptCode] = useState<string>('REV');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCitizenId, setRegCitizenId] = useState('');

  const [localError, setLocalError] = useState<string | null>(null);

  const demoAccounts = [
    {
      roleName: 'State Administrator',
      roleBadge: 'ADMIN',
      badgeColor: 'bg-rose-200 text-slate-950 border-rose-400 font-black',
      icon: Shield,
      username: 'admin',
      pass: 'Admin@MahaSetu2026',
      desc: 'Super administrative access to cross-departmental telemetry, registry configuration, and security monitoring.'
    },
    {
      roleName: 'Revenue Department Officer',
      roleBadge: 'REVENUE',
      badgeColor: 'bg-amber-200 text-slate-950 border-amber-400 font-black',
      icon: Building2,
      username: 'officer.revenue',
      pass: 'Officer@Revenue2026',
      desc: 'Custodian of 7/12 land records, mutation ledgers, survey plots, and property titles.'
    },
    {
      roleName: 'Agriculture Department Officer',
      roleBadge: 'AGRICULTURE',
      badgeColor: 'bg-emerald-200 text-slate-950 border-emerald-400 font-black',
      icon: Building2,
      username: 'officer.agri',
      pass: 'Officer@Agri2026',
      desc: 'Access to farmer profiles, seasonal crop records, soil health indices, and fertilizer subsidies.'
    },
    {
      roleName: 'Social Welfare Officer',
      roleBadge: 'WELFARE',
      badgeColor: 'bg-purple-200 text-slate-950 border-purple-400 font-black',
      icon: Building2,
      username: 'officer.welfare',
      pass: 'Officer@Welfare2026',
      desc: 'Direct Benefit Transfer (DBT) administration, old-age pension ledgers, and disability aid.'
    },
    {
      roleName: 'Citizen (Ramesh Shinde)',
      roleBadge: 'CITIZEN',
      badgeColor: 'bg-sky-200 text-slate-950 border-sky-400 font-black',
      icon: UserCheck,
      username: 'ramesh.shinde',
      pass: 'Citizen@Maha2026',
      desc: 'Citizen self-service portal for inspecting linked land records, crop data, and welfare stipends.'
    }
  ];

  const handleDemoLogin = async (account: typeof demoAccounts[0]) => {
    clearError();
    setLocalError(null);
    const ok = await login(account.username, account.pass);
    if (ok && onSuccess) {
      const role = account.roleBadge === 'ADMIN' ? 'ROLE_ADMIN' : account.roleBadge === 'CITIZEN' ? 'ROLE_CITIZEN' : 'ROLE_DEPARTMENT_OFFICER';
      onSuccess(role);
    }
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!usernameOrEmail.trim() || !password.trim()) {
      setLocalError('Please enter both username/email and password');
      return;
    }

    const ok = await login(usernameOrEmail.trim(), password);
    if (ok && onSuccess) onSuccess();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!regUsername || !regEmail || !regPassword || !regFullName) {
      setLocalError('Please fill in all required fields');
      return;
    }

    if (regPassword.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    const payload: any = {
      username: regUsername.trim().toLowerCase(),
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      fullName: regFullName.trim(),
      phone: regPhone.trim() || undefined,
      role: regRole,
    };

    if (regRole === 'ROLE_DEPARTMENT_OFFICER') {
      payload.departmentCode = regDeptCode;
    } else if (regRole === 'ROLE_CITIZEN') {
      payload.citizenId = regCitizenId.trim() || 'MH-CIT-10001';
    }

    const ok = await register(payload);
    if (ok && onSuccess) onSuccess(regRole);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 flex flex-col justify-between transition-colors">
      
      {/* Top Government Strip */}
      <div className="w-full bg-white border-b border-slate-300 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm border border-amber-600">
              MS
            </div>
            <div>
              <span className="font-black text-sm text-slate-950">Government of Maharashtra</span>
              <span className="text-xs text-slate-800 font-bold hidden sm:inline ml-2">| State Interoperability Platform</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Center Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-4xl bg-white border border-slate-300 rounded-xl shadow-lg overflow-hidden">
          
          {/* Header Banner */}
          <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-300 text-center">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              MahaSetu <span className="text-amber-700 font-extrabold text-lg sm:text-2xl">Gateway</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-800 mt-1 max-w-lg mx-auto font-bold">
              Secure Government Digital Interoperability & Data Exchange Portal
            </p>

            {/* Navigation Tabs */}
            <div className="flex justify-center gap-1 mt-6 p-1 bg-slate-200 rounded-lg max-w-md mx-auto border border-slate-300">
              <button
                onClick={() => { setActiveTab('demo'); clearError(); setLocalError(null); }}
                className={`flex-1 py-1.5 px-3 text-xs font-black rounded-md transition-all ${
                  activeTab === 'demo'
                    ? 'bg-white text-slate-950 shadow-sm border border-slate-300'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                Demo Accounts
              </button>
              <button
                onClick={() => { setActiveTab('login'); clearError(); setLocalError(null); }}
                className={`flex-1 py-1.5 px-3 text-xs font-black rounded-md transition-all ${
                  activeTab === 'login'
                    ? 'bg-white text-slate-950 shadow-sm border border-slate-300'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                Standard Login
              </button>
              <button
                onClick={() => { setActiveTab('register'); clearError(); setLocalError(null); }}
                className={`flex-1 py-1.5 px-3 text-xs font-black rounded-md transition-all ${
                  activeTab === 'register'
                    ? 'bg-white text-slate-950 shadow-sm border border-slate-300'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                Register Account
              </button>
            </div>
          </div>

          {/* Alert Message */}
          {(error || localError) && (
            <div className="mx-6 sm:mx-8 mt-6 p-3.5 bg-rose-100 border border-rose-300 rounded-lg flex items-start gap-2.5 text-slate-950 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-rose-900">Authentication Error: </span>
                <span>{error || localError}</span>
              </div>
            </div>
          )}

          {/* Tab 1: Demo Accounts Grid */}
          {activeTab === 'demo' && (
            <div className="p-6 sm:p-8 space-y-3">
              <div className="text-xs text-slate-900 font-extrabold mb-2">
                Click on any authorized role below to sign in instantly with synthetic test credentials:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {demoAccounts.map((acc, idx) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleDemoLogin(acc)}
                      disabled={isLoading}
                      className="group text-left p-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-amber-600 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-amber-700" />
                            <span className="font-black text-sm text-slate-950">
                              {acc.roleName}
                            </span>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${acc.badgeColor}`}>
                            {acc.roleBadge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed mb-3 font-semibold">
                          {acc.desc}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-slate-300 flex items-center justify-between text-xs text-slate-900 font-bold">
                        <span>User: <code className="font-black text-slate-950">{acc.username}</code></span>
                        <span className="text-amber-800 font-black flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Sign In</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Standard Login Form */}
          {activeTab === 'login' && (
            <div className="p-6 sm:p-8 max-w-md mx-auto">
              <form onSubmit={handleStandardLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-950 mb-1">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="e.g. admin or officer.revenue"
                      className="w-full bg-slate-50 border border-slate-400 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-950 placeholder-slate-500 font-bold focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-950 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 border border-slate-400 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-950 placeholder-slate-500 font-bold focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all text-xs sm:text-sm border border-amber-600"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Authenticate & Sign In</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Tab 3: Account Registration */}
          {activeTab === 'register' && (
            <div className="p-6 sm:p-8 max-w-lg mx-auto">
              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Account Role Selector */}
                <div>
                  <label className="block text-xs font-black text-slate-950 mb-1.5">
                    Account Classification (RBAC Role) *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('ROLE_CITIZEN')}
                      className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                        regRole === 'ROLE_CITIZEN'
                          ? 'bg-amber-100 border-amber-600 text-amber-950 font-black shadow-xs'
                          : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100 font-bold'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 mx-auto mb-1 text-amber-700" />
                      <span className="text-[11px] block">Citizen</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('ROLE_DEPARTMENT_OFFICER')}
                      className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                        regRole === 'ROLE_DEPARTMENT_OFFICER'
                          ? 'bg-amber-100 border-amber-600 text-amber-950 font-black shadow-xs'
                          : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100 font-bold'
                      }`}
                    >
                      <Building2 className="w-4 h-4 mx-auto mb-1 text-amber-700" />
                      <span className="text-[11px] block">Officer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('ROLE_ADMIN')}
                      className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                        regRole === 'ROLE_ADMIN'
                          ? 'bg-amber-100 border-amber-600 text-amber-950 font-black shadow-xs'
                          : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100 font-bold'
                      }`}
                    >
                      <Shield className="w-4 h-4 mx-auto mb-1 text-amber-700" />
                      <span className="text-[11px] block">Administrator</span>
                    </button>
                  </div>
                </div>

                {/* Conditional Department Selector for Officers */}
                {regRole === 'ROLE_DEPARTMENT_OFFICER' && (
                  <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-lg">
                    <label className="block text-xs font-black text-amber-950 mb-1">
                      Assigned Department *
                    </label>
                    <select
                      value={regDeptCode}
                      onChange={(e) => setRegDeptCode(e.target.value)}
                      className="w-full bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-950 font-bold focus:outline-none focus:border-amber-600"
                    >
                      <option value="REV">REV — Revenue & Forest (7/12 Land Records)</option>
                      <option value="AGR">AGR — Dept of Agriculture (Kisan Schemes)</option>
                      <option value="WEL">WEL — Social Welfare (DBT & Stipends)</option>
                    </select>
                  </div>
                )}

                {/* Conditional Citizen ID for Citizens */}
                {regRole === 'ROLE_CITIZEN' && (
                  <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-black text-sky-950">
                        Citizen ID (Canonical Mapping)
                      </label>
                      <span className="text-[10px] text-sky-700 font-bold">Auto-links records</span>
                    </div>
                    <input
                      type="text"
                      value={regCitizenId}
                      onChange={(e) => setRegCitizenId(e.target.value)}
                      placeholder="MH-CIT-10001 (Default Seeded Record)"
                      className="w-full bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-950 font-bold focus:outline-none focus:border-amber-600"
                    />
                    <p className="text-[10px] text-sky-800 mt-1 font-medium">
                      Defaults to MH-CIT-10001 with pre-federated land, agriculture, and welfare ledgers.
                    </p>
                  </div>
                )}

                {/* Administrator Role Info */}
                {regRole === 'ROLE_ADMIN' && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-950 text-xs font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>Grants full system telemetry, security audit logs, and service registry authority.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-950 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. kailas.salunkhe"
                      className="w-full bg-slate-50 border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-950 font-bold focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-950 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Kailas Pandurang Salunkhe"
                      className="w-full bg-slate-50 border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-950 font-bold focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-950 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="kailas@gov-synthetic.in"
                      className="w-full bg-slate-50 border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-950 font-bold focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-950 mb-1">Phone (Optional)</label>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full bg-slate-50 border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-950 font-bold focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-950 mb-1">Password (Min 8 chars) *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-950 font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all text-xs border border-amber-600 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>
                        {regRole === 'ROLE_ADMIN'
                          ? 'Register Administrator Account'
                          : regRole === 'ROLE_DEPARTMENT_OFFICER'
                          ? 'Register Department Officer Account'
                          : 'Register Citizen Account'}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Card Footer */}
          <div className="bg-slate-100 border-t border-slate-300 px-6 py-3 flex items-center justify-between text-[11px] text-slate-900 font-bold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Security: BCrypt Hashing • HMAC-SHA256 JWT • Role-Based Access</span>
            </div>
            <span>v1.0.0</span>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-3 text-xs text-slate-900 border-t border-slate-300 bg-white font-bold">
        Government of Maharashtra • Digital Interoperability Platform
      </footer>

    </div>
  );
};
