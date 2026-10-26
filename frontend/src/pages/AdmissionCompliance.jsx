import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  Building2,
  BarChart3,
  AlertOctagon,
  CheckCircle2,
  PlusCircle,
  RefreshCw,
  SlidersHorizontal,
  Gavel,
  ShieldCheck,
  X,
  FileBadge,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const AdmissionCompliance = () => {
  const { user, isAicteAdmin, activeInstitutionId } = useAuth();

  const [institutions, setInstitutions] = useState([]);
  const [selectedInstId, setSelectedInstId] = useState(
    isAicteAdmin ? (activeInstitutionId || '') : user?.institutionId || ''
  );
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [intakeData, setIntakeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sanction Revision Modal State (AICTE Admin)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    courseId: '',
    academicYear: '2024-25',
    approvedIntake: 60,
    maxSupernumerary: 9,
    approvalLetterRef: 'AICTE/WRO/2024-25/SANCTION-REV',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(null);
  const [modalError, setModalError] = useState(null);

  const loadInstitutions = async () => {
    try {
      const res = await api.getInstitutions();
      setInstitutions(res || []);
      if (!selectedInstId && res && res.length > 0) {
        setSelectedInstId(res[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadIntakeMetrics = async (instId) => {
    if (!instId) return;
    try {
      setLoading(true);
      const res = await api.getInstitutionIntake(instId, academicYear);
      setIntakeData(res);
    } catch (err) {
      console.error('Failed to load intake metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  useEffect(() => {
    if (selectedInstId) {
      loadIntakeMetrics(selectedInstId);
    }
  }, [selectedInstId, academicYear]);

  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInstId || !approvalForm.courseId) return;
    try {
      setModalLoading(true);
      setModalError(null);
      await api.setIntakeApproval(selectedInstId, {
        courseId: approvalForm.courseId,
        academicYear: approvalForm.academicYear,
        approvedIntake: Number(approvalForm.approvedIntake),
        maxSupernumerary: Number(approvalForm.maxSupernumerary),
        approvalLetterRef: approvalForm.approvalLetterRef,
      });
      setModalSuccess('Sanction capacity revision committed to national registry.');
      setTimeout(() => {
        setIsModalOpen(false);
        setModalSuccess(null);
        loadIntakeMetrics(selectedInstId);
      }, 1500);
    } catch (err) {
      setModalError(err.message || 'Failed to update approved intake.');
    } finally {
      setModalLoading(false);
    }
  };

  const courses = intakeData?.courses || [];
  const totals = intakeData?.totals || {
    totalApproved: 0,
    totalRegularEnrolled: 0,
    totalSupernumeraryEnrolled: 0,
    totalEnrolled: 0,
  };

  const isOverallOver = totals.totalRegularEnrolled > totals.totalApproved && totals.totalApproved > 0;

  // Chart data preparation
  const chartData = courses.map((c) => ({
    name: c.courseCode || c.courseName,
    Approved: c.approvedIntake,
    Regular: c.regularEnrolled,
    Supernumerary: c.supernumeraryEnrolled,
  }));

  return (
    <div className="space-y-6">
      {/* Top Header & Institutional Selector */}
      <div className="bg-white p-5 rounded-xl border border-gov-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gov-navy bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Statutory Intake Governance
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">AICTE APH 2024-25 Enforcement</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gov-navy mt-1 tracking-tight">
            Approved Intake vs Actual Admission Compliance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit actual candidate enrolments against sanctioned intake caps and supernumerary quotas (TFW, PMSSS, OCI).
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Institution Selector */}
          {isAicteAdmin && (
            <div className="flex items-center space-x-1.5 bg-gov-page border border-gov-border rounded-lg px-2.5 py-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5 text-gov-teal" />
              <select
                value={selectedInstId}
                onChange={(e) => setSelectedInstId(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer max-w-[220px] truncate"
              >
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Academic Year */}
          <div className="flex items-center space-x-1.5 bg-gov-page border border-gov-border rounded-lg px-2.5 py-1.5 text-xs">
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="2024-25">Session 2024-25</option>
              <option value="2023-24">Session 2023-24</option>
            </select>
          </div>

          {/* AICTE Admin: Adjust Sanction Modal Button */}
          {isAicteAdmin && (
            <button
              onClick={() => {
                if (courses.length > 0) {
                  setApprovalForm((prev) => ({
                    ...prev,
                    courseId: courses[0].courseId,
                    approvedIntake: courses[0].approvedIntake || 60,
                  }));
                }
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gov-navy hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>Revise Sanction</span>
            </button>
          )}

          <button
            onClick={() => loadIntakeMetrics(selectedInstId)}
            className="p-1.5 rounded-lg border border-gov-border bg-gov-page hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Institution Banner */}
      {intakeData?.institution && (
        <div className="bg-slate-50 border border-gov-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-700">
          <div>
            <span className="font-bold text-gov-navy text-sm">{intakeData.institution.name}</span>
            <div className="text-slate-500 text-[11px] mt-0.5">
              AICTE Permanent ID: <span className="font-mono font-semibold text-slate-700">{intakeData.institution.code}</span> • Category: {intakeData.institution.category} • State: {intakeData.institution.state}
            </div>
          </div>
          <div className="mt-2 sm:mt-0 font-mono text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded border border-gov-border">
            Status: Active Accredited Institute
          </div>
        </div>
      )}

      {/* 4 Summary Capacity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gov-border p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Sanctioned Intake (Regular)</div>
          <div className="text-2xl font-bold text-gov-navy mt-1 font-mono">
            {totals.totalApproved}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">AICTE Apex Approved Ceiling</div>
        </div>

        <div className="bg-white rounded-xl border border-gov-border p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Actual Regular Enrolment</div>
          <div className={`text-2xl font-bold font-mono mt-1 ${isOverallOver ? 'text-gov-error' : 'text-slate-900'}`}>
            {totals.totalRegularEnrolled}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {totals.totalApproved > 0
              ? `${Math.round((totals.totalRegularEnrolled / totals.totalApproved) * 100)}% utilization`
              : '0% utilization'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gov-border p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Supernumerary Seats Admitted</div>
          <div className="text-2xl font-bold text-gov-teal mt-1 font-mono">
            +{totals.totalSupernumeraryEnrolled}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">TFW 5% + PMSSS + Foreign Quotas</div>
        </div>

        <div className="bg-white rounded-xl border border-gov-border p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Overall Regulatory Status</div>
          <div className="mt-1.5">
            {isOverallOver ? (
              <span className="inline-flex items-center text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                ⚠️ Excess Admission Alert
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ✓ Fully Compliant
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Under APH Chapter VII Rules</div>
        </div>
      </div>

      {/* Chart: Sanctioned vs Regular vs Supernumerary by Course */}
      {courses.length > 0 && (
        <div className="bg-white rounded-xl border border-gov-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wide">
                Intake Capacity vs Actual Headcount by Discipline
              </h2>
              <p className="text-xs text-slate-500">
                Discipline-level comparison of approved ceiling against physical admissions
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {courses.length} Approved Programmes
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E6ED" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7A90' }} />
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
                <Bar dataKey="Approved" fill="#17365D" name="Approved Sanction" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Regular" fill="#167D8D" name="Regular Admitted" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Supernumerary" fill="#D97706" name="Supernumerary (TFW/PMSSS)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Course Compliance Breakdown Table */}
      <div className="bg-white rounded-xl border border-gov-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gov-border flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gov-navy">
              Course-Wise Statutory Compliance Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Detailed breakdown of approved seats, regular admissions, and supernumerary quotas
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gov-page border-b border-gov-border text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Programme & Branch</th>
                <th className="py-2.5 px-3">Sanctioned Intake</th>
                <th className="py-2.5 px-3">Regular Admitted</th>
                <th className="py-2.5 px-3">Supernumerary Breakdown</th>
                <th className="py-2.5 px-3">Capacity Utilization</th>
                <th className="py-2.5 px-3 text-center">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {courses.map((course) => {
                const util = Math.round(((course.regularEnrolled || 0) / (course.approvedIntake || 1)) * 100);
                const isOver = course.regularEnrolled > course.approvedIntake;
                return (
                  <tr key={course.courseId} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{course.courseName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Code: {course.courseCode} • Level: {course.level || 'UG'}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {course.approvedIntake}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className={`font-bold ${isOver ? 'text-gov-error' : 'text-slate-800'}`}>
                        {course.regularEnrolled}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-xs font-mono text-gov-teal font-semibold">
                        +{course.supernumeraryEnrolled} Seats
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Max Allowed: {course.maxSupernumerary || Math.floor(course.approvedIntake * 0.15)} (TFW 5% + PMSSS)
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isOver ? 'bg-gov-error' : 'bg-gov-teal'}`}
                            style={{ width: `${Math.min(util, 100)}%` }}
                          />
                        </div>
                        <span className={`text-[11px] font-mono font-semibold ${isOver ? 'text-gov-error' : 'text-slate-700'}`}>
                          {util}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isOver ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          ⚠️ Excess Intake (+{course.regularEnrolled - course.approvedIntake})
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ Compliant
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statutory Rules Citation & Legal Basis */}
      <div className="bg-white rounded-xl border border-gov-border p-5 shadow-xs text-xs text-slate-600 space-y-3">
        <div className="flex items-center space-x-2 text-gov-navy font-bold uppercase tracking-wider text-xs">
          <Gavel className="w-4 h-4 text-gov-teal" />
          <span>Statutory Authority & Compliance Guidelines</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed">
          <div className="p-3 bg-slate-50 rounded-lg border border-gov-border">
            <strong>AICTE Approval Process Handbook (APH) 2024-25, Clause 7.2 (TFW Scheme):</strong>
            <p className="mt-1 text-slate-500">
              Tuition Fee Waiver (TFW) supernumerary seats are restricted to a maximum of 5% of the approved intake per course. Candidates admitted under this quota must be certified below statutory income thresholds.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-gov-border">
            <strong>AICTE Act 1987 Section 10(k) (Sanction Ceiling Enforcement):</strong>
            <p className="mt-1 text-slate-500">
              No technical institution shall admit students in excess of approved intake without prior formal sanction from the All India Council for Technical Education. Any overcapacity admission shall be declared null and void.
            </p>
          </div>
        </div>
      </div>

      {/* AICTE Admin: Revise Sanction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gov-border max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gov-border pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <FileBadge className="w-5 h-5 text-gov-teal" />
                <h3 className="text-sm font-bold text-gov-navy">Revise Approved Sanction (AICTE)</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg mb-3">
                {modalSuccess}
              </div>
            )}

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg mb-3">
                {modalError}
              </div>
            )}

            <form onSubmit={handleIntakeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Programme:</label>
                <select
                  value={approvalForm.courseId}
                  onChange={(e) => setApprovalForm({ ...approvalForm, courseId: e.target.value })}
                  className="w-full p-2 border border-gov-border rounded-lg bg-gov-page focus:outline-none"
                  required
                >
                  {courses.map((c) => (
                    <option key={c.courseId} value={c.courseId}>
                      {c.courseName} ({c.courseCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Approved Intake Ceiling (Seats):</label>
                <input
                  type="number"
                  min="10"
                  max="480"
                  value={approvalForm.approvedIntake}
                  onChange={(e) => setApprovalForm({ ...approvalForm, approvedIntake: e.target.value })}
                  className="w-full p-2 border border-gov-border rounded-lg bg-gov-page font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supernumerary Ceiling (TFW/PMSSS):</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={approvalForm.maxSupernumerary}
                  onChange={(e) => setApprovalForm({ ...approvalForm, maxSupernumerary: e.target.value })}
                  className="w-full p-2 border border-gov-border rounded-lg bg-gov-page font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">AICTE Sanction Order Reference:</label>
                <input
                  type="text"
                  value={approvalForm.approvalLetterRef}
                  onChange={(e) => setApprovalForm({ ...approvalForm, approvalLetterRef: e.target.value })}
                  className="w-full p-2 border border-gov-border rounded-lg bg-gov-page font-mono focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gov-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-gov-border text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-1.5 rounded-lg bg-gov-navy hover:bg-slate-800 text-white font-semibold transition-colors shadow-xs"
                >
                  {modalLoading ? 'Committing...' : 'Commit Sanction Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
