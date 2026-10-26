import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import {
  Building2,
  Users,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  UserPlus,
  PlusCircle,
  X,
} from 'lucide-react';

export const InstitutionSettings = () => {
  const { user } = useAuth();
  const [institution, setInstitution] = useState(null);
  const [settings, setSettings] = useState(null);
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Add Staff Modal
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', designation: 'Nodal Admission Officer' });
  const [staffSubmitting, setStaffSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    aisheCode: '',
    state: '',
    city: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    type: '',
    primaryNodalOfficer: '',
    complianceAutoAlerts: true,
    autoFlagDuplicates: true,
  });

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [settingsRes, staffRes] = await Promise.all([
        api.getInstitutionSettings().catch(() => null),
        api.getInstitutionStaff().catch(() => null),
      ]);

      const inst = settingsRes?.data?.institution || user?.institution || {
        name: 'Indian Institute of Technology Delhi',
        code: '1-001',
        aisheCode: 'U-0109',
        type: 'Institute of National Importance',
        city: 'New Delhi',
        state: 'Delhi',
        contactEmail: 'admin@iitd.ac.in',
        contactPhone: '+91-11-2659-1000',
      };

      const setts = settingsRes?.data?.settings || {
        primaryNodalOfficer: 'Prof. Rajesh K. Varma',
        nodalEmail: 'admin@iitd.ac.in',
        nodalPhone: '+91-11-2659-1000',
        complianceAutoAlerts: true,
        autoFlagDuplicates: true,
      };

      setInstitution(inst);
      setSettings(setts);
      setStaffUsers(staffRes?.data || [
        {
          id: 'u-1',
          name: user?.name || 'Prof. Rajesh K. Varma',
          email: user?.email || 'admin@iitd.ac.in',
          designation: user?.designation || 'Dean of Academic Admissions',
          role: 'INSTITUTION_ADMIN',
        },
      ]);

      setForm({
        name: inst.name || '',
        code: inst.code || '',
        aisheCode: inst.aisheCode || '',
        state: inst.state || '',
        city: inst.city || '',
        address: inst.address || 'Hauz Khas, New Delhi 110016',
        contactEmail: inst.contactEmail || 'admin@iitd.ac.in',
        contactPhone: inst.contactPhone || '+91-11-2659-1000',
        type: inst.type || 'Institute of National Importance',
        primaryNodalOfficer: setts.primaryNodalOfficer || '',
        complianceAutoAlerts: Boolean(setts.complianceAutoAlerts),
        autoFlagDuplicates: Boolean(setts.autoFlagDuplicates),
      });
    } catch (err) {
      console.error('Failed to load institution settings:', err);
      setError(err.message || 'Failed to load institution settings from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, [user?.institutionId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.updateInstitutionSettings({
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        address: form.address,
        primaryNodalOfficer: form.primaryNodalOfficer,
        complianceAutoAlerts: form.complianceAutoAlerts,
        autoFlagDuplicates: form.autoFlagDuplicates,
      });

      setSuccess(res.message || 'Institution contact details and profile preferences updated successfully in PostgreSQL.');
    } catch (err) {
      setError(err.message || 'Failed to update settings in database.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email) return;

    try {
      setStaffSubmitting(true);
      const res = await api.createInstitutionStaff(staffForm);
      setSuccess(res.message || `Staff member '${staffForm.name}' provisioned successfully.`);
      setShowStaffModal(false);
      setStaffForm({ name: '', email: '', designation: 'Nodal Admission Officer' });
      loadSettingsData();
    } catch (err) {
      setError(err.message || 'Failed to provision staff member.');
    } finally {
      setStaffSubmitting(false);
    }
  };

  if (loading && !institution) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="w-8 h-8 text-gov-navy animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gov-border">
        <div>
          <h1 className="text-xl font-bold text-gov-navy">Institution Settings & Node Parameters</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authorized college profile, registered contact information, and institutional staff users.
          </p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          PostgreSQL Scoped
        </span>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-white rounded-2xl border border-gov-border shadow-panel p-6 sm:p-8">
        <h2 className="text-sm font-bold text-gov-navy mb-4 flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gov-teal" />
          <span>Institutional Profile & Regulatory Identity</span>
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institution Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                disabled
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Official name locked per AICTE accreditation record
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                AICTE Permanent Institution Code (PID)
              </label>
              <input
                type="text"
                name="code"
                value={form.code}
                disabled
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-mono text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                AISHE Code
              </label>
              <input
                type="text"
                name="aisheCode"
                value={form.aisheCode}
                disabled
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-mono text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institution Type
              </label>
              <input
                type="text"
                name="type"
                value={form.type}
                disabled
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Nodal Officer Name *
              </label>
              <input
                type="text"
                name="primaryNodalOfficer"
                value={form.primaryNodalOfficer}
                onChange={handleChange}
                required
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Nodal Contact Email *
              </label>
              <input
                type="email"
                name="contactEmail"
                value={form.contactEmail}
                onChange={handleChange}
                required
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admissions Help Desk Phone *
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={form.contactPhone}
                onChange={handleChange}
                required
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Campus Postal Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          {/* Automated Notification Rules */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-2">
              Automated Alert Preferences
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="complianceAutoAlerts"
                  checked={form.complianceAutoAlerts}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-gov-navy"
                />
                <span>Automatically trigger alerts when course regular enrolment exceeds 95% of approved capacity</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="autoFlagDuplicates"
                  checked={form.autoFlagDuplicates}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-gov-navy"
                />
                <span>Instantly quarantine duplicate APAAR enrolments in cross-institution collision queue</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Only authorized Institution Admins can update contact records.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-gov-navy hover:bg-gov-navy-dark text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Changes to Database</span>
            </button>
          </div>
        </form>
      </div>

      {/* Authorized Users Section */}
      <div className="bg-white rounded-2xl border border-gov-border shadow-panel p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-gov-navy flex items-center space-x-2">
              <Users className="w-4 h-4 text-gov-teal" />
              <span>Authorized Institution Officers</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active staff members authorized to upload batch records and verify enrolments for this college.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowStaffModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-gov-navy text-xs font-bold transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-gov-teal" />
            <span>Add Staff User</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Staff Name</th>
                <th className="p-3">Designation</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-gov-navy">{u.name}</td>
                  <td className="p-3 text-slate-600">{u.designation || 'Academic Registrar'}</td>
                  <td className="p-3 font-mono text-slate-600">{u.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {u.role || 'INSTITUTION_ADMIN'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Active</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gov-border">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-gov-navy">Provision Authorized Institution Staff</h3>
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  required
                  placeholder="e.g. Dr. Kavita Nair"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Institutional Email *</label>
                <input
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  required
                  placeholder="knair@iitd.ac.in"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={staffForm.designation}
                  onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={staffSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-gov-navy text-white text-xs font-bold"
                >
                  {staffSubmitting ? 'Provisioning...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionSettings;
