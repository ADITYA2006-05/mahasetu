import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  UserCheck, 
  Building2, 
  Shield, 
  PlayCircle, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  Lock, 
  Activity, 
  FileCheck, 
  Sliders, 
  FileText, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserManualPageProps {
  onNavigate: (path: string) => void;
  isPublicAccess?: boolean;
}

type ManualTab = 'quickstart' | 'citizen' | 'officer' | 'admin' | 'showcase' | 'architecture' | 'faqs';

interface DemoCredential {
  role: string;
  badge: string;
  badgeColor: string;
  username: string;
  pass: string;
  description: string;
  recommendedTask: string;
  targetRoute: string;
}

const DEMO_ACCOUNTS: DemoCredential[] = [
  {
    role: 'State Administrator',
    badge: 'SUPER ADMIN',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    username: 'admin',
    pass: 'Admin@MahaSetu2026',
    description: 'Full administrative governance over state telemetry, department nodes, outage simulator, and compliance audit logs.',
    recommendedTask: 'Inspect telemetry Recharts, trigger a simulated department outage, and check audit ledger.',
    targetRoute: '/admin/dashboard'
  },
  {
    role: 'Revenue Department Officer',
    badge: 'REVENUE',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    username: 'officer.revenue',
    pass: 'Officer@Revenue2026',
    description: 'Custodian of 7/12 land titles, survey plots, and mutation extracts. Executes multi-department verification.',
    recommendedTask: 'Run the 5-step Citizen Verification Pipeline for citizen MH-CIT-10001.',
    targetRoute: '/officer/citizen-verification'
  },
  {
    role: 'Agriculture Department Officer',
    badge: 'AGRICULTURE',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    username: 'officer.agri',
    pass: 'Officer@Agri2026',
    description: 'Validates farmer profiles, seasonal crop records, soil health indices, and PM-KISAN subsidy claims.',
    recommendedTask: 'Inspect farmer crop records & test federated queries in the Integration Engine.',
    targetRoute: '/officer/integration'
  },
  {
    role: 'Social Welfare Officer',
    badge: 'WELFARE',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    username: 'officer.welfare',
    pass: 'Officer@Welfare2026',
    description: 'Manages Direct Benefit Transfer (DBT) pensions, disability aid, and financial disbursement validation.',
    recommendedTask: 'Verify beneficiary eligibility and DBT status for government schemes.',
    targetRoute: '/officer/dashboard'
  },
  {
    role: 'Citizen Beneficiary (Ramesh Shinde)',
    badge: 'CITIZEN',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    username: 'ramesh.shinde',
    pass: 'Citizen@Maha2026',
    description: 'Self-service citizen portal for inspecting linked land records, crop data, and controlling DPDP privacy consents.',
    recommendedTask: 'Review 360-degree linked records, grant or revoke departmental data consent, and audit access history.',
    targetRoute: '/citizen/dashboard'
  }
];

export const UserManualPage: React.FC<UserManualPageProps> = ({ onNavigate, isPublicAccess = false }) => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ManualTab>('quickstart');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const isCitizen = user?.roles?.includes('ROLE_CITIZEN');
  const isOfficer = user?.roles?.some(r => r === 'ROLE_DEPARTMENT_OFFICER');
  const isAdmin = user?.roles?.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_SYSTEM');

  const faqs = [
    {
      q: 'Does MahaSetu store citizen Aadhaar cards or land extract papers?',
      a: 'No. MahaSetu is built on a strict Zero-Data-Hoarding architecture. It does not store or centralize any citizen PII or paper certificates. It acts as an in-memory transit bridge that queries sovereign departments in real-time, normalizes the payload, and transmits it directly to the authorized caller.'
    },
    {
      q: 'Can a government officer inspect citizen records without consent?',
      a: 'No. Under the DPDP Act 2023 Gatekeeper module, every cross-department federated query checks for an active, valid, and unexpired citizen consent for the designated purpose (e.g., SUBSIDY_VERIFICATION). If consent is missing or revoked, the gateway blocks the request with HTTP 403 CONSENT_REQUIRED.'
    },
    {
      q: 'What happens if a departmental server (e.g., Agriculture) goes offline?',
      a: 'MahaSetu incorporates circuit breakers and fault-tolerant failovers. If the Agriculture gateway fails to respond, the platform does not crash. It returns the available Revenue and Welfare data with an overall status of PARTIAL_SUCCESS, noting the failed node in the telemetry ledger.'
    },
    {
      q: 'How do different departments exchange data if their field names do not match?',
      a: 'MahaSetu has a built-in Semantic Schema Normalization Engine. Revenue uses snake_case, Agriculture uses camelCase, and Welfare uses nested objects. MahaSetu converts all departmental outputs into a unified, versioned Canonical Data Model on the fly.'
    },
    {
      q: 'Can I test custom Citizen IDs that are not pre-seeded?',
      a: 'Yes! The platform includes an on-demand synthetic generator. You can enter any ID like MH-CIT-88990 or register a new citizen account with any 12-digit number; MahaSetu dynamically provisions realistic departmental records so verification workflows never halt.'
    },
    {
      q: 'How is the audit trail protected against tampering?',
      a: 'Every access event, consent modification, and query is permanently recorded in the Compliance Audit Ledger with unique Request IDs, cryptographic timestamps, officer IDs, and execution latencies. Citizens can view access logs affecting them, while Admins view statewide logs.'
    }
  ];

  // Filter sections when search is active
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [searchQuery, faqs]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner & Orientation */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <BookOpen className="w-5 h-5" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Official Operational Manual
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              MahaSetu Platform User Guide & Manual
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
              Step-by-step instructions for Citizens, Department Nodal Officers, State Administrators, and Evaluators to navigate and operate the zero-data-hoarding state interoperability gateway.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isPublicAccess ? (
              <button
                onClick={() => onNavigate('/')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/demo')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Launch Interactive Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Search Filter */}
        <div className="mt-6 relative max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search manual (e.g., 7/12 records, consent revocation, outage simulation, API health)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Manual Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('quickstart')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'quickstart'
              ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Start & Demo Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab('citizen')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'citizen'
              ? 'bg-sky-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Citizen Portal Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('officer')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'officer'
              ? 'bg-indigo-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Officer Verification Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'admin'
              ? 'bg-rose-700 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin & Telemetry Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('showcase')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'showcase'
              ? 'bg-amber-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>Live Demo Walkthrough</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'architecture'
              ? 'bg-slate-800 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Architecture & Security</span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'faqs'
              ? 'bg-emerald-700 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>FAQs & Troubleshooting</span>
        </button>
      </div>

      {/* TAB 1: QUICK START & DEMO ACCOUNTS */}
      {activeTab === 'quickstart' && (
        <div className="space-y-6">
          {/* Quick Start Steps */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>3-Step Quick Start Workflow</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center mb-2.5">
                    1
                  </div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Pick a Persona</h3>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Choose between <strong>Citizen</strong>, <strong>Officer</strong> (Revenue, Agri, Welfare), or <strong>State Admin</strong>.
                  </p>
                </div>
                <div className="mt-3 text-[11px] text-amber-700 font-bold bg-amber-50 p-2 rounded-lg border border-amber-200">
                  Pre-seeded synthetic data is ready for immediate testing.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center mb-2.5">
                    2
                  </div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Sign In / Register</h3>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Use 1-click login on the Login Page Demo Accounts tab, or copy the credentials below. You can also register any new account.
                  </p>
                </div>
                <div className="mt-3 text-[11px] text-indigo-700 font-bold bg-indigo-50 p-2 rounded-lg border border-indigo-200">
                  Passwords use BCrypt-12 and authenticate via JWT tokens.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-2.5">
                    3
                  </div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Execute Operations</h3>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Grant consents, inspect land records, trigger multi-department federations, or simulate gateway outages.
                  </p>
                </div>
                <div className="mt-3 text-[11px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  All actions update the compliance audit ledger in real-time.
                </div>
              </div>
            </div>
          </div>

          {/* Demo Accounts Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-black text-slate-900">Pre-configured Demo Credentials</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Click the copy button beside any credential to paste it directly into the login form.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 self-start sm:self-auto">
                Synthetic Environment
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {DEMO_ACCOUNTS.map((acc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${acc.badgeColor}`}>
                        {acc.badge}
                      </span>
                      <span className="font-black text-sm text-slate-900">{acc.role}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{acc.description}</p>
                    <div className="text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">Recommended Test: </span>
                      {acc.recommendedTask}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shrink-0">
                    <div className="text-xs">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Username</span>
                      <code className="font-mono font-black text-slate-900">{acc.username}</code>
                    </div>
                    <button
                      onClick={() => handleCopy(acc.username, `user-${idx}`)}
                      title="Copy Username"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      {copiedKey === `user-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <div className="h-6 w-px bg-slate-200 mx-1" />

                    <div className="text-xs">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Password</span>
                      <code className="font-mono font-black text-slate-900">{acc.pass}</code>
                    </div>
                    <button
                      onClick={() => handleCopy(acc.pass, `pass-${idx}`)}
                      title="Copy Password"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      {copiedKey === `pass-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {isAuthenticated && (
                      <button
                        onClick={() => onNavigate(acc.targetRoute)}
                        className="ml-2 px-3 py-1.5 rounded-lg bg-slate-900 text-amber-400 text-xs font-bold hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CITIZEN PORTAL GUIDE */}
      {activeTab === 'citizen' && (
        <div className="space-y-6">
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-sky-600 text-white shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-black text-sky-950">Citizen Self-Service Portal Guide</h2>
                <p className="text-xs text-sky-800 font-medium">
                  Citizens have sovereign transparency over their personal data. They can view linked departmental records, grant granular time-bound DPDP consents, immediately revoke permissions, and inspect access logs.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-200/70 text-sky-900">
                    Default Citizen: ramesh.shinde (MH-CIT-10001)
                  </span>
                  {isCitizen && (
                    <button
                      onClick={() => onNavigate('/citizen/dashboard')}
                      className="text-xs font-black text-sky-900 underline hover:text-sky-950 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Go to your Citizen Dashboard</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1: Viewing Dashboard & Records */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-black text-xs flex items-center justify-center">1</span>
                <h3 className="text-sm font-black text-slate-900">Unified Department Records</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Navigate to <strong>Citizen Portal &rarr; My Overview</strong>. Here you will see:
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Revenue Card (7/12)</strong>: Survey No, Gat No, Khata No, Total Area (Hectares & Acres), and Land Classification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Agriculture Card</strong>: PM-KISAN Beneficiary Status, Soil Health Card ID, Active Crops, and Subsidies Availed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Social Welfare Card</strong>: Direct Benefit Transfer (DBT) Scheme, Monthly Stipend Amount (₹), and Masked Bank Account.</span>
                </li>
              </ul>
              {isCitizen && (
                <button
                  onClick={() => onNavigate('/citizen/dashboard')}
                  className="mt-2 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Citizen Overview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Step 2: Managing DPDP Consents */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">2</span>
                <h3 className="text-sm font-black text-slate-900">Granting & Revoking DPDP Consents</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Navigate to <strong>Citizen Portal &rarr; Data Consents</strong> to control data sharing under the DPDP Act 2023:
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Grant New Consent</strong>: Select requesting department, intended purpose (e.g. <code>SUBSIDY_VERIFICATION</code>), allowed scopes, and validity period (30, 90, 365 days).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Instant Revocation</strong>: Click <em>Revoke Consent</em> on any active permission. Any subsequent officer query will be blocked immediately with HTTP 403.</span>
                </li>
              </ul>
              {isCitizen && (
                <button
                  onClick={() => onNavigate('/citizen/consents')}
                  className="mt-2 w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Manage Data Consents</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Step 3: Access History Transparency */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">3</span>
                <h3 className="text-sm font-black text-slate-900">Transparency Access Audit Log</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Navigate to <strong>Citizen Portal &rarr; Access History</strong>:
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Inspect every single timestamped query made by departmental officers concerning your identity.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Verify the Officer Username, Request ID, Purpose Code, and Departments Queried.</span>
                </li>
              </ul>
              {isCitizen && (
                <button
                  onClick={() => onNavigate('/citizen/data-access')}
                  className="mt-2 w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Access History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Step 4: Profile & Identifiers */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center">4</span>
                <h3 className="text-sm font-black text-slate-900">Demographic Profile & Synthetic Identifiers</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Navigate to <strong>Citizen Portal &rarr; My Profile & Identifiers</strong>:
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>View master demographic record: Full Name, Gender, Masked Phone, Masked Email, and District.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Inspect department crosswalk IDs (Revenue Khata, Agri Registration, and Welfare Beneficiary ID).</span>
                </li>
              </ul>
              {isCitizen && (
                <button
                  onClick={() => onNavigate('/citizen/profile')}
                  className="mt-2 w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View My Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OFFICER CONSOLE GUIDE */}
      {activeTab === 'officer' && (
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-black text-indigo-950">Department Nodal Officer Console Guide</h2>
                <p className="text-xs text-indigo-800 font-medium">
                  Officers can verify subsidy applicants across departments in under 60 milliseconds without collecting physical papers or hoarding unneeded citizen records.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-200/70 text-indigo-900">
                    Accounts: officer.revenue | officer.agri | officer.welfare
                  </span>
                  {(isOfficer || isAdmin) && (
                    <button
                      onClick={() => onNavigate('/officer/citizen-verification')}
                      className="text-xs font-black text-indigo-900 underline hover:text-indigo-950 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Citizen Verification Pipeline</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              The 5-Step Automated Verification Pipeline (`/officer/citizen-verification`)
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Step 1: Citizen Identification</h4>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    Search or select a citizen (e.g. <code>MH-CIT-10001</code>) from the synthetic applicant table. MahaSetu validates the identity and queries the identity crosswalk without revealing the citizen's actual Aadhaar number.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Step 2: DPDP Consent Gatekeeper Verification</h4>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    The platform checks if an active, unexpired consent exists for the specified verification purpose. If consent is valid, the green verified badge appears. If consent was revoked by the citizen, verification is blocked.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Step 3: Multi-Department Asynchronous Federation</h4>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    MahaSetu dispatches concurrent parallel queries to the Revenue (7/12 Land), Agriculture (Crops & Subsidies), and Welfare (DBT) endpoints. Response latencies (in milliseconds) and node status badges are displayed.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">4</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Step 4: Canonical Schema Inspection & Cross-Validation</h4>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    The disparate departmental formats are presented in a clean unified view: Landholding hectares vs crop declarations vs pension accounts. Officers can also toggle the raw canonical JSON response payload.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">5</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Step 5: Decision & Compliance Auditing</h4>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    The officer stamps the verification as <strong>Approved</strong> or <strong>Rejected</strong> with optional remarks. An immutable audit record with Request ID and timestamp is instantly logged.
                  </p>
                </div>
              </div>
            </div>

            {(isOfficer || isAdmin) && (
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => onNavigate('/officer/citizen-verification')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Launch Citizen Verification Pipeline</span>
                </button>
                <button
                  onClick={() => onNavigate('/officer/integration')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Layers className="w-4 h-4" />
                  <span>Open Integration Query Console</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: STATE ADMINISTRATOR GUIDE */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-700 text-white shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-black text-rose-950">State Administrator Telemetry Guide</h2>
                <p className="text-xs text-rose-800 font-medium">
                  System administrators have complete platform visibility: real-time Recharts telemetry, departmental outage simulation (chaos testing), schema transformation rules, and immutable audit logs.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-200/70 text-rose-900">
                    Account: admin / Admin@MahaSetu2026
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => onNavigate('/admin/dashboard')}
                      className="text-xs font-black text-rose-900 underline hover:text-rose-950 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open State Telemetry</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1: Real-Time Telemetry */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-black text-slate-900">State Telemetry & Recharts (`/admin/dashboard`)</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Monitor statewide throughput, request latencies, and error distributions. Interactive graphs show verifications per department and geographic distribution across Maharashtra districts.
              </p>
              {isAdmin && (
                <button
                  onClick={() => onNavigate('/admin/dashboard')}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Telemetry Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Feature 2: Chaos Outage Simulator */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-black text-slate-900">Department Outage Simulation (`/admin/api-health`)</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Test gateway fault tolerance! Toggle any department (e.g. Agriculture) to <strong>OFFLINE</strong> or <strong>DEGRADED</strong>. Then run a query in the Officer console to observe the platform gracefully return <code>PARTIAL_SUCCESS</code> rather than crashing.
              </p>
              {isAdmin && (
                <button
                  onClick={() => onNavigate('/admin/api-health')}
                  className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Health & Outage Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Feature 3: Schema Mapping Visualizer */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Semantic Schema Engine (`/admin/schema-mappings`)</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Inspect how heterogeneous departmental attributes (like <code>khata_no</code>, <code>landholdingHectares</code>, <code>stipendAmount</code>) are dynamically converted into unified Canonical models with versioning controls.
              </p>
              {isAdmin && (
                <button
                  onClick={() => onNavigate('/admin/schema-mappings')}
                  className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Schema Mappings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Feature 4: Immutable Audit Ledger */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" />
                <h3 className="text-sm font-black text-slate-900">Immutable Audit Ledger (`/admin/audit-logs`)</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Filter and inspect statewide compliance records by Request ID, Officer Username, Target Citizen, or Status (<code>SUCCESS</code>, <code>PARTIAL_SUCCESS</code>, <code>CONSENT_REJECTED</code>). Export audit logs for oversight bodies.
              </p>
              {isAdmin && (
                <button
                  onClick={() => onNavigate('/admin/audit-logs')}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Audit Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LIVE DEMO SHOWCASE GUIDE */}
      {activeTab === 'showcase' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-600 text-slate-950 shrink-0">
                <PlayCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-black text-amber-950">Interactive 15-Step Showcase (`/demo`)</h2>
                <p className="text-xs text-amber-800 font-medium">
                  Designed specifically for evaluators, hackathon juries, and live demonstrations. The showcase walks through 4 automated end-to-end scenarios with zero manual setup.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('/demo')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Open Live Demo Page Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                  SCENARIO 1
                </span>
                <h3 className="text-xs font-black text-slate-900">Happy Path Federated Verification</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Demonstrates Ramesh Shinde applying for a drought subsidy. MahaSetu queries Revenue, Agriculture, and Welfare simultaneously in under 50ms with valid active consent.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-300">
                  SCENARIO 2
                </span>
                <h3 className="text-xs font-black text-slate-900">Privacy Enforcement & Consent Revocation</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Simulates citizen revoking consent. An officer attempts to verify the citizen; the gateway strictly blocks the request with HTTP 403 <code>CONSENT_REQUIRED</code>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                  SCENARIO 3
                </span>
                <h3 className="text-xs font-black text-slate-900">Graceful Failover & Outage Resilience</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Simulates the Agriculture Department gateway going offline. MahaSetu does not crash; it delivers available Revenue/Welfare records with <code>PARTIAL_SUCCESS</code>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-black border border-indigo-300">
                  SCENARIO 4
                </span>
                <h3 className="text-xs font-black text-slate-900">Semantic Schema Normalization</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Visualizes raw legacy departmental payloads transforming dynamically into the unified MahaSetu canonical model with side-by-side JSON comparison.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ARCHITECTURE & SECURITY */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Zero-Data-Hoarding Architecture & Privacy Guarantees</span>
            </h2>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Traditional government initiatives attempt to build centralized monolithic databases containing all citizen certificates. MahaSetu eliminates this data breach risk by operating strictly as a <strong>Zero-Data-Hoarding Transit Bridge</strong>:
            </p>

            <div className="p-4 rounded-xl bg-slate-900 text-amber-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              {`[ Citizen / Officer / Admin ]
               │
   (JWT HMAC-SHA256 & BCrypt-12 RBAC)
               ▼
┌────────────────────────────────────────────────────────┐
│                   MAHASETU GATEWAY                     │
├────────────────────────────────────────────────────────┤
│ 1. DPDP 2023 Consent Gatekeeper (Purpose Limitation)   │
│ 2. Dynamic Identity Crosswalk (Zero Aadhaar Exposure)   │
│ 3. Canonical Schema Engine (Heterogeneous -> Unified)  │
│ 4. Asynchronous Parallel Gateway Dispatcher            │
│ 5. Fault-Tolerant Circuit Breaker (PARTIAL_SUCCESS)    │
│ 6. Immutable Compliance Audit Ledger                   │
└──────────────────────────┬─────────────────────────────┘
                           │
      ┌────────────────────┼────────────────────┐
      ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ REVENUE DEPT │     │  AGRI DEPT   │     │ WELFARE DEPT │
│  (7/12 Land) │     │ (Crops/PMK)  │     │ (DBT Scheme) │
└──────────────┘     └──────────────┘     └──────────────┘`}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-black text-xs">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>DPDP Act 2023 Compliance</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Enforces strict purpose limitation, consent expiration timers, and instant citizen revocation rights across all state endpoints.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-black text-xs">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Cryptographic Data Protection</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  HMAC-SHA256 signed JWT tokens, 12 rounds BCrypt salt hashing, and synthetic Aadhaar Virtual Identifiers (VID) preventing PII leakage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: FAQS & TROUBLESHOOTING */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              <span>Frequently Asked Questions & Operational Troubleshooting</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Find quick answers to common questions about data privacy, outages, consent verification, and platform usage.
            </p>

            <div className="mt-6 space-y-3">
              {filteredFaqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between gap-3 text-xs font-black text-slate-900 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {expandedFaq === idx && (
                    <div className="p-4 bg-white border-t border-slate-200 text-xs text-slate-700 font-medium leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}

              {filteredFaqs.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No FAQs matched your search query. Try typing another term.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Support Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Need further assistance? Access the interactive Swagger API docs or inspection modals anytime.</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('/swagger-ui.html', '_blank')}
            className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Swagger UI</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManualPage;
