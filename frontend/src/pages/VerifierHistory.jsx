import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const VerifierHistory = () => {
  const [search, setSearch] = useState('');

  const historyCases = [
    {
      id: 'RC-2026-0003',
      studentName: 'Aarav Sharma',
      apaarId: '2026-9811-3001',
      institution: 'IIT Delhi',
      decision: 'RESOLVED_VERIFIED',
      decisionLabel: 'Resolved: Clean Enrolment Validated',
      rationale: 'Verified CBSE Class XII mark sheet (Roll: 11648293) and DigiLocker ABC token. No concurrent collisions detected in other technical universities.',
      resolvedDate: '15 Sep 2024, 04:15 PM',
      officer: 'Vikram Sengupta (Senior Talent Verification Lead, TCS India)',
    },
    {
      id: 'RC-2026-0004',
      studentName: 'Diya Patel',
      apaarId: '2026-9811-3002',
      institution: 'IIT Delhi',
      decision: 'APPROVED_TFW',
      decisionLabel: 'Resolved: Supernumerary TFW Quota Validated',
      rationale: 'Annual family income certificate and institutional recommendation verified under 5% TFW quota. Does not displace regular sanctioned capacity.',
      resolvedDate: '10 Sep 2024, 11:30 AM',
      officer: 'Vikram Sengupta (Senior Talent Verification Lead, TCS India)',
    },
    {
      id: 'RC-2026-0005',
      studentName: 'Sameer Khan',
      apaarId: '2026-9811-3015',
      institution: 'COEP Tech University',
      decision: 'DISCREPANCY_RECTIFIED',
      decisionLabel: 'Resolved: Minor Demographic Typo Rectified',
      rationale: 'Candidate submitted corrected name gazette notification. DigiLocker record updated.',
      resolvedDate: '02 Sep 2024, 02:40 PM',
      officer: 'Vikram Sengupta (Senior Talent Verification Lead, TCS India)',
    },
  ];

  const filtered = historyCases.filter(
    (c) =>
      !search ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.apaarId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gov-border">
        <div>
          <h1 className="text-xl font-bold text-gov-navy flex items-center space-x-2">
            <History className="w-5 h-5 text-gov-teal" />
            <span>Verification Decision & Case History</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Traceable historical log of all past case adjudications, officer determinations, and sealed findings.
          </p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          Permanent Audit Record
        </span>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white rounded-xl border border-gov-border p-4 shadow-panel flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resolved cases by Case ID, Candidate Name, or APAAR..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy"
          />
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gov-border shadow-panel p-5 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-gov-navy">{item.id}</span>
                <span className="text-xs font-bold text-slate-800">• {item.studentName}</span>
                <span className="text-[10px] font-mono text-slate-400">({item.apaarId})</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {item.decisionLabel}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-gov-navy block text-[11px] mb-1">Sealed Adjudication Rationale:</span>
              {item.rationale}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-1">
              <div>
                <span>Adjudicated by: </span>
                <strong className="text-slate-700">{item.officer}</strong>
              </div>
              <div className="flex items-center space-x-1 font-mono">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{item.resolvedDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerifierHistory;
