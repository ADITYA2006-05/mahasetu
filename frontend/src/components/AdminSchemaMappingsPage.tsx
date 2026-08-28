import React, { useState, useEffect } from 'react';
import { 
  GitMerge, 
  Plus, 
  Search, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Code, 
  ArrowRight, 
  Layers,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SchemaMappingItem } from '../types';

export const AdminSchemaMappingsPage: React.FC = () => {
  const { token, user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SYSTEM');

  const [mappings, setMappings] = useState<SchemaMappingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMapping, setEditingMapping] = useState<SchemaMappingItem | null>(null);
  const [formData, setFormData] = useState<{
    departmentCode: string;
    sourceField: string;
    canonicalField: string;
    dataType: string;
    transformationRule: string;
    version: string;
    description: string;
    isActive: boolean;
  }>({
    departmentCode: 'REV',
    sourceField: '',
    canonicalField: '',
    dataType: 'STRING',
    transformationRule: 'DIRECT_MAP',
    version: '1.0',
    description: '',
    isActive: true
  });

  // Simulator / Sandbox State
  const [sandboxDept, setSandboxDept] = useState<string>('REV');
  const [sandboxPayload, setSandboxPayload] = useState<string>(
    JSON.stringify({
      citizen_name: "Ramesh Tukaram Shinde",
      district_name: "Pune",
      taluka_name: "Haveli",
      village_name: "Wagholi",
      survey_no: "SN-101",
      area_acres: 1.98
    }, null, 2)
  );
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [sandboxLoading, setSandboxLoading] = useState<boolean>(false);
  const [sandboxError, setSandboxError] = useState<string | null>(null);

  const fetchMappings = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const url = selectedDept === 'ALL' 
        ? '/api/schema-mappings' 
        : `/api/schema-mappings?departmentCode=${selectedDept}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMappings(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || 'Failed to load schema mappings');
      }
    } catch (e: any) {
      setError(e.message || 'Network error fetching schema mappings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [selectedDept, token]);

  const handleOpenCreateModal = () => {
    setEditingMapping(null);
    setFormData({
      departmentCode: selectedDept === 'ALL' ? 'REV' : selectedDept,
      sourceField: '',
      canonicalField: '',
      dataType: 'STRING',
      transformationRule: 'DIRECT_MAP',
      version: '1.0',
      description: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: SchemaMappingItem) => {
    setEditingMapping(item);
    setFormData({
      departmentCode: item.departmentCode,
      sourceField: item.sourceField,
      canonicalField: item.canonicalField,
      dataType: item.dataType || 'STRING',
      transformationRule: item.transformationRule || 'DIRECT_MAP',
      version: item.version || '1.0',
      description: item.description || '',
      isActive: item.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleSaveMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !isAdmin) return;

    try {
      const url = editingMapping?.id 
        ? `/api/schema-mappings/${editingMapping.id}` 
        : '/api/schema-mappings';
      const method = editingMapping?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchMappings();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to save schema mapping');
      }
    } catch (e: any) {
      alert(e.message || 'Error saving schema mapping');
    }
  };

  const handleDeleteMapping = async (id?: number) => {
    if (!id || !token || !isAdmin) return;
    if (!window.confirm('Are you sure you want to delete this schema mapping rule?')) return;

    try {
      const res = await fetch(`/api/schema-mappings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMappings();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to delete schema mapping');
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting schema mapping');
    }
  };

  const handleRunSandbox = async () => {
    if (!token) return;
    setSandboxLoading(true);
    setSandboxError(null);
    setSandboxResult(null);

    try {
      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(sandboxPayload);
      } catch (jsonErr: any) {
        setSandboxError('Invalid JSON format: ' + jsonErr.message);
        setSandboxLoading(false);
        return;
      }

      const res = await fetch('/api/schema-mappings/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          departmentCode: sandboxDept,
          rawData: parsedPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSandboxResult(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setSandboxError(err.message || 'Transformation failed');
      }
    } catch (e: any) {
      setSandboxError(e.message || 'Error executing transformation');
    } finally {
      setSandboxLoading(false);
    }
  };

  const handleSandboxPreset = (dept: string) => {
    setSandboxDept(dept);
    if (dept === 'REV') {
      setSandboxPayload(JSON.stringify({
        citizen_name: "Ramesh Tukaram Shinde",
        district_name: "Pune",
        taluka_name: "Haveli",
        village_name: "Wagholi",
        survey_no: "SN-101",
        area_acres: 1.98
      }, null, 2));
    } else if (dept === 'AGR') {
      setSandboxPayload(JSON.stringify({
        farmerName: "Ramesh Tukaram Shinde",
        district: "Pune",
        landSurveyNumber: "SN-101",
        cropName: "Cotton",
        season: "Kharif",
        landUsage: "0.8000 Ha"
      }, null, 2));
    } else if (dept === 'WEL') {
      setSandboxPayload(JSON.stringify({
        beneficiary_name: "Ramesh Tukaram Shinde",
        scheme_code: "SCH-SGNY-01",
        scheme_name: "Sanjay Gandhi Niradhar Anudan Yojana",
        previous_benefit: true,
        application_status: "APPROVED",
        benefit_amount: 1500.0
      }, null, 2));
    }
    setSandboxResult(null);
    setSandboxError(null);
  };

  const filteredMappings = mappings.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.sourceField?.toLowerCase().includes(q) ||
      m.canonicalField?.toLowerCase().includes(q) ||
      m.departmentCode?.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q);
  });

  const activeCount = mappings.filter(m => m.isActive !== false).length;
  const canonicalCount = mappings.filter(m => m.entityType === 'CANONICAL_MAPPING').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <GitMerge className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Schema Mapping & Canonical Data Engine</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Phase 5 Standard
                </span>
              </h1>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Dynamic PostgreSQL Semantic Rules Engine • Transforming Legacy Department Payloads into Standardized MahaSetu Models
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Mapping Rule</span>
            </button>
          )}
          <button
            onClick={fetchMappings}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Refresh Mappings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Total Configured Rules</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{mappings.length}</p>
          <span className="text-[11px] text-slate-500 font-medium">Loaded from PostgreSQL</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Active Rules</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Currently in service pipeline</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Canonical Rules</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-1">{canonicalCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">MahaSetu target model mappings</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Federated Departments</span>
            <GitMerge className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-sky-700 mt-1">3 Nodes</p>
          <span className="text-[11px] text-slate-500 font-medium">Revenue, Agriculture, Welfare</span>
        </div>
      </div>

      {/* Live Transformation Simulator Sandbox */}
      <div className="p-5 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-black text-slate-900">Live Semantic Transformation Simulator</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-300">
              Interactive Sandbox
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Load Preset:</span>
            <button
              onClick={() => handleSandboxPreset('REV')}
              className={`px-2.5 py-1 rounded text-xs font-black border transition-all ${
                sandboxDept === 'REV' ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300'
              }`}
            >
              Revenue 7/12
            </button>
            <button
              onClick={() => handleSandboxPreset('AGR')}
              className={`px-2.5 py-1 rounded text-xs font-black border transition-all ${
                sandboxDept === 'AGR' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300'
              }`}
            >
              Agriculture
            </button>
            <button
              onClick={() => handleSandboxPreset('WEL')}
              className={`px-2.5 py-1 rounded text-xs font-black border transition-all ${
                sandboxDept === 'WEL' ? 'bg-sky-600 text-white border-sky-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300'
              }`}
            >
              Welfare
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Input Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Source Legacy Department Payload ({sandboxDept}):</span>
              <span className="text-slate-500 font-mono">Raw JSON</span>
            </div>
            <textarea
              rows={8}
              value={sandboxPayload}
              onChange={(e) => setSandboxPayload(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              spellCheck={false}
            />
            <div className="flex justify-end">
              <button
                onClick={handleRunSandbox}
                disabled={sandboxLoading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Play className={`w-3.5 h-3.5 ${sandboxLoading ? 'animate-spin' : ''}`} />
                <span>{sandboxLoading ? 'Transforming...' : 'Test Transform'}</span>
              </button>
            </div>
          </div>

          {/* Right: Transformed Canonical Model */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Transformed MahaSetu Canonical Model:</span>
              <span className="text-indigo-600 font-mono">Standardized Tree</span>
            </div>
            <div className="h-[218px] p-3 rounded-xl bg-slate-950 text-indigo-300 font-mono text-xs border border-slate-800 overflow-y-auto shadow-inner">
              {sandboxError ? (
                <div className="text-rose-400 flex items-center gap-2 p-2 bg-rose-950/40 rounded border border-rose-800">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{sandboxError}</span>
                </div>
              ) : sandboxResult ? (
                <pre className="whitespace-pre-wrap">{JSON.stringify(sandboxResult, null, 2)}</pre>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-center">
                  <p>Click "Test Transform" to view live canonical data conversion.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Department Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all ${
              selectedDept === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
            }`}
          >
            All Departments ({mappings.length})
          </button>
          <button
            onClick={() => setSelectedDept('REV')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all ${
              selectedDept === 'REV'
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
            }`}
          >
            Revenue (REV)
          </button>
          <button
            onClick={() => setSelectedDept('AGR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all ${
              selectedDept === 'AGR'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
            }`}
          >
            Agriculture (AGR)
          </button>
          <button
            onClick={() => setSelectedDept('WEL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all ${
              selectedDept === 'WEL'
                ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
            }`}
          >
            Social Welfare (WEL)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search field or path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Main Mapping Rules Table */}
      <div className="rounded-2xl bg-white border border-slate-300 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900">Configured Schema Mapping Rules</h3>
            <span className="text-xs text-slate-500">({filteredMappings.length} rules matching)</span>
          </div>
          {!isAdmin && (
            <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              Read-Only Officer View (Admin required for CRUD)
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-600">Loading schema mappings from PostgreSQL...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-xs font-bold">
            {error}
          </div>
        ) : filteredMappings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold">
            No schema mappings found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-4">Dept</th>
                  <th className="py-3 px-4">Legacy Source Field</th>
                  <th className="py-3 px-4 text-center">Transform</th>
                  <th className="py-3 px-4">Canonical Target Path</th>
                  <th className="py-3 px-4">Data Type</th>
                  <th className="py-3 px-4">Rule</th>
                  <th className="py-3 px-4">Ver</th>
                  <th className="py-3 px-4">Status</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs font-bold text-slate-800">
                {filteredMappings.map((m) => {
                  const isRev = m.departmentCode === 'REV';
                  const isAgr = m.departmentCode === 'AGR';
                  const isWel = m.departmentCode === 'WEL';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      {/* Department Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isRev ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          isAgr ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                          isWel ? 'bg-sky-100 text-sky-900 border border-sky-300' :
                          'bg-slate-100 text-slate-900 border border-slate-300'
                        }`}>
                          {m.departmentCode}
                        </span>
                      </td>

                      {/* Source Field */}
                      <td className="py-3 px-4 font-mono font-black text-slate-900">
                        {m.sourceField}
                      </td>

                      {/* Transform Arrow */}
                      <td className="py-3 px-4 text-center text-indigo-500">
                        <ArrowRight className="w-4 h-4 mx-auto inline" />
                      </td>

                      {/* Canonical Target Field */}
                      <td className="py-3 px-4 font-mono font-black text-indigo-700">
                        {m.canonicalField}
                      </td>

                      {/* Data Type */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                          m.dataType === 'DOUBLE' || m.dataType === 'NUMBER' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                          m.dataType === 'BOOLEAN' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          'bg-slate-100 text-slate-800 border border-slate-300'
                        }`}>
                          {m.dataType || 'STRING'}
                        </span>
                      </td>

                      {/* Rule */}
                      <td className="py-3 px-4 text-[11px] font-mono text-slate-600">
                        {m.transformationRule || 'DIRECT_MAP'}
                      </td>

                      {/* Version */}
                      <td className="py-3 px-4 text-[11px] font-mono text-slate-500">
                        v{m.version || '1.0'}
                      </td>

                      {/* Active Status */}
                      <td className="py-3 px-4">
                        {m.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-slate-400">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Disabled</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      {isAdmin && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(m)}
                              className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Edit Mapping"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMapping(m.id)}
                              className="p-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                              title="Delete Mapping"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Mapping Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-300 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-indigo-600" />
                <span>{editingMapping ? 'Edit Schema Mapping Rule' : 'Create New Schema Mapping Rule'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMapping} className="p-5 space-y-4 text-xs font-bold">
              {/* Department Select */}
              <div>
                <label className="block text-slate-700 mb-1">Source Department</label>
                <select
                  value={formData.departmentCode}
                  onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="REV">Revenue & Forest Department (REV)</option>
                  <option value="AGR">Department of Agriculture (AGR)</option>
                  <option value="WEL">Social Justice & Welfare Department (WEL)</option>
                </select>
              </div>

              {/* Source Field */}
              <div>
                <label className="block text-slate-700 mb-1">Legacy Source Field Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. survey_no, farmerName, benefit_amount"
                  value={formData.sourceField}
                  onChange={(e) => setFormData({ ...formData, sourceField: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Canonical Field */}
              <div>
                <label className="block text-slate-700 mb-1">Target Canonical Path (Dot-Notation)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. land.surveyNumber, citizen.name, welfare.benefitAmount"
                  value={formData.canonicalField}
                  onChange={(e) => setFormData({ ...formData, canonicalField: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Data Type */}
                <div>
                  <label className="block text-slate-700 mb-1">Target Data Type</label>
                  <select
                    value={formData.dataType}
                    onChange={(e) => setFormData({ ...formData, dataType: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="STRING">STRING</option>
                    <option value="DOUBLE">DOUBLE / NUMBER</option>
                    <option value="INTEGER">INTEGER</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                  </select>
                </div>

                {/* Rule */}
                <div>
                  <label className="block text-slate-700 mb-1">Transformation Rule</label>
                  <select
                    value={formData.transformationRule}
                    onChange={(e) => setFormData({ ...formData, transformationRule: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DIRECT_MAP">DIRECT_MAP</option>
                    <option value="FEDERATED_KEY">FEDERATED_KEY</option>
                    <option value="STATUS_BOOLEAN">STATUS_BOOLEAN</option>
                    <option value="TIER_MAPPING">TIER_MAPPING</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 mb-1">Rule Documentation / Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300"
                />
                <label htmlFor="isActiveToggle" className="text-slate-700 cursor-pointer">
                  Activate this mapping rule in live engine
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-sm"
                >
                  {editingMapping ? 'Update Mapping' : 'Create Mapping'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
