import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  FileCheck2,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  AlertCircle,
} from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user, isLoading } = useAuth();

  // If already authenticated, allow jumping straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/overview', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Read role from query param or default to AICTE_ADMIN
  const roleParam = searchParams.get('role');
  const initialRole = ['INSTITUTION_ADMIN', 'AICTE_ADMIN', 'VERIFIER'].includes(roleParam)
    ? roleParam
    : 'INSTITUTION_ADMIN';

  const [activeRole, setActiveRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Role Definitions with exact mandated responsibilities
  const roleConfigs = {
    INSTITUTION_ADMIN: {
      id: 'INSTITUTION_ADMIN',
      portalNumber: '1',
      title: 'Institution Admin Login',
      shortTitle: '1. Institution Admin',
      icon: Building2,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      activeBorder: 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50',
      responsibilities: [
        'Manages student records and document uploads.',
        'Checks admission and intake compliance.',
        'Reviews verification alerts.',
      ],
      defaultAccount: {
        name: 'Prof. Rajesh K. Varma (IIT Delhi)',
        email: 'admin@iitd.ac.in',
        password: 'IITD@123',
      },
      alternates: [
        { label: 'COEP Pune', email: 'admin@coep.ac.in', pass: 'COEP@123' },
        { label: 'VJTI Mumbai', email: 'admin@vjti.ac.in', pass: 'VJTI@123' },
      ],
    },
    AICTE_ADMIN: {
      id: 'AICTE_ADMIN',
      portalNumber: '2',
      title: 'AICTE / Platform Admin Login',
      shortTitle: '2. AICTE / Platform Admin',
      icon: Shield,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      activeBorder: 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/50',
      responsibilities: [
        'Views institution-wise dashboards.',
        'Monitors potential duplicate enrolments.',
        'Reviews compliance reports and audit logs.',
      ],
      defaultAccount: {
        name: 'Dr. Ramesh Chandra (AICTE Apex)',
        email: 'aicte.admin@aicte.gov.in',
        password: 'Admin@123',
      },
      alternates: [],
    },
    VERIFIER: {
      id: 'VERIFIER',
      portalNumber: '3',
      title: 'Verification Officer Login',
      shortTitle: '3. Verification Officer',
      icon: FileCheck2,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      activeBorder: 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/50',
      responsibilities: [
        'Reviews AI-generated alerts.',
        'Checks documents and conflicting records.',
        'Approves or rejects cases after manual review.',
      ],
      defaultAccount: {
        name: 'Vikram Sengupta (Corporate HR / TCS)',
        email: 'verifier@tcs.com',
        password: 'Verifier@123',
      },
      alternates: [],
    },
  };

  const currentConfig = roleConfigs[activeRole];

  // Set default credentials when switching tabs
  const handleRoleChange = (roleKey) => {
    setActiveRole(roleKey);
    setError(null);
    setEmail('');
    setPassword('');
  };

  const handleAutofill = (accEmail, accPass) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/overview', { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gov-page text-gov-charcoal font-sans antialiased flex flex-col justify-between">
      {/* GovTech Tricolor Top Bar */}
      <div className="gov-tricolor-bar w-full" />

      {/* Top Header / Back Navigation */}
      <div className="max-w-4xl w-full mx-auto px-4 pt-6 flex justify-between items-center">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-gov-navy transition-colors bg-white px-3.5 py-1.5 rounded-lg border border-gov-border shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to AICTE Portal & Help Desk</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono">AICTE Security Gateway Active</span>
        </div>
      </div>

      {/* Main Login Container */}
      <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-xl">
          {/* Platform Identity Card Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gov-navy text-white shadow-md border border-slate-700 mb-3">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-navy tracking-tight">
              APAARSetu National Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Ministry of Education • All India Council for Technical Education (AICTE)
            </p>
          </div>

          {/* Three Role Portals Tabs */}
          <div className="bg-white rounded-t-2xl border-t border-x border-gov-border p-2 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Select Authorized Access Role:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {Object.values(roleConfigs).map((cfg) => {
                const Icon = cfg.icon;
                const isSelected = activeRole === cfg.id;
                return (
                  <button
                    key={cfg.id}
                    type="button"
                    onClick={() => handleRoleChange(cfg.id)}
                    className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? cfg.activeBorder
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected ? 'bg-gov-navy text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Portal {cfg.portalNumber}
                      </div>
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {cfg.id === 'INSTITUTION_ADMIN'
                          ? 'Institution Admin'
                          : cfg.id === 'AICTE_ADMIN'
                          ? 'AICTE Admin'
                          : 'Verification Officer'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Details & Responsibilities Box */}
          <div className="bg-slate-50 border-x border-b border-gov-border px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${currentConfig.badgeColor}`}>
                Portal {currentConfig.portalNumber}: {currentConfig.title}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Role Responsibilities</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-700">
              {currentConfig.responsibilities.map((resp, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gov-teal shrink-0 mt-0.5" />
                  <span className="font-medium">{resp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pure Credentials Form Box */}
          <div className="bg-white rounded-b-2xl border-x border-b border-gov-border shadow-xl p-6 sm:p-8">
            <h2 className="text-base font-bold text-gov-navy mb-1">
              Sign In with Authorized Credentials
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Enter your official username / email and password to access the platform.
            </p>

            {error && (
              <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="font-medium">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Email / Username
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={currentConfig.defaultAccount.email}
                    className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-navy focus:border-gov-navy font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">Bcrypt Salted</span>
                </div>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-navy focus:border-gov-navy font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gov-navy hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-gov-navy shadow-md shadow-slate-900/10 transition-all disabled:opacity-50"
              >
                <span>{submitting ? 'Authenticating with Central Registry...' : `Sign In as ${currentConfig.id === 'INSTITUTION_ADMIN' ? 'Institution Admin' : currentConfig.id === 'AICTE_ADMIN' ? 'AICTE Admin' : 'Verification Officer'}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Autofill Helper for Evaluators */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick Evaluation Auto-fill:</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleAutofill(
                      currentConfig.defaultAccount.email,
                      currentConfig.defaultAccount.password
                    )
                  }
                  className="text-xs font-bold text-gov-teal hover:text-teal-800 underline transition-colors"
                >
                  Fill Default ({currentConfig.defaultAccount.email.split('@')[0]})
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-600 flex flex-wrap items-center justify-between gap-1">
                <div>
                  <span className="text-slate-500">Email:</span>{' '}
                  <span className="font-bold text-slate-800">{currentConfig.defaultAccount.email}</span>
                </div>
                <div>
                  <span className="text-slate-500">Pass:</span>{' '}
                  <span className="font-bold text-slate-800">{currentConfig.defaultAccount.password}</span>
                </div>
              </div>

              {currentConfig.alternates.length > 0 && (
                <div className="mt-2 flex items-center space-x-2 text-[11px]">
                  <span className="text-slate-500 font-medium">Or test another institute:</span>
                  {currentConfig.alternates.map((alt) => (
                    <button
                      key={alt.email}
                      type="button"
                      onClick={() => handleAutofill(alt.email, alt.pass)}
                      className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors"
                    >
                      {alt.label}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                <span className="font-semibold text-slate-600">Note:</span> AICTE Admins can onboard new technical institutes and provision officers directly from the System Settings panel. Any newly provisioned credentials stored in the database can be used to log in here immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <footer className="text-center py-4 border-t border-gov-border text-xs text-slate-500 bg-white">
        © 2024-2026 All India Council for Technical Education (AICTE), New Delhi. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Login;
