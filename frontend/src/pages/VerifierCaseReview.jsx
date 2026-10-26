import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import {
  Gavel,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Save,
  RefreshCw,
  FileCheck2,
  ShieldAlert,
  Clock,
} from 'lucide-react';

export const VerifierCaseReview = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [decision, setDecision] = useState('REQUEST_ADDITIONAL_INFO');
  const [rationale, setRationale] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const decisionOptions = [
    {
      value: 'UNDER_REVIEW',
      label: 'Mark as Under Review (Gathering Evidence)',
      description: 'Keep investigation active while requesting additional documents or hearing candidate clarification.',
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      value: 'REQUEST_ADDITIONAL_INFO',
      label: 'Request Additional Information from Institution',
      description: 'Issue official notification to institution registrars requesting seat relinquishment or migration certificate.',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      value: 'RECORD_DISCREPANCY',
      label: 'Record Formal Discrepancy (Document Variance)',
      description: 'Document an empirical variance between uploaded marksheet and DigiLocker verified record.',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    {
      value: 'NOT_SUBSTANTIATED',
      label: 'Mark Match as Not Substantiated (Dismiss Alert)',
      description: 'Adjudicate that the collision was a false positive (e.g. name homonym or legitimate student transfer).',
      badge: 'bg-slate-100 text-slate-800 border-slate-200',
    },
    {
      value: 'ESCALATE',
      label: 'Escalate to AICTE National Legal Directorate',
      description: 'Escalate complex jurisdictional or institutional dispute to the national apex review board.',
      badge: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    {
      value: 'RESOLVE_CONFIRMED',
      label: 'Resolve with Formal Order (Mandatory Rationale)',
      description: 'Close review case with legally binding determination and audit trail recording.',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!rationale.trim() || rationale.trim().length < 15) {
      setFeedback({
        type: 'error',
        message: 'A mandatory review rationale (minimum 15 characters) is required to document the adjudication decision.',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Map decision to backend case status
      let backendStatus = 'UNDER_REVIEW';
      if (decision === 'RESOLVE_CONFIRMED' || decision === 'NOT_SUBSTANTIATED') {
        backendStatus = 'RESOLVED';
      } else if (decision === 'RECORD_DISCREPANCY' || decision === 'REQUEST_ADDITIONAL_INFO') {
        backendStatus = 'REQUIRING_CORRECTION';
      }

      await api.updateReviewCase(caseId || 'rc-1', {
        status: backendStatus,
        reviewerRemarks: `[ACTION: ${decision}] ${rationale.trim()}`,
      });

      setFeedback({
        type: 'success',
        message: 'Adjudication decision recorded in immutable audit log. Case status synchronized.',
      });

      setTimeout(() => {
        navigate('/verifier/cases');
      }, 1500);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to submit adjudication decision.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to={`/verifier/cases/${caseId}`}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-gov-navy transition-colors bg-white px-3 py-1.5 rounded-lg border border-gov-border shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Case Summary</span>
        </Link>
        <span className="text-xs font-mono font-bold text-slate-400">
          Case: {caseId}
        </span>
      </div>

      {/* Main Review Form Card */}
      <div className="bg-white rounded-2xl border border-gov-border shadow-panel p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between pb-5 border-b border-gov-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gov-navy text-white flex items-center justify-center shrink-0">
              <Gavel className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gov-navy">
                Controlled Case Adjudication & Resolution
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Record official verification finding with traceable audit logging. Mandatory rationale required.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            Authorized Finding
          </span>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Action Radio Options */}
          <div>
            <label className="block text-xs font-bold text-gov-navy uppercase tracking-wider mb-2.5">
              Select Adjudication Action:
            </label>
            <div className="space-y-2.5">
              {decisionOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    decision === opt.value
                      ? 'border-gov-navy bg-slate-50/80 ring-1 ring-gov-navy'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value={opt.value}
                    checked={decision === opt.value}
                    onChange={(e) => setDecision(e.target.value)}
                    className="mt-1 text-gov-navy"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">{opt.label}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border leading-none ${opt.badge}`}>
                        Action
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Mandatory Rationale */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                Adjudication Rationale & Review Findings *
              </label>
              <span className="text-[10px] text-slate-400">Minimum 15 characters</span>
            </div>
            <textarea
              rows={4}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Detail the documentary evidence verified, institution statements reviewed, and statutory basis for this determination..."
              required
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Your name, agency node, timestamp, and rationale will be permanently sealed in the PostgreSQL audit log.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to={`/verifier/cases/${caseId}`}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-gov-navy hover:bg-gov-navy-dark text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Committing Finding...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Seal Official Adjudication</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifierCaseReview;
