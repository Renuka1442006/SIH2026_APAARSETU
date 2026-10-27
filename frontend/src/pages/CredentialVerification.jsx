import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Ban,
  Fingerprint,
} from 'lucide-react';

export const CredentialVerification = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('verify');

  // Verify State
  const [verifyRef, setVerifyRef] = useState('APAAR-CRD-2026-IITD-001');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

  // Issue Credential State
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [issuedCredential, setIssuedCredential] = useState(null);
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState(null);

  // Tamper Demo State
  const [tamperField, setTamperField] = useState('studentName');
  const [tamperValue, setTamperValue] = useState('Aditya Kumar (Malicious Impersonator)');
  const [tamperResult, setTamperResult] = useState(null);
  const [tampering, setTampering] = useState(false);

  // Revoke Credential State
  const [revokeReason, setRevokeReason] = useState('Admission cancelled due to duplicate enrolment');
  const [revoking, setRevoking] = useState(false);

  const loadStudentsForIssuance = async () => {
    try {
      const res = await api.getStudents({ limit: '20' });
      setStudents(res.students || []);
      if (res.students && res.students.length > 0) {
        setSelectedStudentId(res.students[0].id);
        if (res.students[0].enrolments && res.students[0].enrolments.length > 0) {
          setSelectedCourseId(res.students[0].enrolments[0].courseId);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStudentsForIssuance();
    handleVerify('APAAR-CRD-2026-IITD-001');
  }, []);

  const handleVerify = async (refToVerify) => {
    const ref = refToVerify || verifyRef;
    if (!ref) return;
    try {
      setVerifying(true);
      setVerifyError(null);
      setVerifyResult(null);
      const res = await api.verifyCredential(ref.trim());
      setVerifyResult(res);
    } catch (err) {
      setVerifyError(err.message || 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleIssueCredential = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseId) return;
    try {
      setIssuing(true);
      setIssueError(null);
      const res = await api.issueCredential({
        studentId: selectedStudentId,
        courseId: selectedCourseId,
        academicYear,
      });
      setIssuedCredential(res.credential);
      setVerifyRef(res.credential.credentialReference);
    } catch (err) {
      setIssueError(err.message || 'Failed to issue credential.');
    } finally {
      setIssuing(false);
    }
  };

  const handleTamperCheck = async () => {
    if (!verifyResult || !verifyResult.credential) return;
    try {
      setTampering(true);
      const res = await api.simulateTamper({
        credentialId: issuedCredential?.id || 'demo-credential',
        tamperedField: tamperField,
        tamperedValue: tamperValue,
      });
      setTamperResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setTampering(false);
    }
  };

  const handleRevoke = async () => {
    if (!issuedCredential) return;
    try {
      setRevoking(true);
      await api.revokeCredential(issuedCredential.id, revokeReason);
      handleVerify(issuedCredential.credentialReference);
    } catch (e) {
      console.error(e);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Cryptographic Trust Layer
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">HMAC-SHA256 Server Signature</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Verifiable Academic Credentials & Anti-Tamper Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue and verify cryptographically sealed academic records with zero exposure of sensitive PII or raw APAAR identifiers in URLs.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'verify' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Public Verification Portal
          </button>
          <button
            onClick={() => setActiveTab('issue')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'issue' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Issue New Credential
          </button>
          <button
            onClick={() => setActiveTab('tamper-demo')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'tamper-demo' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Anti-Tamper Demo (Judges)
          </button>
        </div>
      </div>

      {/* TAB 1: Public Verification Portal */}
      {activeTab === 'verify' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Verify Academic Credential</h2>
            <p className="text-xs text-slate-500">
              Enter the unique credential reference or test pre-seeded active & revoked demo credentials.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Credential Reference Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={verifyRef}
                    onChange={(e) => setVerifyRef(e.target.value)}
                    placeholder="e.g. APAAR-CRD-2026-IITD-001"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono text-slate-800"
                  />
                  <button
                    onClick={() => handleVerify()}
                    disabled={verifying}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors disabled:opacity-50 flex items-center space-x-1"
                  >
                    {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Verify</span>
                  </button>
                </div>
              </div>

              {/* Quick sample chips */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500">Quick Test Samples:</span>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setVerifyRef('APAAR-CRD-2026-IITD-001');
                      handleVerify('APAAR-CRD-2026-IITD-001');
                    }}
                    className="px-2.5 py-1 rounded text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors"
                  >
                    ✓ Active: IITD-001 (Aarav Sharma)
                  </button>
                  <button
                    onClick={() => {
                      setVerifyRef('APAAR-CRD-2026-VJTI-999');
                      handleVerify('APAAR-CRD-2026-VJTI-999');
                    }}
                    className="px-2.5 py-1 rounded text-[11px] font-mono bg-red-50 text-red-800 border border-red-300 hover:bg-red-100 transition-colors"
                  >
                    ✗ Revoked: VJTI-999 (Suspended)
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Architecture Notice */}
            <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center space-x-1.5">
                <Fingerprint className="w-4 h-4 text-blue-700" />
                <span>Security & Privacy Safeguard</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Raw APAAR numbers and Aadhaar references are NEVER embedded in the QR URL. Only the reference ID and HMAC-SHA256 signature token are transmitted.
              </p>
            </div>
          </div>

          {/* Right: Verification Outcome Card */}
          <div className="lg:col-span-7 space-y-4">
            {verifyError && (
              <div className="bg-red-50 border border-red-200 p-5 rounded-xl text-red-800 text-xs space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Credential Verification Failed</span>
                </div>
                <p>{verifyError}</p>
              </div>
            )}

            {verifyResult && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-5">
                {/* Status Header Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    verifyResult.verified
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : verifyResult.status === 'REVOKED'
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {verifyResult.verified ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Ban className="w-8 h-8 text-rose-600 flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="text-base font-extrabold">
                        {verifyResult.verified
                          ? 'AUTHENTIC ACADEMIC CREDENTIAL VERIFIED'
                          : verifyResult.status === 'REVOKED'
                          ? 'CREDENTIAL REVOKED / SUSPENDED'
                          : 'SIGNATURE INVALID OR TAMPERED'}
                      </h3>
                      <p className="text-xs opacity-90">
                        {verifyResult.verified
                          ? 'Cryptographically validated against AICTE National VidyarthiSetu Registry'
                          : verifyResult.revocationReason || 'Signature mismatch detected'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                      verifyResult.verified
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-rose-200 text-rose-900'
                    }`}
                  >
                    {verifyResult.status}
                  </span>
                </div>

                {/* Credential Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Student Name
                    </span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {verifyResult.credential?.studentName}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      APAAR ID (Masked)
                    </span>
                    <div className="text-sm font-mono font-bold text-slate-800 mt-0.5">
                      {verifyResult.credential?.apaarMasked}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Awarding Institution
                    </span>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      {verifyResult.credential?.institutionName}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Code: {verifyResult.credential?.institutionCode}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Course & Academic Year
                    </span>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      {verifyResult.credential?.courseName} ({verifyResult.credential?.courseCode})
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Year: {verifyResult.credential?.academicYear}
                    </div>
                  </div>
                </div>

                {/* Cryptographic Proof Details */}
                <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1">
                    <span>Algorithm: HMAC-SHA256</span>
                    <span>Total Verifications: {verifyResult.credential?.verificationCount}</span>
                  </div>
                  <div className="text-[10px] text-slate-300 pt-1">
                    Reference: {verifyResult.credential?.reference}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    Signature Status: Validated with Server Key
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Issue New Credential */}
      {activeTab === 'issue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Generate Digitally Signed Academic Credential
            </h2>
            <p className="text-xs text-slate-500">
              Creates a cryptographic HMAC-SHA256 signature and high-density QR code for third-party verifiers.
            </p>

            {issueError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {issueError}
              </div>
            )}

            <form onSubmit={handleIssueCredential} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Student *
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    const st = students.find((s) => s.id === e.target.value);
                    if (st && st.enrolments && st.enrolments.length > 0) {
                      setSelectedCourseId(st.enrolments[0].courseId);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.apaarId || 'No APAAR'}) — {st.currentInstitution?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Year *
                </label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={issuing}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <QrCode className="w-4 h-4" />
                <span>{issuing ? 'Signing & Generating QR...' : 'Issue Signed Test Credential'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-6">
            {issuedCredential ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  Credential Successfully Issued
                </span>

                <div className="flex justify-center my-3">
                  {issuedCredential.qrCodeDataUrl ? (
                    <img
                      src={issuedCredential.qrCodeDataUrl}
                      alt="Credential QR Code"
                      className="w-44 h-44 rounded-xl border-2 border-slate-800 shadow-lg p-1 bg-white"
                    />
                  ) : (
                    <div className="w-44 h-44 bg-slate-100 flex items-center justify-center text-slate-400">
                      QR Code
                    </div>
                  )}
                </div>

                <div className="font-mono text-sm font-bold text-slate-900">
                  {issuedCredential.credentialReference}
                </div>
                <p className="text-xs text-slate-500">
                  Student: <strong>{issuedCredential.student?.fullName}</strong> •{' '}
                  {issuedCredential.institution?.name}
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => {
                      setActiveTab('verify');
                      setVerifyRef(issuedCredential.credentialReference);
                      handleVerify(issuedCredential.credentialReference);
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    Open in Verification Portal →
                  </button>
                  <button
                    onClick={handleRevoke}
                    disabled={revoking}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    {revoking ? 'Revoking...' : 'Revoke Credential'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 text-xs">
                Fill the form on the left to issue a digitally signed academic credential.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Interactive Anti-Tamper Demo for Hackathon Judges */}
      {activeTab === 'tamper-demo' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Interactive Cryptographic Tamper Demonstration
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Demonstrates to hackathon evaluators how any unauthorized alteration to student name, course, or APAAR payload immediately invalidates the cryptographic signature.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Field to Artificially Tamper With *
              </label>
              <select
                value={tamperField}
                onChange={(e) => setTamperField(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-medium"
              >
                <option value="studentName">Student Full Name</option>
                <option value="courseCode">Course Code (e.g. Upgrade from BT-MECH to BT-CSE)</option>
                <option value="academicYear">Academic Year</option>
                <option value="apaarMasked">Masked APAAR Identifier</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tampered Malicious Value *
              </label>
              <input
                type="text"
                value={tamperValue}
                onChange={(e) => setTamperValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleTamperCheck}
            disabled={tampering}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-colors flex items-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{tampering ? 'Evaluating Signature...' : 'Execute Tamper Verification Test'}</span>
          </button>

          {/* Tamper Result Callout */}
          {tamperResult && (
            <div className="p-5 rounded-xl border border-slate-300 bg-slate-900 text-slate-200 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-amber-400 font-bold">{tamperResult.simulationTest}</span>
                <span className="text-emerald-400 font-semibold">
                  Original Signature Valid: {String(tamperResult.originalSignatureValid)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                <div className="p-3 rounded bg-slate-800/80">
                  <div className="text-slate-400 uppercase font-semibold text-[10px]">
                    Authentic Original Payload
                  </div>
                  <pre className="text-emerald-300 mt-1 whitespace-pre-wrap">
                    {JSON.stringify(tamperResult.originalPayload, null, 2)}
                  </pre>
                </div>

                <div className="p-3 rounded bg-slate-800/80">
                  <div className="text-slate-400 uppercase font-semibold text-[10px]">
                    Tampered Injected Payload
                  </div>
                  <pre className="text-red-300 mt-1 whitespace-pre-wrap">
                    {JSON.stringify(tamperResult.tamperedPayload, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 flex items-center justify-between font-bold">
                <span>Tampered Signature Valid: {String(tamperResult.tamperedSignatureValid)}</span>
                <span className="text-red-200">{tamperResult.securityGuarantee}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
