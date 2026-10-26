import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  FileCheck2,
  RefreshCw,
  Eye,
} from 'lucide-react';

export const VerifierCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadCases = async () => {
    try {
      setLoading(true);
      const res = await api.getReviewCases(statusFilter || undefined);
      setCases(res || []);
    } catch (err) {
      console.error('Failed to load cases queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [statusFilter]);

  // Demo fallback queue if database is fresh
  const displayCases = cases.length > 0 ? cases : [
    {
      id: 'rc-1',
      caseNumber: 'RC-2026-0001',
      student: { fullName: 'Rohan Aditya Sharma', apaarId: '2026-9090-1122' },
      primaryInstitution: { name: 'Indian Institute of Technology Delhi', code: '1-001' },
      conflictingInstitution: { name: 'Veermata Jijabai Technological Institute', code: '1-003' },
      reason: 'Cross-Institution Duplicate Enrolment: Concurrent BT-CSE admission active at both institutions.',
      status: 'UNDER_REVIEW',
      priority: 'HIGH',
      assignedDate: '2024-09-12',
    },
    {
      id: 'rc-2',
      caseNumber: 'RC-2026-0002',
      student: { fullName: 'Simran Preet Kaur', apaarId: 'MISSING' },
      primaryInstitution: { name: 'COEP Technological University', code: '1-002' },
      conflictingInstitution: null,
      reason: 'Mandatory APAAR Identifier Missing: Admitted under provisional reservation quota.',
      status: 'UNDER_REVIEW',
      priority: 'MEDIUM',
      assignedDate: '2024-09-14',
    },
    {
      id: 'rc-3',
      caseNumber: 'RC-2026-0003',
      student: { fullName: 'Aarav Sharma', apaarId: '2026-9811-3001' },
      primaryInstitution: { name: 'Indian Institute of Technology Delhi', code: '1-001' },
      conflictingInstitution: null,
      reason: 'Credential Verification Audit: Routine random sampling of active HMAC-SHA256 credentials.',
      status: 'RESOLVED',
      priority: 'LOW',
      assignedDate: '2024-08-30',
    },
  ];

  const filtered = displayCases.filter((c) => {
    const studentName = c.student?.fullName || '';
    const studentApaar = c.student?.apaarId || '';
    const caseNum = c.caseNumber || '';
    const q = search.toLowerCase();

    const matchesSearch =
      !search ||
      studentName.toLowerCase().includes(q) ||
      studentApaar.toLowerCase().includes(q) ||
      caseNum.toLowerCase().includes(q);

    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gov-border">
        <div>
          <h1 className="text-xl font-bold text-gov-navy">Assigned Verification Case Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, triage, and adjudicate cross-institution duplicate alerts, document mismatches, and quota compliance cases.
          </p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          Traceable Review Process
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-gov-border p-4 shadow-panel flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Case ID (RC-2026-XXXX), Student Name, or APAAR ID..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white sm:w-52"
        >
          <option value="">All Review Statuses</option>
          <option value="UNDER_REVIEW">Under Active Review</option>
          <option value="REQUIRING_CORRECTION">Requiring Correction</option>
          <option value="RESOLVED">Resolved & Approved</option>
          <option value="REJECTED">Dismissed / Rejected</option>
        </select>
      </div>

      {/* Cases Queue Table */}
      <div className="bg-white rounded-2xl border border-gov-border shadow-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Case ID</th>
                <th className="p-3.5">Candidate / Student</th>
                <th className="p-3.5">Primary College</th>
                <th className="p-3.5">Conflicting College</th>
                <th className="p-3.5">Issue Description</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-gov-navy">
                    {item.caseNumber || 'RC-2026-0001'}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-800">{item.student?.fullName}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      APAAR: {item.student?.apaarId || 'MISSING'}
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-700">
                    <div className="font-medium">{item.primaryInstitution?.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Code: {item.primaryInstitution?.code}
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-700">
                    {item.conflictingInstitution ? (
                      <div>
                        <div className="font-medium text-rose-800">{item.conflictingInstitution.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Code: {item.conflictingInstitution.code}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">None (Internal)</span>
                    )}
                  </td>
                  <td className="p-3.5 max-w-xs text-slate-600 line-clamp-2">
                    {item.reason}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border leading-none ${
                        item.status === 'UNDER_REVIEW'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : item.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/verifier/cases/${item.id}`}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold"
                      >
                        Inspect
                      </Link>
                      <Link
                        to={`/verifier/cases/${item.id}/review`}
                        className="px-2.5 py-1 rounded bg-gov-navy hover:bg-gov-navy-dark text-white text-[11px] font-bold"
                      >
                        Adjudicate
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VerifierCases;
