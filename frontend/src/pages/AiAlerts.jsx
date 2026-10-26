import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  FileText,
  Building,
  ArrowRight,
  TrendingUp,
  Sliders,
  Filter,
} from 'lucide-react';

export const AiAlerts = () => {
  const [selectedCategory, setSelectedCategory] = useState('');

  const explainableAlerts = [
    {
      id: 'ALT-2026-001',
      category: 'Cross-Institution Concurrent Admission',
      severity: 'HIGH',
      confidenceScore: 99.4,
      targetEntity: 'Rohan Aditya Sharma (APAAR: 2026-9090-1122)',
      institutions: ['IIT Delhi (Code: 1-001)', 'VJTI Mumbai (Code: 1-003)'],
      evidence: 'Deterministic match on 12-digit APAAR identifier and identical DOB (12/08/2004) concurrently active across two engineering colleges for Academic Year 2024-25.',
      reason: 'Dual enrolment detected across state autonomous and central institutes violating UGC/AICTE full-time enrolment mandates.',
      recommendedAction: 'Issue formal query to VJTI Mumbai and candidate to confirm official seat relinquishment or transfer certificate authenticity.',
      reviewStatus: 'UNDER_INVESTIGATION',
      nonPunitiveNotice: 'Advisory Alert: Non-punitive administrative hold until verification officer interview.',
    },
    {
      id: 'ALT-2026-002',
      category: 'Document Fingerprint Hash Collision',
      severity: 'HIGH',
      confidenceScore: 98.2,
      targetEntity: 'Class XII Marksheet (CBSE 2024)',
      institutions: ['IIT Delhi', 'VJTI Mumbai'],
      evidence: 'Binary SHA-256 checksum (9f83a42d...) identical between two independent upload batches submitted under distinct student identifiers.',
      reason: 'Same source certificate document uploaded for multiple candidate admissions.',
      recommendedAction: 'Direct forensic officer review of digital certificate and cryptographic signature validation.',
      reviewStatus: 'ESCALATED_TO_VERIFIER',
      nonPunitiveNotice: 'Requires human forensic inspection before any administrative conclusion.',
    },
    {
      id: 'ALT-2026-003',
      category: 'Sanctioned Intake Utilization Alert',
      severity: 'MEDIUM',
      confidenceScore: 92.5,
      targetEntity: 'COEP Tech University (B.Tech Mechanical)',
      institutions: ['COEP Tech University (Code: 1-002)'],
      evidence: 'Actual confirmed admissions (118/120) reached 98.3% of sanctioned regular capacity, while 4 supernumerary TFW seats are active.',
      reason: 'Course is approaching threshold ceiling for sanctioned intake approval.',
      recommendedAction: 'Notify admissions registrar to monitor waitlist conversions and verify supernumerary quota segregation.',
      reviewStatus: 'SYSTEM_MONITORED',
      nonPunitiveNotice: 'Regulatory threshold informational advisory.',
    },
    {
      id: 'ALT-2026-004',
      category: 'Aadhaar e-KYC Verification Discrepancy',
      severity: 'LOW',
      confidenceScore: 84.1,
      targetEntity: 'Simran Preet Kaur (Enrolment: 112403001)',
      institutions: ['COEP Tech University'],
      evidence: 'Phonetic name difference detected between provisional admission application and DigiLocker record.',
      reason: 'Minor spelling variance in middle name between institution roster and academic bank of credits.',
      recommendedAction: 'Prompt candidate to authorize DigiLocker demographic synchronization upon semester registration.',
      reviewStatus: 'RESOLVED_PENDING_SYNC',
      nonPunitiveNotice: 'Benign demographic normalization required.',
    },
  ];

  const filtered = selectedCategory
    ? explainableAlerts.filter((a) => a.category.toLowerCase().includes(selectedCategory.toLowerCase()))
    : explainableAlerts;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gov-border">
        <div>
          <h1 className="text-xl font-bold text-gov-navy flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>AI Alerts & Explainable Insights</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent machine-assisted risk heuristics. Scores serve as investigation guidance and do not replace authorized human review.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
            Heuristic Model v2.4 Active
          </span>
        </div>
      </div>

      {/* Ethical AI Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">National Regulatory Guidelines:</strong> In accordance with AICTE ethical governance policy, automated algorithms and confidence scores only trigger review queues. No student record is classified as fraudulent without thorough human verification and authorized adjudication.
        </div>
      </div>

      {/* Alert Feed */}
      <div className="space-y-4">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className="bg-white rounded-2xl border border-gov-border shadow-panel p-5 hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono font-bold text-slate-500">{alert.id}</span>
                <span className="text-xs font-bold text-gov-navy">{alert.category}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded leading-none ${
                    alert.severity === 'HIGH'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : alert.severity === 'MEDIUM'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {alert.severity} PRIORITY
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-400 font-medium">Confidence:</span>
                <span className="font-mono font-bold text-gov-teal">{alert.confidenceScore}%</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                  {alert.reviewStatus}
                </span>
              </div>
            </div>

            <div className="mt-3.5 space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Target Reference: </span>
                <strong className="text-slate-800">{alert.targetEntity}</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                <span className="font-bold text-gov-navy block text-[11px] mb-1">Empirical Evidence:</span>
                {alert.evidence}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-purple-950">
                  <span className="font-bold block text-[11px] text-purple-900 mb-0.5">Policy Rationale:</span>
                  {alert.reason}
                </div>
                <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 text-teal-950">
                  <span className="font-bold block text-[11px] text-teal-900 mb-0.5">Recommended Action:</span>
                  {alert.recommendedAction}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="italic">{alert.nonPunitiveNotice}</span>
                <span className="text-gov-teal font-bold hover:underline cursor-pointer flex items-center space-x-1">
                  <span>Open Adjudication Case</span>
                  <ArrowRight className="w-3.5 h-3.5 inline" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiAlerts;
