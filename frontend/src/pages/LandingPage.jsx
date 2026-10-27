import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  FileCheck2,
  ArrowRight,
  HelpCircle,
  Gavel,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  School,
  FileText,
  Sparkles,
  Phone,
  Mail,
  Award,
} from 'lucide-react';

import { PublicNavbar } from '../components/PublicNavbar.jsx';
import aicteLogo from '../logo/AICTE-Log.png';
import heroBg from '../logo/backcground.jpg';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handlePortalLogin = (roleType) => {
    navigate(`/login?role=${roleType}`);
  };

  const faqs = [
    {
      q: 'What is APAAR and why is it mandatory for AICTE institutions?',
      a: 'APAAR (Automated Permanent Academic Account Registry) is a 12-digit lifelong unique identifier for students across India, established under the National Education Policy (NEP 2020) and Ministry of Education. It unifies academic records, prevents fraudulent impersonation, and facilitates verifiable credit transfers via the Academic Bank of Credits (ABC).',
    },
    {
      q: 'How does the Cross-Institution Duplicate Enrolment Detection Engine work?',
      a: 'When an institution uploads student admission lists (via CSV or manual registration), AICTE VidyarthiSetu compares candidate APAAR identifiers, demographic hashes, and Class 12th certificate SHA-256 signatures in real time against all active enrolments nationwide. If a student is simultaneously enrolled in two full-time technical programs, an immediate regulatory collision alert is triggered.',
    },
    {
      q: 'How are Supernumerary Seat Quotas monitored under AICTE APH rules?',
      a: 'Under the AICTE Approval Process Handbook (APH) 2024-25, Tuition Fee Waiver (TFW) seats are capped at a strict 5% above the sanctioned intake. Prime Minister’s Special Scholarship Scheme (PMSSS) for J&K/Ladakh, Kashmiri Migrants, and Foreign National quotas are tracked separately so that regular sanctioned ceilings are never breached.',
    },
    {
      q: 'How does AICTE VidyarthiSetu verify academic credentials without exposing student PII?',
      a: 'AICTE VidyarthiSetu issues tamper-proof QR credentials signed with an HMAC-SHA256 private key. The QR URL contains only an opaque reference token and a cryptographic signature. Sensitive attributes (such as the 12-digit APAAR or Aadhaar details) are never exposed in public QR codes or URLs.',
    },
    {
      q: 'How can an institution obtain its login credentials?',
      a: 'The AICTE / Platform Administrator provisions institution accounts directly in the national registry database. Each technical institute is assigned a dedicated Nodal Administrator username and password, linked to their permanent AICTE Institute ID (PID).',
    },
  ];

  return (
    <div className="min-h-screen bg-gov-page text-gov-charcoal font-sans antialiased flex flex-col">
      {/* Enhanced Public Navbar with AICTE Logo, Navigation, and Demo Switcher */}
      <PublicNavbar />

      {/* HERO SECTION */}
      <section
        className="relative py-16 sm:py-20 border-b border-gov-border overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark navy-blue overlay with appropriate transparency for readability */}
        <div className="absolute inset-0 bg-[#0B1E36]/85 bg-gradient-to-b from-[#0B1E36]/90 via-[#17365D]/85 to-[#0F243E]/92" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900/60 text-blue-200 text-xs font-bold border border-blue-400/30 mb-6 shadow-2xs backdrop-blur-xs">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>All India Council for Technical Education (AICTE) • National Regulatory Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight sm:leading-none">
              National Student Data Verification &{' '}
              <span className="text-amber-400">Cross-Institution Anti-Collision</span> Platform
            </h1>

            <p className="mt-5 text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              AICTE VidyarthiSetu empowers technical institutions and regulatory officers across India to manage student admissions, validate 12-digit APAAR identifiers, detect duplicate enrolments across colleges, verify admission certificates, and monitor approved intake compliance.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/submit-documents"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md transition-all group"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-200" />
                <span>Student Document Portal (Self-Service)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gov-navy hover:bg-slate-800 text-white text-sm font-bold shadow-md border border-slate-600 transition-all group"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>Access Authorized Portals</span>
              </button>

              <a
                href="#portals"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold shadow-xs backdrop-blur-xs transition-colors"
              >
                <School className="w-4 h-4 text-amber-300" />
                <span>Explore Three Login Roles</span>
              </a>

              <a
                href="#help"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium backdrop-blur-xs transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-slate-300" />
                <span>Help & FAQs</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* THREE LOGIN ROLES SECTION */}
      <section id="portals" className="py-16 bg-white border-b border-gov-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-gov-teal bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Role-Based Access Control (RBAC)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gov-navy mt-2">
              Three Dedicated Portal Access Roles
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select your designated authority to sign in to your specific workflow environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PORTAL 1: Institution Admin Login */}
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50/20 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 rounded-lg bg-blue-600 text-white shadow-xs">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      Portal 1
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      Institution Admin Login
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  For authorized registrars, principals, and nodal admission officers of technical institutes.
                </p>

                <div className="space-y-2.5 text-xs text-slate-700 mb-6">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="font-medium">Manages student records and document uploads.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="font-medium">Checks admission and intake compliance.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="font-medium">Reviews verification alerts.</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handlePortalLogin('INSTITUTION_ADMIN')}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <span>Sign In as Institution Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="text-[10px] text-slate-400 text-center mt-2 font-mono">
                  Demo: admin@iitd.ac.in • IITD@123
                </div>
              </div>
            </div>

            {/* PORTAL 2: AICTE / Platform Admin Login */}
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50/20 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 rounded-lg bg-purple-700 text-white shadow-xs">
                    <Shield className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                      Portal 2
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      AICTE / Platform Admin Login
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Apex regulatory oversight for AICTE officials, regional directors, and council auditors.
                </p>

                <div className="space-y-2.5 text-xs text-slate-700 mb-6">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <span className="font-medium">Views institution-wise dashboards.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <span className="font-medium">Monitors potential duplicate enrolments.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <span className="font-medium">Reviews compliance reports and audit logs.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <span className="font-medium">Onboards institutions & provisions usernames/passwords.</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handlePortalLogin('AICTE_ADMIN')}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-lg bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <span>Sign In as AICTE Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="text-[10px] text-slate-400 text-center mt-2 font-mono">
                  Demo: aicte.admin@aicte.gov.in • Admin@123
                </div>
              </div>
            </div>

            {/* PORTAL 3: Verification Officer Login */}
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50/20 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 rounded-lg bg-amber-600 text-white shadow-xs">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                      Portal 3
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      Verification Officer Login
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  For certified compliance officers, third-party employer verifiers, and appellate adjudicators.
                </p>

                <div className="space-y-2.5 text-xs text-slate-700 mb-6">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="font-medium">Reviews AI-generated alerts.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="font-medium">Checks documents and conflicting records.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="font-medium">Approves or rejects cases after manual review.</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handlePortalLogin('VERIFIER')}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <span>Sign In as Verification Officer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="text-[10px] text-slate-400 text-center mt-2 font-mono">
                  Demo: verifier@tcs.com • Verifier@123
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AICTE DETAILS & MANDATE SECTION */}
      <section id="about" className="py-16 bg-gov-page border-b border-gov-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gov-navy bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Statutory Authority & Policy Context
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gov-navy leading-tight">
                AICTE Mandate & The Approval Process Handbook (APH)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The All India Council for Technical Education (AICTE), under the Ministry of Education, regulates technical education across India to ensure quality, transparency, and data integrity.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3.5 bg-white rounded-lg border border-gov-border">
                  <div className="font-bold text-gov-navy mb-1">Clause 7.2: Supernumerary Quota</div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Tuition Fee Waiver (TFW) supernumerary seats are restricted to a maximum of 5% of sanctioned intake, reserved strictly for economically eligible candidates.
                  </p>
                </div>
                <div className="p-3.5 bg-white rounded-lg border border-gov-border">
                  <div className="font-bold text-gov-navy mb-1">Clause 7.3: Dual Enrolment Ban</div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    No candidate shall concurrently occupy two full-time formal degree seats. Doing so invalidates both admissions unless legitimately transferred.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-gov-border shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-gov-navy font-bold text-xs uppercase tracking-wider">
                <Gavel className="w-4 h-4 text-gov-teal" />
                <span>Statutory Compliance Architecture</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span><strong>Zero PII Exposure:</strong> Opaque tokens and HMAC signatures protect candidate privacy.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span><strong>Cross-College Collision Shield:</strong> Detects simultaneous seat claims across institutes.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <span><strong>Intake Ceiling Guard:</strong> Prevents institutions from over-admitting students beyond approved sanctions.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="py-16 bg-white border-b border-gov-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-gov-teal bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Technical Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gov-navy mt-2">
              Key Platform Innovations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Engineered specifically for Smart India Hackathon to solve national data deduplication challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-gov-border bg-gov-page hover:bg-slate-50 transition-colors">
              <div className="p-2.5 rounded-lg bg-rose-100 text-rose-700 inline-block mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                Cross-College Collision Engine (Differentiator)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Side-by-side comparison of duplicate applications across institutions with automated confidence scoring and adjudication workflows.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-gov-border bg-gov-page hover:bg-slate-50 transition-colors">
              <div className="p-2.5 rounded-lg bg-teal-100 text-gov-teal inline-block mb-3">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                AI Document OCR & SHA-256 Hash Matching
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Extracts certificates and marksheets in real time, compares against applicant database records, and catches re-used certificate hashes.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-gov-border bg-gov-page hover:bg-slate-50 transition-colors">
              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700 inline-block mb-3">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                Cryptographic Credentials & Anti-Tamper Demo
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Issues verifiable academic records with HMAC-SHA256 signatures and QR verification, complete with an interactive judge tamper demonstration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HELP & FAQ SECTION */}
      <section id="help" className="py-16 bg-gov-page border-b border-gov-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-3 py-1 rounded-full">
              Help Desk & Knowledge Base
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gov-navy mt-2">
              Frequently Asked Questions & Guidelines
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Guidance for institutions, nodal officers, and third-party verifiers.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gov-border shadow-2xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-50/80"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gov-teal shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contact Support Box */}
          <div className="mt-8 p-5 bg-white rounded-xl border border-gov-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-blue-50 text-gov-navy border border-blue-200">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">AICTE National Technical Helpdesk</h4>
                <p className="text-[11px] text-slate-500">
                  Toll-free: 1800-11-2026 • Email: support@vidyarthisetu.aicte.gov.in
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg bg-gov-navy hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
            >
              Sign In to Portal →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-8 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center text-white">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <span className="font-extrabold text-base text-white">AICTE VidyarthiSetu Platform</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                v2.4 (SIH 2026 Prototype)
              </span>
            </div>

            <div className="flex items-center space-x-6 text-slate-400">
              <a href="#about" className="hover:text-white">AICTE Mandate</a>
              <a href="#portals" className="hover:text-white">Role Portals</a>
              <a href="#help" className="hover:text-white">Guidelines</a>
              <Link to="/login" className="hover:text-amber-400 font-semibold">Portal Login</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              © 2026 All India Council for Technical Education (AICTE), Ministry of Education, Government of India.
            </div>
            <div>
              Designed for Smart India Hackathon • Simulated APAAR Verification Engine
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
