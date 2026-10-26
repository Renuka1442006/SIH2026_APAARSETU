import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  FileText,
  Download,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  RefreshCw,
  Printer,
  CheckCircle2,
  Building,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const ReportsAnalytics = () => {
  const { isAicteAdmin } = useAuth();
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [selectedState, setSelectedState] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportNotice, setExportNotice] = useState(null);

  // State-wise enrolment vs intake
  const stateData = [
    { state: 'Delhi NCT', sanctioned: 180, enrolled: 165, verified: 158 },
    { state: 'Maharashtra', sanctioned: 240, enrolled: 228, verified: 215 },
    { state: 'Tamil Nadu', sanctioned: 120, enrolled: 110, verified: 104 },
    { state: 'Karnataka', sanctioned: 150, enrolled: 142, verified: 135 },
    { state: 'Telangana', sanctioned: 130, enrolled: 122, verified: 118 },
  ];

  // APAAR Verification Status Distribution
  const verificationMix = [
    { name: 'Simulated Verified', value: 68, color: '#0F766E' },
    { name: 'Format Valid (Demo)', value: 18, color: '#17365D' },
    { name: 'Under Adjudication', value: 9, color: '#D97706' },
    { name: 'Missing APAAR ID', value: 5, color: '#DC2626' },
  ];

  // Social Category & Supernumerary Quota Distribution
  const categoryData = [
    { category: 'General', count: 410 },
    { category: 'OBC-NCL', count: 285 },
    { category: 'SC', count: 160 },
    { category: 'ST', count: 85 },
    { category: 'EWS', count: 90 },
    { category: 'TFW (Supernumerary)', count: 48 },
    { category: 'PMSSS (J&K)', count: 24 },
    { category: 'Foreign National / OCI', count: 18 },
  ];

  // Intake Velocity Trends
  const velocityData = [
    { session: 'Q1 Jun', submissions: 120, verified: 110, flagged: 10 },
    { session: 'Q2 Jul', submissions: 340, verified: 320, flagged: 20 },
    { session: 'Q3 Aug', submissions: 680, verified: 650, flagged: 30 },
    { session: 'Q4 Sep', submissions: 820, verified: 785, flagged: 35 },
  ];

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'State,Sanctioned_Intake,Actual_Enrolled,Verified_APAAR,Compliance_Rate\n' +
      stateData
        .map(
          (d) =>
            `${d.state},${d.sanctioned},${d.enrolled},${d.verified},${Math.round((d.verified / d.sanctioned) * 100)}%`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AICTE_APAARSetu_Enrolment_Report_${academicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('CSV report generated and downloaded successfully.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleExportJSON = () => {
    const reportObj = {
      portal: 'APAARSetu - AICTE Student Data Management & Verification Platform',
      generatedAt: new Date().toISOString(),
      academicYear,
      stateMetrics: stateData,
      verificationBreakdown: verificationMix,
      quotaDistribution: categoryData,
      statutoryComplianceStandard: 'AICTE APH 2024-25',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportObj, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `AICTE_Regulatory_Dossier_${academicYear}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Regulatory JSON dossier generated and downloaded.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="bg-white p-5 rounded-xl border border-gov-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gov-navy bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              National Intelligence & Auditing
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Session {academicYear}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gov-navy mt-1 tracking-tight">
            Regulatory Reports & Enrolment Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            National summary metrics, state-level accreditation trends, and verifiable export dossiers.
          </p>
        </div>

        {/* Filters and Exports */}
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

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gov-border bg-gov-page hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gov-navy hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Export JSON Dossier</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-1.5 rounded-lg border border-gov-border bg-gov-page hover:bg-slate-100 text-slate-600 transition-colors"
            title="Print Summary"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 4 National KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gov-border p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Validated Admissions</div>
          <div className="text-2xl font-bold text-gov-navy mt-1 font-mono">1,120</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across 4 Pilot Institutions</div>
        </div>

        <div className="bg-white rounded-xl border border-gov-border p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">APAAR Linkage Adoption</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">86.4%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Simulated & Format Validated</div>
        </div>

        <div className="bg-white rounded-xl border border-gov-border p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Cross-College Collisions</div>
          <div className="text-2xl font-bold text-rose-700 mt-1 font-mono">2</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Dual Enrolments Halted</div>
        </div>

        <div className="bg-white rounded-xl border border-gov-border p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Intake Compliance Index</div>
          <div className="text-2xl font-bold text-gov-teal mt-1 font-mono">98.2%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Within Approved Sanction Cap</div>
        </div>
      </div>

      {/* Recharts Row 1: State-Wise Enrolment vs Approved & Verification Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* State-Wise Enrolment (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-gov-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wide">
                State-Wise Approved Sanction vs Enrolment vs APAAR Verified
              </h2>
              <p className="text-xs text-slate-500">
                Comparative regional intake and student verification compliance
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E6ED" />
                <XAxis dataKey="state" tick={{ fontSize: 11, fill: '#6B7A90' }} />
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
                <Bar dataKey="sanctioned" fill="#17365D" name="Sanctioned Intake" radius={[3, 3, 0, 0]} />
                <Bar dataKey="enrolled" fill="#167D8D" name="Actual Enrolled" radius={[3, 3, 0, 0]} />
                <Bar dataKey="verified" fill="#0F766E" name="APAAR Verified" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Status Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gov-border p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wide">
              APAAR Verification Distribution (%)
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              National status breakdown across technical student registry
            </p>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={verificationMix}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {verificationMix.map((entry, index) => (
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

          <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
            {verificationMix.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recharts Row 2: Category Quotas & Ingestion Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Social Category & Quotas (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-gov-border p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wide">
              Admission Category & Supernumerary Quota Distribution
            </h2>
            <p className="text-xs text-slate-500">
              Breakdown across constitutional reservations and AICTE supernumerary seats (TFW, PMSSS, OCI)
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E1E6ED" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7A90' }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fill: '#202B38' }} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E1E6ED',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#167D8D" name="Candidates" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quarterly Verification Velocity (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gov-border p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wide">
              Audit & Processing Velocity
            </h2>
            <p className="text-xs text-slate-500">
              Quarterly throughput of validated admissions vs flagged collisions
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E6ED" />
                <XAxis dataKey="session" tick={{ fontSize: 11, fill: '#6B7A90' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7A90' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E1E6ED',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="submissions" name="Total Ingested" stroke="#17365D" fill="#17365D" fillOpacity={0.15} />
                <Area type="monotone" dataKey="verified" name="APAAR Verified" stroke="#0F766E" fill="#0F766E" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
