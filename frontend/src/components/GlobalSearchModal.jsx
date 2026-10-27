import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Users,
  ShieldAlert,
  Building2,
  FileCheck2,
  QrCode,
  LayoutDashboard,
  FileText,
  Sliders,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api.js';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [cases, setCases] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      // Preload some initial data for search
      api.getInstitutions().then(setInstitutions).catch(() => {});
      api.getReviewCases().then(setCases).catch(() => {});
      api.getStudents({ limit: '20' }).then((res) => setStudents(res.students || [])).catch(() => {});
    }
  }, [isOpen]);

  // Quick navigation pages
  const staticPages = [
    { name: 'National Overview', path: '/overview', category: 'Navigation', icon: LayoutDashboard },
    { name: 'Student Records', path: '/students', category: 'Navigation', icon: Users },
    { name: 'AI Document Verification', path: '/document-verification', category: 'Navigation', icon: FileCheck2 },
    { name: 'Cross-Institution Validation', path: '/cross-institution', category: 'Navigation', icon: ShieldAlert },
    { name: 'Admission Compliance', path: '/compliance', category: 'Navigation', icon: Building2 },
    { name: 'Verification Cases & Alerts', path: '/cases', category: 'Navigation', icon: ShieldAlert },
    { name: 'QR Credential Verification', path: '/qr-verification', category: 'Navigation', icon: QrCode },
    { name: 'Reports & Analytics', path: '/reports', category: 'Navigation', icon: FileText },
    { name: 'Security Audit Ledger', path: '/audit-logs', category: 'Navigation', icon: FileText },
    { name: 'Regulatory Settings', path: '/settings', category: 'Navigation', icon: Sliders },
    { name: 'Bulk CSV Intake Upload', path: '/bulk-upload', category: 'Navigation', icon: FileCheck2 },
  ];

  if (!isOpen) return null;

  const lowerQ = query.toLowerCase().trim();

  const filteredPages = staticPages.filter((p) =>
    p.name.toLowerCase().includes(lowerQ)
  );

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(lowerQ) ||
      (s.apaarId && s.apaarId.toLowerCase().includes(lowerQ)) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(lowerQ))
  );

  const filteredCases = cases.filter(
    (c) =>
      c.title.toLowerCase().includes(lowerQ) ||
      (c.caseReference && c.caseReference.toLowerCase().includes(lowerQ)) ||
      (c.description && c.description.toLowerCase().includes(lowerQ))
  );

  const filteredInstitutions = institutions.filter(
    (i) =>
      i.name.toLowerCase().includes(lowerQ) ||
      i.code.toLowerCase().includes(lowerQ) ||
      (i.city && i.city.toLowerCase().includes(lowerQ))
  );

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, APAAR IDs, duplicate cases, institutions, or pages... (ESC to close)"
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Pages */}
          {filteredPages.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Application Pages & Workspaces
              </div>
              <div className="space-y-0.5">
                {filteredPages.slice(0, 5).map((page) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.path}
                      onClick={() => handleSelect(page.path)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="w-4 h-4 text-gov-teal group-hover:text-gov-navy" />
                        <span className="font-medium">{page.name}</span>
                      </div>
                      <span className="text-xs text-slate-400 group-hover:text-slate-600 flex items-center space-x-1">
                        <span>Go</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Students */}
          {lowerQ && filteredStudents.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center justify-between">
                <span>Matched Student Records</span>
                <span className="text-[10px] font-normal lowercase">{filteredStudents.length} found</span>
              </div>
              <div className="space-y-0.5">
                {filteredStudents.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(`/students?search=${encodeURIComponent(s.fullName)}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-blue-50/70 hover:text-blue-900 transition-colors text-left group"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center space-x-2">
                        <span>{s.fullName}</span>
                        <span className="text-xs font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {s.apaarId ? s.apaarId : 'NO APAAR'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {s.enrolments?.[0]?.course?.name || 'Enrolled Student'} • {s.enrolments?.[0]?.course?.institution?.name || 'Technical Institute'}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cross-Institution & Review Cases */}
          {lowerQ && filteredCases.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center justify-between">
                <span>Regulatory Alerts & Collisions</span>
                <span className="text-[10px] font-normal lowercase">{filteredCases.length} found</span>
              </div>
              <div className="space-y-0.5">
                {filteredCases.slice(0, 3).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(`/cross-institution?caseId=${c.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-rose-50/70 hover:text-rose-900 transition-colors text-left group"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center space-x-2">
                        <span className="text-xs font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                          {c.severity}
                        </span>
                        <span>{c.title}</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-md">
                        Ref: {c.caseReference} • {c.description}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Institutions */}
          {lowerQ && filteredInstitutions.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center justify-between">
                <span>AICTE Approved Institutions</span>
                <span className="text-[10px] font-normal lowercase">{filteredInstitutions.length} found</span>
              </div>
              <div className="space-y-0.5">
                {filteredInstitutions.slice(0, 3).map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => handleSelect(`/compliance?institutionId=${inst.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left group"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{inst.name}</div>
                      <div className="text-xs text-slate-500">
                        Code: {inst.code} • {inst.city}, {inst.state} • Type: {inst.category}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {lowerQ &&
            filteredPages.length === 0 &&
            filteredStudents.length === 0 &&
            filteredCases.length === 0 &&
            filteredInstitutions.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No matching records or pages found for "{query}".
              </div>
            )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-600 font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-600 font-mono">↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-600 font-mono">↵</kbd> to select</span>
          </div>
          <span className="font-medium text-gov-navy">AICTE VidyarthiSetu Index Search</span>
        </div>
      </div>
    </div>
  );
};
