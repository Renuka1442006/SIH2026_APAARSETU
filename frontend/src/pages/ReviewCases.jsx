import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export const ReviewCases = () => {
  const { user, isAicteAdmin, isVerifier } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

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
      setUpdateSuccess('Review case decision logged and audit record created.');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
              National Collision Queue
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">{cases.length} Cases Logged</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Cross-Institution Conflict Resolution & Review Workflow
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit concurrent dual enrolments, APAAR identity collisions, and unverified credentials across Indian technical colleges.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Review Statuses</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW (Active)</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="REQUIRING_CORRECTION">REQUIRING_CORRECTION</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <button
            onClick={loadCases}
            className="p-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100"
            title="Refresh Cases"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Cases Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Loading flagged cases queue...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No active review cases found</p>
            <p className="text-xs text-slate-400 mt-1">All student records are verified and compliant.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Case ID</th>
                  <th className="px-4 py-3">Student Name & APAAR</th>
                  <th className="px-4 py-3">Primary Institution</th>
                  <th className="px-4 py-3">Conflicting Institution</th>
                  <th className="px-4 py-3">Collision Reason</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{c.caseNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{c.student?.fullName}</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        APAAR: {c.student?.apaarId || 'MISSING'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{c.primaryInstitution?.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Code: {c.primaryInstitution?.code}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.conflictingInstitution ? (
                        <div>
                          <div className="font-bold text-red-700">
                            {c.conflictingInstitution.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Code: {c.conflictingInstitution.code}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Intake / Internal</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs">{c.reason}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenReview(c)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Inspect & Adjudicate</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side-by-Side Collision Comparison & Review Modal */}
      {activeCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {activeCase.caseNumber}
                  </span>
                  <StatusBadge status={activeCase.status} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Cross-Institution Duplicate Adjudication
                </h3>
              </div>
              <button
                onClick={() => setActiveCase(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Alert Reason */}
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start space-x-2.5">
                <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Collision Diagnostic Rule</div>
                  <p className="mt-0.5 text-slate-700">{activeCase.reason}</p>
                </div>
              </div>

              {/* Side by Side Institution Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Institution A: Primary */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                    Institution A (Primary)
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">
                    {activeCase.primaryInstitution?.name}
                  </h4>
                  <div className="text-xs text-slate-600 font-mono mt-0.5">
                    Code: {activeCase.primaryInstitution?.code} • {activeCase.primaryInstitution?.state}
                  </div>

                  <div className="mt-3 pt-2 border-t border-blue-200/60 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Student Name:</span>
                      <strong className="text-slate-800">{activeCase.student?.fullName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">APAAR ID:</span>
                      <strong className="font-mono text-slate-800">{activeCase.student?.apaarId}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Admitted Course:</span>
                      <strong className="text-slate-800">
                        {activeCase.student?.enrolments?.[0]?.course?.name || 'BT-CSE'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Roll Number:</span>
                      <strong className="font-mono text-slate-800">
                        {activeCase.student?.enrolments?.[0]?.rollNumber || 'N/A'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Institution B: Conflicting */}
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 bg-red-100 px-2 py-0.5 rounded">
                    Institution B (Conflicting)
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">
                    {activeCase.conflictingInstitution?.name || 'Concurrent Institution'}
                  </h4>
                  <div className="text-xs text-slate-600 font-mono mt-0.5">
                    Code: {activeCase.conflictingInstitution?.code || '1-003'} •{' '}
                    {activeCase.conflictingInstitution?.state || 'Maharashtra'}
                  </div>

                  <div className="mt-3 pt-2 border-t border-red-200/60 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duplicate APAAR:</span>
                      <strong className="font-mono text-red-800">{activeCase.student?.apaarId}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Concurrent Enrolment:</span>
                      <strong className="text-red-700">Same Academic Year (2024-25)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Violation Type:</span>
                      <strong className="text-red-800">Dual Sanctioned Seat Occupancy</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adjudication Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-4 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Reviewer Decision & Resolution Action
                </h4>

                {updateError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    {updateError}
                  </div>
                )}
                {updateSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
                    {updateSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Review Status *
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-semibold"
                    >
                      <option value="RESOLVED">RESOLVED (Legitimate Transfer Verified / Conflict Cleared)</option>
                      <option value="REQUIRING_CORRECTION">REQUIRING_CORRECTION (Institution Must Rectify Roll/APAAR)</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW (Investigation in Progress)</option>
                      <option value="REJECTED">REJECTED (Cancel Duplicate Admission)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Reviewer Authorization
                    </label>
                    <div className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700">
                      {user?.name} ({user?.role})
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reviewer Findings & Statutory Remarks *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewerRemarks}
                    onChange={(e) => setReviewerRemarks(e.target.value)}
                    placeholder="Enter official rationale for resolution (e.g. Migration certificate verified; admission at VJTI cancelled; IIT Delhi seat confirmed legitimate)..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveCase(null)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Recording Decision...' : 'Save Review Decision'}
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
