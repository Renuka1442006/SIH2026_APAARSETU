import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { StatusBadge } from '../components/Badge.jsx';
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  UserCheck,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  X,
  FileText,
  Gavel,
  History,
} from 'lucide-react';

export const VerificationCases = () => {
  const { user, isAicteAdmin, isVerifier } = useAuth();
  const [searchParams] = useSearchParams();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeCase, setActiveCase] = useState(null);
  const [newStatus, setNewStatus] = useState('RESOLVED');
  const [reviewerRemarks, setReviewerRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);

  const loadCases = async () => {
    try {
      setLoading(true);
      const res = await api.getReviewCases(
        statusFilter || undefined,
        isAicteAdmin || isVerifier ? undefined : user?.institutionId
      );
      setCases(res || []);

      const caseIdParam = searchParams.get('caseId');
      if (caseIdParam && res) {
        const found = res.find((c) => c.id === caseIdParam);
        if (found) {
          handleOpenReview(found);
        }
      }
    } catch (err) {
      console.error('Failed to load review cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [statusFilter]);

  const handleOpenReview = async (caseItem) => {
    try {
      const fullCase = await api.getReviewCaseById(caseItem.id);
      setActiveCase(fullCase);
      setNewStatus(fullCase.status === 'UNDER_REVIEW' ? 'RESOLVED' : fullCase.status);
      setReviewerRemarks(fullCase.reviewerRemarks || '');
      setUpdateError(null);
      setUpdateSuccess(null);
    } catch (e) {
      console.error(e);
      setActiveCase(caseItem);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!activeCase) return;
    try {
      setUpdating(true);
      setUpdateError(null);
      await api.updateReviewCase(activeCase.id, {
        status: newStatus,
        reviewerRemarks,
      });
      setUpdateSuccess('Official regulatory decision committed. Audit event created.');
      loadCases();
      setTimeout(() => {
        setActiveCase(null);
        setUpdateSuccess(null);
      }, 1500);
    } catch (err) {
      setUpdateError(err.message || 'Failed to update review status.');
    } finally {
      setUpdating(false);
    }
  };

  // Filter cases by search and severity
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.student?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.student?.apaarId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = !severityFilter || c.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-gov-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Regulatory Adjudication Queue
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">{cases.length} Total Matters</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gov-navy mt-1 tracking-tight">
            Verification Cases & Compliance Review
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritized adjudication queue for duplicate enrolments, missing APAAR credentials, and excess intake.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 bg-gov-page border border-gov-border rounded-lg px-2.5 py-1.5 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case, student, APAAR..."
              className="bg-transparent text-slate-800 focus:outline-none placeholder:text-slate-400 text-xs w-36 sm:w-48"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-gov-page border border-gov-border rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REQUIRING_CORRECTION">Requires Correction</option>
              <option value="ESCALATED">Escalated</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-gov-page border border-gov-border rounded-lg px-2.5 py-1.5 text-xs">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <button
            onClick={loadCases}
            className="p-1.5 rounded-lg border border-gov-border bg-gov-page hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cases Queue Table */}
      <div className="bg-white rounded-xl border border-gov-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gov-navy" />
            <p className="text-xs">Loading compliance review cases...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No review cases matching filter</p>
            <p className="text-xs text-slate-400 mt-1">
              All student records are verified and compliant under current parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gov-page border-b border-gov-border text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-4">Case Reference</th>
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">Student & APAAR</th>
                  <th className="py-2.5 px-4">Primary Institution</th>
                  <th className="py-2.5 px-4">Violation / Cause</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gov-navy">
                      {c.caseReference || c.caseNumber || 'REV-2024-001'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          c.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : c.severity === 'HIGH'
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {c.severity || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{c.student?.fullName || 'Candidate'}</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        APAAR: {c.student?.apaarId || 'MISSING_IDENTIFIER'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{c.primaryInstitution?.name || 'Technical Institute'}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Code: {c.primaryInstitution?.code || '1-001'}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-medium text-slate-800 block truncate">{c.title}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{c.description || c.reason}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenReview(c)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-gov-navy hover:bg-gov-navy hover:text-white transition-colors border border-blue-200"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Adjudicate</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjudication Modal */}
      {activeCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gov-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-gov-border bg-gov-page">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-extrabold text-gov-navy bg-blue-100 px-2 py-0.5 rounded">
                    {activeCase.caseReference || activeCase.caseNumber}
                  </span>
                  <StatusBadge status={activeCase.status} size="sm" />
                </div>
                <h3 className="text-sm font-bold text-gov-navy mt-1">
                  Adjudicate Compliance Case & Issue Directive
                </h3>
              </div>
              <button
                onClick={() => setActiveCase(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Alert Diagnostics */}
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex items-start space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{activeCase.title}</span>
                  <p className="mt-0.5 text-rose-800 leading-relaxed">
                    {activeCase.description || activeCase.reason}
                  </p>
                </div>
              </div>

              {/* Candidate & Enrolment Details */}
              <div className="p-3 bg-slate-50 rounded-lg border border-gov-border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Student:</span>
                  <span className="font-bold text-slate-800">{activeCase.student?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">APAAR Identifier:</span>
                  <span className="font-mono font-bold text-gov-navy">
                    {activeCase.student?.apaarId || 'MISSING_APAAR'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Primary Institution:</span>
                  <span className="font-medium text-slate-800">
                    {activeCase.primaryInstitution?.name} ({activeCase.primaryInstitution?.code})
                  </span>
                </div>
              </div>

              {/* Review Decision Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2 border-t border-gov-border">
                {updateError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                    {updateError}
                  </div>
                )}
                {updateSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                    {updateSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      New Regulatory Status:
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full p-2 border border-gov-border rounded-lg bg-gov-page font-semibold focus:outline-none"
                    >
                      <option value="RESOLVED">RESOLVED (Legitimate Transfer / Cleared)</option>
                      <option value="REQUIRING_CORRECTION">REQUIRING_CORRECTION (Notice Issued)</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW (Active Investigation)</option>
                      <option value="ESCALATED">ESCALATED (Appellate Authority Hearing)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Adjudicating Officer:
                    </label>
                    <div className="p-2 bg-gov-page border border-gov-border rounded-lg text-slate-800 font-medium">
                      {user?.name} ({user?.role})
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Statutory Rationale & Reviewer Remarks:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewerRemarks}
                    onChange={(e) => setReviewerRemarks(e.target.value)}
                    placeholder="Enter formal findings (e.g. 'Seat transfer certificate verified. Duplicate enrollment at secondary institution cancelled per APH Chapter VII.')..."
                    className="w-full p-2.5 border border-gov-border rounded-lg bg-gov-page focus:outline-none focus:border-gov-teal"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-gov-border">
                  <button
                    type="button"
                    onClick={() => setActiveCase(null)}
                    className="px-3 py-1.5 rounded-lg border border-gov-border text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-1.5 rounded-lg bg-gov-navy hover:bg-slate-800 text-white font-semibold transition-colors shadow-xs"
                  >
                    {updating ? 'Recording...' : 'Commit Decision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
