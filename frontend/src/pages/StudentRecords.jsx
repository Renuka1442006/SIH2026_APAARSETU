import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { StatusBadge } from '../components/Badge.jsx';
import {
  Users,
  Search,
  UserPlus,
  Eye,
  RefreshCw,
  FileCheck,
  X,
  CheckCircle2,
} from 'lucide-react';

export const StudentRecords = () => {
  const { user, isAicteAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [supernumeraryOnly, setSupernumeraryOnly] = useState(false);
  const [showMasked, setShowMasked] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(
    isAicteAdmin ? '' : user?.institutionId || ''
  );

  // Modals
  const [viewStudent, setViewStudent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: '',
    gender: 'MALE',
    dob: '2004-06-15',
    email: '',
    phone: '',
    apaarId: '',
    courseId: '',
    institutionId: user?.institutionId || '',
    academicYear: '2024-25',
    rollNumber: '',
    socialCategory: 'GENERAL',
    nriCategory: false,
    ociStatus: false,
    foreignNational: false,
    supernumeraryCategory: 'NONE',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addSuccess, setAddSuccess] = useState(null);

  const [availableCourses, setAvailableCourses] = useState([]);

  const fetchInstitutionsAndCourses = async () => {
    try {
      const insts = await api.getInstitutions();
      setInstitutions(insts);

      const allCourses = [];
      insts.forEach((inst) => {
        if (inst.courses) {
          inst.courses.forEach((c) => {
            allCourses.push({ ...c, instName: inst.name, instCode: inst.code });
          });
        }
      });
      setAvailableCourses(allCourses);

      if (allCourses.length > 0 && !addForm.courseId) {
        const matching = allCourses.find((c) =>
          user?.institutionId ? c.institutionId === user.institutionId : true
        );
        if (matching) {
          setAddForm((prev) => ({
            ...prev,
            courseId: matching.id,
            institutionId: matching.institutionId,
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (search) params.search = search;
      if (selectedInstitution) params.institutionId = selectedInstitution;
      if (selectedCourse) params.courseId = selectedCourse;
      if (selectedStatus) params.status = selectedStatus;
      if (supernumeraryOnly) params.supernumerary = 'true';

      const res = await api.getStudents(params);
      setStudents(res.students || []);
    } catch (err) {
      console.error('Failed to load students:', err);
      setError(err.message || 'Failed to fetch student records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutionsAndCourses();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [search, selectedInstitution, selectedCourse, selectedStatus, supernumeraryOnly]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    setAddSuccess(null);

    try {
      const payload = {
        ...addForm,
        institutionId: user?.institutionId || addForm.institutionId,
      };

      const result = await api.createStudent(payload);
      setAddSuccess(
        result.hasConflict
          ? 'Student added, but flagged with a Cross-Institution Collision Review Case!'
          : 'Student record enrolled successfully!'
      );
      loadStudents();
      setTimeout(() => {
        setIsAddModalOpen(false);
        setAddSuccess(null);
      }, 1500);
    } catch (err) {
      setAddError(err.message || 'Failed to create student record.');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              National Student Registry
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">{students.length} Records Loaded</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Student Records & APAAR Identity Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Query student enrolments, inspect simulated APAAR credentials, and audit supernumerary allocations.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowMasked(!showMasked)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{showMasked ? 'Mask Identifiers' : 'Reveal Unmasked (Authorized)'}</span>
          </button>

          <button
            onClick={() => {
              setAddError(null);
              setAddSuccess(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Student</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Name, APAAR ID or Roll No..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Institution Filter (For AICTE Admin) */}
          {isAicteAdmin && (
            <div className="lg:col-span-3">
              <select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Institutions</option>
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Course Filter */}
          <div className={isAicteAdmin ? 'lg:col-span-2' : 'lg:col-span-4'}>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Courses</option>
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Enrolment Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="FLAGGED">FLAGGED (Collisions)</option>
              <option value="TRANSFERRED">TRANSFERRED</option>
              <option value="GRADUATED">GRADUATED</option>
            </select>
          </div>

          {/* Supernumerary checkbox toggle */}
          <div className="lg:col-span-1 flex items-center">
            <label className="flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={supernumeraryOnly}
                onChange={(e) => setSupernumeraryOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium">Quota</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Student Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Loading student records...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No student records found</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Roll Number</th>
                  <th className="px-4 py-3">Student Full Name</th>
                  <th className="px-4 py-3">APAAR Identifier</th>
                  <th className="px-4 py-3">Institution & Course</th>
                  <th className="px-4 py-3">Quota / Supernumerary</th>
                  <th className="px-4 py-3">APAAR Status</th>
                  <th className="px-4 py-3">Enrolment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => {
                  const enr = st.enrolments?.[0];
                  const hasCollision = enr?.status === 'FLAGGED';
                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        hasCollision ? 'bg-red-50/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-medium text-slate-700">
                        {enr?.rollNumber || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{st.fullName}</div>
                        <div className="text-[10px] text-slate-500">
                          {st.gender} • DOB: {new Date(st.dob).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {st.apaarId ? (
                          <span className="font-mono text-slate-800 font-medium">
                            {showMasked
                              ? st.apaarId
                              : st.apaarId.length >= 8
                              ? `XXXX-XXXX-${st.apaarId.slice(-4)}`
                              : `XXXX-${st.apaarId.slice(-2)}`}
                          </span>
                        ) : (
                          <span className="text-red-500 font-semibold italic">Missing ID</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">
                          {enr?.course?.code || 'BT-CSE'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                          {st.currentInstitution?.name || 'Institution'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {st.supernumeraryCategory !== 'NONE' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            {st.supernumeraryCategory}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">{st.socialCategory}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={st.apaarStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={enr?.status || 'ACTIVE'} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setViewStudent(st)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Student Profile Modal */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewStudent.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  APAAR: {viewStudent.apaarId || 'MISSING (Unlinked)'}
                </p>
              </div>
              <button
                onClick={() => setViewStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Gender</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{viewStudent.gender}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Date of Birth</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {new Date(viewStudent.dob).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Social Category</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{viewStudent.socialCategory}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Supernumerary</span>
                  <div className="font-semibold text-amber-700 mt-0.5">
                    {viewStudent.supernumeraryCategory || 'NONE'}
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Aadhaar Vault Ref</span>
                  <div className="font-mono text-slate-700 mt-0.5">
                    {viewStudent.aadhaarVaultRef || 'AV-XXXX-XXXX'}
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Verification</span>
                  <div className="mt-0.5">
                    <StatusBadge status={viewStudent.apaarStatus} />
                  </div>
                </div>
              </div>

              {/* Enrolment History */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Academic Enrolment Timeline & History
                </h4>
                <div className="space-y-2">
                  {viewStudent.enrolments?.map((enr) => (
                    <div
                      key={enr.id}
                      className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          {enr.course?.name} ({enr.course?.code})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {enr.institution?.name} • Year {enr.academicYear} • Roll:{' '}
                          <span className="font-mono font-medium">{enr.rollNumber}</span>
                        </div>
                      </div>
                      <StatusBadge status={enr.status} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Issued Credentials */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Issued Verifiable Credentials
                </h4>
                {viewStudent.credentials && viewStudent.credentials.length > 0 ? (
                  <div className="space-y-2">
                    {viewStudent.credentials.map((crd) => (
                      <div
                        key={crd.id}
                        className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="font-mono font-bold text-emerald-900">
                              {crd.credentialReference}
                            </span>
                            <div className="text-[10px] text-emerald-700">
                              Status: {crd.status} • Issued: {new Date(crd.issuedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">
                          HMAC Verified
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-dashed border-slate-300 text-center text-xs text-slate-400">
                    No verifiable credentials issued yet.
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setViewStudent(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Enroll New Student</h3>
                <p className="text-xs text-slate-500">
                  Adds student record with real-time APAAR validation and cross-institution collision check.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {addError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {addError}
                </div>
              )}
              {addSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{addSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.fullName}
                    onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                    placeholder="e.g. Siddharth Verma"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    APAAR Identifier (12 digits)
                  </label>
                  <input
                    type="text"
                    value={addForm.apaarId}
                    onChange={(e) => setAddForm({ ...addForm, apaarId: e.target.value })}
                    placeholder="e.g. 2026-9811-9921"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Leave blank to test missing APAAR handling.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={addForm.gender}
                    onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={addForm.dob}
                    onChange={(e) => setAddForm({ ...addForm, dob: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course / Branch *
                  </label>
                  <select
                    required
                    value={addForm.courseId}
                    onChange={(e) => {
                      const sel = availableCourses.find((c) => c.id === e.target.value);
                      setAddForm({
                        ...addForm,
                        courseId: e.target.value,
                        institutionId: sel ? sel.institutionId : addForm.institutionId,
                      });
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Course</option>
                    {availableCourses
                      .filter((c) => (user?.institutionId ? c.institutionId === user.institutionId : true))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institution Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.rollNumber}
                    onChange={(e) => setAddForm({ ...addForm, rollNumber: e.target.value })}
                    placeholder="e.g. 2024CS10901"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Social Category
                  </label>
                  <select
                    value={addForm.socialCategory}
                    onChange={(e) => setAddForm({ ...addForm, socialCategory: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supernumerary Seat Category
                  </label>
                  <select
                    value={addForm.supernumeraryCategory}
                    onChange={(e) => setAddForm({ ...addForm, supernumeraryCategory: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="NONE">NONE (Regular Sanctioned Seat)</option>
                    <option value="TFW">TFW (Tuition Fee Waiver - 5%)</option>
                    <option value="PMSSS">PMSSS (J&K Special Scholarship)</option>
                    <option value="JK_MIGRANT">JK Migrant</option>
                    <option value="FOREIGN_NATIONAL">Foreign National / PIO</option>
                    <option value="CW">Children of Armed Forces (CW)</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-700">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addForm.nriCategory}
                    onChange={(e) => setAddForm({ ...addForm, nriCategory: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>NRI Quota</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addForm.ociStatus}
                    onChange={(e) => setAddForm({ ...addForm, ociStatus: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>OCI Cardholder</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addForm.foreignNational}
                    onChange={(e) => setAddForm({ ...addForm, foreignNational: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Foreign National</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  {addLoading ? 'Enrolling...' : 'Confirm & Save Enrolment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
