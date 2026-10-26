import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import {
  Building2,
  Search,
  PlusCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Users,
  BookOpen,
} from 'lucide-react';

export const InstitutionDirectory = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const res = await api.getInstitutions();
      setInstitutions(res || []);
    } catch (err) {
      console.error('Failed to load institutions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  const filtered = institutions.filter((inst) => {
    const matchesSearch =
      !search ||
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.code.toLowerCase().includes(search.toLowerCase()) ||
      (inst.aisheCode && inst.aisheCode.toLowerCase().includes(search.toLowerCase()));
    const matchesState = !stateFilter || inst.state === stateFilter;
    return matchesSearch && matchesState;
  });

  const states = Array.from(new Set(institutions.map((i) => i.state).filter(Boolean)));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gov-border">
        <div>
          <h1 className="text-xl font-bold text-gov-navy">Participating Institution Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            National directory of accredited technical universities & colleges registered on the APAARSetu gateway.
          </p>
        </div>
        <Link
          to="/platform/institutions/new"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-gov-navy hover:bg-gov-navy-dark text-white text-xs font-bold shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Onboard New Institution</span>
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-xl border border-gov-border p-4 shadow-panel flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Institution Name, AICTE Code, or AISHE..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gov-navy/20 focus:border-gov-navy"
          />
        </div>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white sm:w-48"
        >
          <option value="">All States & UTs</option>
          {states.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Grid of Institutions */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-gov-navy mr-2" />
          <span className="text-xs font-medium">Loading Institution Registry...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gov-border p-12 text-center text-slate-400">
          <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-600">No institutions match your search criteria</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing your filters or onboard a new institution.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((inst) => (
            <div
              key={inst.id}
              className="bg-white rounded-2xl border border-gov-border shadow-panel hover:shadow-elevated transition-shadow p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                    {inst.code}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-gov-navy mt-3 line-clamp-2">
                  {inst.name}
                </h3>
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{inst.city}, {inst.state}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">AISHE Code</span>
                    <span className="font-mono font-semibold text-slate-700">{inst.aisheCode || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Institute Type</span>
                    <span className="font-semibold text-slate-700 truncate block">{inst.type || 'Autonomous'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Approved Courses</span>
                    <span className="font-bold text-gov-navy">{inst.courses?.length || 3} Programs</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gateway Status</span>
                    <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Verified</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-slate-400">{inst.contactEmail}</span>
                <span className="font-bold text-gov-teal hover:underline cursor-pointer">
                  View Profile →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstitutionDirectory;
