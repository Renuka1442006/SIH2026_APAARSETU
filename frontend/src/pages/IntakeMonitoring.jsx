import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  BarChart3,
  Building,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';

export const IntakeMonitoring = () => {
  const { user, isAicteAdmin } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstId, setSelectedInstId] = useState(
    user?.institutionId || ''
  );
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [intakeData, setIntakeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set Intake Modal (AICTE Admin)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    courseId: '',
    academicYear: '2024-25',
    approvedIntake: 60,
    maxSupernumerary: 9,
    approvalLetterRef: 'AICTE/WRO/2024-25/APP-REV',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const loadInstitutions = async () => {
    try {
      const res = await api.getInstitutions();
      setInstitutions(res);
      if (!selectedInstId && res.length > 0) {
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
    setModalLoading(true);
    setModalError(null);
    try {
      await api.setIntakeApproval(selectedInstId, approvalForm);
      setIsModalOpen(false);
      loadIntakeMetrics(selectedInstId);
    } catch (err) {
      setModalError(err.message || 'Failed to update approval sanction.');
    } finally {
      setModalLoading(false);
    }
  };

  const courses = intakeData?.courses || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Capacity Regulatory Control
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Academic Year: {academicYear}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            AICTE Approved Intake & Supernumerary Quota Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict compliance monitoring against sanctioned seats. Supernumerary categories (TFW 5%, PMSSS, Foreign National) are capped according to statutory AICTE handbook provisions.
          </p>
        </div>

        {isAicteAdmin && (
          <button
            onClick={() => {
              setModalError(null);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Set / Revise Sanctioned Intake</span>
          </button>
        )}
      </div>

      {/* Institution Picker (If AICTE Admin) */}
      {isAicteAdmin && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <Building className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Select Institution for Inspection
            </label>
            <select
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-blue-500"
            >
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.code}) — {i.state}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Institution Details Header */}
      {intakeData && (
        <div className="bg-slate-900 text-white p-5 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-400 font-semibold font-mono">
              AICTE CODE: {intakeData.institution?.code} • AISHE: {intakeData.institution?.aisheCode}
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">{intakeData.institution?.name}</h2>
            <p className="text-xs text-slate-400">{intakeData.institution?.state}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Total Courses Monitored</span>
            <div className="text-xl font-black text-amber-400">{courses.length}</div>
          </div>
        </div>
      )}

      {/* Courses Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs">Loading approved intake quotas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => {
            const regularPercent = Math.min(100, Math.round((c.regularCount / c.approvedIntake) * 100));
            const isExceeded = c.isExcessRegular;
            return (
              <div
                key={c.courseId}
                className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${
                  isExceeded ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {c.courseCode}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{c.courseName}</h3>
                  </div>

                  {isExceeded ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white animate-pulse">
                      Exceeded +{c.excessCount}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                      Vacant: {c.availableRegularSeats}
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Regular Enrolment</span>
                    <span>
                      {c.regularCount} / {c.approvedIntake} ({regularPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isExceeded ? 'bg-red-600' : regularPercent > 85 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, regularPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Supernumerary breakdown */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-amber-50/70 border border-amber-200">
                    <span className="text-[10px] font-semibold text-amber-800 uppercase">Supernumerary</span>
                    <div className="text-sm font-bold text-amber-900 mt-0.5">
                      {c.supernumeraryCount} / {c.maxSupernumerary}
                    </div>
                    <span className="text-[9px] text-amber-700">TFW/PMSSS/FN cap</span>
                  </div>

                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Enrolled</span>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{c.totalEnrolment}</div>
                    <span className="text-[9px] text-slate-400">Regular + Quota</span>
                  </div>
                </div>

                {/* Approval Ref Letter */}
                <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>AICTE Sanction Ref</span>
                  </span>
                  <span className="font-mono text-slate-600">{c.approvalLetterRef}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Set Intake Modal (AICTE Admin Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Set Approved Intake Sanction</h3>
                <p className="text-xs text-slate-500">Official statutory capacity granted to course.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIntakeSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Course *</label>
                <select
                  required
                  value={approvalForm.courseId}
                  onChange={(e) => setApprovalForm({ ...approvalForm, courseId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.courseId} value={c.courseId}>
                      {c.courseCode} - {c.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Approved Regular Sanctioned Intake *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={approvalForm.approvedIntake}
                  onChange={(e) =>
                    setApprovalForm({
                      ...approvalForm,
                      approvedIntake: parseInt(e.target.value, 10),
                      maxSupernumerary: Math.round(parseInt(e.target.value, 10) * 0.15),
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supernumerary Seat Cap (15% by AICTE norm)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={approvalForm.maxSupernumerary}
                  onChange={(e) =>
                    setApprovalForm({
                      ...approvalForm,
                      maxSupernumerary: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  AICTE Sanction Letter Reference Number *
                </label>
                <input
                  type="text"
                  required
                  value={approvalForm.approvalLetterRef}
                  onChange={(e) =>
                    setApprovalForm({ ...approvalForm, approvalLetterRef: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-sm hover:bg-blue-500"
                >
                  {modalLoading ? 'Saving...' : 'Apply Sanction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
