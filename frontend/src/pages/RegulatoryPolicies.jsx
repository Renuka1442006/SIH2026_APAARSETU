import React, { useState } from 'react';
import {
  Gavel,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Calendar,
  BookOpen,
  Sliders,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const RegulatoryPolicies = () => {
  const [saveNotice, setSaveNotice] = useState(null);

  const [rules, setRules] = useState([
    {
      id: 'POL-AICTE-01',
      title: 'Tuition Fee Waiver (TFW) Supernumerary Ceiling',
      category: 'Supernumerary Seat Allocation',
      threshold: '5% of Approved Intake',
      effectiveDate: '01 April 2024',
      officialSource: 'AICTE Approval Process Handbook (APH) 2024-25, Clause 3.2',
      verified: true,
      description: 'Maximum 5% seats over and above the sanctioned intake shall be allowed under TFW Scheme. These seats are completely supernumerary and shall not reduce regular open seats.',
    },
    {
      id: 'POL-AICTE-02',
      title: 'Cross-Institution Concurrent Admission Disqualification',
      category: 'Admission Integrity',
      threshold: 'Strict Binary (0 concurrent enrolments)',
      effectiveDate: '01 July 2023',
      officialSource: 'UGC Notification F.No.1-2/2022(NEP) on Dual Degrees & AICTE Enrolment Regulations',
      verified: true,
      description: 'A student admitted to a regular full-time degree program cannot concurrently enrol in another full-time program across technical institutions without formal transfer approval.',
    },
    {
      id: 'POL-AICTE-03',
      title: 'Prime Minister’s Special Scholarship Scheme (PMSSS) J&K',
      category: 'Supernumerary Quota',
      threshold: 'Maximum 2 seats per program (Total cap: 10 per institute)',
      effectiveDate: '15 May 2024',
      officialSource: 'AICTE SAG Bureau Guidelines 2024-25',
      verified: true,
      description: 'Supernumerary quota for students from UT of Jammu & Kashmir and Ladakh administered via central PMSSS counselling.',
    },
    {
      id: 'POL-DEMO-04',
      title: 'AI OCR Document Inconsistency Warning Threshold (Prototype Parameter)',
      category: 'Automated Validation Heuristics',
      threshold: '90.0% Confidence Match',
      effectiveDate: 'Demo Active',
      officialSource: 'AICTE VidyarthiSetu Prototype Engineering Config',
      verified: false,
      description: 'Configurable OCR discrepancy threshold: extractions below 90% confidence trigger secondary manual verification officer inspection.',
    },
    {
      id: 'POL-DEMO-05',
      title: 'Foreign National / CIWG Supernumerary Allocation',
      category: 'International Intake',
      threshold: '15% Sanctioned Intake',
      effectiveDate: '01 June 2024',
      officialSource: 'AICTE APH 2024-25, Chapter IV',
      verified: true,
      description: '15% seats over and above sanctioned intake for Foreign Nationals / Persons of Indian Origin (PIO) / Children of Indian Workers in Gulf Countries (CIWG).',
    },
  ]);

  const handleSave = () => {
    setSaveNotice('Regulatory rulebook thresholds synchronized with national validation engine.');
    setTimeout(() => setSaveNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gov-border">
        <div>
          <h1 className="text-xl font-bold text-gov-navy flex items-center space-x-2">
            <Gavel className="w-5 h-5 text-gov-teal" />
            <span>Regulatory Rule Configuration & Validation Thresholds</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable regulatory rulebook governing admission validation, supernumerary caps, and duplicate collision triggers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-gov-navy hover:bg-gov-navy-dark text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Threshold Changes</span>
        </button>
      </div>

      {saveNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Rules Feed */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white rounded-2xl border border-gov-border shadow-panel p-5 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <span className="text-[11px] font-mono font-bold text-slate-500">{rule.id}</span>
                <h3 className="text-xs font-bold text-gov-navy">{rule.title}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  {rule.category}
                </span>
                {rule.verified ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Official AICTE Rule</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Prototype Parameter</span>
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {rule.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Configured Threshold:</span>
                <strong className="text-gov-navy font-bold">{rule.threshold}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Official Source:</span>
                <span className="text-slate-700 font-medium truncate block">{rule.officialSource}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Effective Date:</span>
                <span className="text-slate-700 font-medium">{rule.effectiveDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegulatoryPolicies;
