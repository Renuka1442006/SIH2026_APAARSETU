import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  CheckSquare,
  FileSpreadsheet,
  AlertOctagon,
  Calendar,
  User,
  Eye,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export const ValidationResults = () => {
  const { user, isAicteAdmin } = useAuth();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issueFilter, setIssueFilter] = useState('');

  const loadBatches = async () => {
    try {
      setLoading(true);
      const res = await api.getUploadBatches(isAicteAdmin ? undefined : user?.institutionId);
      setBatches(res || []);
      if (res && res.length > 0 && !selectedBatch) {
        loadBatchDetails(res[0].id);
      }
    } catch (err) {
      console.error('Failed to load upload batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBatchDetails = async (id) => {
    try {
      const b = await api.getUploadBatchById(id);
      setSelectedBatch(b);
    } catch (err) {
      console.error('Failed to load batch details:', err);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const issues = selectedBatch?.validationIssues || [];
  const filteredIssues = issueFilter
    ? issues.filter((i) => i.issueType === issueFilter)
    : issues;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Audit & Diagnostics
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-medium">{batches.length} Upload Batches Archived</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
          Batch Validation History & Anomaly Diagnostics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Inspect past batch verification outcomes, forensic duplicate logs, and excess quota flags.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Past Batches List */}
        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Archived Upload Batches</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {batches.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No upload batches recorded yet.
              </div>
            ) : (
              batches.map((b) => (
                <div
                  key={b.id}
                  onClick={() => loadBatchDetails(b.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedBatch?.id === b.id
                      ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                      : 'bg-slate-50/50 hover:bg-slate-100/60 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 truncate max-w-[180px]">
                      {b.fileName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-medium">
                      {b.academicYear}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1">
                    {b.institution?.name || 'Institution'}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200/60">
                    <div className="space-x-1.5">
                      <span className="text-emerald-700 font-bold">✓ {b.acceptedRows}</span>
                      <span className="text-red-600 font-bold">✗ {b.rejectedRows}</span>
                      <span className="text-amber-700 font-bold">⚠ {b.warningRows}</span>
                    </div>
                    <span className="text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Selected Batch Diagnostics */}
        <div className="lg:col-span-8 space-y-4">
          {selectedBatch ? (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedBatch.fileName}</h2>
                  <p className="text-xs text-slate-500">
                    Uploaded by <strong className="text-slate-700">{selectedBatch.uploadedByUser?.name}</strong> •{' '}
                    {new Date(selectedBatch.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Filter by Issue Type */}
                <div className="flex items-center space-x-2 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={issueFilter}
                    onChange={(e) => setIssueFilter(e.target.value)}
                    className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none"
                  >
                    <option value="">All Diagnostics</option>
                    <option value="CROSS_INSTITUTION_DUPLICATE">Cross-Institution Collision</option>
                    <option value="INTAKE_EXCEEDED">Intake Capacity Exceeded</option>
                    <option value="FILE_DUPLICATE">Duplicate in File</option>
                    <option value="DB_DUPLICATE">Duplicate in Database</option>
                    <option value="MISSING_APAAR">Missing APAAR</option>
                    <option value="INVALID_FORMAT">Invalid Format</option>
                  </select>
                </div>
              </div>

              {/* Batch Metrics Pills */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Rows</div>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">{selectedBatch.totalRows}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] text-emerald-800 font-semibold uppercase">Accepted</div>
                  <div className="text-lg font-extrabold text-emerald-700 mt-0.5">{selectedBatch.acceptedRows}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200">
                  <div className="text-[10px] text-red-800 font-semibold uppercase">Rejected</div>
                  <div className="text-lg font-extrabold text-red-600 mt-0.5">{selectedBatch.rejectedRows}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="text-[10px] text-amber-800 font-semibold uppercase">Warnings</div>
                  <div className="text-lg font-extrabold text-amber-700 mt-0.5">{selectedBatch.warningRows}</div>
                </div>
              </div>

              {/* Issues Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-3 py-2">Row #</th>
                      <th className="px-3 py-2">Student Name</th>
                      <th className="px-3 py-2">APAAR ID</th>
                      <th className="px-3 py-2">Issue Type</th>
                      <th className="px-3 py-2">Diagnostic Detail</th>
                      <th className="px-3 py-2 text-center">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredIssues.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                          No issues reported for this filter.
                        </td>
                      </tr>
                    ) : (
                      filteredIssues.map((iss) => {
                        const isCross = iss.issueType === 'CROSS_INSTITUTION_DUPLICATE';
                        return (
                          <tr
                            key={iss.id}
                            className={`hover:bg-slate-50 transition-colors ${
                              isCross ? 'bg-red-50/50' : ''
                            }`}
                          >
                            <td className="px-3 py-2 font-mono text-slate-500">{iss.rowNumber || '—'}</td>
                            <td className="px-3 py-2 font-semibold text-slate-900">{iss.studentName || 'Batch Level'}</td>
                            <td className="px-3 py-2 font-mono text-slate-700">{iss.apaarId || 'N/A'}</td>
                            <td className="px-3 py-2">
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                                {iss.issueType}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-700 max-w-xs">{iss.message}</td>
                            <td className="px-3 py-2 text-center">
                              {iss.severity === 'ERROR' && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-800 border border-red-300">
                                  ERROR
                                </span>
                              )}
                              {iss.severity === 'WARNING' && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  WARNING
                                </span>
                              )}
                              {iss.severity === 'INFO' && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                  INFO
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
              Select an upload batch on the left to inspect diagnostics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
