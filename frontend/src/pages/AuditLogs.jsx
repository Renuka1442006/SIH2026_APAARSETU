import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import Papa from 'papaparse';
import {
  History,
  Download,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  Building,
  User,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const AuditLogs = () => {
  const { user, isAicteAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportNotice, setExportNotice] = useState(null);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const params = { limit: '100' };
      if (actionFilter) params.action = actionFilter;
      if (!isAicteAdmin && user?.institutionId) {
        params.institutionId = user.institutionId;
      }
      const res = await api.getAuditEvents(params);
      setEvents(res.events || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [actionFilter]);

  const handleExportCSV = () => {
    if (events.length === 0) return;
    const exportData = events.map((e) => ({
      Timestamp: new Date(e.timestamp).toISOString(),
      Action: e.action,
      EntityType: e.entityType,
      EntityID: e.entityId || 'N/A',
      Actor: e.user ? `${e.user.name} (${e.user.email})` : 'System Daemon',
      Role: e.user?.role || 'SYSTEM',
      Institution: e.institution?.name || 'AICTE Apex HQ',
      IPAddress: e.ipAddress || '127.0.0.1',
      Details: e.details || '',
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AICTE_APAARSetu_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Security audit ledger exported to CSV.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Filter events by search query
  const filteredEvents = events.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.action?.toLowerCase().includes(q) ||
      e.user?.name?.toLowerCase().includes(q) ||
      e.user?.email?.toLowerCase().includes(q) ||
      e.institution?.name?.toLowerCase().includes(q) ||
      e.details?.toLowerCase().includes(q) ||
      e.ipAddress?.includes(q)
    );
  });

  const getActionBadge = (action) => {
    switch (action) {
      case 'USER_LOGIN':
        return { label: 'Login Event', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'STUDENT_CREATE':
        return { label: 'Student Registered', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'BULK_UPLOAD_COMMITTED':
        return { label: 'Batch Committed', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'REVIEW_CASE_UPDATED':
        return { label: 'Adjudication Logged', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'CREDENTIAL_ISSUED':
        return { label: 'Credential Issued', bg: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'CREDENTIAL_REVOKED':
        return { label: 'Credential Revoked', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: action, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-gov-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300 flex items-center space-x-1">
              <Lock className="w-3 h-3 text-slate-600" />
              <span>Immutable Regulatory Security Ledger</span>
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">{events.length} Recorded Transactions</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gov-navy mt-1 tracking-tight">
            Security Audit Trail & Governance Activity
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically sealed timeline of admissions, duplicate collision resolutions, and credential authentications.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 bg-gov-page border border-gov-border rounded-lg px-2.5 py-1.5 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actor, action, details..."
              className="bg-transparent text-slate-800 focus:outline-none placeholder:text-slate-400 text-xs w-36 sm:w-48"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-gov-page border border-gov-border rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">All Action Types</option>
              <option value="USER_LOGIN">User Logins</option>
              <option value="STUDENT_CREATE">Single Admissions</option>
              <option value="BULK_UPLOAD_COMMITTED">Batch Intake Commits</option>
              <option value="REVIEW_CASE_UPDATED">Case Adjudications</option>
              <option value="CREDENTIAL_ISSUED">Credential Issuances</option>
              <option value="CREDENTIAL_REVOKED">Credential Revocations</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={events.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gov-navy hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadAuditLogs}
            className="p-1.5 rounded-lg border border-gov-border bg-gov-page hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-gov-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gov-navy" />
            <p className="text-xs">Fetching cryptographic audit entries...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No matching audit events</p>
            <p className="text-xs text-slate-400 mt-1">Adjust search parameters or action filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gov-page border-b border-gov-border text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-4">Timestamp (IST)</th>
                  <th className="py-2.5 px-4">Action Event</th>
                  <th className="py-2.5 px-4">Actor & Role</th>
                  <th className="py-2.5 px-4">Institution Context</th>
                  <th className="py-2.5 px-4">Transaction Details</th>
                  <th className="py-2.5 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEvents.map((evt) => {
                  const b = getActionBadge(evt.action);
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap text-[11px]">
                        {new Date(evt.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border ${b.bg}`}>
                          {b.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {evt.user?.name || 'System Daemon'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {evt.user?.email || 'system@aicte.gov.in'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 truncate max-w-[180px]">
                          {evt.institution?.name || 'AICTE Apex HQ'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {evt.institution?.code ? `Code: ${evt.institution.code}` : 'Central Authority'}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <span className="font-mono text-slate-700 text-[11px] leading-relaxed break-words">
                          {evt.details}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">
                        {evt.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Immutable Proof Ledger Note */}
      <div className="bg-slate-50 border border-gov-border rounded-xl p-4 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            <strong>Statutory Compliance Ledger:</strong> All audit records are write-once, append-only, and protected against retro-modification.
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">HASH: SHA256-LEAF-CHAIN</span>
      </div>
    </div>
  );
};

export default AuditLogs;
