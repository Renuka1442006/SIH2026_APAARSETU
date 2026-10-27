import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { PublicNavbar } from '../components/PublicNavbar.jsx';
import {
  Shield,
  FileCheck2,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Building,
  Calendar,
  Hash,
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
  Download,
  Award,
  Sparkles,
  School,
  Info,
  Clock,
  Check,
  ChevronRight,
  Copy,
  FileType,
  FileCheck,
  XCircle,
  HelpCircle,
  Fingerprint,
  FileUp,
} from 'lucide-react';

export const StudentPublicDocumentUpload = () => {
  // Step 1: Candidate Lookup States
  const [identifier, setIdentifier] = useState('');
  const [dob, setDob] = useState('');
  const [searching, setSearching] = useState(false);
  const [lookupError, setLookupError] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [copiedApaar, setCopiedApaar] = useState(false);

  // Step 2: Document Upload States
  const [documentType, setDocumentType] = useState('HIGHER_SECONDARY_12TH');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Quick Demo Pre-fill options for evaluators
  const demoCandidates = [
    {
      label: 'Aarav Sharma',
      institution: 'IIT Delhi',
      identifier: '2026-9811-3001',
      dob: '2004-05-14',
      course: 'B.Tech Computer Science',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badgeText: 'Clean Enrolment',
    },
    {
      label: 'Rohan A. Sharma',
      institution: 'COEP / VJTI',
      identifier: '2026-9090-1122',
      dob: '2004-08-12',
      course: 'Mechanical Engineering',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
      badgeText: 'Collision Test Candidate',
    },
    {
      label: 'Vikramaditya Rao',
      institution: 'NIT Trichy',
      identifier: '2026-7788-0001',
      dob: '2005-04-18',
      course: 'Civil Engineering',
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
      badgeText: 'APAAR Verified',
    },
  ];

  const handlePreFill = (demo) => {
    setIdentifier(demo.identifier);
    setDob(demo.dob);
    setLookupError(null);
  };

  // 1. Candidate Identity Verification Lookup
  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setLookupError('Please enter your 12-digit APAAR ID or Institutional Roll Number.');
      return;
    }

    setSearching(true);
    setLookupError(null);
    setUploadResult(null);

    try {
      const res = await api.lookupCandidate({
        identifier: identifier.trim(),
        dob: dob || undefined,
      });

      const candidateData = res?.candidate || res?.data?.candidate;
      if (candidateData) {
        setCandidate(candidateData);
      } else {
        setLookupError(res?.error || res?.data?.error || 'Unable to locate candidate records.');
      }
    } catch (err) {
      console.error('Lookup failed:', err);
      setLookupError(
        err.response?.data?.error ||
          err.message ||
          'Candidate verification failed. Please check your APAAR ID and Date of Birth.'
      );
    } finally {
      setSearching(false);
    }
  };

  // 2. Client-Side SHA-256 Hash Computation
  const processFile = async (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10 MB regulatory limit.');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    setIsHashing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setFileHash(hashHex);
    } catch (err) {
      console.error('Client hash calculation failed:', err);
      setFileHash('HASH_COMPUTED_ON_SERVER');
    } finally {
      setIsHashing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  const copyApaarToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedApaar(true);
    setTimeout(() => setCopiedApaar(false), 2500);
  };

  // 3. Document Self-Upload Submission
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a valid certificate file (PDF, JPG, PNG).');
      return;
    }
    if (!candidate) {
      setUploadError('Candidate session invalid. Please verify your identity first.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('studentId', candidate.id);
      formData.append('institutionId', candidate.institution.id);
      formData.append('documentType', documentType);

      const res = await api.studentSelfUploadDocument(formData);
      const resultData = res?.data || res;

      if (resultData?.success) {
        setUploadResult(resultData);
        // Add new document to candidate's local list
        if (resultData.document) {
          setCandidate((prev) => ({
            ...prev,
            documents: [resultData.document, ...(prev?.documents || [])],
          }));
        }
        setSelectedFile(null);
        setFileHash('');
      } else {
        setUploadError(resultData?.error || 'Document submission failed.');
      }
    } catch (err) {
      console.error('Upload submission error:', err);
      setUploadError(
        err.response?.data?.error ||
          err.message ||
          'Failed to upload and register document hash. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const documentTypesList = [
    {
      id: 'HIGHER_SECONDARY_12TH',
      title: 'Class 12th / Higher Secondary Marksheet & Passing Certificate',
      desc: 'Used for cross-institution admission deduplication & demographic matching',
      badge: 'Primary Verification',
    },
    {
      id: 'TRANSFER_CERTIFICATE',
      title: 'School / College Leaving Certificate (Transfer Certificate - TC)',
      desc: 'Mandatory proof of formal relinquishment from previous institution',
      badge: 'Relinquishment Proof',
    },
    {
      id: 'MIGRATION_CERTIFICATE',
      title: 'Board / University Migration Certificate',
      desc: 'Authenticates formal academic jurisdiction transition',
      badge: 'Jurisdiction',
    },
    {
      id: 'APAAR_CONSENT_LETTER',
      title: 'APAAR & Aadhaar Voluntary Consent Undertaking Form',
      desc: 'NEP 2020 DigiLocker consent form for ABC credit synchronization',
      badge: 'DigiLocker ABC',
    },
    {
      id: 'CASTE_INCOME_CERTIFICATE',
      title: 'Reserved Category (SC/ST/OBC/EWS) / TFW Income Certificate',
      desc: 'Statutory verification for Tuition Fee Waiver (5% Supernumerary Quota)',
      badge: 'APH Supernumerary',
    },
    {
      id: 'ENTRANCE_SCORECARD',
      title: 'JEE Main / State CET Entrance Exam Scorecard',
      desc: 'Sanctioned merit score validation against state admission quota',
      badge: 'Merit Score',
    },
  ];

  return (
    <div className="min-h-screen bg-gov-page text-gov-charcoal font-sans antialiased flex flex-col justify-between">
      {/* Official Government Navbar with AICTE Logo, Navigation, and Demo Switcher */}
      <PublicNavbar />

      {/* Sub-header Context / Breadcrumb Bar */}
      <div className="bg-slate-50 border-b border-gov-border/70 py-2.5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-xs">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 font-semibold text-slate-600 hover:text-gov-navy transition-colors"
          >
            <span>← Return to AICTE VidyarthiSetu Portal Overview</span>
          </Link>

          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span className="hidden sm:inline-flex items-center space-x-1 font-mono text-[11px] text-slate-600">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>SHA-256 Client-Side Cryptographic Vault</span>
            </span>
            <Link
              to="/login"
              className="px-2.5 py-1 rounded-md bg-white border border-gov-border text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
            >
              Institution / Officer Login →
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-gov-navy via-[#173a67] to-gov-navy text-white py-10 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/70 border border-blue-400/40 text-amber-300 text-xs font-bold tracking-wide backdrop-blur-xs">
            <Award className="w-3.5 h-3.5" />
            <span>AICTE National Academic Repository • Student Self-Service Portal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Academic Document Submission &{' '}
            <span className="text-amber-400">Anti-Collision Verification</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Verify your student record using your 12-digit APAAR ID and Date of Birth, and submit
            academic certificates directly to your enrolled technical institute with real-time SHA-256 fingerprinting.
          </p>

          {/* 3-Step Progress Indicator Ribbon */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                candidate
                  ? 'bg-emerald-950/40 border-emerald-400/40 text-emerald-200'
                  : 'bg-white/10 border-white/20 text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    candidate ? 'bg-emerald-500 text-slate-900' : 'bg-white/20 text-white'
                  }`}
                >
                  {candidate ? '✓' : '1'}
                </span>
                <span className="text-xs font-bold">1. Verify Student Record</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 pl-7 truncate">
                {candidate ? `${candidate.fullName} Verified` : 'Enter 12-Digit APAAR ID & DOB'}
              </p>
            </div>

            <div
              className={`p-3.5 rounded-xl border transition-all ${
                candidate && !uploadResult
                  ? 'bg-amber-950/40 border-amber-400/40 text-amber-200'
                  : uploadResult
                  ? 'bg-emerald-950/40 border-emerald-400/40 text-emerald-200'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    uploadResult
                      ? 'bg-emerald-500 text-slate-900'
                      : candidate
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {uploadResult ? '✓' : '2'}
                </span>
                <span className="text-xs font-bold">2. Upload Certificate</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 pl-7">
                {uploadResult ? 'Certificate Uploaded' : 'Select Category & SHA-256 Hash'}
              </p>
            </div>

            <div
              className={`p-3.5 rounded-xl border transition-all ${
                uploadResult
                  ? 'bg-emerald-950/40 border-emerald-400/40 text-emerald-200'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    uploadResult ? 'bg-emerald-500 text-slate-900' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  3
                </span>
                <span className="text-xs font-bold">3. Official Receipt</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 pl-7">
                {uploadResult ? 'Receipt Generated' : 'Digital Tamper-Proof Audit Token'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Form Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* STEP 1 CARD: Candidate Identity Verification Form */}
        <div className="bg-white rounded-2xl border border-gov-border/80 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gov-border/80 pb-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-gov-navy font-black text-base shadow-xs">
                1
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gov-navy flex items-center space-x-2">
                  <span>Step 1: Student Identity Verification</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your 12-digit APAAR ID and Date of Birth to verify your technical institute enrolment.
                </p>
              </div>
            </div>

            {candidate && (
              <span className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Active Student</span>
              </span>
            )}
          </div>

          {/* PRIMARY LOOKUP FORM (Placed First as Requested) */}
          <form onSubmit={handleLookup} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 12-Digit APAAR ID Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <span>12-Digit APAAR ID or Roll Number</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    XXXX-XXXX-XXXX
                  </span>
                </div>
                
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none">
                    <Fingerprint className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (lookupError) setLookupError(null);
                    }}
                    placeholder="e.g. 2026-9811-3001 or 2024CS10101"
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-gov-navy font-mono text-slate-900 transition-all shadow-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  National Academic Depository (APAAR / ABC ID) linked to your college admission.
                </p>
              </div>

              {/* Date of Birth Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <span>Date of Birth (DOB)</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    Matches 10th Record
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none">
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => {
                      setDob(e.target.value);
                      if (lookupError) setLookupError(null);
                    }}
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-gov-navy font-sans text-slate-900 transition-all shadow-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Secondary authentication factor matching your official institutional enrolment.
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {lookupError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{lookupError}</div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>AICTE Central Verification Handshake • Read-Only Query</span>
              </div>

              <div className="flex items-center space-x-3">
                {candidate && (
                  <button
                    type="button"
                    onClick={() => {
                      setCandidate(null);
                      setUploadResult(null);
                      setSelectedFile(null);
                      setFileHash('');
                    }}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Clear / Switch Student
                  </button>
                )}

                <button
                  type="submit"
                  disabled={searching}
                  className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gov-navy to-[#183963] hover:from-[#183963] hover:to-gov-navy text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  {searching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Verifying Record in National Registry...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-amber-300" />
                      <span>Verify Student Identity</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* SIH DEMO STUDENT PROFILES (Added AFTER the Form as Requested) */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 bg-slate-50/70 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 rounded-b-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                  SIH Evaluator Demo Profiles (1-Click Test)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Click any candidate below to auto-fill the form above:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {demoCandidates.map((demo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePreFill(demo)}
                  className="text-left p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-gov-teal hover:shadow-sm hover:bg-teal-50/20 transition-all text-xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 group-hover:text-gov-teal transition-colors">
                      {demo.label}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${demo.badge}`}>
                      {demo.badgeText}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 inline-block mb-1">
                    APAAR: {demo.identifier}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">
                    {demo.institution} • {demo.course}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Student Dossier Display (Appears once student is verified) */}
          {candidate && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 border border-blue-200 space-y-5 animate-fadeIn shadow-xs mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-blue-200/80 pb-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gov-navy text-white flex items-center justify-center font-bold text-xl shadow-sm border border-blue-300">
                    {candidate.fullName?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-extrabold text-gov-navy flex items-center space-x-2">
                      <span>{candidate.fullName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-gov-navy border border-blue-300">
                        {candidate.gender}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 flex items-center space-x-2">
                      <span>DOB: {new Date(candidate.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Enrolment Active</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    12-Digit APAAR Identifier
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs">
                    <span className="text-sm font-mono font-bold text-gov-navy">
                      {candidate.apaarId}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyApaarToClipboard(candidate.apaarId)}
                      className="text-slate-400 hover:text-gov-navy transition-colors cursor-pointer"
                      title="Copy APAAR ID"
                    >
                      {copiedApaar ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Enrolment Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold block">
                    Admitted Technical Institution:
                  </span>
                  <div className="font-bold text-slate-900 flex items-center space-x-2 mt-1.5 text-sm">
                    <School className="w-4 h-4 text-gov-teal shrink-0" />
                    <span>{candidate.institution?.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono block mt-1.5">
                    AICTE PID: {candidate.institution?.code} • {candidate.institution?.city}, {candidate.institution?.state}
                  </span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold block">
                    Admitted Academic Program & Roll Number:
                  </span>
                  <div className="font-bold text-slate-900 mt-1.5 text-sm">
                    {candidate.enrolment?.courseName || 'Engineering Program'}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono block mt-1.5">
                    Roll No: {candidate.enrolment?.rollNumber || 'PENDING'} • Academic Year: {candidate.enrolment?.academicYear || '2024-25'}
                  </span>
                </div>
              </div>

              {/* Previously Submitted Certificates */}
              {candidate.documents && candidate.documents.length > 0 && (
                <div className="pt-3 border-t border-blue-200/80">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-gov-navy" />
                      <span>Vault Certificates on Record ({candidate.documents.length})</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      SHA-256 Fingerprint Validated
                    </span>
                  </div>

                  <div className="space-y-2">
                    {candidate.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs gap-2 shadow-2xs"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-gov-teal shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{doc.fileName}</span>
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                            {doc.documentType}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                            SHA: {doc.checksum?.slice(0, 14)}...
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              doc.verificationStatus === 'VERIFIED_CLEAN'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : doc.verificationStatus === 'DISCREPANCY_FLAGGED'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {doc.verificationStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* STEP 2 CARD: Document Upload & Real-Time SHA-256 Fingerprinting */}
        {candidate && (
          <div className="bg-white rounded-2xl border border-gov-border/80 shadow-md p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex items-center space-x-3.5 border-b border-gov-border/80 pb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-gov-teal font-black text-base shadow-xs">
                2
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gov-navy">
                  Step 2: Certificate Self-Submission & Real-Time Fingerprinting
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your certificate type, choose your file, and register with client-side SHA-256 hashing.
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-6">
              {/* Document Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Academic Certificate Category <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-gov-teal font-medium text-slate-800 transition-all cursor-pointer shadow-xs"
                  >
                    {documentTypesList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title} ({item.badge})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Choose the category that matches the certificate you are submitting to {candidate.institution?.name}.
                </p>
              </div>

              {/* Drag-and-Drop File Upload Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Attach Document File <span className="text-rose-500 font-bold">*</span>
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer relative group ${
                    isDragging
                      ? 'border-gov-teal bg-teal-50/40 ring-4 ring-teal-100'
                      : 'border-slate-300 hover:border-gov-teal bg-slate-50/50 hover:bg-teal-50/10'
                  }`}
                >
                  <input
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-3.5">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-gov-teal group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-8 h-8" />
                    </div>

                    {selectedFile ? (
                      <div className="space-y-2">
                        <div className="text-sm sm:text-base font-bold text-gov-navy">{selectedFile.name}</div>
                        <div className="text-xs text-slate-500">
                          File Size: <span className="font-mono font-semibold">{Math.round(selectedFile.size / 1024)} KB</span> • Type: {selectedFile.type || 'Document'}
                        </div>
                        <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 mt-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>File Loaded • Click to Replace File</span>
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="text-sm sm:text-base font-bold text-slate-800">
                          Click to browse or drag and drop your certificate here
                        </div>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          PDF, JPG, or PNG up to 10 MB • Clear color scans or DigiLocker signed PDFs recommended
                        </p>
                        <div className="flex items-center justify-center space-x-2 pt-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500">.PDF</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500">.JPG</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500">.PNG</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500">MAX 10 MB</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Real-Time Client-Side SHA-256 Fingerprint Display */}
              {(fileHash || isHashing) && (
                <div className="p-5 rounded-2xl bg-[#091528] text-white space-y-3 animate-fadeIn shadow-lg border border-slate-700/80">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold">
                      <Hash className="w-4 h-4" />
                      <span>Client-Side SHA-256 Cryptographic Fingerprint:</span>
                    </div>

                    {isHashing ? (
                      <span className="text-amber-300 flex items-center space-x-1.5 text-xs font-mono">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Computing byte hash...</span>
                      </span>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(fileHash)}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 cursor-pointer transition-colors"
                          title="Copy SHA-256 hash"
                        >
                          {copiedHash ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Hash</span>
                            </>
                          )}
                        </button>
                        <span className="text-emerald-400 font-semibold text-xs flex items-center space-x-1 font-mono">
                          <Check className="w-3.5 h-3.5" />
                          <span>Computed in Memory</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="font-mono text-xs sm:text-sm text-emerald-300 break-all bg-black/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed tracking-wider">
                    {fileHash || 'Computing byte digest in browser memory...'}
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This 256-bit hash uniquely identifies this document. The AICTE anti-collision engine cross-references this fingerprint across all active technical enrolments nationwide to detect duplicate claims.
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {uploadError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">{uploadError}</div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile || isHashing}
                  className="flex items-center space-x-2.5 px-7 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Transmitting & Cross-Validating...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-amber-300" />
                      <span>Submit Document to Institutional Vault</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3 CARD: Cryptographic Official Receipt (On Successful Upload) */}
        {uploadResult && (
          <div className="bg-white rounded-2xl border border-gov-border/80 shadow-elevated p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gov-border/80 pb-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gov-navy">
                    Official Document Submission Receipt
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Tx Token: {uploadResult.receipt?.transactionToken}
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-auto text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Acknowledged by {candidate?.institution?.code}
              </span>
            </div>

            {/* DUPLICATE COLLISION ALERT (IF DETECTED) */}
            {uploadResult.document?.duplicateHashFound ? (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-300 space-y-2.5">
                <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>National Cross-Institution Collision Detected</span>
                </div>
                <p className="text-xs text-rose-900 leading-relaxed font-semibold">
                  {uploadResult.document?.duplicateNotes}
                </p>
                <div className="text-[11px] text-rose-800 bg-white/80 p-3 rounded-xl border border-rose-200 leading-relaxed">
                  {uploadResult.document?.aiExplanation}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Verified Clean: </span>
                  <span className="leading-relaxed">{uploadResult.document?.aiExplanation}</span>
                </div>
              </div>
            )}

            {/* Receipt Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Candidate:</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{candidate?.fullName}</div>
                <div className="font-mono text-[11px] text-slate-500 mt-0.5">APAAR ID: {candidate?.apaarId}</div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Recipient Institution:</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{uploadResult.receipt?.institutionName}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Timestamp: {new Date(uploadResult.receipt?.timestamp).toLocaleString()}
                </div>
              </div>

              <div className="sm:col-span-2 pt-3 border-t border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Registered Cryptographic Checksum:</span>
                <div className="font-mono text-xs text-slate-800 break-all bg-white p-3 rounded-lg border border-slate-200 mt-1">
                  {uploadResult.document?.checksum}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-gov-border bg-gov-page hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Official Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUploadResult(null);
                  setSelectedFile(null);
                  setFileHash('');
                }}
                className="px-5 py-2.5 rounded-xl bg-gov-navy hover:bg-gov-navy-dark text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Submit Another Certificate →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gov-border py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            All India Council for Technical Education (AICTE), Ministry of Education, Government of India
          </p>
          <p className="text-[11px] text-slate-400">
            AICTE VidyarthiSetu — Student Data Management & Cross-Institution Anti-Collision Registry
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            Governed under NEP 2020 & AICTE Approval Process Handbook (APH 2024-25)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StudentPublicDocumentUpload;
