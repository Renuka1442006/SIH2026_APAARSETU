import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

export const Login = () => {
  const navigate = useNavigate();
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
      {/* GovTech Tricolor Top Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" />

      {/* Top Header / Back Navigation */}
      <div className="max-w-5xl w-full mx-auto px-4 pt-6 flex justify-between items-center">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-gov-navy transition-colors bg-white px-3.5 py-1.5 rounded-lg border border-gov-border shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to APAARSetu Portal</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-gov-border shadow-2xs">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] font-semibold text-slate-700">
            PostgreSQL • Secure RBAC Auth
          </span>
        </div>
      </div>

      {/* Main Login Workspace */}
      <div className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Login Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gov-border shadow-panel p-6 sm:p-8">
            {/* Header / Brand */}
            <div className="flex items-start space-x-4 mb-6 pb-6 border-b border-gov-border">
              <div className="w-12 h-12 rounded-xl bg-gov-navy text-white flex items-center justify-center shrink-0 shadow-md">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gov-navy tracking-tight">
                  APAARSetu Sign In
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Student Data Verification & Admission Compliance Platform
                </p>
                <div className="mt-1 text-[11px] text-gov-teal font-medium flex items-center space-x-1">
                  <span>Ministry of Education • AICTE Regulation Prototype</span>
                </div>
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
                    className="text-[11px] font-semibold text-gov-teal hover:underline"
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
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
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
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Backend Determines Portal via RBAC</span>
              </span>
              <span className="font-mono">AES / HMAC-SHA256</span>
            </div>
          </div>

          {/* Right Column: SIH Demo Evaluator Quick-Access (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-gov-border shadow-panel p-5">
              <div className="flex items-center justify-between pb-3 border-b border-gov-border">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                    SIH Demo Accounts
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                  1-Click Test
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">
                Click any portal account to test role-specific workflows. Credentials authenticate against the backend API and redirect to the verified portal dashboard.
              </p>

              {/* Demo Account Cards */}
              <div className="mt-3.5 space-y-2.5">
                {demoAccounts.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleAutofillDemo(acc)}
                      disabled={submitting}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer group ${acc.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 shrink-0 text-gov-navy" />
                          <span className="text-xs font-bold">{acc.label}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border leading-none ${acc.badge}`}>
                          {acc.role === 'INSTITUTION_ADMIN' ? 'Portal 1' : acc.role === 'AICTE_ADMIN' ? 'Portal 2' : 'Portal 3'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {acc.sub}
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>{acc.email}</span>
                        <span className="text-gov-teal font-sans font-bold group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                          <span>Sign In</span>
                          <ArrowRight className="w-3 h-3 inline" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Portal Architecture Notice */}
            <div className="p-4 rounded-xl bg-slate-50 border border-gov-border text-[11px] text-slate-600 space-y-2">
              <div className="font-bold text-gov-navy flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-gov-teal" />
                <span>Three Distinct Portal Namespaces</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-500 pl-4 list-disc">
                <li><strong className="text-slate-700">/institution/*</strong>: Scoped to logged-in college records</li>
                <li><strong className="text-slate-700">/platform/*</strong>: Platform oversight & national analytics</li>
                <li><strong className="text-slate-700">/verifier/*</strong>: Dedicated reviewer queue & evidence audit</li>
              </ul>
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
          APAARSetu Prototype Platform • Smart India Hackathon (SIH 2026)
        </div>
        <div className="mt-1 sm:mt-0 font-mono text-[10px]">
          PostgreSQL Database • RBAC Secured
        </div>
      </footer>
    </div>
  );
};

export default Login;
