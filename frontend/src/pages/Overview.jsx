import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { StatusBadge } from '../components/Badge.jsx';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Building2,
  FileCheck2,
  QrCode,
  UploadCloud,
  UserPlus,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  CheckCircle2,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const Overview = () => {
  const { user, isAicteAdmin, activeInstitutionId } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [cases, setCases] = useState([]);
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [selectedState, setSelectedState] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const params = { academicYear };
      if (selectedState) params.state = selectedState;
      if (!isAicteAdmin && user?.institutionId) {
        params.institutionId = user.institutionId;
      } else if (activeInstitutionId) {
        params.institutionId = activeInstitutionId;
      }

      const [dashRes, casesRes] = await Promise.all([
        api.getAicteDashboard(params),
        api.getReviewCases('UNDER_REVIEW', !isAicteAdmin ? user?.institutionId : undefined),
      ]);

      setData(dashRes);
      setCases(casesRes || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [academicYear, selectedState, activeInstitutionId]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-gov-navy animate-spin" />
          <p className="text-xs text-slate-500 font-medium">
            Aggregating APAARSetu National Compliance Ledger...
          </p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalInstitutions: 4,
    totalStudents: 12,
    verifiedCount: 8,
    flaggedCount: 3,
    totalIntakeApproved: 540,
    totalActualEnrolment: 12,
  };

  // 5 Key Dashboard Metrics per specification
  const kpiCards = [
    {
      id: 'total-students',
      title: 'Total Student Records',
      value: summary.totalStudents || 0,
      sub: `${summary.totalInstitutions || 4} Technical Institutions`,
      icon: Users,
      color: 'text-gov-navy',
      bgColor: 'bg-blue-50/70',
      borderColor: 'border-blue-200',
      link: '/students',
    },
    {
      id: 'verified-records',
      title: 'Verified Records',
      value: summary.verifiedCount || 0,
      sub: `${Math.round(((summary.verifiedCount || 1) / Math.max(summary.totalStudents || 1, 1)) * 100)}% APAAR validated`,
      icon: ShieldCheck,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50/70',
      borderColor: 'border-emerald-200',
      link: '/students?status=SIMULATED_VERIFIED',
    },
    {
      id: 'pending-reviews',
      title: 'Pending Reviews',
      value: cases.length || summary.flaggedCount || 2,
      sub: 'Action required by reviewer',
      icon: AlertTriangle,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50/70',
      borderColor: 'border-amber-200',
      link: '/cases',
    },
    {
      id: 'duplicate-matches',
      title: 'Potential Duplicate Matches',
      value: summary.flaggedCount || 2,
      sub: 'Simultaneous Multi-College Enrolment',
      icon: ShieldAlert,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50/70',
      borderColor: 'border-rose-200',
      link: '/cross-institution',
    },
    {
      id: 'intake-alerts',
      title: 'Intake Compliance Alerts',
      value: summary.excessIntakeAlerts || 1,
      sub: 'Exceeding approved ceiling',
      icon: Building2,
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50/70',
      borderColor: 'border-indigo-200',
      link: '/compliance',
    },
  ];

  // Verification Trend Data (Synthetic demo trend)
  const trendData = [
    { month: 'Jun 2024', regular: 42, verified: 36, flagged: 4 },
    { month: 'Jul 2024', regular: 120, verified: 108, flagged: 11 },
    { month: 'Aug 2024', regular: 280, verified: 265, flagged: 14 },
    { month: 'Sep 2024', regular: 390, verified: 372, flagged: 16 },
    { month: 'Oct 2024', regular: 460, verified: 441, flagged: 18 },
  ];

  // Verification Status Breakdown
  const statusPieData = [
    { name: 'Simulated Verified', value: summary.verifiedCount || 8, color: '#0F766E' },
    { name: 'Format Valid (Demo)', value: 2, color: '#17365D' },
    { name: 'Under Investigation', value: cases.length || 2, color: '#D97706' },
    { name: 'Missing APAAR ID', value: 1, color: '#DC2626' },
  ];

  // Course Sanction vs Enrolment
  const courseStats = data?.courseStats || [
    { courseName: 'Computer Science & Engineering', approvedIntake: 240, regularEnrolled: 180, supernumeraryEnrolled: 14 },
    { courseName: 'Electronics & Communication', approvedIntake: 180, regularEnrolled: 140, supernumeraryEnrolled: 10 },
    { courseName: 'Mechanical Engineering', approvedIntake: 120, regularEnrolled: 122, supernumeraryEnrolled: 6 },
  ];

  const recentAlerts = data?.recentAlerts || [
    {
      id: 'alt-1',
      studentName: 'Rohan Sharma',
      apaarId: '2026-9090-1122',
      institutionName: 'IIT Delhi & VJTI Mumbai',
      severity: 'CRITICAL',
      reason: 'Simultaneous B.Tech Enrolment across 2 Institutes',
      date: '2024-10-24',
    },
    {
      id: 'alt-2',
      studentName: 'Simran Kaur',
      apaarId: 'NOT_PROVIDED',
      institutionName: 'Anna University',
      severity: 'WARNING',
      reason: 'Mandatory APAAR Identifier Missing from Enrolment',
      date: '2024-10-22',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Banner & Regulatory Filters */}
      <div className="bg-white p-5 rounded-xl border border-gov-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gov-navy bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {isAicteAdmin ? 'National Regulatory Oversight' : 'Institutional Compliance Console'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Academic Session 2024-25</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gov-navy mt-1 tracking-tight">
            AICTE Student Data Management & Verification Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time monitoring of APAAR authentication, cross-college duplicate prevention, and intake quotas.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 bg-gov-page border border-gov-border rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="2024-25">Session 2024-25</option>
              <option value="2023-24">Session 2023-24</option>
            </select>
          </div>

          {isAicteAdmin && (
            <div className="flex items-center space-x-1.5 bg-gov-page border border-gov-border rounded-lg px-2.5 py-1.5 text-xs">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="">All States (National)</option>
                <option value="Delhi">Delhi NCT</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
              </select>
            </div>
          )}

          <button
            onClick={loadDashboardData}
            className="p-1.5 rounded-lg border border-gov-border bg-gov-page hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards (Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => navigate(card.link)}
              className="bg-white rounded-xl border border-gov-border p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 truncate">{card.title}</span>
                <div className={`p-1.5 rounded-lg border ${card.bgColor} ${card.borderColor}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-gov-navy">
                  {card.value}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-gov-teal transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Action Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-xl p-4 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Rapid Regulatory Workflows
          </div>
          <div className="text-sm font-semibold text-slate-100 mt-0.5">
            Standard Compliance Operations & Pre-Screening Tools
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => navigate('/students')}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-white transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-300" />
            <span>Add Single Enrolment</span>
          </button>

          <button
            onClick={() => navigate('/bulk-upload')}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-white transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-teal-300" />
            <span>Batch CSV Ingestion</span>
          </button>

          <button
            onClick={() => navigate('/document-verification')}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-white transition-colors"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>AI Document OCR</span>
          </button>

          <button
            onClick={() => navigate('/cross-institution')}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-gov-navy text-xs font-bold transition-colors shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Investigate Collisions</span>
          </button>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Velocity Trends */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gov-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wide">
                Student Verification & Intake Trends
              </h2>
              <p className="text-xs text-slate-500">
                Monthly trajectory of regular enrolments vs verified credentials
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              94.2% Success Rate
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRegular" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#17365D" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#17365D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#167D8D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#167D8D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E6ED" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7A90' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7A90' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E1E6ED',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="regular"
                  name="Total Enrolments"
                  stroke="#17365D"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRegular)"
                />
                <Area
                  type="monotone"
                  dataKey="verified"
                  name="APAAR Verified"
                  stroke="#167D8D"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVerified)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Status Distribution (Donut Chart) */}
        <div className="bg-white rounded-xl border border-gov-border p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wide">
              Verification Status Mix
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Distribution of current candidate authentication states
            </p>

            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E1E6ED',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {statusPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate max-w-[150px]">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.value} records</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Priority Review Queue & Recent Flagged Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Review Queue */}
        <div className="bg-white rounded-xl border border-gov-border p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gov-border mb-3">
            <div>
              <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wide flex items-center space-x-2">
                <span>Priority Review Queue</span>
                <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                  {cases.length} Open Cases
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Cross-institution collisions and admission anomalies requiring regulatory resolution
              </p>
            </div>
            <button
              onClick={() => navigate('/cases')}
              className="text-xs font-semibold text-gov-teal hover:text-gov-navy flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {cases.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No open review cases pending resolution.
              </div>
            ) : (
              cases.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/cases?caseId=${item.id}`)}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">Ref: {item.caseReference}</span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Flagged Records & Collisions */}
        <div className="bg-white rounded-xl border border-gov-border p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gov-border mb-3">
            <div>
              <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wide flex items-center space-x-2">
                <span>Recent Flagged Enrolments</span>
              </h2>
              <p className="text-xs text-slate-500">
                Suspected identity collisions and missing identifiers detected by engine
              </p>
            </div>
            <button
              onClick={() => navigate('/cross-institution')}
              className="text-xs font-semibold text-gov-teal hover:text-gov-navy flex items-center space-x-1"
            >
              <span>Duplicate Tool</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAlerts.map((alt) => (
              <div key={alt.id} className="py-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{alt.studentName}</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {alt.apaarId}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-600 font-medium mt-0.5">{alt.reason}</p>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Institution: {alt.institutionName} • Detected: {alt.date}
                  </div>
                </div>
                <button
                  onClick={() => navigate('/cross-institution')}
                  className="px-2 py-1 text-[11px] font-medium rounded border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  Investigate
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Institution-Wise Approved Intake vs Actual Enrolment */}
      <div className="bg-white rounded-xl border border-gov-border p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wide">
              Course-Wise Approved Intake vs Actual Enrolment
            </h2>
            <p className="text-xs text-slate-500">
              Sanctioned capacity enforcement under AICTE Approval Process Handbook (APH) 2024-25
            </p>
          </div>
          <button
            onClick={() => navigate('/compliance')}
            className="text-xs font-semibold text-gov-teal hover:text-gov-navy flex items-center space-x-1"
          >
            <span>Full Compliance Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gov-page border-b border-gov-border text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Course / Discipline</th>
                <th className="py-2.5 px-3">Approved Sanction</th>
                <th className="py-2.5 px-3">Regular Enrolled</th>
                <th className="py-2.5 px-3">Supernumerary (TFW/PMSSS)</th>
                <th className="py-2.5 px-3">Capacity Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {courseStats.map((c, idx) => {
                const total = (c.regularEnrolled || 0) + (c.supernumeraryEnrolled || 0);
                const isOver = (c.regularEnrolled || 0) > (c.approvedIntake || 1);
                return (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{c.courseName}</td>
                    <td className="py-2.5 px-3 font-mono font-medium">{c.approvedIntake}</td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className={isOver ? 'text-gov-error font-bold' : 'text-slate-900 font-medium'}>
                        {c.regularEnrolled}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gov-teal font-medium">
                      +{c.supernumeraryEnrolled || 0}
                    </td>
                    <td className="py-2.5 px-3">
                      {isOver ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          ⚠️ Excess Intake (+{c.regularEnrolled - c.approvedIntake})
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ Compliant ({Math.round(((c.regularEnrolled || 0) / (c.approvedIntake || 1)) * 100)}%)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => navigate('/compliance')}
                        className="text-xs font-medium text-gov-navy hover:underline"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
