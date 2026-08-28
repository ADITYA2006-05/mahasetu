import React, { useState } from 'react';
import { X, Code, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ApiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  statsData?: any;
}

export const ApiInspectorModal: React.FC<ApiInspectorModalProps> = ({
  isOpen,
  onClose,
  statsData,
}) => {
  const { user, token } = useAuth();
  const [selectedEndpoint, setSelectedEndpoint] = useState<'integration_request' | 'consents' | 'audit_logs' | 'schema_mappings' | 'integration_history' | 'stats' | 'health' | 'auth_me' | 'auth_login'>('integration_request');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const endpoints: Record<string, { method: string; path: string; authRequired: string; payload: any }> = {
    integration_request: {
      method: 'POST',
      path: '/api/integration/request',
      authRequired: 'Bearer JWT (ROLE_DEPARTMENT_OFFICER, ROLE_ADMIN, ROLE_SYSTEM)',
      payload: {
        requestId: "REQ-4B5DB3F0",
        citizenId: "MH-CIT-10001",
        status: "SUCCESS",
        purpose: "SUBSIDY_VERIFICATION",
        requestingUser: "officer.revenue",
        citizen: {
          id: "MH-CIT-10001",
          name: "Ramesh Tukaram Shinde"
        },
        location: {
          district: "Pune",
          taluka: "Haveli",
          village: "Wagholi"
        },
        land: {
          surveyNumber: "SN-101",
          areaAcres: 1.98,
          source: "REVENUE"
        },
        agriculture: {
          crop: "Cotton",
          season: "Kharif",
          landUsage: "0.8000 Ha",
          source: "AGRICULTURE"
        },
        welfare: {
          schemeCode: "SCH-SGNY-01",
          schemeName: "Sanjay Gandhi Niradhar Anudan Yojana",
          previousBenefit: true,
          applicationStatus: "APPROVED",
          benefitAmount: 1500.0,
          source: "WELFARE"
        },
        sources: [
          "REVENUE",
          "AGRICULTURE",
          "WELFARE"
        ],
        departmentResponses: [
          { department: "REVENUE", status: "SUCCESS", responseTimeMs: 120 },
          { department: "AGRICULTURE", status: "SUCCESS", responseTimeMs: 95 },
          { department: "WELFARE", status: "SUCCESS", responseTimeMs: 110 }
        ],
        totalLatencyMs: 128
      }
    },
    schema_mappings: {
      method: 'GET',
      path: '/api/schema-mappings?departmentCode=REV',
      authRequired: 'Bearer JWT (ROLE_DEPARTMENT_OFFICER, ROLE_ADMIN, ROLE_SYSTEM)',
      payload: [
        {
          id: 16,
          departmentCode: "REV",
          departmentName: "Revenue & Forest Department",
          sourceField: "survey_no",
          canonicalField: "land.surveyNumber",
          dataType: "STRING",
          transformationRule: "DIRECT_MAP",
          version: "1.0",
          isActive: true
        },
        {
          id: 17,
          departmentCode: "REV",
          departmentName: "Revenue & Forest Department",
          sourceField: "area_acres",
          canonicalField: "land.areaAcres",
          dataType: "DOUBLE",
          transformationRule: "DIRECT_MAP",
          version: "1.0",
          isActive: true
        }
      ]
    },
    integration_history: {
      method: 'GET',
      path: '/api/integration/history',
      authRequired: 'Bearer JWT (ROLE_DEPARTMENT_OFFICER, ROLE_ADMIN, ROLE_SYSTEM)',
      payload: [
        {
          requestId: "REQ-4B5DB3F0",
          citizenId: "MH-CIT-10001",
          status: "SUCCESS",
          purpose: "SUBSIDY_VERIFICATION",
          departmentResponses: [
            { department: "REVENUE", status: "SUCCESS", responseTimeMs: 120 },
            { department: "AGRICULTURE", status: "SUCCESS", responseTimeMs: 95 },
            { department: "WELFARE", status: "SUCCESS", responseTimeMs: 110 }
          ]
        }
      ]
    },
    consents: {
      method: 'GET',
      path: '/api/consents',
      authRequired: 'Bearer JWT (ROLE_CITIZEN, ROLE_ADMIN, ROLE_SYSTEM)',
      payload: [
        {
          id: 1,
          consentId: "CNS-4A2D1B89",
          citizenId: "MH-CIT-10001",
          citizenName: "Ramesh Tukaram Shinde",
          requestingDepartment: "AGRICULTURE",
          purpose: "SUBSIDY_VERIFICATION",
          status: "ACTIVE",
          scopes: ["IDENTITY", "LOCATION", "LAND", "AGRICULTURE", "WELFARE"],
          createdAt: "2026-08-28T07:00:00Z",
          expiresAt: "2026-11-28T07:00:00Z"
        }
      ]
    },
    audit_logs: {
      method: 'GET',
      path: '/api/audit-logs?citizenId=MH-CIT-10001',
      authRequired: 'Bearer JWT (ROLE_ADMIN, ROLE_SYSTEM)',
      payload: [
        {
          id: 1,
          auditId: "AUD-9F2B3C4D",
          requestId: "REQ-4B5DB3F0",
          citizenId: "MH-CIT-10001",
          requestingUser: "officer.revenue",
          requestingDepartment: "INTEGRATION_GATEWAY",
          targetDepartment: "REVENUE, AGRICULTURE, WELFARE",
          targetService: "/api/integration/request",
          purpose: "SUBSIDY_VERIFICATION",
          dataScope: "IDENTITY, LAND, AGRICULTURE, WELFARE",
          status: "SUCCESS",
          responseTimeMs: 38,
          timestamp: "2026-08-28T07:15:00Z"
        }
      ]
    },
    stats: {
      method: 'GET',
      path: '/api/stats',
      authRequired: 'Bearer JWT (ROLE_ADMIN, ROLE_SYSTEM)',
      payload: statsData || {
        status: 'SUCCESS',
        summary: { totalCitizens: 50, totalDepartments: 3, totalDistricts: 10, totalLandRecords: 50, totalFarmerProfiles: 50, totalWelfareRecords: 50 }
      }
    },
    health: {
      method: 'GET',
      path: '/api/health',
      authRequired: 'Public (No Auth)',
      payload: {
        status: 'UP',
        service: 'MahaSetu Interoperability Platform',
        version: '1.0.0-phase4',
        environment: 'production-ready',
        database: { status: 'CONNECTED', dialect: 'PostgreSQL', entities_loaded: 16, seeder_mode: 'SYNTHETIC_CONSISTENT' }
      }
    },
    auth_me: {
      method: 'GET',
      path: '/api/auth/me',
      authRequired: 'Bearer JWT (Any Authenticated User)',
      payload: user || {
        id: 1,
        username: 'admin',
        email: 'admin@mahasetu.gov.in',
        fullName: 'MahaSetu State Administrator',
        roles: ['ROLE_ADMIN'],
        active: true
      }
    },
    auth_login: {
      method: 'POST',
      path: '/api/auth/login',
      authRequired: 'Public (Username/Email + Password)',
      payload: {
        status: 'SUCCESS',
        message: 'User authenticated successfully',
        accessToken: token ? `${token.substring(0, 30)}...` : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        tokenType: 'Bearer',
        expiresInMs: 86400000,
        user: { username: 'admin', roles: ['ROLE_ADMIN'], fullName: 'MahaSetu State Administrator' }
      }
    }
  };

  const current = endpoints[selectedEndpoint];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(current.payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-300 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-300 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 border border-amber-300">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
                <span>REST API & Security Inspector</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-black">
                  OpenAPI 3.0
                </span>
              </h3>
              <p className="text-xs text-slate-800 font-bold">
                Spring Security 6 • HMAC-SHA256 Token Validation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="p-3 bg-slate-100 border-b border-slate-300 flex flex-wrap items-center gap-2">
          {Object.entries(endpoints).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setSelectedEndpoint(key as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black border transition-all ${
                selectedEndpoint === key
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                  : 'bg-white border-slate-300 text-slate-950 hover:bg-slate-50'
              }`}
            >
              <span className="font-mono text-[10px] uppercase font-black">{value.method}</span>
              <span>{value.path}</span>
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-950 text-xs font-black border border-slate-300 transition-all"
            >
              {copied ? 'Copied JSON!' : 'Copy JSON'}
            </button>
          </div>
        </div>

        {/* Auth Badge */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-800 font-bold">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>Authorization:</span>
            <span className="font-mono font-black text-slate-950">{current.authRequired}</span>
          </div>
          {token && (
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-900 font-mono text-[11px] font-black">
              <span>Active Bearer Token Injected</span>
            </div>
          )}
        </div>

        {/* JSON Code Viewer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-100 font-mono text-xs text-slate-950 font-bold">
          <pre className="whitespace-pre-wrap leading-relaxed font-mono font-bold text-slate-950">
            {JSON.stringify(current.payload, null, 2)}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 px-6 border-t border-slate-300 bg-slate-50 flex items-center justify-between text-xs text-slate-800 font-bold">
          <div className="flex items-center gap-3">
            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-colors"
            >
              <span>Open Swagger UI</span>
              <span className="text-[10px] opacity-80">↗</span>
            </a>
            <span className="hidden sm:inline text-slate-500">Interactive OpenAPI 3.0 API Playground</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-950 font-black transition-all border border-slate-300"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
