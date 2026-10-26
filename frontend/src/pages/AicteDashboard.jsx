import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import {
  Building2,
  Users,
  AlertOctagon,
  CheckCircle2,
  FileBadge2,
  TrendingUp,
  Filter,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const AicteDashboard = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [academicYear, setAcademicYear] = useState('2024-25');
  const [selectedState, setSelectedState] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { academicYear };
      if (selectedState) params.state = selectedState;

      const res = await api.getAicteDashboard(params);
      setData(res);
    } catch (err) {
      console.error('Failed to load AICTE dashboard:', err);
      setError(err.message || 'Failed to fetch analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [academicYear, selectedState]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Aggregating National AICTE Records...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const courseStats = data?.courseStats || [];
  const institutionStats = data?.institutionStats || [];
  const stateDist = data?.stateDistribution || [];
  const recentAlerts = data?.recentAlerts || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              National Apex View
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Academic Year: {academicYear}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            AICTE National Intake & Enrolment Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cross-institution duplicate oversight, approved capacity monitoring and verifiable student credentials.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="2024-25">Year: 2024-25</option>
              <option value="2025-26">Year: 2025-26</option>
            </select>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All States</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>

            <button
              onClick={loadData}
              className="p-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Refresh Analytics"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Critical Collision / Excess Intake Alert Banner */}
      {summary.flaggedEnrolments > 0 && (
        <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border-l-4 border-red-600 p-4 rounded-xl shadow-sm flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-900">
                🚨 {summary.flaggedEnrolments} Potential Cross-Institution Duplicate Collisions Detected!
              </h3>
              <p className="text-xs text-red-700 mt-0.5">
                Synthetic test students are actively enrolled concurrently at multiple institutions (e.g. IIT Delhi and VJTI Mumbai). Review workflow is active.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/platform/cases')}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex-shrink-0 cursor-pointer"
          >
            <span>Resolve Collisions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Institutions</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{summary.totalInstitutions || 0}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">100% AISHE Mapped</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{summary.totalStudents || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Enrolled across branches</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Validated Clean</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2">{summary.acceptedEnrolments || 0}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Compliant records</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Collision Alerts</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-2">{summary.flaggedEnrolments || 0}</div>
          <div className="text-[11px] text-red-600 font-medium mt-1">Dual Enrolment Flags</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Review Cases</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2">{summary.activeReviewCases || 0}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Pending Resolution</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Credentials</span>
            <FileBadge2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-700 mt-2">{summary.credentialsCount || 0}</div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">HMAC-SHA256 Signed</div>
        </div>
      </div>

      {/* Charts Section: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Approved Intake vs. Actual Enrolment (Course-Wise)
              </h2>
              <p className="text-xs text-slate-500">
                Comparison of AICTE approved regular capacity against enrolled student roster
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 font-medium">
              Sanction Compliance
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseStats} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="courseCode" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="approvedIntake" name="Approved Regular Intake" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualEnrolment" name="Actual Enrolment (Regular)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="supernumerary" name="Supernumerary Seats (TFW/PMSSS/FN)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900">State-Wise Institutions</h2>
            <p className="text-xs text-slate-500">AICTE accredited colleges by jurisdiction</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={stateDist} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="state" type="category" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Institutions" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Institution Sanction Compliance Table & Alerts Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Institution Intake Utilization Ledger</h2>
              <p className="text-xs text-slate-500">Monitoring excess intake violations across accredited technical institutes</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-2.5">Institution Code & Name</th>
                  <th className="px-3 py-2.5">State</th>
                  <th className="px-3 py-2.5 text-right">Approved</th>
                  <th className="px-3 py-2.5 text-right">Enrolled</th>
                  <th className="px-3 py-2.5 text-right">Supernumerary</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {institutionStats.map((inst) => (
                  <tr key={inst.institutionId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-3">
                      <div className="font-semibold text-slate-900">{inst.institutionName}</div>
                      <div className="text-[10px] font-mono text-slate-500">Code: {inst.code}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{inst.state}</td>
                    <td className="px-3 py-3 text-right font-medium text-slate-700">{inst.approved}</td>
                    <td className="px-3 py-3 text-right font-bold text-slate-900">{inst.actual}</td>
                    <td className="px-3 py-3 text-right text-amber-700 font-medium">+{inst.supernumerary}</td>
                    <td className="px-3 py-3 text-center">
                      {inst.isExcess ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                          Excess Intake
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Compliant ({inst.complianceRate}%)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Validation Alerts */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Validation Alerts</h2>
              <p className="text-xs text-slate-500">Automated intake and duplicate flags</p>
            </div>
            <button
              onClick={() => navigate('/platform/alerts')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              View All Alerts →
            </button>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {recentAlerts.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">No active alerts reported.</div>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border text-xs ${
                    alert.severity === 'ERROR'
                      ? 'bg-red-50/70 border-red-200 text-red-900'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="truncate max-w-[170px]">{alert.studentName || 'System Alert'}</span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        alert.severity === 'ERROR' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                      }`}
                    >
                      {alert.issueType}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-700 leading-snug line-clamp-2">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
