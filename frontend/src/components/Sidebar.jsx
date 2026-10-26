import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  ShieldAlert,
  Building2,
  AlertTriangle,
  QrCode,
  FileText,
  History,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role;

  // 10 Essential Sidebar Items per Master Specification
  const navItems = [
    {
      to: '/overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      description: 'National & Institutional Overview',
    },
    {
      to: '/students',
      label: 'Student Records',
      icon: Users,
      badge: null,
      description: 'Directory, Identifiers & Enrolments',
    },
    {
      to: '/document-verification',
      label: 'Document Verification',
      icon: FileCheck2,
      badge: 'AI OCR',
      badgeColor: 'bg-teal-50 text-gov-teal border-teal-200',
      description: 'AI-Assisted Certificate & Marksheet Verification',
    },
    {
      to: '/cross-institution',
      label: 'Cross-Institution Validation',
      icon: ShieldAlert,
      badge: 'Key Alert',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
      description: 'Multi-College Duplicate Detection Engine',
    },
    {
      to: '/compliance',
      label: 'Admission Compliance',
      icon: Building2,
      badge: null,
      description: 'Approved Intake vs Actual & Supernumerary',
    },
    {
      to: '/cases',
      label: 'Verification Cases',
      icon: AlertTriangle,
      badge: 'Queue',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      description: 'Flagged Enrolments & Regulatory Queue',
    },
    {
      to: '/qr-verification',
      label: 'QR Credential Verification',
      icon: QrCode,
      badge: null,
      description: 'Verifiable Credentials & Tamper Proofing',
    },
    {
      to: '/reports',
      label: 'Reports & Analytics',
      icon: FileText,
      badge: null,
      description: 'National Accreditation Trends & Export',
    },
    {
      to: '/audit-logs',
      label: 'Audit Logs',
      icon: History,
      badge: null,
      description: 'Immutable Governance & Security Trail',
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Sliders,
      badge: null,
      description: 'Regulatory Rulebooks & Gateway Config',
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-gov-border transition-all duration-300 flex flex-col shrink-0 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header / Section Label */}
      <div className="p-4 border-b border-gov-border flex items-center justify-between">
        {!collapsed ? (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Regulatory Navigation
            </div>
            <div className="text-xs font-semibold text-gov-navy mt-0.5">
              Portal Services
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <ShieldCheck className="w-5 h-5 text-gov-teal" />
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-slate-400 hover:text-gov-navy hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? `${item.label} — ${item.description}` : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gov-navy text-white shadow-2xs font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-gov-navy'
                } ${collapsed ? 'justify-center' : 'justify-between'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`flex items-center ${collapsed ? '' : 'space-x-3'}`}>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-gov-teal'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border leading-none ${
                        isActive ? 'bg-blue-900/60 text-white border-blue-500' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Action: Bulk Upload Button */}
      <div className="p-3 border-t border-gov-border">
        <NavLink
          to="/bulk-upload"
          className={({ isActive }) =>
            `flex items-center rounded-lg text-xs font-medium transition-colors border ${
              isActive
                ? 'bg-teal-50 border-teal-300 text-gov-teal font-semibold'
                : 'bg-gov-page border-gov-border text-slate-700 hover:bg-slate-100 hover:text-gov-navy'
            } ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2 space-x-2'}`
          }
          title={collapsed ? 'Bulk CSV Intake Upload' : undefined}
        >
          <UploadCloud className="w-4 h-4 text-gov-teal shrink-0" />
          {!collapsed && (
            <div className="truncate">
              <span className="font-semibold">Batch CSV Upload</span>
              <p className="text-[10px] text-slate-400">Pre-validation Engine</p>
            </div>
          )}
        </NavLink>
      </div>

      {/* Footer info badge */}
      {!collapsed && (
        <div className="p-3 bg-slate-50/80 border-t border-gov-border text-[11px] text-slate-500">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span>ENGINE: SHA256</span>
            <span className="text-emerald-700 font-bold">ACTIVE</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            AICTE Compliance Standard 2024-25
          </div>
        </div>
      )}
    </aside>
  );
};
