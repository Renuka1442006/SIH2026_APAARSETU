import React from 'react';

export const StatusBadge = ({ status, size = 'sm' }) => {
  const s = (status || '').toUpperCase();
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  // APAAR Verification Statuses
  if (s === 'SIMULATED_VERIFIED' || s === 'VERIFIED') {
    return (
      <span className={`inline-flex items-center font-medium rounded bg-emerald-50 text-emerald-800 border border-emerald-200 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
        Simulated Verified
      </span>
    );
  }
  if (s === 'FORMAT_VALID_TEST') {
    return (
      <span className={`inline-flex items-center font-medium rounded bg-blue-50 text-gov-navy border border-blue-200 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-gov-navy mr-1.5"></span>
        Format Valid (Demo)
      </span>
    );
  }
  if (s === 'MISSING' || s === 'MISSING_APAAR') {
    return (
      <span className={`inline-flex items-center font-medium rounded bg-rose-50 text-gov-error border border-rose-200 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-gov-error mr-1.5"></span>
        Missing Identifier
      </span>
    );
  }
  if (s === 'UNVERIFIED') {
    return (
      <span className={`inline-flex items-center font-medium rounded bg-amber-50 text-gov-warning border border-amber-200 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-gov-warning mr-1.5"></span>
        Unverified Record
      </span>
    );
  }

  // Enrolment & Compliance Statuses
  if (s === 'ACTIVE') {
    return (
      <span className={`inline-flex items-center font-medium rounded bg-emerald-50 text-emerald-800 border border-emerald-200 ${padding}`}>
        Active Enrolment
      </span>
    );
  }
  if (s === 'FLAGGED' || s === 'CONFLICT' || s === 'CROSS_INSTITUTION_DUPLICATE') {
    return (
      <span className={`inline-flex items-center font-medium rounded bg-rose-50 text-gov-error border border-rose-200 ${padding}`}>
        ⚠️ Potential Conflict
      </span>
    );
  }
  if (s === 'CONFIRMED_CONFLICT') {
    return (
      <span className={`inline-flex items-center font-bold rounded bg-rose-100 text-gov-error border border-rose-300 ${padding}`}>
        🚨 Confirmed Collision
      </span>
    );
  }
  if (s === 'TRANSFERRED') {
    return (
      <span className={`inline-flex items-center font-medium rounded bg-slate-100 text-slate-700 border border-slate-300 ${padding}`}>
        Transferred
      </span>
    );
  }
  if (s === 'GRADUATED') {
    return (
      <span className={`inline-flex items-center font-medium rounded bg-teal-50 text-gov-teal border border-teal-200 ${padding}`}>
        Graduated
      </span>
    );
  }

  // Review Case Statuses
  if (s === 'UNDER_REVIEW') {
    return (
      <span className={`inline-flex items-center font-medium rounded bg-amber-50 text-amber-800 border border-amber-200 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
        Under Investigation
      </span>
    );
  }
  if (s === 'RESOLVED') {
    return (
      <span className={`inline-flex items-center font-medium rounded bg-emerald-50 text-emerald-800 border border-emerald-200 ${padding}`}>
        ✓ Case Resolved
      </span>
    );
  }
  if (s === 'REQUIRING_CORRECTION') {
    return (
      <span className={`inline-flex items-center font-medium rounded bg-orange-50 text-orange-800 border border-orange-200 ${padding}`}>
        Requires Rectification
      </span>
    );
  }
  if (s === 'ESCALATED') {
    return (
      <span className={`inline-flex items-center font-bold rounded bg-purple-50 text-purple-800 border border-purple-200 ${padding}`}>
        Escalated to Hearing
      </span>
    );
  }
  if (s === 'REVOKED') {
    return (
      <span className={`inline-flex items-center font-medium rounded bg-red-100 text-red-900 border border-red-300 ${padding}`}>
        Revoked / Suspended
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium rounded bg-slate-100 text-slate-700 border border-slate-200 ${padding}`}>
      {status}
    </span>
  );
};
