import React, { useState } from 'react';
import {
  Sliders,
  Server,
  ShieldCheck,
  CheckCircle2,
  Save,
  Radio,
  Globe,
  Lock,
  RefreshCw,
  Key,
} from 'lucide-react';

export const PlatformSettings = () => {
  const [saveNotice, setSaveNotice] = useState(null);

  const [config, setConfig] = useState({
    simulatedDigiLocker: true,
    apaarValidationStrictness: 'STRICT_12_DIGIT',
    duplicateDetectionScope: 'NATIONAL_CONCURRENT',
    cryptoSigningAlgorithm: 'HMAC-SHA256',
    qrTokenExpiryDays: 365,
    sessionTimeoutHours: 24,
    enableDetailedAuditTrails: true,
    enableSimulatedOCR: true,
    databaseEngine: 'PostgreSQL Database Engine',
  });

  const handleToggle = (key) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaveNotice('Platform parameters successfully updated across all gateway nodes.');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gov-border">
        <div>
          <h1 className="text-xl font-bold text-gov-navy">Platform & Gateway Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure system-wide cryptographic trust parameters, PostgreSQL connection parameters, and demo simulation switches.
          </p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
          Root Authority
        </span>
      </div>

      {saveNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Core Database & Gateway Configuration */}
        <div className="bg-white rounded-2xl border border-gov-border shadow-panel p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-gov-navy flex items-center space-x-2">
            <Server className="w-4 h-4 text-gov-teal" />
            <span>Database & Cryptographic Trust Layer</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Database Layer</label>
              <input
                type="text"
                disabled
                value="PostgreSQL (Dedicated Application Database)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Single application database configured via backend .env
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Credential Signature Algorithm</label>
              <input
                type="text"
                disabled
                value="HMAC-SHA256 (Server Private Key)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Duplicate Collision Scope</label>
              <select
                value={config.duplicateDetectionScope}
                onChange={(e) => setConfig({ ...config, duplicateDetectionScope: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="NATIONAL_CONCURRENT">National Concurrent Enrolment (All Colleges)</option>
                <option value="STATE_ONLY">State-Level Technical Colleges Only</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">APAAR Format Strictness</label>
              <select
                value={config.apaarValidationStrictness}
                onChange={(e) => setConfig({ ...config, apaarValidationStrictness: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="STRICT_12_DIGIT">Strict 12-Digit (XXXX-XXXX-XXXX)</option>
                <option value="PERMISSIVE_TEST">Permissive Test Identifier</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: SIH Prototype Simulation Switches */}
        <div className="bg-white rounded-2xl border border-gov-border shadow-panel p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-gov-navy flex items-center space-x-2">
            <Radio className="w-4 h-4 text-gov-teal" />
            <span>Prototype Integration Gateways & Simulation Switches</span>
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            In accordance with hackathon criteria, external ministerial and state databases are simulated using realistic mock pipelines.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/50 transition-colors">
              <div>
                <div className="text-xs font-bold text-slate-800">Simulate DigiLocker e-KYC Identity Gateway</div>
                <div className="text-[11px] text-slate-500">Enables mock biometric & Aadhaar vault reference synthesis.</div>
              </div>
              <input
                type="checkbox"
                checked={config.simulatedDigiLocker}
                onChange={() => handleToggle('simulatedDigiLocker')}
                className="w-4 h-4 text-gov-navy rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/50 transition-colors">
              <div>
                <div className="text-xs font-bold text-slate-800">Simulate OCR Document Verification Engine</div>
                <div className="text-[11px] text-slate-500">Generates OCR fields and checksum matches for sample certificates.</div>
              </div>
              <input
                type="checkbox"
                checked={config.enableSimulatedOCR}
                onChange={() => handleToggle('enableSimulatedOCR')}
                className="w-4 h-4 text-gov-navy rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/50 transition-colors">
              <div>
                <div className="text-xs font-bold text-slate-800">Immutable Audit Event Stream</div>
                <div className="text-[11px] text-slate-500">Record all batch uploads, credential issuances, and logins to PostgreSQL audit trail.</div>
              </div>
              <input
                type="checkbox"
                checked={config.enableDetailedAuditTrails}
                onChange={() => handleToggle('enableDetailedAuditTrails')}
                className="w-4 h-4 text-gov-navy rounded"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gov-navy hover:bg-gov-navy-dark text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply Configuration Settings</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlatformSettings;
