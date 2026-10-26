import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import Papa from 'papaparse';
import {
  Download,
  RefreshCw,
} from 'lucide-react';

export const AuditReports = () => {
  const { user, isAicteAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

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
      User: e.user ? `${e.user.name} (${e.user.email})` : 'System',
      Role: e.user?.role || 'SYSTEM',
      Institution: e.institution?.name || 'AICTE Apex / Central',
      IPAddress: e.ipAddress || '127.0.0.1',
      Details: e.details || '',
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AICTE_APAARSetu_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
              Immutable Governance Trail
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">{events.length} Events Logged</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Security Audit Trail & Governance Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full compliance record of student enrolments, batch commits, case reviews, credential issuances, and user logins.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="">All Actions</option>
            <option value="USER_LOGIN">User Logins</option>
            <option value="STUDENT_CREATE">Student Admissions</option>
            <option value="BULK_UPLOAD_COMMITTED">Bulk Uploads</option>
            <option value="REVIEW_CASE_UPDATED">Case Resolutions</option>
            <option value="CREDENTIAL_ISSUED">Credential Issuances</option>
            <option value="CREDENTIAL_REVOKED">Credential Revocations</option>
          </select>

          <button
            onClick={handleExportCSV}
            disabled={events.length === 0}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Audit Events Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Loading audit ledger...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No audit records found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3">Actor / User</th>
                  <th className="px-4 py-3">Institution</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-sans font-bold text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {evt.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 font-sans font-medium">
                      {evt.entityType}
                    </td>
                    <td className="px-4 py-2.5 font-sans">
                      <div className="font-semibold text-slate-900">{evt.user?.name || 'System Auto'}</div>
                      <div className="text-[10px] text-slate-500">{evt.user?.email || 'SYSTEM'}</div>
                    </td>
                    <td className="px-4 py-2.5 font-sans text-slate-700">
                      {evt.institution?.name || 'AICTE Apex HQ'}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{evt.ipAddress || '127.0.0.1'}</td>
                    <td className="px-4 py-2.5 text-slate-600 font-sans text-[11px] max-w-xs truncate">
                      {evt.details ? evt.details : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
