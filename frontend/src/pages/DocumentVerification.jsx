import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
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
} from 'lucide-react';

export const DocumentVerification = () => {
  const { user } = useAuth();

  // Sample mock documents for instant hackathon evaluation
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
      duplicateInstitution: 'IIT Delhi & VJTI Mumbai (Same file uploaded to both)',
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
      candidateName: 'Aditya Kumar',
      apaarId: '2026-1122-3344',
      docType: 'TRANSFER_CERTIFICATE',
      docName: 'School_Transfer_Certificate_TC.pdf',
      fileSize: '280 KB',
      sha256: '3c19b489d81927f8a7e091b48d6174a8123519b7829a1b49182374c982319084',
      duplicateHashMatch: false,
      duplicateInstitution: null,
      status: 'VERIFIED_CLEAN',
      extractedFields: [
        { field: 'Candidate Full Name', ocrValue: 'ADITYA KUMAR', dbValue: 'Aditya Kumar', confidence: 99.8, match: true },
        { field: 'Date of Birth', ocrValue: '2004-03-12', dbValue: '2004-03-12', confidence: 99.5, match: true },
        { field: 'Leaving Status', ocrValue: 'Duly Qualified for B.Tech Admission', dbValue: 'Qualified', confidence: 97.2, match: true },
        { field: 'Conduct & Character', ocrValue: 'Exemplary', dbValue: 'Good', confidence: 95.0, match: true },
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
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  const handleAction = (decision) => {
    setActionSuccess(`Decision "${decision}" logged with immutable SHA-256 audit entry.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

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
            Automated OCR extraction, cross-field reconciliation, and SHA-256 document deduplication across colleges.
          </p>
        </div>

        {/* Upload Action */}
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-gov-navy hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors">
            <Upload className="w-3.5 h-3.5 text-amber-300" />
            <span>Upload Candidate Document</span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setActionSuccess(`File "${e.target.files[0].name}" ingested. Running OCR extraction pipeline...`);
                  setTimeout(() => setActionSuccess(null), 4000);
                }
              }}
            />
          </label>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Document Selection Tabs */}
      <div className="bg-white p-2 rounded-xl border border-gov-border shadow-xs flex flex-wrap gap-2">
        {sampleDocuments.map((doc) => {
          const isSelected = activeDoc.id === doc.id;
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
                {doc.duplicateHashMatch ? (
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
              <div className="text-[10px] text-slate-400 mt-0.5">
                APAAR: {doc.apaarId} • {doc.fileSize}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Split Verification Workspace */}
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
                  <div className="font-bold text-slate-900 font-serif tracking-wide">{activeDoc.candidateName}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-1 border border-teal-500/60 bg-teal-50/20 rounded">
                    <div className="text-[9px] text-slate-500 font-semibold">DATE OF BIRTH</div>
                    <div className="font-semibold text-slate-800">15-06-2004</div>
                  </div>
                  <div className="p-1 border border-teal-500/60 bg-teal-50/20 rounded">
                    <div className="text-[9px] text-slate-500 font-semibold">ROLL NUMBER</div>
                    <div className="font-mono font-semibold text-slate-800">11648293</div>
                  </div>
                </div>

                <div className="p-1.5 border border-slate-200 rounded">
                  <div className="text-[9px] text-slate-500 font-semibold mb-1">SUBJECT MARKS</div>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <span>Physics: 95/100</span>
                    <span>Chemistry: 94/100</span>
                    <span>Mathematics: 98/100</span>
                    <span>English Core: 97/100</span>
                  </div>
                </div>

                {/* Digital Verification Hologram / Stamp */}
                <div className="pt-4 flex items-center justify-between border-t border-slate-200 mt-4">
                  <div className="text-[9px] text-slate-400 font-mono">
                    CERT: CBSE-2024-X12-8291
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
          {activeDoc.duplicateHashMatch ? (
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
                    The SHA-256 cryptographic digest of this uploaded file matches an identical document
                    submitted under another AICTE institution ({activeDoc.duplicateInstitution}).
                  </p>
                  <div className="mt-2 text-[11px] font-mono text-rose-700 bg-white/70 p-2 rounded border border-rose-200">
                    Target Collision: Rohan Sharma (APAAR 2026-9090-1122) simultaneously enrolled at IIT Delhi & VJTI Mumbai.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center space-x-3 text-xs text-emerald-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Cryptographic Integrity Verified:</strong> No prior submission of this file hash found across national database.
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
                Confidence avg: 98.4%
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
                  {activeDoc.extractedFields.map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{f.field}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">{f.ocrValue}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{f.dbValue}</td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className="text-emerald-700 font-semibold">{f.confidence}%</span>
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
                  ))}
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
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeDoc.aiExplanation}
            </p>
          </div>

          {/* Reviewer Action Workflow Panel */}
          <div className="bg-white rounded-xl border border-gov-border p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy">
              Regulatory Reviewer Decision
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Reviewer Remarks & Audit Annotation:
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter regulatory notes, e.g. 'Marksheet verified against CBSE repository. Proceeding with registration.'"
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-gov-border bg-gov-page focus:outline-none focus:border-gov-teal"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleAction('Approved & Verified')}
                className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Document</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('Flagged for Duplicate Investigation')}
                className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Flag Discrepancy</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('Rejected & Request Rectification')}
                className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject Document</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
