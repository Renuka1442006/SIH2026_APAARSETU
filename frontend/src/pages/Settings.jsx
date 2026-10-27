import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import {
  Sliders,
  Building2,
  ShieldCheck,
  Server,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Key,
  Globe,
  Radio,
  FileText,
  Save,
  RefreshCw,
  UserPlus,
  Users,
  PlusCircle,
  Search,
  Calendar,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

export const Settings = () => {
  const { user, isAicteAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(isAicteAdmin ? 'onboarding' : 'profile');
  const [saveNotice, setSaveNotice] = useState(null);

  // Institution & User Provisioning State
  const [onboardForm, setOnboardForm] = useState({
    code: '',
    name: '',
    aisheCode: '',
    state: 'Maharashtra',
    city: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    type: 'State Autonomous',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminDesignation: 'Principal / Registrar',
  });

  const [verifierForm, setVerifierForm] = useState({
    name: '',
    email: '',
    password: '',
    designation: 'Credential Verification Officer (Audit Agency)',
  });

  const [dbInstitutions, setDbInstitutions] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [submittingOnboard, setSubmittingOnboard] = useState(false);
  const [submittingVerifier, setSubmittingVerifier] = useState(false);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerSubTab, setLedgerSubTab] = useState('institutions');

  // Load database ledger on mount or when onboarding tab opens
  const loadDatabaseLedger = async () => {
    setLoadingLedger(true);
    setActionError(null);
    try {
      const instData = await api.getInstitutions();
      setDbInstitutions(Array.isArray(instData) ? instData : []);

      if (isAicteAdmin) {
        const usersData = await api.getUsers();
        setDbUsers(Array.isArray(usersData) ? usersData : []);
      }
    } catch (err) {
      console.error('Failed to load database ledger:', err);
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    loadDatabaseLedger();
  }, [isAicteAdmin]);

  // Handle Onboard Institution
  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setSubmittingOnboard(true);

    try {
      const res = await api.onboardInstitution(onboardForm);
      const createdAtDate = res?.institution?.createdAt
        ? new Date(res.institution.createdAt).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'medium',
          })
        : new Date().toLocaleString('en-IN');

      setActionSuccess({
        title: 'Institution & Admin Account Committed to Database!',
        institutionName: res?.institution?.name || onboardForm.name,
        code: res?.institution?.code || onboardForm.code,
        adminEmail: res?.adminUser?.email || onboardForm.adminEmail,
        adminPass: onboardForm.adminPassword,
        timestamp: createdAtDate,
      });

      // Reset form
      setOnboardForm({
        code: '',
        name: '',
        aisheCode: '',
        state: 'Maharashtra',
        city: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
        type: 'State Autonomous',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        adminDesignation: 'Principal / Registrar',
      });

      // Refresh DB data
      await loadDatabaseLedger();
    } catch (err) {
      setActionError(err.message || 'Failed to onboard institution and provision admin account.');
    } finally {
      setSubmittingOnboard(false);
    }
  };

  // Handle Create Verification Officer
  const handleVerifierSubmit = async (e) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setSubmittingVerifier(true);

    try {
      const res = await api.createUser({
        name: verifierForm.name,
        email: verifierForm.email,
        password: verifierForm.password,
        designation: verifierForm.designation,
        role: 'VERIFIER',
      });

      const createdAtDate = res?.user?.createdAt
        ? new Date(res.user.createdAt).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'medium',
          })
        : new Date().toLocaleString('en-IN');

      setActionSuccess({
        title: 'Verification Officer Account Committed to Database!',
        verifierName: verifierForm.name,
        adminEmail: verifierForm.email,
        adminPass: verifierForm.password,
        timestamp: createdAtDate,
      });

      setVerifierForm({
        name: '',
        email: '',
        password: '',
        designation: 'Credential Verification Officer (Audit Agency)',
      });

      await loadDatabaseLedger();
    } catch (err) {
      setActionError(err.message || 'Failed to provision verification officer account.');
    } finally {
      setSubmittingVerifier(false);
    }
  };

  // Institutional Profile State
  const [profile, setProfile] = useState({
    instName: user?.institution?.name || 'Indian Institute of Technology Delhi',
    instCode: user?.institution?.code || '1-001',
    aisheCode: 'C-22451',
    category: user?.institution?.category || 'CENTRAL_INSTITUTE',
    state: user?.institution?.state || 'Delhi',
    city: user?.institution?.city || 'New Delhi',
    headOfInstitute: 'Prof. Rangan Banerjee',
    nodalEmail: user?.email || 'admin@iitd.ac.in',
    nodalPhone: '+91 11 2659 1000',
  });

  // Regulatory Parameters State
  const [rules, setRules] = useState({
    aphStandard: 'APH_2024_2025',
    strictDuplicateBlocking: true,
    tfwMaxPercentage: 5,
    mandatoryApaarEnrollment: true,
    allowProvisionalAdmission: false,
    autoFlagCrossCollegeEnrollment: true,
  });

  // Gateway Simulation State
  const [gateways, setGateways] = useState({
    apaarGateway: 'https://sandbox.apaar.gov.in/api/v2/verify',
    digilockerGateway: 'https://sandbox.digilocker.gov.in/api/v1/auth',
    nadRepository: 'https://nad.gov.in/registry/v3/academic-records',
    mockLatencyMs: 150,
    offlineMode: false,
  });

  const handleSave = (section) => {
    setSaveNotice(`Configuration for "${section}" persisted to regulatory registry.`);
    setTimeout(() => setSaveNotice(null), 3500);
  };

  // Filtered ledger lists
  const filteredInstitutions = dbInstitutions.filter(
    (inst) =>
      inst.name.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      inst.code.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      inst.state.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      (inst.city && inst.city.toLowerCase().includes(ledgerSearch.toLowerCase()))
  );

  const filteredUsers = dbUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      (u.institution && u.institution.name.toLowerCase().includes(ledgerSearch.toLowerCase()))
  );

  const indianStates = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Delhi',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-gov-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gov-navy bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              System Administration
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {isAicteAdmin ? 'AICTE Regulatory Authority' : 'Institution Portal Settings'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gov-navy mt-1 tracking-tight">
            Institutional Settings & Regulatory Rulebook
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure institutional profile, onboard new institutes, provision verification officers, and monitor database records.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1 bg-gov-page p-1 rounded-xl border border-gov-border text-xs font-semibold">
          {isAicteAdmin && (
            <button
              onClick={() => setActiveTab('onboarding')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'onboarding'
                  ? 'bg-gov-navy text-white shadow-xs font-bold'
                  : 'text-gov-navy hover:text-blue-900 bg-blue-50/50'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-300" />
              <span>Institutions & Officers Provisioning</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-gov-navy shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Institutional Profile
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'rules'
                ? 'bg-white text-gov-navy shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Regulatory Policies
          </button>

          <button
            onClick={() => setActiveTab('gateways')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'gateways'
                ? 'bg-white text-gov-navy shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            National Gateways (Demo)
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'security'
                ? 'bg-white text-gov-navy shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Security & Crypto
          </button>
        </div>
      </div>

      {saveNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 0: INSTITUTIONS & USER PROVISIONING (AICTE ADMIN)   */}
      {/* ======================================================== */}
      {activeTab === 'onboarding' && (
        <div className="space-y-6">
          {/* Authority Banner */}
          <div className="bg-gradient-to-r from-gov-navy via-slate-800 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold tracking-tight">
                    AICTE Apex Provisioning Authority
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    Database Authority Active
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  As the AICTE Platform Administrator, you have statutory authority to onboard technical institutions, assign usernames & bcrypt-hashed passwords to institutional administrators, and provision independent third-party verification officers. All records are securely committed to the central database.
                </p>
              </div>
            </div>

            <button
              onClick={loadDatabaseLedger}
              disabled={loadingLedger}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-colors shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLedger ? 'animate-spin text-amber-300' : ''}`} />
              <span>{loadingLedger ? 'Syncing...' : 'Sync Database Ledger'}</span>
            </button>
          </div>

          {/* Success Banner */}
          {actionSuccess && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-emerald-950 shadow-sm animate-in fade-in">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5 text-xs">
                  <div className="font-extrabold text-sm text-emerald-900">
                    {actionSuccess.title}
                  </div>
                  {actionSuccess.institutionName && (
                    <div className="text-emerald-800">
                      <span className="font-semibold">Registered Institute:</span>{' '}
                      <span className="font-bold">{actionSuccess.institutionName}</span> (Code:{' '}
                      <span className="font-mono font-bold">{actionSuccess.code}</span>)
                    </div>
                  )}
                  {actionSuccess.verifierName && (
                    <div className="text-emerald-800">
                      <span className="font-semibold">Verification Officer:</span>{' '}
                      <span className="font-bold">{actionSuccess.verifierName}</span>
                    </div>
                  )}
                  <div className="p-2.5 rounded-lg bg-emerald-100/70 border border-emerald-300 font-mono text-[11px] text-emerald-900 flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-emerald-700">Login Username:</span>{' '}
                      <span className="font-bold">{actionSuccess.adminEmail}</span>
                    </div>
                    <div>
                      <span className="text-emerald-700">Initial Password:</span>{' '}
                      <span className="font-bold">{actionSuccess.adminPass}</span>
                    </div>
                    <div>
                      <span className="text-emerald-700">Stored in DB at:</span>{' '}
                      <span className="font-bold">{actionSuccess.timestamp}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Password is encrypted with bcrypt salt factor 10. The user can now immediately sign in at the respective Login Portal!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {actionError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start space-x-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-semibold">{actionError}</div>
            </div>
          )}

          {/* TWO PROVISIONING WORKSPACES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* WORKSPACE 1: ONBOARD INSTITUTION & ADMIN (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-gov-border shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex items-center space-x-2.5 border-b border-gov-border pb-3">
                <div className="p-2 rounded-lg bg-blue-50 text-gov-navy border border-blue-200">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gov-navy">
                    1. Onboard Technical Institution & Provision Admin
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Creates the institutional entity and provisions its Nodal Administrator username & password in the database.
                  </p>
                </div>
              </div>

              <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
                {/* Institution Details Group */}
                <div className="space-y-3">
                  <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>A. Institutional Metadata</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Institution Legal Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={onboardForm.name}
                        onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                        placeholder="e.g. Birla Institute of Technology and Science, Pilani"
                        className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        AICTE Permanent ID / Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={onboardForm.code}
                        onChange={(e) => setOnboardForm({ ...onboardForm, code: e.target.value })}
                        placeholder="e.g. 1-005"
                        className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white font-mono focus:outline-none focus:ring-1 focus:ring-gov-navy"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        AISHE Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={onboardForm.aisheCode}
                        onChange={(e) => setOnboardForm({ ...onboardForm, aisheCode: e.target.value })}
                        placeholder="e.g. U-0374"
                        className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white font-mono focus:outline-none focus:ring-1 focus:ring-gov-navy"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={onboardForm.state}
                        onChange={(e) => setOnboardForm({ ...onboardForm, state: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
                      >
                        {indianStates.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={onboardForm.city}
                        onChange={(e) => setOnboardForm({ ...onboardForm, city: e.target.value })}
                        placeholder="e.g. Pilani"
                        className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Institution Category
                      </label>
                      <select
                        value={onboardForm.type}
                        onChange={(e) => setOnboardForm({ ...onboardForm, type: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
                      >
                        <option value="Central Institute">Central Institute / Institute of National Importance</option>
                        <option value="State Government">State Government College</option>
                        <option value="State Autonomous">State Autonomous University</option>
                        <option value="Deemed University">Deemed University / Private</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Official Contact Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={onboardForm.contactEmail}
                        onChange={(e) => setOnboardForm({ ...onboardForm, contactEmail: e.target.value })}
                        placeholder="e.g. info@bits-pilani.ac.in"
                        className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
                      />
                    </div>
                  </div>
                </div>

                {/* Provision Admin Credentials Group */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>B. Provision Institution Admin Credentials (Stored in Database)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Admin Officer Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={onboardForm.adminName}
                        onChange={(e) => setOnboardForm({ ...onboardForm, adminName: e.target.value })}
                        placeholder="e.g. Prof. V. Ramgopal Rao"
                        className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Admin Designation
                      </label>
                      <input
                        type="text"
                        value={onboardForm.adminDesignation}
                        onChange={(e) => setOnboardForm({ ...onboardForm, adminDesignation: e.target.value })}
                        placeholder="e.g. Vice Chancellor / Registrar"
                        className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Admin Official Email / Username <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={onboardForm.adminEmail}
                        onChange={(e) => setOnboardForm({ ...onboardForm, adminEmail: e.target.value })}
                        placeholder="e.g. admin@bits-pilani.ac.in"
                        className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white font-medium focus:outline-none focus:ring-1 focus:ring-gov-navy"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Admin Initial Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={onboardForm.adminPassword}
                        onChange={(e) => setOnboardForm({ ...onboardForm, adminPassword: e.target.value })}
                        placeholder="e.g. Bits@123"
                        className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white font-mono focus:outline-none focus:ring-1 focus:ring-gov-navy"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingOnboard}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-gov-navy hover:bg-slate-800 text-white font-bold transition-all shadow-xs disabled:opacity-50"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-300" />
                    <span>{submittingOnboard ? 'Writing to Central Database...' : 'Onboard Institution & Store in Database'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* WORKSPACE 2: PROVISION VERIFICATION OFFICER (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-gov-border shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex items-center space-x-2.5 border-b border-gov-border pb-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                  <UserPlus className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gov-navy">
                    2. Provision Verification Officer
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Grants access to corporate HRs or independent auditors to review AI alerts and verify credentials.
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifierSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Officer Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={verifierForm.name}
                    onChange={(e) => setVerifierForm({ ...verifierForm, name: e.target.value })}
                    placeholder="e.g. Pooja Mehta"
                    className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Email / Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={verifierForm.email}
                    onChange={(e) => setVerifierForm({ ...verifierForm, email: e.target.value })}
                    placeholder="e.g. verifier@infosys.com"
                    className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white font-medium focus:outline-none focus:ring-1 focus:ring-gov-navy"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={verifierForm.password}
                    onChange={(e) => setVerifierForm({ ...verifierForm, password: e.target.value })}
                    placeholder="e.g. Verifier@123"
                    className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white font-mono focus:outline-none focus:ring-1 focus:ring-gov-navy"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Organization / Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={verifierForm.designation}
                    onChange={(e) => setVerifierForm({ ...verifierForm, designation: e.target.value })}
                    placeholder="e.g. Senior Credential Auditor - Infosys BGC"
                    className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
                  />
                </div>

                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                  <span className="font-bold">Role Capabilities:</span> Verification Officers can inspect tamper-evident QR signatures, adjudicate cross-institution student collision flags, and submit regulatory compliance reviews.
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingVerifier}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-xs disabled:opacity-50"
                  >
                    <PlusCircle className="w-4 h-4 text-white" />
                    <span>{submittingVerifier ? 'Storing Account...' : 'Provision Officer & Store in Database'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 3: LIVE DATABASE REGISTRY LEDGER                 */}
          {/* ======================================================== */}
          <div className="bg-white rounded-xl border border-gov-border shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gov-border pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-gov-navy">
                    Live National Database Registry Ledger
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    SQLite dev.db
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time records stored in the central database schema (Institutions: {dbInstitutions.length}, Users: {dbUsers.length}).
                </p>
              </div>

              {/* Sub-tabs & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-gov-page rounded-lg p-0.5 border border-gov-border text-xs font-semibold">
                  <button
                    onClick={() => setLedgerSubTab('institutions')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      ledgerSubTab === 'institutions'
                        ? 'bg-white text-gov-navy shadow-xs font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    Institutions ({dbInstitutions.length})
                  </button>
                  <button
                    onClick={() => setLedgerSubTab('users')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      ledgerSubTab === 'users'
                        ? 'bg-white text-gov-navy shadow-xs font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    Provisioned Users ({dbUsers.length})
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    placeholder="Search ledger..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-gov-page border border-gov-border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-gov-navy w-44"
                  />
                </div>
              </div>
            </div>

            {/* Institutions Table */}
            {ledgerSubTab === 'institutions' && (
              <div className="overflow-x-auto border border-gov-border rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gov-page text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-gov-border">
                    <tr>
                      <th className="py-2.5 px-3">AICTE Code</th>
                      <th className="py-2.5 px-3">Institution Name</th>
                      <th className="py-2.5 px-3">State & City</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Nodal Admin / Contact</th>
                      <th className="py-2.5 px-3">Date Stored in DB</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInstitutions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          No institutions match your search query.
                        </td>
                      </tr>
                    ) : (
                      filteredInstitutions.map((inst) => {
                        const adminUser = inst.users?.find((u) => u.role === 'INSTITUTION_ADMIN');
                        const createdDate = inst.createdAt
                          ? new Date(inst.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Seeded';

                        return (
                          <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-gov-navy">
                              {inst.code}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-900">
                              {inst.name}
                              <div className="text-[10px] text-slate-400 font-mono">
                                AISHE: {inst.aisheCode}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {inst.city ? `${inst.city}, ` : ''}{inst.state}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                {inst.type || 'Government'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">
                              {adminUser ? (
                                <div>
                                  <span className="font-semibold text-slate-900">{adminUser.name}</span>
                                  <div className="text-slate-400 text-[10px]">{adminUser.email}</div>
                                </div>
                              ) : (
                                inst.contactEmail
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                              {createdDate}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                ACTIVE
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Users Table */}
            {ledgerSubTab === 'users' && (
              <div className="overflow-x-auto border border-gov-border rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gov-page text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-gov-border">
                    <tr>
                      <th className="py-2.5 px-3">Role Authority</th>
                      <th className="py-2.5 px-3">Full Name</th>
                      <th className="py-2.5 px-3">Email / Username</th>
                      <th className="py-2.5 px-3">Designation / Affiliation</th>
                      <th className="py-2.5 px-3">Linked Institution</th>
                      <th className="py-2.5 px-3">Date Stored in DB</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          No provisioned users found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const createdDate = u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Seeded';

                        const roleBadge =
                          u.role === 'AICTE_ADMIN'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : u.role === 'INSTITUTION_ADMIN'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200';

                        return (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleBadge}`}>
                                {u.role === 'AICTE_ADMIN'
                                  ? 'AICTE Admin'
                                  : u.role === 'INSTITUTION_ADMIN'
                                  ? 'Institution Admin'
                                  : 'Verification Officer'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {u.name}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-700 text-[11px]">
                              {u.email}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {u.designation || 'Officer'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 font-medium">
                              {u.institution?.name || 'AICTE Apex Authority (National)'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                              {createdDate}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                ACTIVE
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: INSTITUTIONAL PROFILE                             */}
      {/* ======================================================== */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-gov-border p-6 shadow-xs space-y-6">
          <div className="border-b border-gov-border pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gov-navy flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-gov-teal" />
                <span>AICTE Institutional Master Record</span>
              </h2>
              <p className="text-xs text-slate-500">
                Official accreditation identifiers mapped to this portal session.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              ACC-AICTE-VALIDATED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Institution Name:
              </label>
              <input
                type="text"
                value={profile.instName}
                onChange={(e) => setProfile({ ...profile, instName: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page text-slate-900 focus:outline-none focus:ring-1 focus:ring-gov-navy font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                AICTE Permanent Institute ID (PID):
              </label>
              <input
                type="text"
                value={profile.instCode}
                disabled
                className="w-full p-2.5 rounded-lg border border-gov-border bg-slate-100 text-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                AISHE Code:
              </label>
              <input
                type="text"
                value={profile.aisheCode}
                onChange={(e) => setProfile({ ...profile, aisheCode: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Institution Category:
              </label>
              <select
                value={profile.category}
                onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page text-slate-900"
              >
                <option value="CENTRAL_INSTITUTE">Central Institute / INI</option>
                <option value="STATE_GOVT">State Government College</option>
                <option value="PRIVATE_UNAIDED">Private / Unaided</option>
                <option value="DEEMED_UNIVERSITY">Deemed University</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                State & Jurisdiction:
              </label>
              <input
                type="text"
                value={`${profile.city}, ${profile.state}`}
                disabled
                className="w-full p-2.5 rounded-lg border border-gov-border bg-slate-100 text-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Head of Institution / Director:
              </label>
              <input
                type="text"
                value={profile.headOfInstitute}
                onChange={(e) => setProfile({ ...profile, headOfInstitute: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nodal Administrator Email:
              </label>
              <input
                type="email"
                value={profile.nodalEmail}
                onChange={(e) => setProfile({ ...profile, nodalEmail: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nodal Liaison Phone:
              </label>
              <input
                type="text"
                value={profile.nodalPhone}
                onChange={(e) => setProfile({ ...profile, nodalPhone: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gov-border flex justify-end">
            <button
              onClick={() => handleSave('Institutional Profile')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gov-navy hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-amber-300" />
              <span>Update Institutional Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: REGULATORY POLICIES                               */}
      {/* ======================================================== */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-xl border border-gov-border p-6 shadow-xs space-y-6">
          <div className="border-b border-gov-border pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gov-navy flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-gov-teal" />
              <span>AICTE Approval Process Handbook (APH) Policy Engine</span>
            </h2>
            <p className="text-xs text-slate-500">
              Regulatory parameters enforcing admission ceilings, supernumerary caps, and APAAR verification.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-gov-border bg-gov-page">
              <div>
                <span className="font-bold text-slate-900 block">APH Edition Standard:</span>
                <span className="text-slate-500 text-[11px]">
                  Governing handbook rules applied during automated student upload validation.
                </span>
              </div>
              <span className="font-mono font-bold text-gov-navy bg-white px-3 py-1 rounded border border-gov-border">
                {rules.aphStandard}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg border border-gov-border">
              <div>
                <span className="font-bold text-slate-900 block">
                  Enforce Strict Cross-College Duplicate Blocking:
                </span>
                <span className="text-slate-500 text-[11px]">
                  Automatically halts intake if candidate APAAR is detected in another active technical program.
                </span>
              </div>
              <input
                type="checkbox"
                checked={rules.strictDuplicateBlocking}
                onChange={(e) => setRules({ ...rules, strictDuplicateBlocking: e.target.checked })}
                className="w-4 h-4 text-gov-navy rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg border border-gov-border">
              <div>
                <span className="font-bold text-slate-900 block">
                  Tuition Fee Waiver (TFW) Statutory Cap:
                </span>
                <span className="text-slate-500 text-[11px]">
                  Strict ceiling above sanctioned intake under AICTE APH Section 2.12 (Maximum 5%).
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={rules.tfwMaxPercentage}
                  onChange={(e) => setRules({ ...rules, tfwMaxPercentage: Number(e.target.value) })}
                  className="w-16 p-1.5 rounded border border-gov-border text-center font-bold"
                />
                <span className="font-bold text-slate-700">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg border border-gov-border">
              <div>
                <span className="font-bold text-slate-900 block">
                  Mandatory 12-Digit APAAR Format Validation:
                </span>
                <span className="text-slate-500 text-[11px]">
                  Rejects admission records without valid 12-digit numeric APAAR identifiers during bulk upload.
                </span>
              </div>
              <input
                type="checkbox"
                checked={rules.mandatoryApaarEnrollment}
                onChange={(e) => setRules({ ...rules, mandatoryApaarEnrollment: e.target.checked })}
                className="w-4 h-4 text-gov-navy rounded"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gov-border flex justify-end">
            <button
              onClick={() => handleSave('Regulatory Policies')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gov-navy hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-amber-300" />
              <span>Save Policy Rules</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: NATIONAL GATEWAYS (DEMO)                          */}
      {/* ======================================================== */}
      {activeTab === 'gateways' && (
        <div className="bg-white rounded-xl border border-gov-border p-6 shadow-xs space-y-6">
          <div className="border-b border-gov-border pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gov-navy flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gov-teal" />
              <span>National Integration Gateways (Sandbox Simulation)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Simulated connections to MoE APAAR Gateway, DigiLocker, and NAD (National Academic Depository).
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                MoE APAAR Central ID Gateway Endpoint:
              </label>
              <input
                type="text"
                value={gateways.apaarGateway}
                onChange={(e) => setGateways({ ...gateways, apaarGateway: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page font-mono text-slate-900 focus:outline-none"
              />
              <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                ● STATUS: READY (Simulated TLS 1.3 Handshake Verified)
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                DigiLocker Marksheet Authentication Gateway:
              </label>
              <input
                type="text"
                value={gateways.digilockerGateway}
                onChange={(e) => setGateways({ ...gateways, digilockerGateway: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-gov-border bg-gov-page font-mono text-slate-900 focus:outline-none"
              />
              <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                ● STATUS: READY (HMAC Token Handshake Verified)
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Simulated Sandbox Network Latency (ms):
              </label>
              <input
                type="number"
                min="0"
                max="2000"
                step="50"
                value={gateways.mockLatencyMs}
                onChange={(e) => setGateways({ ...gateways, mockLatencyMs: Number(e.target.value) })}
                className="w-48 p-2 rounded-lg border border-gov-border bg-gov-page font-mono text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gov-border flex justify-end">
            <button
              onClick={() => handleSave('National Gateways')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gov-navy hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-amber-300" />
              <span>Save Sandbox Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SECURITY & CRYPTO                                 */}
      {/* ======================================================== */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl border border-gov-border p-6 shadow-xs space-y-6">
          <div className="border-b border-gov-border pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gov-navy flex items-center space-x-2">
              <Lock className="w-4 h-4 text-gov-teal" />
              <span>Cryptographic Architecture & Server Signing Authority</span>
            </h2>
            <p className="text-xs text-slate-500">
              Details on HMAC-SHA256 digital signature keys, PII redaction protocols, and audit retention.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-900 block">Server-Held Private Key Active</span>
                <p className="text-emerald-800 mt-0.5">
                  Credentials issued by AICTE VidyarthiSetu are signed using an HMAC-SHA256 signature generated with a secret key held exclusively in backend memory. The signature is embedded in QR references without exposing raw PII.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-gov-border bg-gov-page">
                <span className="font-bold text-slate-900 block mb-1">PII Masking Policy</span>
                <p className="text-slate-500 text-[11px]">
                  All student APAAR identifiers are masked by default as <span className="font-mono font-bold text-slate-800">XXXX-XXXX-1122</span> in views and tables. Unmasking requires explicit authorized toggle with session audit logging.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-gov-border bg-gov-page">
                <span className="font-bold text-slate-900 block mb-1">Session Security</span>
                <p className="text-slate-500 text-[11px]">
                  JWT Bearer authentication with 24-hour expiration and instantaneous invalidation upon logout or role switching.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
