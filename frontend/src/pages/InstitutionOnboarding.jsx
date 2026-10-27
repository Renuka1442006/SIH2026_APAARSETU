import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import {
  Building2,
  PlusCircle,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  User,
  Mail,
  Lock,
  MapPin,
  Shield,
} from 'lucide-react';

export const InstitutionOnboarding = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    code: '',
    name: '',
    aisheCode: '',
    state: 'Maharashtra',
    city: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    type: 'State Autonomous Institute',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminDesignation: 'Academic Dean / Registrar',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!form.name.trim() || !form.code.trim() || !form.aisheCode.trim()) {
      setError('Institution Name, AICTE Code, and AISHE Code are required.');
      return;
    }
    if (!form.adminEmail.trim() || !form.adminPassword) {
      setError('Initial administrator email and temporary password are required.');
      return;
    }
    if (form.adminPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.onboardInstitution(form);
      setSuccess({
        message: res.message || 'Institution and initial administrator provisioned successfully.',
        instName: form.name,
        instCode: form.code,
        adminEmail: form.adminEmail,
      });
      // Clear sensitive fields
      setForm((prev) => ({
        ...prev,
        adminPassword: '',
      }));
    } catch (err) {
      setError(err.message || 'Failed to onboard institution.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/platform/institutions"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-gov-navy transition-colors bg-white px-3 py-1.5 rounded-lg border border-gov-border shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Institution Directory</span>
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          Apex Authority: AICTE National Admin
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gov-border shadow-panel p-6 sm:p-8">
        <div className="flex items-start justify-between pb-5 border-b border-gov-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gov-navy">
                Onboard Accredited Technical Institution
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Register a new college node on the AICTE VidyarthiSetu gateway and securely provision its primary Institution Administrator.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
            National Provisioning
          </span>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Institution Successfully Onboarded</div>
              <p>{success.message}</p>
              <div className="mt-2 text-[11px] font-mono bg-white/80 p-2.5 rounded border border-emerald-200">
                <div>Institution: {success.instName} ({success.instCode})</div>
                <div>Admin Login: {success.adminEmail}</div>
              </div>
              <div className="pt-2">
                <Link
                  to="/platform/institutions"
                  className="font-bold underline hover:text-emerald-950"
                >
                  View in Institution Directory →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="font-medium leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Section 1: Institution Accreditation Details */}
          <div>
            <h2 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <span>1. Institution Accreditation & Identification</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Institution Name (as approved by AICTE) *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Sardar Patel College of Engineering"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  AICTE Permanent Institution Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 1-005"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  AISHE Code (Higher Education Survey) *
                </label>
                <input
                  type="text"
                  name="aisheCode"
                  value={form.aisheCode}
                  onChange={handleChange}
                  required
                  placeholder="e.g. C-33821"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  State / Union Territory *
                </label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi NCT</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City / Campus Location *
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Mumbai"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institution Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="State Autonomous Institute">State Autonomous Institute</option>
                  <option value="Institute of National Importance">Institute of National Importance</option>
                  <option value="Central University">Central University</option>
                  <option value="Private Deemed University">Private Deemed University</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Campus Help Desk Contact Email *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  required
                  placeholder="registrar@spce.ac.in"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Initial Admin Account Provisioning */}
          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <span>2. Primary Institution Administrator Account</span>
            </h2>
            <p className="text-[11px] text-slate-500 mb-4">
              Provision the root administrative account for this college. Passwords are cryptographically hashed using BCrypt before persisting to PostgreSQL.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Administrator Full Name *
                </label>
                <input
                  type="text"
                  name="adminName"
                  value={form.adminName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Dr. Sudhir Agrawal"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Administrative Designation
                </label>
                <input
                  type="text"
                  name="adminDesignation"
                  value={form.adminDesignation}
                  onChange={handleChange}
                  placeholder="Principal & Academic Registrar"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Administrator Login Email *
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  value={form.adminEmail}
                  onChange={handleChange}
                  required
                  placeholder="admin@spce.ac.in"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Temporary Account Password *
                </label>
                <input
                  type="password"
                  name="adminPassword"
                  value={form.adminPassword}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <Link
              to="/platform/institutions"
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-gov-navy hover:bg-gov-navy-dark text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Provisioning Node...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Onboard & Provision Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstitutionOnboarding;
