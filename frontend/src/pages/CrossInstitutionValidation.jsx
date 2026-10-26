import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { StatusBadge } from '../components/Badge.jsx';
import {
  ShieldAlert,
  Building,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  Send,
  Gavel,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

export const CrossInstitutionValidation = () => {
  const { user, isAicteAdmin } = useAuth();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showMasked, setShowMasked] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Action modal / feedback
  const [remarks, setRemarks] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load cases from backend
  const loadCases = async () => {
    try {
      setLoading(true);
      const res = await api.getReviewCases(statusFilter || undefined);
      setCases(res || []);

      const caseIdParam = searchParams.get('caseId');
      if (caseIdParam && res) {
        const found = res.find((c) => c.id === caseIdParam);
        if (found) setSelectedCase(found);
      } else if (res && res.length > 0 && !selectedCase) {
        setSelectedCase(res[0]);
      }
    } catch (err) {
      console.error('Failed to load collision cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [statusFilter]);

  // Demo synthetic cases for full presentation if cases list is short
  const collisionCases = cases.length > 0 ? cases : [
    {
      id: 'case-demo-1',
      caseReference: 'REV-2024-DUP-001',
      title: 'Simultaneous Multi-College Enrolment Collision',
      description: 'Candidate Rohan Sharma (APAAR 2026-9090-1122) enrolled simultaneously at IIT Delhi and VJTI Mumbai for full-time B.Tech programs.',
      severity: 'CRITICAL',
      status: 'UNDER_REVIEW',
      matchScore: 99.2,
      matchingReason: 'Identical APAAR Identifier (2026-9090-1122) + Date of Birth (2004-06-15) across two active B.Tech programs.',
      createdAt: '2024-10-24T10:30:00Z',
      institutionA: {
        name: 'Indian Institute of Technology Delhi',
        code: '1-001',
        state: 'Delhi',
        course: 'B.Tech - Computer Science & Engineering',
        rollNumber: '2024CS1092',
        admissionDate: '2024-08-01',
        type: 'Regular Full-Time',
        feePaid: 'Yes (Full Term)',
      },
      institutionB: {
        name: 'Veermata Jijabai Technological Institute (VJTI)',
        code: '1-003',
        state: 'Maharashtra',
        course: 'B.Tech - Mechanical Engineering',
        rollNumber: '24102008',
        admissionDate: '2024-08-10',
        type: 'Regular Full-Time (Conflict)',
        feePaid: 'Yes (Provisional)',
      },
      conflicts: [
        'Concurrent full-time enrolment in two technical degree programs violates AICTE APH Chapter VII Clause 7.3.',
        'Both institutes claim regular physical attendance for academic year 2024-25.',
        'Uploaded Class 12th Marksheet SHA-256 hash is byte-for-byte identical.',
      ],
    },
    {
      id: 'case-demo-2',
      caseReference: 'REV-2024-DUP-002',
      title: 'Potential Name & Biometric Fuzzy Duplicate',
      description: 'Candidate Aditya Kumar (COEP Tech) matches candidate Aditya Sharma (Anna University) with high demographic overlap.',
      severity: 'HIGH',
      status: 'UNDER_REVIEW',
      matchScore: 84.5,
      matchingReason: 'Fuzzy match on Candidate Name (88%), Father Name (94%), DOB (100%), but distinct APAAR identifiers.',
      createdAt: '2024-10-25T14:15:00Z',
      institutionA: {
        name: 'COEP Technological University Pune',
        code: '1-002',
        state: 'Maharashtra',
        course: 'B.Tech - Electronics & Telecommunication',
        rollNumber: 'COEP-24-ENTC-042',
        admissionDate: '2024-08-05',
        type: 'Regular Full-Time',
        feePaid: 'Yes',
      },
      institutionB: {
        name: 'Anna University, Chennai',
        code: '1-004',
        state: 'Tamil Nadu',
        course: 'B.Tech - Information Technology',
        rollNumber: 'AU-2024-IT-104',
        admissionDate: '2024-08-12',
        type: 'Regular Full-Time',
        feePaid: 'Yes',
      },
      conflicts: [
        'High demographic similarity detected. Possible identity typo or dual application.',
        'Requires secondary identity verification via Aadhaar/DigiLocker biometric gateway.',
      ],
    },
  ];

  const current = selectedCase || collisionCases[0];

  // Action handlers
  const handleAction = async (actionType) => {
    setActionLoading(true);
    try {
      let targetStatus = 'UNDER_REVIEW';
      if (actionType === 'CONFIRM_CONFLICT') targetStatus = 'CONFIRMED_CONFLICT';
      if (actionType === 'DISMISS_MATCH') targetStatus = 'RESOLVED';
      if (actionType === 'REQUEST_INFO') targetStatus = 'REQUIRING_CORRECTION';
      if (actionType === 'ESCALATE') targetStatus = 'ESCALATED';

      if (current.id && !current.id.startsWith('case-demo')) {
        await api.updateReviewCase(current.id, {
          status: targetStatus,
          reviewerRemarks: remarks || `Action ${actionType} triggered from Duplicate Engine.`,
        });
      }

      setActionSuccess(`Case successfully updated to status: ${targetStatus}. Audit event recorded.`);
      setTimeout(() => {
        setActionSuccess(null);
        loadCases();
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const maskIdentifier = (id) => {
    if (!id) return 'NOT_PROVIDED';
    if (showMasked) return id;
    if (id.length >= 8) {
      return `XXXX-XXXX-${id.slice(-4)}`;
    }
    return `XXXX-${id.slice(-2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-xl border border-gov-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Regulatory Core Differentiator
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Cross-Institution Collision Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gov-navy mt-1 tracking-tight">
            Cross-Institution Duplicate Enrolment Validation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify, investigate, and halt simultaneous student admissions across AICTE-approved institutions nationwide.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMasked(!showMasked)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gov-border bg-gov-page hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
          >
            {showMasked ? <EyeOff className="w-3.5 h-3.5 text-gov-teal" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
            <span>{showMasked ? 'Mask Identifiers' : 'Reveal Unmasked (Authorized)'}</span>
          </button>

          <button
            onClick={loadCases}
            className="p-1.5 rounded-lg border border-gov-border bg-gov-page hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Cases"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Collision Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-xl border border-gov-border p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gov-navy">
                Suspected Duplicate Queue
              </span>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {collisionCases.length} Detected
              </span>
            </div>

            <div className="space-y-2.5">
              {collisionCases.map((item) => {
                const isSelected = (current?.id === item.id) || (current?.caseReference === item.caseReference);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedCase(item);
                      setRemarks('');
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-gov-navy/50 shadow-2xs'
                        : 'bg-gov-page border-gov-border hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                        {item.matchScore || 99.2}% MATCH
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                      {item.description}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono">Ref: {item.caseReference}</span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statutory Handbook Citation Card */}
          <div className="bg-slate-50 rounded-xl border border-gov-border p-4 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-gov-navy uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Gavel className="w-3.5 h-3.5 text-gov-teal" />
              <span>Statutory Regulatory Rulebook</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              <strong>AICTE Approval Process Handbook (APH) 2024-25, Chapter VII:</strong> A student shall not be enrolled simultaneously in two full-time formal degree or diploma programs. Discovery of duplicate enrolment invalidates both registrations unless one is legitimately cancelled.
            </p>
          </div>
        </div>

        {/* Right: Detailed Side-by-Side Comparison & Action Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Case Summary Card */}
          <div className="bg-white rounded-xl border border-gov-border p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gov-border pb-3.5">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                    {current?.severity || 'CRITICAL'} SEVERITY
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-mono text-slate-500">
                    Ref: {current?.caseReference || 'REV-2024-DUP-001'}
                  </span>
                </div>
                <h2 className="text-base font-bold text-gov-navy mt-1">
                  {current?.title || 'Simultaneous Multi-College Enrolment Collision'}
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <StatusBadge status={current?.status || 'UNDER_REVIEW'} />
              </div>
            </div>

            {/* AI Collision Reason Banner */}
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-3 text-xs text-rose-900">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Automated Collision Reasoning:</span>
                <p className="mt-0.5 text-rose-800 leading-relaxed">
                  {current?.matchingReason ||
                    'Identical APAAR Identifier + Date of Birth across two concurrent technical institutions.'}
                </p>
              </div>
            </div>

            {/* SIDE-BY-SIDE RECORD COMPARISON GRID */}
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy mb-3">
                Side-by-Side Enrolment Dossier Comparison
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Institution A Card */}
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50/20 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gov-navy" />
                      <span className="text-xs font-bold text-gov-navy">Institution A (First Submission)</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-blue-100 text-blue-900 rounded">
                      Code: {current?.institutionA?.code || '1-001'}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-slate-900">
                    {current?.institutionA?.name || 'Indian Institute of Technology Delhi'}
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-slate-100">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Course / Branch:</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {current?.institutionA?.course || 'B.Tech - Computer Science'}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-500">Roll / Reference:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {current?.institutionA?.rollNumber || '2024CS1092'}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-500">APAAR Identifier:</span>
                      <span className="font-mono font-bold text-gov-navy">
                        {maskIdentifier('2026-9090-1122')}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-500">Admission Date:</span>
                      <span className="font-medium text-slate-800">
                        {current?.institutionA?.admissionDate || '2024-08-01'}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-500">Programme Mode:</span>
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                        {current?.institutionA?.type || 'Regular Full-Time'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Institution B Card */}
                <div className="rounded-xl border-2 border-rose-200 bg-rose-50/20 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-rose-200/60 pb-2">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-rose-700" />
                      <span className="text-xs font-bold text-rose-900">Institution B (Concurrent Duplicate)</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-rose-100 text-rose-900 rounded">
                      Code: {current?.institutionB?.code || '1-003'}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-slate-900">
                    {current?.institutionB?.name || 'Veermata Jijabai Technological Institute'}
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-slate-100">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Course / Branch:</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {current?.institutionB?.course || 'B.Tech - Mechanical Engg'}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-500">Roll / Reference:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {current?.institutionB?.rollNumber || '24102008'}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-500">APAAR Identifier:</span>
                      <span className="font-mono font-bold text-rose-700">
                        {maskIdentifier('2026-9090-1122')}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-500">Admission Date:</span>
                      <span className="font-medium text-slate-800">
                        {current?.institutionB?.admissionDate || '2024-08-10'}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-500">Programme Mode:</span>
                      <span className="font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10px]">
                        {current?.institutionB?.type || 'Regular Full-Time (Conflict)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conflicting Findings Checklist */}
            <div className="mt-5 p-3.5 bg-slate-50 rounded-lg border border-gov-border">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Documented Regulatory Conflicts:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {(current?.conflicts || [
                  'Concurrent full-time enrolment in two technical degree programs violates AICTE APH Chapter VII Clause 7.3.',
                  'Both institutes claim regular physical attendance for academic year 2024-25.',
                  'Uploaded Class 12th Marksheet SHA-256 hash is byte-for-byte identical.',
                ]).map((c, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ACTION BUTTONS & REGULATORY RESOLUTION CONTROLS */}
            <div className="mt-6 pt-5 border-t border-gov-border space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Investigation Findings & Reviewer Directive (Mandatory for Action):
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. 'Confirmed duplicate enrolment with candidate. Institution B seat cancelled. Show cause issued.'"
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-gov-border bg-gov-page focus:outline-none focus:border-gov-teal"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* 1. Confirm Conflict (Halt Duplicate Submission) */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction('CONFIRM_CONFLICT')}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Confirm Conflict (Freeze Duplicate)</span>
                </button>

                {/* 2. Dismiss Match (False Positive / Twin / Legitimate Transfer) */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction('DISMISS_MATCH')}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dismiss Match (Legitimate Transfer)</span>
                </button>

                {/* 3. Request College Clarification */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction('REQUEST_INFO')}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-gov-page hover:bg-slate-200 text-slate-700 border border-gov-border text-xs font-medium transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-gov-teal" />
                  <span>Request Clarification</span>
                </button>

                {/* 4. Escalate to AICTE Hearing */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction('ESCALATE')}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-gov-navy text-xs font-bold transition-colors shadow-xs"
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>Escalate to Appellate Hearing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
