import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import {
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building,
  ShieldCheck,
  Save,
  RefreshCw,
  HelpCircle,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export const AddStudent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Dropdown options loaded from PostgreSQL
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [admissionCategories, setAdmissionCategories] = useState([]);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState([]);
  
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState('UG');

  const [form, setForm] = useState({
    fullName: '',
    gender: 'MALE',
    dob: '2005-06-15',
    email: '',
    phone: '',
    apaarId: '',
    rollNumber: '',
    courseId: '',
    academicYear: '2024-25',
    admissionStatus: 'CONFIRMED',
    socialCategory: 'GENERAL',
    supernumeraryCategory: 'NONE',
    nriCategory: false,
    ociStatus: false,
    foreignNational: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadDatabaseOptions = async () => {
    try {
      setLoadingOptions(true);
      setOptionsError(null);

      const [coursesRes, yearsRes, catsRes, statusesRes] = await Promise.all([
        api.getInstitutionCoursesOption(),
        api.getInstitutionAcademicYearsOption(),
        api.getInstitutionAdmissionCategoriesOption(),
        api.getInstitutionEnrollmentStatusesOption(),
      ]);

      const courseList = coursesRes?.data || [];
      const yearList = yearsRes?.data || [];
      const catList = catsRes?.data || [];
      const statusList = statusesRes?.data || [];

      setCourses(courseList);
      setAcademicYears(yearList);
      setAdmissionCategories(catList);
      setEnrollmentStatuses(statusList);

      // Set initial defaults from real database options
      if (courseList.length > 0) {
        const ugCourse = courseList.find((c) => (c.level || 'UG') === 'UG') || courseList[0];
        const defaultProg = ugCourse.level || 'UG';
        setSelectedProgram(defaultProg);
        if (!form.courseId) {
          setForm((prev) => ({ ...prev, courseId: ugCourse.id }));
        }
      }
      if (yearList.length > 0 && !form.academicYear) {
        setForm((prev) => ({ ...prev, academicYear: yearList[0] }));
      }
      if (statusList.length > 0 && !form.admissionStatus) {
        setForm((prev) => ({ ...prev, admissionStatus: statusList[0].code }));
      }
    } catch (err) {
      console.error('Failed to load database options for Add Student:', err);
      setOptionsError(err.message || 'Unable to connect to database to fetch admission options.');
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    loadDatabaseOptions();
  }, [user?.institutionId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Frontend Field Validation
    if (!form.fullName.trim()) {
      setError('Student full name is required as per official Class 10th/12th certificate.');
      return;
    }
    if (!form.rollNumber.trim()) {
      setError('Institution-assigned roll number is mandatory.');
      return;
    }
    if (!form.courseId) {
      setError('Please select an AICTE-approved course from the dropdown.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        gender: form.gender,
        dob: form.dob,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        apaarId: form.apaarId.trim() || undefined,
        currentInstitutionId: user?.institutionId,
        socialCategory: form.socialCategory,
        supernumeraryCategory: form.supernumeraryCategory,
        nriCategory: form.nriCategory,
        ociStatus: form.ociStatus,
        foreignNational: form.foreignNational,
        courseId: form.courseId,
        academicYear: form.academicYear,
        admissionStatus: form.admissionStatus,
        rollNumber: form.rollNumber.trim(),
        admissionDate: new Date().toISOString(),
      };

      const res = await api.createInstitutionStudent(payload);
      setSuccess(
        res.message ||
          `Student record for ${form.fullName} successfully registered in PostgreSQL database with status '${form.admissionStatus}'.`
      );

      // Reset form fields
      setForm((prev) => ({
        ...prev,
        fullName: '',
        email: '',
        phone: '',
        apaarId: '',
        rollNumber: '',
        supernumeraryCategory: 'NONE',
      }));

      // Scroll to notification banner
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Failed to submit student record to PostgreSQL.');
    } finally {
      setSubmitting(false);
    }
  };

  const regularCategories = admissionCategories.filter(
    (c) => c.type === 'REGULAR' || c.type === 'RESERVATION'
  );
  const supernumeraryCategories = admissionCategories.filter(
    (c) => c.type === 'SUPERNUMERARY'
  );

  // Available Degree Programs from real database courses
  const availablePrograms = React.useMemo(() => {
    const levels = new Set(courses.map((c) => c.level || 'UG'));
    const programMeta = [
      { code: 'UG', label: 'B.Tech / B.E. (Undergraduate)' },
      { code: 'PG', label: 'M.Tech / M.E. (Postgraduate)' },
      { code: 'DIPLOMA', label: 'Diploma in Engineering' },
    ];
    const matched = programMeta.filter((p) => levels.has(p.code));
    if (matched.length > 0) return matched;
    if (courses.length > 0) {
      return Array.from(levels).map((lvl) => ({ code: lvl, label: `${lvl} Program` }));
    }
    return programMeta;
  }, [courses]);

  // Dynamic branches belonging to the chosen Degree Program
  const filteredBranches = React.useMemo(() => {
    return courses.filter((c) => (c.level || 'UG') === selectedProgram);
  }, [courses, selectedProgram]);

  const handleProgramChange = (e) => {
    const newProg = e.target.value;
    setSelectedProgram(newProg);
    const matching = courses.filter((c) => (c.level || 'UG') === newProg);
    if (matching.length > 0) {
      setForm((prev) => ({ ...prev, courseId: matching[0].id }));
    } else {
      setForm((prev) => ({ ...prev, courseId: '' }));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/institution/students"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-gov-navy transition-colors bg-white px-3 py-1.5 rounded-lg border border-gov-border shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Student Registry</span>
        </Link>
        <span className="text-xs font-mono font-bold text-gov-navy">
          Scope: {user?.institution?.code || '1-001'} (Local Institution Node)
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gov-border shadow-panel p-6 sm:p-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gov-border gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-gov-navy shrink-0 shadow-2xs">
              <UserPlus className="w-6 h-6 text-gov-teal" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gov-teal bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  PostgreSQL-Backed Enrolment
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">One-by-One Student Intake</span>
              </div>
              <h1 className="text-xl font-bold text-gov-navy tracking-tight mt-0.5">
                Register Student Record & Link APAAR ID
              </h1>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Target College</div>
            <div className="text-xs font-bold text-gov-navy mt-0.5 max-w-[200px] truncate">
              {user?.institution?.name || 'Assigned Institution'}
            </div>
          </div>
        </div>

        {/* Options Loading State */}
        {loadingOptions && (
          <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center space-y-2">
            <RefreshCw className="w-6 h-6 text-gov-navy animate-spin" />
            <p className="font-semibold">Loading statutory options from PostgreSQL database...</p>
            <span className="text-[10px] text-slate-400 font-mono">
              Fetching approved courses, academic sessions, and admission categories...
            </span>
          </div>
        )}

        {/* Options Error Banner with Retry */}
        {optionsError && !loadingOptions && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start justify-between mt-4">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-rose-900">Failed to load admission dropdowns</h4>
                <p className="text-xs text-rose-700 mt-0.5">{optionsError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadDatabaseOptions}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Success Feedback */}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3 mt-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-900">Enrolment Successfully Committed!</h4>
              <p className="text-xs text-emerald-700 mt-0.5">{success}</p>
              <div className="mt-2.5 flex items-center space-x-3">
                <Link
                  to="/institution/students"
                  className="text-xs font-bold text-emerald-800 hover:underline"
                >
                  View in Student Registry →
                </Link>
                <Link
                  to="/institution/dashboard"
                  className="text-xs font-bold text-slate-600 hover:underline"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 mt-4">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-900">Submission Blocked</h4>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {!loadingOptions && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Section 1: Demographic & Identity */}
            <div>
              <h2 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <span>1. Candidate Demographic & Identity Attributes</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Candidate Full Name (as per 10th/12th Certificate) *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Aarav Sharma"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    12-Digit APAAR Identifier (Automated Academic Account)
                  </label>
                  <input
                    type="text"
                    name="apaarId"
                    value={form.apaarId}
                    onChange={handleChange}
                    placeholder="e.g. 2026-9811-3001"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Synthetic test format: XXXX-XXXX-XXXX (Leave blank if provisional)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other / Transgender</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Official / Contact Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="student@example.in"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Contact Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91-9876543210"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Academic Program & Roll Number */}
            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <span>2. Academic Enrolment & Sanction Quota Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institution Roll Number / Enrolment ID *
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={form.rollNumber}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 2024CS10105"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                {/* Dropdown 1: Degree Program */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Degree Program *
                  </label>
                  <select
                    value={selectedProgram}
                    onChange={handleProgramChange}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy"
                  >
                    {availablePrograms.map((prog) => (
                      <option key={prog.code} value={prog.code}>
                        {prog.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Filters the available department branches below
                  </span>
                </div>

                {/* Dropdown 2: Branch / Discipline */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Branch / Discipline *
                  </label>
                  {filteredBranches.length === 0 ? (
                    <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-800">
                      No branches found for this program in database.
                    </div>
                  ) : (
                    <select
                      name="courseId"
                      value={form.courseId}
                      onChange={handleChange}
                      required
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy font-medium text-slate-800"
                    >
                      <option value="">-- Select Branch / Discipline --</option>
                      {filteredBranches.map((c) => {
                        const branchName = c.name.includes(' in ') ? c.name.split(' in ')[1] : c.name;
                        return (
                          <option key={c.id} value={c.id}>
                            {c.code} — {branchName} ({c.durationYears || 4} Years)
                          </option>
                        );
                      })}
                    </select>
                  )}
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    AICTE sanctioned discipline
                  </span>
                </div>

                {/* Dropdown 2: Academic Years from PostgreSQL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Year *
                  </label>
                  <select
                    name="academicYear"
                    value={form.academicYear}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {academicYears.map((yr) => (
                      <option key={yr} value={yr}>
                        Session {yr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dropdown 3: Enrolment Statuses from PostgreSQL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admission Status *
                  </label>
                  <select
                    name="admissionStatus"
                    value={form.admissionStatus}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {enrollmentStatuses.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dropdown 4: Social / Regular Admission Categories from PostgreSQL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Constitutional Social Category *
                  </label>
                  <select
                    name="socialCategory"
                    value={form.socialCategory}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {regularCategories.length > 0
                      ? regularCategories.map((cat) => (
                          <option key={cat.code} value={cat.code}>
                            {cat.name}
                          </option>
                        ))
                      : [
                          <option key="GEN" value="GENERAL">General / Open Merit</option>,
                          <option key="OBC" value="OBC_NCL">OBC-NCL</option>,
                          <option key="SC" value="SC">Scheduled Caste (SC)</option>,
                          <option key="ST" value="ST">Scheduled Tribe (ST)</option>,
                          <option key="EWS" value="EWS">Economically Weaker Section (EWS)</option>,
                        ]}
                  </select>
                </div>

                {/* Dropdown 5: Supernumerary Quota from PostgreSQL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    AICTE Supernumerary Quota Classification
                  </label>
                  <select
                    name="supernumeraryCategory"
                    value={form.supernumeraryCategory}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="NONE">None (Regular Approved Capacity)</option>
                    {supernumeraryCategories.map((sCat) => (
                      <option key={sCat.code} value={sCat.code}>
                        {sCat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Special Categories Toggle */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Special Status Classifications (if applicable)
              </label>
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="nriCategory"
                    checked={form.nriCategory}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-gov-navy focus:ring-gov-navy/20"
                  />
                  <span>NRI Sponsored Ward</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="ociStatus"
                    checked={form.ociStatus}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-gov-navy focus:ring-gov-navy/20"
                  />
                  <span>OCI / PIO Cardholder</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="foreignNational"
                    checked={form.foreignNational}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-gov-navy focus:ring-gov-navy/20"
                  />
                  <span>Foreign National (CIWG)</span>
                </label>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-5 border-t border-slate-100 flex items-center justify-end space-x-3">
              <Link
                to="/institution/students"
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || courses.length === 0}
                className="px-5 py-2 rounded-lg bg-gov-navy hover:bg-gov-navy-dark text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    <span>Validating & Registering...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-amber-300" />
                    <span>Commit Student Record</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddStudent;
