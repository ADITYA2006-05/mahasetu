import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ConsentItem, CreateConsentPayload } from '../types';
import { API_BASE_URL } from '../config/api';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Info, 
  Lock 
} from 'lucide-react';

export const CitizenConsentsPage: React.FC = () => {
  const { token, user } = useAuth();

  const [consents, setConsents] = useState<ConsentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'REVOKED' | 'EXPIRED'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalSubmitting, setModalSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [requestingDept, setRequestingDept] = useState<string>('ALL');
  const [purpose, setPurpose] = useState<string>('SUBSIDY_VERIFICATION');
  const [selectedScopes, setSelectedScopes] = useState<{ [key: string]: boolean }>({
    IDENTITY: true,
    LOCATION: true,
    LAND: true,
    AGRICULTURE: true,
    WELFARE: true,
  });
  const [validityDays, setValidityDays] = useState<number>(90);

  const fetchConsents = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/consents`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch consent records');
      const data: ConsentItem[] = await res.json();
      setConsents(data);
    } catch (err: any) {
      setError(err.message || 'Error loading consents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, [token]);

  const handleRevoke = async (id: number, consentId: string) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to revoke consent agreement ${consentId}? Government departments will no longer be able to query your data under this agreement.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/consents/${id}/revoke`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to revoke consent agreement');
      await fetchConsents();
    } catch (err: any) {
      alert(`Error revoking consent: ${err.message}`);
    }
  };

  const handleCreateConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const scopes = Object.keys(selectedScopes).filter(k => selectedScopes[k]);
    if (scopes.length === 0) {
      setModalError('Please select at least one data scope.');
      return;
    }

    setModalSubmitting(true);
    setModalError(null);

    const payload: CreateConsentPayload = {
      requestingDepartment: requestingDept,
      purpose,
      scopes,
      validityDays,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/consents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to grant consent agreement');
      }

      setIsModalOpen(false);
      await fetchConsents();
    } catch (err: any) {
      setModalError(err.message || 'Error granting consent');
    } finally {
      setModalSubmitting(false);
    }
  };

  const filteredConsents = consents.filter(c => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const activeCount = consents.filter(c => c.status === 'ACTIVE').length;
  const revokedCount = consents.filter(c => c.status === 'REVOKED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-6 text-white border border-emerald-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Citizen Sovereignty & Consent Framework (Phase 6)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Citizen Data Sharing Consents
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">
              You own your data. Government departments can only query your records when you have granted an active, purpose-bound, and time-limited consent agreement.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Grant New Consent
            </button>
            <button
              onClick={fetchConsents}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Refresh Consents"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Active Consents</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{activeCount}</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Revoked Agreements</span>
            <div className="text-2xl font-black text-rose-400 mt-0.5">{revokedCount}</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Citizen Master ID</span>
            <div className="text-sm font-mono font-black text-amber-300 mt-1">{user?.citizenId || 'MH-CIT-10001'}</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Privacy Policy</span>
            <div className="text-xs font-bold text-sky-400 mt-1 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Purpose Bound
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          {(['ALL', 'ACTIVE', 'REVOKED', 'EXPIRED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab === 'ALL' ? `All Consents (${consents.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Consents List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">Loading citizen consent agreements...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          {error}
        </div>
      ) : filteredConsents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-900">No Consent Agreements Found</h3>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto font-medium">
            {statusFilter === 'ALL' 
              ? "You haven't granted any data-sharing consents yet. Click '+ Grant New Consent' to allow authorized government services to query your records."
              : `No consent records match the '${statusFilter}' filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConsents.map(consent => {
            const isActive = consent.status === 'ACTIVE';
            const isRevoked = consent.status === 'REVOKED';

            return (
              <div 
                key={consent.id}
                className={`bg-white rounded-2xl p-5 border transition-all shadow-sm flex flex-col justify-between ${
                  isActive 
                    ? 'border-emerald-300 hover:border-emerald-400 ring-1 ring-emerald-100' 
                    : isRevoked 
                      ? 'border-rose-200 bg-slate-50/50' 
                      : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div>
                  {/* Top Bar: Consent ID & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                        {consent.consentId}
                      </span>
                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isActive 
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                          : isRevoked 
                            ? 'bg-rose-100 text-rose-900 border border-rose-300' 
                            : 'bg-slate-200 text-slate-800 border border-slate-300'
                      }`}>
                        {isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <XCircle className="w-3 h-3 text-rose-700" />}
                        {consent.status}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-slate-500">
                      Dept: <strong className="text-slate-900">{consent.requestingDepartment}</strong>
                    </span>
                  </div>

                  {/* Purpose Box */}
                  <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200/80 mb-3">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Authorized Purpose</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-emerald-700" />
                      {consent.purpose}
                    </div>
                  </div>

                  {/* Approved Scopes */}
                  <div className="mb-4">
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Approved Data Scopes</div>
                    <div className="flex flex-wrap gap-1.5">
                      {consent.scopes?.map(scope => (
                        <span 
                          key={scope}
                          className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer: Dates & Actions */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <div className="text-[11px] text-slate-500 font-medium">
                    {isActive ? (
                      <span className="flex items-center gap-1 text-slate-700">
                        <Clock className="w-3 h-3 text-emerald-600" /> Expires: {new Date(consent.expiresAt).toLocaleDateString('en-IN')}
                      </span>
                    ) : isRevoked ? (
                      <span className="text-rose-700 font-bold">
                        Revoked on {consent.revokedAt ? new Date(consent.revokedAt).toLocaleDateString('en-IN') : 'N/A'}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-bold">Expired</span>
                    )}
                  </div>

                  {isActive && (
                    <button
                      onClick={() => handleRevoke(consent.id, consent.consentId)}
                      className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-black text-xs border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Revoke Consent
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grant New Consent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-300 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">Grant Data Sharing Consent</h3>
                  <p className="text-xs text-slate-600 font-medium">Authorize purposeful data access for government schemes</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateConsent} className="space-y-4 mt-4 text-xs font-bold text-slate-800">
              {/* Requesting Department */}
              <div>
                <label className="block text-slate-900 mb-1">Requesting Government Department</label>
                <select
                  value={requestingDept}
                  onChange={e => setRequestingDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">All Departments (Federated Interoperability Gateway)</option>
                  <option value="AGRICULTURE">Department of Agriculture (AGR)</option>
                  <option value="REVENUE">Revenue & Forest Department (REV)</option>
                  <option value="WELFARE">Social Justice & Welfare (WEL)</option>
                </select>
              </div>

              {/* Purpose Selection */}
              <div>
                <label className="block text-slate-900 mb-1">Authorized Purpose</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 mb-2 uppercase"
                  placeholder="e.g. SUBSIDY_VERIFICATION"
                  required
                />
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'SUBSIDY_VERIFICATION',
                    'DIRECT_BENEFIT_TRANSFER',
                    'SCHEME_ENROLLMENT',
                    'LAND_RECORD_AUDIT',
                    'LOAN_SANCTION_INQUIRY',
                  ].map(p => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPurpose(p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        purpose === p 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scope Checkboxes */}
              <div>
                <label className="block text-slate-900 mb-1.5">Approved Data Scopes (Privacy Limitation)</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {[
                    { key: 'IDENTITY', label: 'Identity (Name & Citizen ID)', desc: 'Basic citizen identity record' },
                    { key: 'LOCATION', label: 'Location (District, Taluka, Village)', desc: 'Geographic location hierarchy' },
                    { key: 'LAND', label: 'Land Records (7/12 & Survey No)', desc: 'Landholding acreage & survey plots' },
                    { key: 'AGRICULTURE', label: 'Agriculture (Crop & Season)', desc: 'Farming crop profile & land usage' },
                    { key: 'WELFARE', label: 'Welfare (DBT & Schemes)', desc: 'Pension & direct financial benefits' },
                  ].map(sc => (
                    <label key={sc.key} className="flex items-start gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-100">
                      <input
                        type="checkbox"
                        checked={!!selectedScopes[sc.key]}
                        onChange={e => setSelectedScopes({ ...selectedScopes, [sc.key]: e.target.checked })}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="text-slate-900 font-black">{sc.label}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{sc.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Validity Days */}
              <div>
                <label className="block text-slate-900 mb-1">Validity Period (Days)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={validityDays}
                    onChange={e => setValidityDays(Number(e.target.value))}
                    min={1}
                    max={365}
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex gap-1.5">
                    {[30, 90, 180, 365].map(d => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setValidityDays(d)}
                        className={`px-2.5 py-1 rounded text-xs font-bold border ${
                          validityDays === d 
                            ? 'bg-slate-900 text-white border-slate-900' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  {modalSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Grant Agreement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
