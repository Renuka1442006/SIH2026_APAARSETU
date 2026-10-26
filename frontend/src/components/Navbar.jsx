import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Shield,
  UserCheck,
  Building2,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Search,
  Bell,
  ChevronRight,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal.jsx';

export const Navbar = () => {
  const { user, logout, quickDemoLogin, activeInstitutionId, setActiveInstitutionId, institutions } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const demoAccounts = [
    {
      role: 'AICTE_ADMIN',
      label: 'AICTE Apex Admin',
      email: 'aicte.admin@aicte.gov.in',
      pass: 'Admin@123',
      sub: 'All Institutions & Apex Monitoring',
    },
    {
      role: 'INSTITUTION_ADMIN',
      label: 'IIT Delhi Admin',
      email: 'admin@iitd.ac.in',
      pass: 'IITD@123',
      sub: 'Central Institute (Code 1-001)',
    },
    {
      role: 'INSTITUTION_ADMIN',
      label: 'COEP Tech Univ Pune',
      email: 'admin@coep.ac.in',
      pass: 'COEP@123',
      sub: 'State Autonomous (Code 1-002)',
    },
    {
      role: 'INSTITUTION_ADMIN',
      label: 'VJTI Mumbai Admin',
      email: 'admin@vjti.ac.in',
      pass: 'VJTI@123',
      sub: 'State Autonomous (Code 1-003)',
    },
    {
      role: 'VERIFIER',
      label: 'Authorized Verifier (TCS)',
      email: 'verifier@tcs.com',
      pass: 'Verifier@123',
      sub: 'Corporate / HR Third-Party',
    },
  ];

  const handleQuickSwitch = async (email, pass) => {
    try {
      setSwitching(true);
      setShowDemoMenu(false);
      await quickDemoLogin(email, pass);
    } catch (err) {
      console.error('Quick switch failed:', err);
    } finally {
      setSwitching(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'AICTE_ADMIN':
        return { label: 'AICTE Apex Admin', bg: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'INSTITUTION_ADMIN':
        return { label: 'Institution Admin', bg: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'VERIFIER':
        return { label: 'Authorized Verifier', bg: 'bg-amber-100 text-amber-900 border-amber-200' };
      default:
        return { label: 'User', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const badge = getRoleBadge(user?.role);

  // Dynamic Page Title & Breadcrumbs from Route
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/' || path === '/overview') {
      return { title: 'Executive Overview', crumbs: ['National Regulatory Portal', 'Executive Overview'] };
    }
    if (path.startsWith('/students')) {
      return { title: 'Student Records', crumbs: ['Student Registry', 'Enrolments & Identifiers'] };
    }
    if (path.startsWith('/document-verification')) {
      return { title: 'Document Verification Workspace', crumbs: ['Verification Services', 'AI Document OCR'] };
    }
    if (path.startsWith('/cross-institution')) {
      return { title: 'Cross-Institution Duplicate Engine', crumbs: ['Compliance & Oversight', 'Cross-College Collision'] };
    }
    if (path.startsWith('/compliance')) {
      return { title: 'Admission & Intake Compliance', crumbs: ['Institutional Compliance', 'Approved Intake vs Actual'] };
    }
    if (path.startsWith('/cases')) {
      return { title: 'Verification Cases & Alerts', crumbs: ['Compliance Oversight', 'Priority Case Queue'] };
    }
    if (path.startsWith('/qr-verification')) {
      return { title: 'Tamper-Proof Credential Verification', crumbs: ['Verifiable Credentials', 'QR Cryptographic Engine'] };
    }
    if (path.startsWith('/reports')) {
      return { title: 'Regulatory Reports & Analytics', crumbs: ['Intelligence', 'National Analytics'] };
    }
    if (path.startsWith('/audit-logs')) {
      return { title: 'Statutory Audit Ledger', crumbs: ['Security & Governance', 'Audit Trail'] };
    }
    if (path.startsWith('/settings')) {
      return { title: 'System & Institutional Settings', crumbs: ['Administration', 'Policy Configuration'] };
    }
    if (path.startsWith('/bulk-upload')) {
      return { title: 'Bulk CSV Intake Upload', crumbs: ['Data Ingestion', 'Batch Processing'] };
    }
    return { title: 'APAARSetu Portal', crumbs: ['Dashboard'] };
  };

  const currentNav = getBreadcrumbs();

  // Mock critical alerts for notification drawer
  const criticalAlerts = [
    {
      id: 'al-1',
      title: 'Simultaneous Multi-College Enrolment',
      description: 'Candidate Rohan Sharma (APAAR 2026-9090-1122) enrolled at IIT Delhi and VJTI Mumbai.',
      time: '12m ago',
      severity: 'HIGH',
      path: '/cross-institution',
    },
    {
      id: 'al-2',
      title: 'Course Intake Over-Admission Warning',
      description: 'Mechanical Engineering (VJTI) actual admissions exceed approved quota by 2 seats.',
      time: '1h ago',
      severity: 'WARNING',
      path: '/compliance',
    },
    {
      id: 'al-3',
      title: 'Digital Credential Revoked',
      description: 'Credential APAAR-CRD-2026-VJTI-999 was invalidated due to seat cancellation.',
      time: '3h ago',
      severity: 'INFO',
      path: '/qr-verification',
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gov-border shadow-xs">
        {/* National Tricolor Stripe */}
        <div className="gov-tricolor-bar w-full" />

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Portal Logo & Breadcrumbs */}
            <div className="flex items-center space-x-4">
              <Link to="/overview" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-lg bg-gov-navy flex items-center justify-center text-white shadow-sm border border-slate-700 transition-transform group-hover:scale-102">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-xl tracking-tight text-gov-navy">
                      APAARSetu
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-gov-navy border border-blue-200">
                      AICTE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                    Student Data Verification & Compliance
                  </p>
                </div>
              </Link>

              {/* Breadcrumb separator & path */}
              <div className="hidden lg:flex items-center space-x-1.5 pl-4 border-l border-slate-200 text-xs">
                <span className="text-slate-400">{currentNav.crumbs[0]}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-800">{currentNav.title}</span>
              </div>
            </div>

            {/* Center / Search: Quick Search Trigger Button */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-gov-border bg-gov-page hover:bg-slate-100/80 text-slate-500 text-xs transition-colors shadow-2xs"
              >
                <div className="flex items-center space-x-2">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>Search students, APAAR IDs, duplicate cases...</span>
                </div>
                <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded">
                  Ctrl K
                </kbd>
              </button>
            </div>

            {/* Right Header Controls */}
            {user && (
              <div className="flex items-center space-x-3">
                {/* Search icon button for mobile */}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-gov-border"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* Institution Filter / Scoping Dropdown (if AICTE Admin) */}
                {user.role === 'AICTE_ADMIN' && institutions && institutions.length > 0 && (
                  <div className="hidden xl:flex items-center space-x-1.5 text-xs">
                    <Building2 className="w-3.5 h-3.5 text-gov-teal" />
                    <select
                      value={activeInstitutionId}
                      onChange={(e) => setActiveInstitutionId(e.target.value)}
                      className="bg-gov-page border border-gov-border rounded-md px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-gov-teal"
                    >
                      <option value="">All Technical Institutions (National)</option>
                      {institutions.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Notification Bell Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                    className="relative p-2 rounded-lg text-slate-600 hover:text-gov-navy hover:bg-slate-100 border border-gov-border transition-colors"
                    title="Regulatory Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gov-error ring-2 ring-white"></span>
                  </button>

                  {showNotificationMenu && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl border border-gov-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-gov-border flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Regulatory Alerts & Directives
                        </span>
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          {criticalAlerts.length} Actionable
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                        {criticalAlerts.map((alt) => (
                          <div
                            key={alt.id}
                            onClick={() => {
                              setShowNotificationMenu(false);
                              navigate(alt.path);
                            }}
                            className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-900">{alt.title}</span>
                              <span className="text-[10px] text-slate-400">{alt.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              {alt.description}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="px-3 py-2 border-t border-gov-border bg-slate-50/70 text-center">
                        <button
                          onClick={() => {
                            setShowNotificationMenu(false);
                            navigate('/cases');
                          }}
                          className="text-xs font-medium text-gov-teal hover:text-gov-navy"
                        >
                          View All Review Cases →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 1-Click Evaluation Persona Switcher */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDemoMenu(!showDemoMenu)}
                    disabled={switching}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gov-page hover:bg-slate-200/70 text-slate-700 border border-gov-border transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-gov-teal" />
                    <span className="hidden sm:inline">Role Switcher</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>

                  {showDemoMenu && (
                    <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-xl border border-gov-border py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-1.5 border-b border-gov-border text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Select Demo Persona (Evaluation)
                      </div>
                      {demoAccounts.map((acc) => (
                        <button
                          key={acc.email}
                          onClick={() => handleQuickSwitch(acc.email, acc.pass)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50/70 transition-colors ${
                            user.email === acc.email ? 'bg-blue-50 font-semibold text-gov-navy' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="text-slate-900 font-medium">{acc.label}</div>
                            <div className="text-[10px] text-slate-500">{acc.sub}</div>
                          </div>
                          {user.email === acc.email && <CheckCircle2 className="w-4 h-4 text-gov-teal" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Info / Role Pill */}
                <div className="hidden md:flex flex-col text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <span className="text-xs font-bold text-slate-900">{user.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-end space-x-1">
                    {user.institution ? (
                      <>
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[180px]">{user.institution.name}</span>
                      </>
                    ) : (
                      <span>AICTE Apex HQ, New Delhi</span>
                    )}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-500 hover:text-gov-error hover:bg-rose-50 border border-gov-border transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
