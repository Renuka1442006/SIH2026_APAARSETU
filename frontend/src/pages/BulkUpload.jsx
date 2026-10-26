import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  UploadCloud,
  Download,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  FileCheck,
  ArrowRight,
} from 'lucide-react';

export const BulkUpload = ({ onNavigate }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [academicYear, setAcademicYear] = useState('2024-25');
  const [selectedFile, setSelectedFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [commitSuccess, setCommitSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('all');

  const handleDownloadTemplate = () => {
    window.location.href = api.getTemplateUrl();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setValidationResult(null);
      setCommitSuccess(null);
      setError(null);
      processFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setValidationResult(null);
      setCommitSuccess(null);
      setError(null);
      processFile(file);
    }
  };

  const processFile = async (file) => {
    try {
      setValidating(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('academicYear', academicYear);
      if (user?.institutionId) {
        formData.append('institutionId', user.institutionId);
      }

      const res = await api.validatePreview(formData);
      setValidationResult(res);
    } catch (err) {
      console.error('Validation error:', err);
      setError(err.message || 'Failed to process and validate CSV file.');
    } finally {
      setValidating(false);
    }
  };

  const handleCommit = async () => {
    if (!validationResult || !validationResult.processedRows) return;
    try {
      setCommitting(true);
      setError(null);

      const payload = {
        institutionId: user?.institutionId,
        academicYear,
        fileName: selectedFile?.name || 'Bulk_Admissions.csv',
        rows: validationResult.processedRows,
      };

      const res = await api.commitBatch(payload);
      setCommitSuccess(res.message);
    } catch (err) {
      console.error('Commit error:', err);
      setError(err.message || 'Failed to commit batch to database.');
    } finally {
      setCommitting(false);
    }
  };

  const issues = validationResult?.issues || [];
  const filteredIssues = issues.filter((iss) => {
    if (activeTab === 'errors') return iss.severity === 'ERROR';
    if (activeTab === 'warnings') return iss.severity === 'WARNING';
    if (activeTab === 'accepted') return iss.severity === 'INFO';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Bulk Admissions Pipeline
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Academic Year: {academicYear}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Bulk CSV Upload & Automated Validation Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit intake rosters in CSV format. The validation engine performs row-by-row APAAR checks, format inspection, intake quota audits, and cross-institution collision detection.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>Download Official CSV Template</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start space-x-3">
          <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Validation Execution Error</div>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {commitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <div className="font-bold">Batch Enrolment Completed!</div>
              <p className="mt-0.5">{commitSuccess}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate?.('students')}
            className="flex items-center space-x-1 font-bold text-emerald-800 hover:text-emerald-950 underline"
          >
            <span>View Enrolled Students</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="bg-white border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-blue-50/20 group shadow-sm"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-blue-50 group-hover:bg-blue-100 border border-blue-200 flex items-center justify-center mx-auto mb-4 text-blue-600 transition-colors">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-slate-800">
          {selectedFile ? selectedFile.name : 'Drag & drop student admissions CSV file here'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Supports standardized AICTE format (.csv, up to 5MB). Standard fields: fullName, gender, dob, apaarId, courseCode, rollNumber, supernumeraryCategory.
        </p>

        <div className="mt-4 flex items-center justify-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow-sm group-hover:bg-blue-500 transition-colors">
            {selectedFile ? 'Change File' : 'Browse Local Files'}
          </span>
        </div>
      </div>

      {/* Validating Spinner */}
      {validating && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-sm">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">
            Running AICTE Automated Validation Engine...
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Validating 12-digit APAAR format • Checking duplicates within file • Auditing cross-institution collisions • Verifying approved intake quota.
          </p>
        </div>
      )}

      {/* Validation Results Overview Cards */}
      {validationResult && !validating && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Total Rows Inspected</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {validationResult.totalRows}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Parsed from CSV</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
              <span className="text-xs font-semibold text-emerald-800">Accepted For Enrolment</span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                {validationResult.acceptedRows}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Ready to commit</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/30 shadow-sm">
              <span className="text-xs font-semibold text-red-800">Rejected (Errors)</span>
              <div className="text-2xl font-extrabold text-red-600 mt-1">
                {validationResult.rejectedRows}
              </div>
              <div className="text-[11px] text-red-600 font-medium mt-0.5">Violates rules</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
              <span className="text-xs font-semibold text-amber-800">Warnings / Notices</span>
              <div className="text-2xl font-extrabold text-amber-700 mt-1">
                {validationResult.warningRows}
              </div>
              <div className="text-[11px] text-amber-600 font-medium mt-0.5">Missing ID / Notes</div>
            </div>
          </div>

          {/* Intake Quota Impact Table */}
          {validationResult.intakeAnalysis && validationResult.intakeAnalysis.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Projected Course Intake Impact Analysis
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Assessing how this incoming batch impacts your approved regular quota.
              </p>

              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-3 py-2">Course</th>
                      <th className="px-3 py-2 text-right">Sanctioned Quota</th>
                      <th className="px-3 py-2 text-right">Current Enrolled</th>
                      <th className="px-3 py-2 text-right">New Batch Regular</th>
                      <th className="px-3 py-2 text-right">New Supernumerary</th>
                      <th className="px-3 py-2 text-right">Projected Total Regular</th>
                      <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {validationResult.intakeAnalysis.map((c) => (
                      <tr key={c.courseCode}>
                        <td className="px-3 py-2 font-bold text-slate-800">{c.courseName} ({c.courseCode})</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-700">{c.approvedIntake}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{c.currentEnrolment}</td>
                        <td className="px-3 py-2 text-right font-semibold text-blue-700">+{c.newBatchRegular}</td>
                        <td className="px-3 py-2 text-right font-semibold text-amber-700">+{c.newBatchSupernumerary}</td>
                        <td className="px-3 py-2 text-right font-extrabold text-slate-900">{c.projectedTotalRegular}</td>
                        <td className="px-3 py-2 text-center">
                          {c.isExceeded ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                              Exceeded by {c.projectedTotalRegular - c.approvedIntake} Seats!
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Within Capacity ({c.remainingQuota} seats left)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Row-by-Row Diagnostics Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Validation Engine Diagnostics Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed inspection reasons per row. Blockers must be resolved prior to admission.
                </p>
              </div>

              {/* Tab Filters */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  All ({issues.length})
                </button>
                <button
                  onClick={() => setActiveTab('errors')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    activeTab === 'errors' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Errors ({validationResult.rejectedRows})
                </button>
                <button
                  onClick={() => setActiveTab('warnings')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    activeTab === 'warnings' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Warnings ({validationResult.warningRows})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Row #</th>
                    <th className="px-4 py-2.5">Student Name</th>
                    <th className="px-4 py-2.5">APAAR ID</th>
                    <th className="px-4 py-2.5">Diagnostic Rule / Issue Type</th>
                    <th className="px-4 py-2.5">Reason & Details</th>
                    <th className="px-4 py-2.5 text-center">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIssues.map((iss, index) => {
                    const isCollision = iss.issueType === 'CROSS_INSTITUTION_DUPLICATE';
                    return (
                      <tr
                        key={index}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isCollision ? 'bg-red-50/60 font-semibold' : ''
                        }`}
                      >
                        <td className="px-4 py-2.5 font-mono text-slate-500">{iss.rowNumber}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-900">{iss.studentName}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-700">{iss.apaarId}</td>
                        <td className="px-4 py-2.5">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                            {iss.issueType}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-700">{iss.message}</td>
                        <td className="px-4 py-2.5 text-center">
                          {iss.severity === 'ERROR' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                              BLOCKING ERROR
                            </span>
                          )}
                          {iss.severity === 'WARNING' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              WARNING
                            </span>
                          )}
                          {iss.severity === 'INFO' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              SIMULATED NOTICE
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Commit Actions Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs text-slate-500">
                <span>{validationResult.acceptedRows} of {validationResult.totalRows} records are compliant.</span>
                {validationResult.rejectedRows > 0 && (
                  <span className="text-red-600 font-semibold ml-1">
                    Rejected rows ({validationResult.rejectedRows}) will be skipped from the commit.
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setValidationResult(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  Clear & Re-Upload
                </button>
                <button
                  onClick={handleCommit}
                  disabled={committing || validationResult.acceptedRows === 0}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>
                    {committing
                      ? 'Committing Enrolments...'
                      : `Commit ${validationResult.acceptedRows} Accepted Students`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
