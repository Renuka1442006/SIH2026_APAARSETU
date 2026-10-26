import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { StatusBadge } from '../components/Badge.jsx';
import {
  Building,
  UploadCloud,
  UserPlus,
  QrCode,
  Download,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const InstitutionDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [institution, setInstitution] = useState(null);
  const [intakeMetrics, setIntakeMetrics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const institutionId = user?.institutionId;

  const loadDashboardData = async () => {
    if (!institutionId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const [instData, metricsData, studentsData] = await Promise.all([
        api.getInstitutionById(institutionId),
        api.getInstitutionIntake(institutionId),
        api.getStudents({ institutionId, limit: '8' }),
      ]);

      setInstitution(instData);
      setIntakeMetrics(metricsData);
      setStudents(studentsData.students || []);
    } catch (err) {
      console.error('Failed to load institution dashboard:', err);
      setError(err.message || 'Failed to load institution records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [institutionId]);

  if (loading && !institution) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const courses = intakeMetrics?.courses || [];

  return (
    <div className="space-y-6">
      {/* Institution Profile Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-blue-800/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center flex-shrink-0">
              <Building className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  AICTE Code: {institution?.code || 'N/A'}
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-300">AISHE: {institution?.aisheCode}</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-emerald-400 font-medium">{institution?.type}</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mt-1 text-white">
                {institution?.name || 'Technical Institution'}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                {institution?.address || `${institution?.city}, ${institution?.state}`} • Contact:{' '}
                {institution?.contactEmail}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate?.('bulk-upload')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Bulk CSV Upload</span>
            </button>
            <button
              onClick={() => onNavigate?.('students')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
            <button
              onClick={() => onNavigate?.('credentials')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Issue Credential</span>
            </button>
          </div>
        </div>
      </div>

      {/* Approved Intake Capacity Meters */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Sanctioned Intake Quota Monitoring (Academic Year: 2024-25)
            </h2>
            <p className="text-xs text-slate-500">
              Official capacity granted by AICTE. Supernumerary seats (TFW, PMSSS, Foreign National) are audited separately.
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('intake')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>Detailed Capacity View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => {
            const percent = Math.min(100, Math.round((c.regularCount / c.approvedIntake) * 100));
            const isExceeded = c.isExcessRegular;
            return (
              <div
                key={c.courseId}
                className={`p-4 rounded-xl border transition-all ${
                  isExceeded
                    ? 'bg-red-50/50 border-red-300'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {c.courseCode}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">{c.courseName}</h3>
                  </div>
                  {isExceeded ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">
                      Exceeded +{c.excessCount}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Available: {c.availableRegularSeats}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                    <span>Regular: {c.regularCount} / {c.approvedIntake}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isExceeded ? 'bg-red-600' : percent > 85 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Supernumerary Enrolled: <strong className="text-amber-700 font-semibold">{c.supernumeraryCount}</strong></span>
                  <span className="font-mono">{c.approvalLetterRef}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Student Admissions Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Student Admissions</h2>
            <p className="text-xs text-slate-500">Enrolment roster linked to synthetic APAAR validation</p>
          </div>
          <button
            onClick={() => onNavigate?.('students')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>View All Records ({students.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-2.5">Roll Number</th>
                <th className="px-3 py-2.5">Student Full Name</th>
                <th className="px-3 py-2.5">APAAR Identifier</th>
                <th className="px-3 py-2.5">Course</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Supernumerary</th>
                <th className="px-3 py-2.5">APAAR Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st) => {
                const enr = st.enrolments?.[0];
                return (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-medium text-slate-700">
                      {enr?.rollNumber || 'N/A'}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">{st.fullName}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-600">
                      {st.apaarId ? st.apaarId : <span className="text-red-500 italic">Not Provided</span>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{enr?.course?.code || 'BT-CSE'}</td>
                    <td className="px-3 py-2.5 text-slate-600">{st.socialCategory}</td>
                    <td className="px-3 py-2.5">
                      {st.supernumeraryCategory !== 'NONE' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          {st.supernumeraryCategory}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={st.apaarStatus} />
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
