import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Lock,
  Menu,
  X,
  ChevronDown,
  Building2,
  Shield,
  Sparkles,
  ArrowRight,
  ExternalLink,
  School,
  CheckCircle2,
} from 'lucide-react';
import aicteLogo from '../logo/AICTE-Log.png';

export const PublicNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [evalMenuOpen, setEvalMenuOpen] = useState(false);

  const isLoginPage = location.pathname === '/login';

  const handleNavClick = (anchor) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(anchor);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(`/#${anchor}`);
  };

  const handleQuickRole = (role) => {
    setEvalMenuOpen(false);
    setMobileMenuOpen(false);
    navigate(`/login?role=${role}`);
  };

  const evalRoles = [
    {
      role: 'AICTE_ADMIN',
      label: 'AICTE Apex Admin',
      email: 'aicte.admin@aicte.gov.in',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Shield,
    },
    {
      role: 'INSTITUTION_ADMIN',
      label: 'Institution Admin (IIT Delhi)',
      email: 'admin@iitd.ac.in',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Building2,
    },
    {
      role: 'VERIFIER',
      label: 'Verification Officer (TCS)',
      email: 'verifier@tcs.com',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: FileCheck2,
    },
  ];

  return (
    <nav className="w-full sticky top-0 z-50 bg-white shadow-xs">
      {/* National Tricolor Top Stripe (Saffron, White, Green) */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" />

      <header className="border-b border-gov-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo & National Identity */}
            <Link
              to="/"
              className="flex items-center space-x-3.5 group focus:outline-none"
              title="AICTE VidyarthiSetu"
            >
              <img
                src={aicteLogo}
                alt="AICTE Official Emblem"
                className="h-12 w-12 sm:h-13 sm:w-13 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight text-gov-navy font-sans">
                  AICTE VidyarthiSetu
                </span>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  AICTE Student Data Management & Verification Platform
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-7 text-xs font-semibold text-slate-700">
              <button
                onClick={() => handleNavClick('about')}
                className="hover:text-gov-teal transition-colors py-1 cursor-pointer focus:outline-none"
              >
                AICTE Mandate
              </button>
              <button
                onClick={() => handleNavClick('features')}
                className="hover:text-gov-teal transition-colors py-1 cursor-pointer focus:outline-none"
              >
                Key Features
              </button>
              <button
                onClick={() => handleNavClick('portals')}
                className="hover:text-gov-teal transition-colors py-1 cursor-pointer focus:outline-none"
              >
                Three Role Portals
              </button>
              <button
                onClick={() => handleNavClick('help')}
                className="hover:text-gov-teal transition-colors py-1 cursor-pointer focus:outline-none"
              >
                Help & Guidelines
              </button>
            </div>

            {/* Right Action Buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              {/* Student Document Portal (Self-Service) */}
              <Link
                to="/submit-documents"
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors shadow-2xs"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Student Document Portal</span>
              </Link>

              {/* Evaluation Quick Access Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setEvalMenuOpen(!evalMenuOpen)}
                  className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold border border-gov-border bg-gov-page hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Evaluation Demo</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {evalMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setEvalMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-gov-border shadow-elevated z-50 p-2 divide-y divide-slate-100 animate-fadeIn">
                      <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        1-Click Evaluator Role Switch
                      </div>
                      <div className="py-1 space-y-1">
                        {evalRoles.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.role}
                              type="button"
                              onClick={() => handleQuickRole(item.role)}
                              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
                                  <Icon className="w-4 h-4 text-gov-navy" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-800">
                                    {item.label}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {item.email}
                                  </div>
                                </div>
                              </div>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Sign In to Portal CTA */}
              {isLoginPage ? (
                <Link
                  to="/"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-gov-page border border-gov-border hover:bg-slate-100 text-gov-navy shadow-2xs transition-colors"
                >
                  <School className="w-3.5 h-3.5 text-gov-teal" />
                  <span>Portal Overview</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold bg-gov-navy hover:bg-slate-800 text-white shadow-xs transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Sign In to Portal</span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex sm:hidden items-center space-x-2">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gov-navy text-white"
              >
                <Lock className="w-3 h-3 text-amber-300" />
                <span>Sign In</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg border border-gov-border text-slate-700 hover:bg-slate-100 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gov-border bg-white px-4 py-3 space-y-3 shadow-panel">
            <div className="flex flex-col space-y-2 text-xs font-semibold text-slate-700">
              <button
                onClick={() => handleNavClick('about')}
                className="text-left py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                AICTE Mandate
              </button>
              <button
                onClick={() => handleNavClick('features')}
                className="text-left py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                Key Features
              </button>
              <button
                onClick={() => handleNavClick('portals')}
                className="text-left py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                Three Role Portals
              </button>
              <button
                onClick={() => handleNavClick('help')}
                className="text-left py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                Help & Guidelines
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                to="/submit-documents"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Student Document Portal</span>
              </Link>

              <div className="pt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Evaluation Demo Accounts
              </div>
              {evalRoles.map((item) => (
                <button
                  key={item.role}
                  onClick={() => handleQuickRole(item.role)}
                  className="flex items-center justify-between text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-800"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
    </nav>
  );
};

export default PublicNavbar;
