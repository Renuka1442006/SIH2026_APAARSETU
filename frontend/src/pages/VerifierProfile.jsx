import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  UserCheck,
  ShieldCheck,
  Lock,
  Mail,
  Building,
  Key,
  CheckCircle2,
  Save,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const VerifierProfile = () => {
  const { user } = useAuth();
  const [saveSuccess, setSaveSuccess] = useState(null);

  const [form, setForm] = useState({
    name: user?.name || 'Vikram Sengupta',
    email: user?.email || 'verifier@tcs.com',
    designation: user?.designation || 'Senior Talent Verification Lead, TCS India',
    agency: 'Tata Consultancy Services (TCS) • Authorized AICTE Verification Partner',
    securityStationId: 'VER-STN-MUMBAI-04',
    mfaEnabled: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess('Security preferences and officer workstation settings saved.');
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gov-border">
        <div>
          <h1 className="text-xl font-bold text-gov-navy flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            <span>Verification Officer Profile & Security Workstation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage officer profile credentials, inspection workstation identity, and session security.
          </p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          Role: VERIFIER
        </span>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-gov-border shadow-panel p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-4 pb-5 border-b border-gov-border">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-lg">
            {user?.name?.charAt(0) || 'V'}
          </div>
          <div>
            <h2 className="text-base font-bold text-gov-navy">{user?.name || 'Vikram Sengupta'}</h2>
            <p className="text-xs text-slate-500 font-mono">{user?.email || 'verifier@tcs.com'}</p>
            <div className="mt-1 flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Security Level 3 Verified
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Officer Full Name</label>
              <input
                type="text"
                value={form.name}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Email Address</label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-mono text-slate-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Professional Designation</label>
              <input
                type="text"
                value={form.designation}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Workstation Node ID</label>
              <input
                type="text"
                value={form.securityStationId}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-mono text-slate-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Affiliated Verification Agency</label>
              <input
                type="text"
                value={form.agency}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
              />
            </div>
          </div>

          {/* Scope Limitations Alert */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-600">
            <div className="font-bold text-gov-navy flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-gov-teal" />
              <span>Role-Based Access Policy Restrictions</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              As an authorized Verification Officer, your access is strictly confined to assigned verification cases and cryptographic credential validation. You do not hold permissions to modify national policies, register institutions, or access unrestricted student records.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Last authenticated from IP: 127.0.0.1
            </span>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gov-navy hover:bg-gov-navy-dark text-white font-bold flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Security Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifierProfile;
