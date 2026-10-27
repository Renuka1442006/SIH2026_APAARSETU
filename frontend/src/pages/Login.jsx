import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth, getDashboardRouteForRole } from '../context/AuthContext.jsx';
import api from '../services/api.js';
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
  HelpCircle,
  X,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { PublicNavbar } from '../components/PublicNavbar.jsx';
import aicteLogo from '../logo/AICTE-Log.png';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, isLoading } = useAuth();

  // If already authenticated, redirect to their role-specific dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const target = getDashboardRouteForRole(user.role);
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // If role query parameter exists, autofill that role's credentials
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam) {
      const match = demoAccounts.find((acc) => acc.role === roleParam);
      if (match) {
        setEmail(match.email);
        setPassword(match.password);
      }
    }
  }, [location.search]);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState(null);

  // Demo accounts for SIH evaluator assistance
  const demoAccounts = [
    {
      role: 'INSTITUTION_ADMIN',
      portalTitle: 'Institution Admin Portal',
      label: 'Institution Admin (IIT Delhi)',
      email: 'admin@iitd.ac.in',
      password: 'IITD@123',
      sub: 'Manages student records, CSV ingestion, intake compliance, and credentials for assigned institution.',
      color: 'border-blue-200 bg-blue-50/50 hover:border-blue-400 text-blue-900',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Building2,
    },
    {
      role: 'AICTE_ADMIN',
      portalTitle: 'Platform Admin Portal',
      label: 'Platform Admin (National Apex)',
      email: 'aicte.admin@aicte.gov.in',
      password: 'Admin@123',
      sub: 'Platform-wide oversight, cross-institution duplicate collision detection, institution onboarding & audit logs.',
      color: 'border-purple-200 bg-purple-50/50 hover:border-purple-400 text-purple-900',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Shield,
    },
    {
      role: 'VERIFIER',
      portalTitle: 'Verification Officer Portal',
      label: 'Verification Officer (TCS / Agency)',
      email: 'verifier@tcs.com',
      password: 'Verifier@123',
      sub: 'Review-focused queue for inspecting flagged documents, adjudicating collisions, and verifying QR credentials.',
      color: 'border-amber-200 bg-amber-50/50 hover:border-amber-400 text-amber-900',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: FileCheck2,
    },
  ];

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Official Email or User ID is required.';
    } else if (!email.includes('@') && email.length < 3) {
      errors.email = 'Please provide a valid administrative email or identifier.';
    }
    if (!password) {
      errors.password = 'Password is required to authenticate.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const authenticatedUser = await login(email.trim(), password);
      // Determine redirection from authenticated backend role
      const target = getDashboardRouteForRole(authenticatedUser.role);
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials or network status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutofillDemo = async (demoAcc) => {
    setEmail(demoAcc.email);
    setPassword(demoAcc.password);
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      const authenticatedUser = await login(demoAcc.email, demoAcc.password);
      const target = getDashboardRouteForRole(authenticatedUser.role);
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || 'Demo authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotStatus({ type: 'error', message: 'Please enter your registered email address.' });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await api.forgotPassword({ email: forgotEmail.trim() });
      setForgotStatus({
        type: 'success',
        message: res.message || 'Password reset instructions have been dispatched.',
        token: res.demoResetToken,
      });
    } catch (err) {
      setForgotStatus({
        type: 'error',
        message: err.message || 'Unable to process reset request at this time.',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gov-page text-gov-charcoal font-sans antialiased flex flex-col justify-between">
      {/* Official Government Navbar with AICTE Logo, Navigation, and Demo Switcher */}
      <PublicNavbar />

      {/* Sub-header Context / Breadcrumb Bar */}
      <div className="bg-slate-50 border-b border-gov-border/70 py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-xs">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 font-semibold text-slate-600 hover:text-gov-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Return to AICTE VidyarthiSetu Portal Overview</span>
          </Link>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] font-semibold text-slate-700">
              AICTE National Identity Gateway • Secure RBAC Auth
            </span>
          </div>
        </div>
      </div>

      {/* Main Login Workspace */}
      <div className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6">
        <div className="w-full max-w-lg mx-auto">
          
          {/* Main Login Card */}
          <div className="bg-white rounded-2xl border border-gov-border shadow-panel p-6 sm:p-8">
            {/* Header / Adjusted Brand Name & AICTE Logo */}
            <div className="flex items-center space-x-4 mb-6 pb-5 border-b border-gov-border">
              <img
                src={aicteLogo}
                alt="AICTE Official Logo"
                className="w-14 h-14 object-contain shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-2xl font-black text-gov-navy tracking-tight font-sans">
                  AICTE VidyarthiSetu
                </h1>
                <p className="text-xs text-slate-600 font-semibold mt-0.5 leading-snug">
                  AICTE Student Data Verification & Admission Compliance Platform
                </p>
                <p className="text-[11px] text-gov-teal font-medium mt-0.5">
                  Ministry of Education, Government of India
                </p>
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="font-medium leading-relaxed">{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email / User ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Official Email or User ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
                    }}
                    placeholder="e.g. admin@iitd.ac.in or aicte.admin@aicte.gov.in"
                    className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border bg-slate-50/50 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.email
                        ? 'border-rose-300 focus:ring-rose-200'
                        : 'border-slate-300 focus:ring-gov-navy/20 focus:border-gov-navy'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Account Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotEmail(email);
                      setForgotStatus(null);
                    }}
                    className="text-[11px] font-semibold text-gov-teal hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
                    }}
                    placeholder="Enter your confidential account password"
                    className={`w-full text-xs pl-9 pr-10 py-2.5 rounded-lg border bg-slate-50/50 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.password
                        ? 'border-rose-300 focus:ring-rose-200'
                        : 'border-slate-300 focus:ring-gov-navy/20 focus:border-gov-navy'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.password}</p>
                )}
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 px-4 bg-gov-navy hover:bg-gov-navy-dark text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Verifying Credentials & Session...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Assigned Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Assurance Badge */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Backend Determines Portal via RBAC</span>
              </span>
              <span className="font-mono text-[10px]">AES / HMAC-SHA256</span>
            </div>
          </div>

          {/* Small Box Below Login Card: SIH Demo Accounts */}
          <div className="mt-4 bg-white rounded-xl border border-gov-border shadow-xs p-3.5">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-bold text-gov-navy uppercase tracking-wider">
                  SIH Demo Accounts (1-Click Test)
                </span>
              </div>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-gov-navy border border-blue-200">
                Quick Evaluator Access
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleAutofillDemo(acc)}
                    disabled={submitting}
                    className="p-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-gov-teal hover:shadow-2xs text-left transition-all group cursor-pointer"
                    title={acc.sub}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center space-x-1 min-w-0">
                        <Icon className="w-3 h-3 text-gov-navy shrink-0" />
                        <span className="text-[11px] font-bold text-slate-800 truncate">
                          {acc.role === 'INSTITUTION_ADMIN' ? 'IIT Delhi' : acc.role === 'AICTE_ADMIN' ? 'AICTE Admin' : 'TCS Verifier'}
                        </span>
                      </div>
                      <span className={`text-[8px] font-bold px-1 py-0.2 rounded border shrink-0 ${acc.badge}`}>
                        {acc.role === 'INSTITUTION_ADMIN' ? 'P1' : acc.role === 'AICTE_ADMIN' ? 'P2' : 'P3'}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono truncate">
                      {acc.email}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gov-border shadow-2xl max-w-md w-full p-6 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gov-border">
              <div className="flex items-center space-x-2 text-gov-navy">
                <KeyRound className="w-5 h-5 text-gov-teal" />
                <h3 className="text-sm font-bold">Password Reset Workflow</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotStatus?.type === 'success' ? (
              <div className="py-4 space-y-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Reset Instructions Dispatched</p>
                    <p className="mt-0.5">{forgotStatus.message}</p>
                  </div>
                </div>
                {forgotStatus.token && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px]">
                    <span className="text-slate-500 block text-[10px] font-sans">Demo Recovery Reference Token:</span>
                    <span className="font-bold text-gov-navy">{forgotStatus.token}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2 bg-gov-navy text-white rounded-lg text-xs font-bold hover:bg-gov-navy-dark transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="py-4 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your official registered administrative email address. A cryptographically verifiable password reset link will be sent to your account.
                </p>

                {forgotStatus?.type === 'error' && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{forgotStatus.message}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. admin@iitd.ac.in"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 rounded-lg bg-gov-teal hover:bg-gov-teal-light text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1"
                  >
                    {forgotLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Dispatch Reset Link</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto px-4 py-4 border-t border-gov-border/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
        <div>
          AICTE VidyarthiSetu Prototype Platform • Smart India Hackathon (SIH 2026)
        </div>
        <div className="mt-1 sm:mt-0 font-mono text-[10px]">
          PostgreSQL Database • RBAC Secured
        </div>
      </footer>
    </div>
  );
};

export default Login;
