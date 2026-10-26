import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Save,
  Lock,
} from 'lucide-react';

export const UserRoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Provision New User Modal / Form
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VERIFIER',
    institutionId: '',
    designation: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [uList, iList] = await Promise.all([api.getUsers(), api.getInstitutions()]);
      setUsers(uList || []);
      setInstitutions(iList || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!form.name || !form.email || !form.password) {
      setFeedback({ type: 'error', message: 'Name, email, and password are required.' });
      return;
    }
    if (form.role === 'INSTITUTION_ADMIN' && !form.institutionId) {
      setFeedback({ type: 'error', message: 'Please select an institution for Institution Admin role.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createUser(form);
      setFeedback({ type: 'success', message: res.message || 'Account successfully created.' });
      setShowModal(false);
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'VERIFIER',
        institutionId: '',
        designation: '',
      });
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create user account.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gov-border">
        <div>
          <h1 className="text-xl font-bold text-gov-navy">User & Access Role Governance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Provision verified administrators, assign role-based permissions, and audit access credentials.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowModal(true);
            setFeedback(null);
          }}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-gov-navy hover:bg-gov-navy-dark text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Officer</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-gov-border p-4 shadow-panel flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by officer name or administrative email..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white sm:w-56"
        >
          <option value="">All Administrative Roles</option>
          <option value="AICTE_ADMIN">Platform Admin (AICTE_ADMIN)</option>
          <option value="INSTITUTION_ADMIN">Institution Admin</option>
          <option value="VERIFIER">Verification Officer</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gov-border shadow-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Officer Name</th>
                <th className="p-3.5">Official Email</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Assigned Node / Institution</th>
                <th className="p-3.5">Designation</th>
                <th className="p-3.5 text-right">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gov-navy" />
                    <span>Loading User Ledger...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No users matching criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-gov-navy">{u.name}</td>
                    <td className="p-3.5 font-mono text-slate-600">{u.email}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border leading-none ${
                          u.role === 'AICTE_ADMIN'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : u.role === 'INSTITUTION_ADMIN'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      {u.institution ? (
                        <span className="font-medium">
                          {u.institution.name} ({u.institution.code})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">National Directorate (Apex)</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500">{u.designation || 'Staff'}</td>
                    <td className="p-3.5 text-right">
                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gov-border shadow-2xl max-w-lg w-full p-6 animate-scaleUp">
            <h3 className="text-sm font-bold text-gov-navy pb-3 border-b border-gov-border flex items-center space-x-2">
              <UserPlus className="w-4 h-4 text-gov-teal" />
              <span>Provision Administrative Officer</span>
            </h3>

            <form onSubmit={handleCreateUser} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Officer Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Dr. Sudhir Agrawal"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="e.g. officer@aicte.gov.in"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="VERIFIER">Verification Officer</option>
                    <option value="INSTITUTION_ADMIN">Institution Admin</option>
                    <option value="AICTE_ADMIN">Platform Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    placeholder="e.g. Nodal Officer"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {form.role === 'INSTITUTION_ADMIN' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Institution *</label>
                  <select
                    value={form.institutionId}
                    onChange={(e) => setForm({ ...form, institutionId: e.target.value })}
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="">-- Select Institution --</option>
                    {institutions.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-gov-navy hover:bg-gov-navy-dark text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Provision Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoleManagement;
