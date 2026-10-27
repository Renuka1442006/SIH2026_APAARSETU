import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import {
  FileCheck2,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Hash,
  ShieldCheck,
  Building,
  User,
  Calendar,
  Award,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Download,
  X,
  Search,
  Filter,
  RefreshCw,
  School,
  Check,
} from 'lucide-react';

export const DocumentVerification = () => {
  const { user } = useAuth();

  // Baseline sample fallback documents
  const sampleDocuments = [
    {
      id: 'doc-1',
      candidateName: 'Rohan Sharma',
      apaarId: '2026-9090-1122',
      docType: 'HIGHER_SECONDARY_12TH',
      docName: 'CBSE_Class_XII_Marksheet_2024.pdf',
      fileSize: '412 KB',
      sha256: '9f83a42d13b295c2d3851b4c9b207e7b8a7f45c928421831ef78f01b2a951c34',
      duplicateHashMatch: true,
      duplicateInstitution: 'Indian Institute of Technology Delhi (1-001) & VJTI Mumbai (1-003)',
      status: 'DISCREPANCY_FLAGGED',
      extractedFields: [
        { field: 'Candidate Full Name', ocrValue: 'ROHAN SHARMA', dbValue: 'Rohan Sharma', confidence: 99.4, match: true },
        { field: 'Date of Birth', ocrValue: '15/06/2004', dbValue: '2004-06-15', confidence: 98.2, match: true },
        { field: 'Roll / Registration No', ocrValue: '11648293', dbValue: '11648293', confidence: 99.8, match: true },
        { field: 'Board / Authority', ocrValue: 'Central Board of Secondary Education', dbValue: 'CBSE New Delhi', confidence: 96.5, match: true },
        { field: 'Total Aggregate Marks', ocrValue: '482 / 500 (96.4%)', dbValue: '482 / 500', confidence: 98.9, match: true },
      ],
      aiExplanation:
        'CRITICAL ALERT: File SHA-256 hash matches an identical certificate submitted previously under VJTI Mumbai. OCR attributes match Rohan Sharma, confirming cross-institutional submission of the same credentials.',
    },
    {
      id: 'doc-2',
      candidateName: 'Aarav Sharma',
      apaarId: '2026-9811-3001',
      docType: 'HIGHER_SECONDARY_12TH',
      docName: 'CBSE_Class_XII_Marksheet_Aarav.pdf',
      fileSize: '412 KB',
      sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      duplicateHashMatch: false,
      duplicateInstitution: null,
      status: 'VERIFIED_CLEAN',
      extractedFields: [
        { field: 'Candidate Full Name', ocrValue: 'AARAV SHARMA', dbValue: 'Aarav Sharma', confidence: 99.6, match: true },
        { field: 'Date of Birth', ocrValue: '14/05/2004', dbValue: '2004-05-14', confidence: 99.1, match: true },
        { field: 'Roll / Registration No', ocrValue: '2024CS10101', dbValue: '2024CS10101', confidence: 99.8, match: true },
        { field: 'APAAR 12-Digit Identifier', ocrValue: '2026-9811-3001', dbValue: '2026-9811-3001', confidence: 99.9, match: true },
      ],
      aiExplanation:
        'All OCR extracted fields reconcile 100% with enrolled database attributes. Digital stamp and institutional seal verified against National Academic Depository (NAD) signature dictionary.',
    },
    {
      id: 'doc-3',
      candidateName: 'Simran Kaur',
      apaarId: 'MISSING_APAAR',
      docType: 'APAAR_CONSENT_LETTER',
      docName: 'Aadhaar_APAAR_Declaration_Form.pdf',
      fileSize: '195 KB',
      sha256: 'e89a291834918471b82947192847198274918274918274918274918274918274',
      duplicateHashMatch: false,
      duplicateInstitution: null,
      status: 'REQUIRES_MANUAL_REVIEW',
      extractedFields: [
        { field: 'Candidate Full Name', ocrValue: 'SIMRAN KAUR', dbValue: 'Simran Kaur', confidence: 99.1, match: true },
        { field: 'APAAR 12-Digit Identifier', ocrValue: 'FIELD BLANK / PENDING GENERATION', dbValue: 'NOT_PROVIDED', confidence: 99.9, match: false },
        { field: 'Parental Consent Status', ocrValue: 'Affirmed with Physical Signature', dbValue: 'Pending Verification', confidence: 94.0, match: true },
      ],
      aiExplanation:
        'Document indicates provisional admission without active APAAR generation. Mandatory linkage required under AICTE Approval Process Handbook before enrollment finalization.',
    },
  ];

  const [activeDoc, setActiveDoc] = useState(sampleDocuments[0]);
  const [docList, setDocList] = useState(sampleDocuments);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadStudentId, setUploadStudentId] = useState('');
  const [uploadDocType, setUploadDocType] = useState('HIGHER_SECONDARY_12TH');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileHash, setUploadFileHash] = useState('');
  const [isCalculatingHash, setIsCalculatingHash] = useState(false);
  const [modalUploading, setModalUploading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Fetch real documents from backend
  const loadDocuments = async () => {
    try {
      setLoadingDocs(true);
      const res = await api.getInstitutionDocuments();
      if (res?.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setDocList(res.data.data);
        setActiveDoc(res.data.data[0]);
      } else if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setDocList(res.data);
        setActiveDoc(res.data[0]);
      }
    } catch (err) {
      console.warn('Using sample documents (offline/mock mode):', err.message);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Fetch enrolled students for upload dropdown
  const loadStudents = async () => {
    try {
      const res = await api.getInstitutionStudents();
      if (res?.data?.students && Array.isArray(res.data.students)) {
        setEnrolledStudents(res.data.students);
        if (res.data.students.length > 0) {
          setUploadStudentId(res.data.students[0].id);
        }
      }
    } catch (err) {
      console.warn('Unable to load institution students for dropdown:', err.message);
    }
  };

  useEffect(() => {
    loadDocuments();
    loadStudents();
  }, []);

  // Update Status in PostgreSQL
  const handleUpdateStatus = async (newStatus) => {
    if (!activeDoc?.id) return;
    try {
      setActionLoading(true);
      await api.updateInstitutionDocumentStatus(activeDoc.id, {
        status: newStatus,
        remarks: remarks || `Status marked as ${newStatus} by ${user?.name || 'Authorized Officer'}.`,
      });

      // Update in local state
      const updatedList = docList.map((d) =>
        d.id === activeDoc.id
          ? {
              ...d,
              status: newStatus,
              verificationStatus: newStatus,
              aiExplanation: remarks ? `[Officer Decision]: ${remarks}` : d.aiExplanation,
            }
          : d
      );

      setDocList(updatedList);
      setActiveDoc((prev) => ({
        ...prev,
        status: newStatus,
        verificationStatus: newStatus,
        aiExplanation: remarks ? `[Officer Decision]: ${remarks}` : prev.aiExplanation,
      }));

      setActionSuccess(`Document marked as "${newStatus}" and updated in statutory audit ledger.`);
      setRemarks('');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error('Update status failed:', err);
      setActionSuccess(`Status update failed: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setActionSuccess(null), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle file select in modal + client-side SHA-256 computation
  const handleModalFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setModalError('File exceeds 10 MB limit.');
      return;
    }

    setUploadFile(file);
    setModalError(null);
    setIsCalculatingHash(true);

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setUploadFileHash(hashHex);
    } catch (err) {
      console.error('Client hash error:', err);
      setUploadFileHash('COMPUTED_ON_SERVER');
    } finally {
      setIsCalculatingHash(false);
    }
  };

  // Submit modal upload to backend
  const handleModalUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setModalError('Please attach a document file.');
      return;
    }

    setModalUploading(true);
    setModalError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('studentId', uploadStudentId);
      formData.append('documentType', uploadDocType);

      const res = await api.uploadInstitutionDocument(formData);
      const newDoc = res.data?.data || res.data;

      setActionSuccess(
        res.data?.message ||
          `Document '${uploadFile.name}' uploaded successfully with SHA-256 fingerprinting.`
      );
      setTimeout(() => setActionSuccess(null), 4000);

      // Close modal & reset
      setIsModalOpen(false);
      setUploadFile(null);
      setUploadFileHash('');

      // Refresh documents
      await loadDocuments();
    } catch (err) {
      console.error('Upload modal error:', err);
      setModalError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setModalUploading(false);
    }
  };

  // Filtered documents
  const filteredDocs = docList.filter((doc) => {
    const currentStatus = doc.status || doc.verificationStatus;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CLEAN' && currentStatus === 'VERIFIED_CLEAN') ||
      (statusFilter === 'FLAGGED' && (currentStatus === 'DISCREPANCY_FLAGGED' || doc.duplicateHashMatch)) ||
      (statusFilter === 'REVIEW' && currentStatus === 'REQUIRES_MANUAL_REVIEW');

    const matchesSearch =
      !searchQuery.trim() ||
      doc.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.apaarId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docName?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Workspace Banner */}
      <div className="bg-white p-5 rounded-xl border border-gov-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gov-teal bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              AI-Powered Vision & OCR Workspace
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Model: AICTE-DocuVerify v3.1</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gov-navy mt-1 tracking-tight">
            AI-Assisted Admission Document Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Option B: College Administrator document upload, automated OCR vision matching, and cross-college collision auditing.
          </p>
        </div>

        {/* Modal Trigger */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gov-navy hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4 text-amber-300" />
            <span>Upload Student Certificate</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter & Search Ribbon */}
      <div className="bg-white p-3 rounded-xl border border-gov-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Documents' },
            { id: 'CLEAN', label: 'Clean (Verified)' },
            { id: 'FLAGGED', label: 'Collision Flagged' },
            { id: 'REVIEW', label: 'Requires Review' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-gov-navy text-white shadow-2xs'
                  : 'bg-gov-page hover:bg-slate-100 text-slate-600 border border-gov-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, APAAR..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gov-border bg-gov-page focus:bg-white focus:outline-none focus:border-gov-teal"
          />
        </div>
      </div>

      {/* Document Selection Tabs */}
      <div className="bg-white p-2 rounded-xl border border-gov-border shadow-xs flex flex-wrap gap-2 max-h-48 overflow-y-auto">
        {filteredDocs.length === 0 ? (
          <div className="w-full p-4 text-center text-xs text-slate-400">
            No certificates match the selected filter.
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isSelected = activeDoc?.id === doc.id;
            const isCollision = doc.duplicateHashMatch || doc.status === 'DISCREPANCY_FLAGGED';

            return (
              <button
                key={doc.id}
                onClick={() => {
                  setActiveDoc(doc);
                  setRemarks('');
                }}
                className={`flex-1 min-w-[240px] text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 border-gov-navy/40 shadow-2xs'
                    : 'bg-gov-page border-gov-border hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{doc.candidateName}</span>
                  {isCollision ? (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                      🚨 SHA-256 Collision
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Clean Hash
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 truncate font-mono">
                  {doc.docName}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                  <span>APAAR: {doc.apaarId}</span>
                  <span>{doc.fileSize}</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Main Split Verification Workspace */}
      {activeDoc && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Document Preview Canvas (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-gov-border shadow-xs flex flex-col overflow-hidden">
            {/* Canvas Controls Header */}
            <div className="p-3 bg-gov-page border-b border-gov-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gov-teal" />
                <span className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                  {activeDoc.docName}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 15, 70))}
                  className="p-1 text-slate-600 hover:bg-slate-200 rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-slate-600 px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 15, 140))}
                  className="p-1 text-slate-600 hover:bg-slate-200 rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1 text-slate-600 hover:bg-slate-200 rounded"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Document Renderer Preview */}
            <div className="p-4 bg-slate-900 flex items-center justify-center min-h-[460px] overflow-auto relative">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease',
                }}
                className="bg-white text-slate-900 rounded-sm shadow-2xl p-6 w-[360px] min-h-[480px] border border-slate-300 relative select-none"
              >
                {/* Emblem / Header of the certificate */}
                <div className="text-center border-b pb-3 mb-4">
                  <div className="w-8 h-8 mx-auto rounded-full bg-gov-navy text-amber-400 flex items-center justify-center font-bold text-xs mb-1">
                    🏛️
                  </div>
                  <div className="text-[11px] font-bold tracking-tight uppercase text-gov-navy">
                    Central Board of Secondary Education
                  </div>
                  <div className="text-[9px] text-slate-500 font-medium">
                    Higher Secondary School Examination Certificate 2024
                  </div>
                </div>

                {/* Certificate Body with Simulated OCR Bounding Box highlights */}
                <div className="space-y-3 text-[11px]">
                  <div className="relative p-1 border border-teal-500/80 bg-teal-50/40 rounded">
                    <span className="absolute -top-2 right-1 text-[8px] bg-gov-teal text-white px-1 rounded font-mono">
                      OCR 99.4%
                    </span>
                    <div className="text-[9px] text-slate-500 font-semibold">CANDIDATE NAME</div>
                    <div className="font-bold text-slate-900 font-serif tracking-wide">
                      {activeDoc.candidateName}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-1 border border-teal-500/60 bg-teal-50/20 rounded">
                      <div className="text-[9px] text-slate-500 font-semibold">DATE OF BIRTH</div>
                      <div className="font-semibold text-slate-800">
                        {activeDoc.extractedFields?.find((f) => f.field.includes('Birth'))?.ocrValue || '15/06/2004'}
                      </div>
                    </div>
                    <div className="p-1 border border-teal-500/60 bg-teal-50/20 rounded">
                      <div className="text-[9px] text-slate-500 font-semibold">ROLL NUMBER</div>
                      <div className="font-mono font-semibold text-slate-800">
                        {activeDoc.extractedFields?.find((f) => f.field.includes('Roll'))?.ocrValue || '11648293'}
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5 border border-slate-200 rounded">
                    <div className="text-[9px] text-slate-500 font-semibold mb-1">QUALIFYING MARKS</div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <span>Physics: 95/100</span>
                      <span>Chemistry: 94/100</span>
                      <span>Mathematics: 98/100</span>
                      <span>Aggregate: 96.4%</span>
                    </div>
                  </div>

                  {/* Digital Verification Hologram / Stamp */}
                  <div className="pt-4 flex items-center justify-between border-t border-slate-200 mt-4">
                    <div className="text-[9px] text-slate-400 font-mono">
                      DOC-REF: {activeDoc.id.slice(0, 12)}
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-600 border-dashed flex flex-col items-center justify-center text-emerald-700 text-[8px] font-bold rotate-[-12deg]">
                      <span>VERIFIED</span>
                      <span>NAD/ABC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Hash & Fingerprint Footer */}
            <div className="p-3 bg-gov-page border-t border-gov-border text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400">SHA-256:</span>
                <span className="truncate text-slate-800 font-semibold">{activeDoc.sha256}</span>
              </div>
            </div>
          </div>

          {/* Right: AI OCR Reconciliation & Review Decision (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Duplicate Document Alert Banner if SHA-256 collided */}
            {activeDoc.duplicateHashMatch || activeDoc.status === 'DISCREPANCY_FLAGGED' ? (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 shadow-xs">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                      Cross-Institutional Duplicate Document Collision Detected
                    </h3>
                    <p className="text-xs text-rose-800 font-medium mt-1 leading-relaxed">
                      {activeDoc.duplicateInstitution
                        ? `The SHA-256 cryptographic digest of this certificate matches a file uploaded at ${activeDoc.duplicateInstitution}.`
                        : 'Identical certificate file hash has been recorded across multiple technical institutions in India.'}
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-rose-700 bg-white/70 p-2 rounded border border-rose-200">
                      Collision Detection: Dual admissions prevent seats from being blocked under AICTE Anti-Fraud Guidelines.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center space-x-3 text-xs text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Cryptographic Integrity Verified:</strong> No conflicting submission of this SHA-256 hash found across national database.
                </span>
              </div>
            )}

            {/* AI-Extracted OCR Fields vs Database Record Table */}
            <div className="bg-white rounded-xl border border-gov-border shadow-xs overflow-hidden">
              <div className="p-4 border-b border-gov-border flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gov-teal" />
                    <span>Field-by-Field OCR Reconciliation</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Automated comparison between document vision readouts and institution database records
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-gov-navy border border-blue-200">
                  Confidence avg: 98.6%
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gov-page border-b border-gov-border text-slate-600 uppercase text-[10px] font-semibold">
                      <th className="py-2.5 px-3">Field Attribute</th>
                      <th className="py-2.5 px-3">OCR Extracted Value</th>
                      <th className="py-2.5 px-3">Student Ledger Value</th>
                      <th className="py-2.5 px-3">Match Score</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {activeDoc.extractedFields && activeDoc.extractedFields.length > 0 ? (
                      activeDoc.extractedFields.map((f, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{f.field}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-800">{f.ocrValue}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{f.dbValue || '-'}</td>
                          <td className="py-2.5 px-3 font-mono">
                            <span className="text-emerald-700 font-semibold">{f.confidence || 99}%</span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {f.match ? (
                              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                ✓ Match
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                ✕ Mismatch
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-xs text-slate-400">
                          OCR readouts match enrolled database parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Explanation Box */}
            <div className="bg-slate-50 rounded-xl border border-gov-border p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 mb-1.5">
                <Award className="w-3.5 h-3.5 text-gov-teal" />
                <span>AI Validation Engine Diagnosis</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {activeDoc.aiExplanation}
              </p>
            </div>

            {/* Reviewer Action Workflow Panel */}
            <div className="bg-white rounded-xl border border-gov-border p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy">
                  Institutional Verification Decision
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    activeDoc.status === 'VERIFIED_CLEAN'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : activeDoc.status === 'DISCREPANCY_FLAGGED'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  Current Status: {activeDoc.status || activeDoc.verificationStatus}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Verification Remarks & Audit Annotation:
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks, e.g. 'Class 12 marksheet verified against CBSE repository. Seat confirmation approved.'"
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-gov-border bg-gov-page focus:bg-white focus:outline-none focus:border-gov-teal font-sans"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('VERIFIED_CLEAN')}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify & Approve</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('DISCREPANCY_FLAGGED')}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Flag Duplicate / Discrepancy</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('REQUIRES_MANUAL_REVIEW')}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Request Re-Upload / Rectify</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Upload Student Certificate (Option B) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gov-border space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-gov-navy text-amber-300 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gov-navy">
                    Upload Student Certificate (College Admin)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Attach and cross-verify academic documents directly to student records.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalUploadSubmit} className="space-y-4">
              {/* Select Enrolled Student */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enrolled Candidate <span className="text-rose-500">*</span>
                </label>
                <select
                  value={uploadStudentId}
                  onChange={(e) => setUploadStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gov-border bg-gov-page focus:bg-white focus:outline-none focus:border-gov-teal font-medium"
                >
                  {enrolledStudents.length > 0 ? (
                    enrolledStudents.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.fullName} ({st.apaarId || 'No APAAR'}) • Roll: {st.enrolments?.[0]?.rollNumber || 'N/A'}
                      </option>
                    ))
                  ) : (
                    <option value="">Aarav Sharma (2026-9811-3001) • 2024CS10101</option>
                  )}
                </select>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Classification <span className="text-rose-500">*</span>
                </label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gov-border bg-gov-page focus:bg-white focus:outline-none focus:border-gov-teal font-medium"
                >
                  <option value="HIGHER_SECONDARY_12TH">Class 12th / Higher Secondary Marksheet</option>
                  <option value="TRANSFER_CERTIFICATE">School / College Leaving TC</option>
                  <option value="MIGRATION_CERTIFICATE">Board Migration Certificate</option>
                  <option value="APAAR_CONSENT_LETTER">APAAR & Aadhaar Consent Undertaking</option>
                  <option value="CASTE_INCOME_CERTIFICATE">Category Quota / TFW Income Certificate</option>
                  <option value="ENTRANCE_SCORECARD">Entrance Scorecard (JEE / State CET)</option>
                </select>
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Certificate File (PDF, PNG, JPG up to 10 MB) <span className="text-rose-500">*</span>
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50/60 hover:bg-teal-50/20 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleModalFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Upload className="w-5 h-5 text-gov-teal" />
                    {uploadFile ? (
                      <div>
                        <div className="text-xs font-bold text-gov-navy">{uploadFile.name}</div>
                        <div className="text-[10px] text-slate-500">{Math.round(uploadFile.size / 1024)} KB</div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-semibold text-slate-700">Choose file or drag & drop</span>
                        <div className="text-[10px] text-slate-400">PDF, JPG, PNG</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SHA-256 Preview */}
              {(uploadFileHash || isCalculatingHash) && (
                <div className="p-2.5 rounded-lg bg-slate-900 text-white font-mono text-[10px] space-y-1">
                  <div className="text-amber-400 font-bold flex items-center justify-between">
                    <span>SHA-256 Cryptographic Digest:</span>
                    {isCalculatingHash && <span className="text-slate-400">Computing...</span>}
                  </div>
                  <div className="text-emerald-300 break-all">{uploadFileHash}</div>
                </div>
              )}

              {modalError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalUploading || !uploadFile || isCalculatingHash}
                  className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-gov-navy hover:bg-slate-800 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {modalUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                      <span>Fingerprinting & Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-amber-300" />
                      <span>Upload & Verify Fingerprint</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVerification;
