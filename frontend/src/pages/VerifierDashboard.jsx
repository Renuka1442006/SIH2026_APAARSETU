import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import {
  FileCheck2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Search,
  Building,
  UserCheck,
  QrCode,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const VerifierDashboard = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCases() {
      try {
        setLoading(true);
        const res = await api.getReviewCases();
        setCases(res || []);
      } catch (err) {
        console.error('Failed to load verifier cases:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  const pendingCount = cases.filter((c) => c.status === 'UNDER_REVIEW').length;
  const resolvedCount = cases.filter((c) => c.status === 'RESOLVED').length;
  const correctionCount = cases.filter((c) => c.status === 'REQUIRING_CORRECTION').length;

  const chartData = [
    { name: 'Under Active Review', count: pendingCount || 3, color: '#D97706' },
    { name: 'Resolved / Approved', count: resolvedCount || 8, color: '#0F766E' },
    { name: 'Correction Requested', count: correctionCount || 2, color: '#17365D' },
    { name: 'Escalated to Apex', count: 1, color: '#DC2626' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-gov-navy to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-panel border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-300/30">
                  Verification Officer Terminal
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Shift Active</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1">
                Dispute Investigation & Verification Workstation
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Review assigned duplicate enrolment collisions, inspect digital credentials with SHA-256 signatures, and record evidence-backed adjudication decisions.
              </p>
            </div>
          </div>
          <Link
            to="/verifier/cases"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-2 transition-all shadow-sm"
          >
            <span>Open Assigned Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gov-border shadow-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Cases</span>
            <span className="text-2xl font-black text-gov-navy mt-1 block">{cases.length || 14}</span>
            <span className="text-[10px] text-slate-500">Across technical nodes</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gov-border shadow-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Pending Review</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingCount || 3}</span>
            <span className="text-[10px] text-amber-800 font-medium">Awaiting Officer Decision</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gov-border shadow-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Resolved Cases</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{resolvedCount || 9}</span>
            <span className="text-[10px] text-emerald-800">Closed with rationale</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gov-border shadow-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">High Priority</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">2</span>
            <span className="text-[10px] text-rose-700">Multi-College Collisions</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Case Distribution Chart & High Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gov-border shadow-panel p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-gov-navy uppercase tracking-wider flex items-center space-x-1.5">
              <span>Adjudication Throughput by Status</span>
            </h2>
          </div>
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" angle={-15} textAnchor="end" tick={{ fontSize: 9 }} interval={0} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#17365D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Urgent Queue (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gov-border shadow-panel p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                Assigned Verification Queue (High Priority)
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cases flagged by the automated validation engine for manual inspection.
              </p>
            </div>
            <Link
              to="/verifier/cases"
              className="text-xs font-bold text-gov-teal hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 inline" />
            </Link>
          </div>

          <div className="mt-3 space-y-3">
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-amber-900">RC-2026-0001</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                      HIGH PRIORITY
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 mt-1">
                    Rohan Aditya Sharma • APAAR: 2026-9090-1122
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Cross-Institution Collision: Active BT-CSE enrolment detected concurrently at IIT Delhi and VJTI Mumbai.
                  </p>
                </div>
                <Link
                  to="/verifier/cases/RC-2026-0001"
                  className="px-3 py-1.5 rounded-lg bg-gov-navy text-white text-[11px] font-bold hover:bg-gov-navy-dark transition-colors shrink-0"
                >
                  Review Case
                </Link>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-700">DOC-2026-0042</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      OCR MISMATCH
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 mt-1">
                    CBSE Class XII Marksheet • Hash Match Detected
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Identical certificate SHA-256 uploaded across two institution portals. Requires forensic inspection.
                  </p>
                </div>
                <Link
                  to="/verifier/document-verification"
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-[11px] font-bold hover:bg-slate-100 transition-colors shrink-0"
                >
                  Inspect Doc
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifierDashboard;
