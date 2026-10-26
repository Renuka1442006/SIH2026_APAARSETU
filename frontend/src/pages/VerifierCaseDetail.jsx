import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import {
  AlertTriangle,
  ArrowLeft,
  Building,
  CheckCircle2,
  Clock,
  FileCheck2,
  ShieldAlert,
  User,
  Gavel,
  History,
  HelpCircle,
  FileText,
} from 'lucide-react';

export const VerifierCaseDetail = () => {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        const data = await api.getReviewCaseById(caseId);
        setCaseData(data);
      } catch (err) {
        console.error('Failed to load case detail:', err);
        // Fallback demo detail
        setCaseData({
          id: caseId || 'rc-1',
          caseNumber: 'RC-2026-0001',
          student: {
            fullName: 'Rohan Aditya Sharma',
            apaarId: '2026-9090-1122',
            gender: 'MALE',
            dob: '2004-08-12',
            aadhaarVaultRef: 'AV-XXXX-XXXX-9911',
          },
          primaryInstitution: {
            name: 'Indian Institute of Technology Delhi',
            code: '1-001',
            city: 'New Delhi',
            state: 'Delhi',
          },
          conflictingInstitution: {
            name: 'Veermata Jijabai Technological Institute',
            code: '1-003',
            city: 'Mumbai',
            state: 'Maharashtra',
          },
          reason: 'Cross-Institution Duplicate Enrolment: APAAR 2026-9090-1122 is concurrently enrolled at IIT Delhi (BT-CSE, Roll 2024CS10103) and VJTI Mumbai (BT-CSE, Roll 241070001) for Academic Year 2024-25.',
          status: 'UNDER_REVIEW',
          reviewerRemarks: 'Preliminary check confirmed concurrent submission of Class XII marksheet to both portals.',
          createdAt: '2024-09-12T10:30:00.000Z',
          timeline: [
            { time: '12 Sep 2024, 10:30 AM', event: 'Alert triggered by Automated Validation Engine during VJTI batch ingestion.' },
            { time: '12 Sep 2024, 11:15 AM', event: 'Assigned to Verification Officer queue (TCS Agency Node).' },
            { time: '13 Sep 2024, 02:45 PM', event: 'Document hash collision confirmed against CBSE Certificate 2024.' },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [caseId]);

  if (loading && !caseData) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Case Docket...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/verifier/cases"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-gov-navy transition-colors bg-white px-3 py-1.5 rounded-lg border border-gov-border shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Case Queue</span>
        </Link>
        <span className="text-xs font-mono font-bold text-gov-navy">
          Docket #{caseData?.caseNumber || 'RC-2026-0001'}
        </span>
      </div>

      {/* Main Case Summary Box */}
      <div className="bg-white rounded-2xl border border-gov-border shadow-panel p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gov-border gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Case Docket</span>
              <span className="text-xs font-bold text-gov-navy">• {caseData?.caseNumber}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {caseData?.status || 'UNDER_REVIEW'}
              </span>
            </div>
            <h1 className="text-lg font-bold text-gov-navy mt-1">
              Cross-Institution Collision Investigation
            </h1>
          </div>
          <Link
            to={`/verifier/cases/${caseId}/review`}
            className="px-4 py-2 rounded-lg bg-gov-navy hover:bg-gov-navy-dark text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition-colors"
          >
            <Gavel className="w-4 h-4 text-amber-400" />
            <span>Adjudicate Decision</span>
          </Link>
        </div>

        {/* Cause / Mismatch Explanation */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-gov-navy flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Automated Alert Rationale & Empirical Mismatch</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {caseData?.reason}
          </p>
        </div>

        {/* Side-by-Side Comparison of Permitted Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Institution */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900 pb-2 border-b border-blue-200">
              <span>Primary Node: {caseData?.primaryInstitution?.name}</span>
              <span className="font-mono text-[10px]">{caseData?.primaryInstitution?.code}</span>
            </div>
            <div className="space-y-1 text-xs text-slate-700">
              <div><strong className="text-slate-500">Program:</strong> B.Tech Computer Science & Engg</div>
              <div><strong className="text-slate-500">Enrolment Date:</strong> 15 July 2024</div>
              <div><strong className="text-slate-500">Roll No:</strong> 2024CS10103</div>
              <div><strong className="text-slate-500">Admission Status:</strong> Active (Confirmed)</div>
            </div>
          </div>

          {/* Conflicting Institution */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-rose-900 pb-2 border-b border-rose-200">
              <span>Conflicting Node: {caseData?.conflictingInstitution?.name || 'Secondary Node'}</span>
              <span className="font-mono text-[10px]">{caseData?.conflictingInstitution?.code || '1-003'}</span>
            </div>
            <div className="space-y-1 text-xs text-slate-700">
              <div><strong className="text-slate-500">Program:</strong> B.Tech Computer Engineering</div>
              <div><strong className="text-slate-500">Enrolment Date:</strong> 22 August 2024</div>
              <div><strong className="text-slate-500">Roll No:</strong> 241070001</div>
              <div><strong className="text-slate-500">Admission Status:</strong> Concurrent Active Hold</div>
            </div>
          </div>
        </div>

        {/* Candidate Information Permitted for Review */}
        <div>
          <h2 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-2">
            Candidate Attributes (Masked Demographic Scope)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Candidate Full Name</span>
              <strong className="text-slate-800">{caseData?.student?.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">APAAR ID</span>
              <span className="font-mono font-bold text-gov-navy">{caseData?.student?.apaarId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Date of Birth</span>
              <span className="text-slate-700">{caseData?.student?.dob?.slice(0, 10) || '2004-08-12'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Aadhaar Vault Ref</span>
              <span className="font-mono text-slate-500">AV-XXXX-XXXX-9911</span>
            </div>
          </div>
        </div>

        {/* Case Timeline & Audit History */}
        <div>
          <h2 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-2">
            Case Timeline & Traceable Event Log
          </h2>
          <div className="space-y-2 border-l-2 border-slate-200 pl-4 ml-1">
            <div className="text-xs">
              <span className="font-bold text-slate-700">12 Sep 2024, 10:30 AM — </span>
              <span className="text-slate-600">Cross-Institution collision flagged by Automated Pre-Validation Engine.</span>
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-700">12 Sep 2024, 11:15 AM — </span>
              <span className="text-slate-600">Assigned to Verification Officer Vikram Sengupta for human adjudication.</span>
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-700">14 Sep 2024, 03:20 PM — </span>
              <span className="text-slate-600">Under active review. Document mark sheet SHA-256 fingerprint verified against primary record.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifierCaseDetail;
