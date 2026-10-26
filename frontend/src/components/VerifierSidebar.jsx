import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  FileCheck2,
  ShieldAlert,
  QrCode,
  History,
  Bell,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export const VerifierSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  // 10 Dedicated Verification Officer navigation items
  const navItems = [
    {
      to: '/verifier/dashboard',
      label: 'Verification Dashboard',
      icon: LayoutDashboard,
      badge: null,
      description: 'Assigned cases & review throughput',
    },
    {
      to: '/verifier/cases',
      label: 'My Cases Queue',
      icon: AlertTriangle,
      badge: 'Assigned',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      description: 'Active case queue for investigation',
    },
    {
      to: '/verifier/document-verification',
      label: 'Document Inspection',
      icon: FileCheck2,
      badge: 'OCR Match',
      badgeColor: 'bg-teal-50 text-gov-teal border-teal-200',
      description: 'Mark sheet & certificate OCR comparison',
    },
    {
      to: '/verifier/duplicate-review',
      label: 'Duplicate Review',
      icon: ShieldAlert,
      badge: 'Audit',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
      description: 'Side-by-side college duplicate verification',
    },
    {
      to: '/verifier/qr-verification',
      label: 'QR Verification',
      icon: QrCode,
      badge: 'Signatures',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Cryptographic credential verification',
    },
    {
      to: '/verifier/history',
      label: 'Case History',
      icon: History,
      badge: null,
      description: 'Resolved cases & review findings ledger',
    },
    {
      to: '/verifier/notifications',
      label: 'Notifications & Tasks',
      icon: Bell,
      badge: 'Live',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Institutional responses & assignments',
    },
    {
      to: '/verifier/profile',
      label: 'Profile & Security',
      icon: UserCheck,
      badge: null,
      description: 'Officer profile & security credentials',
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-gov-border transition-all duration-300 flex flex-col shrink-0 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-3.5 border-b border-gov-border flex items-center justify-between">
        {!collapsed ? (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Audit Workstation
            </div>
            <div className="text-xs font-bold text-gov-navy mt-0.5">
              Verification Officer
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
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
                        isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-600'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border leading-none ${
                        isActive ? 'bg-amber-900/60 text-white border-amber-500' : item.badgeColor
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

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 bg-slate-50/80 border-t border-gov-border text-[11px] text-slate-500">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span>AUDIT QUEUE</span>
            <span className="text-amber-700 font-bold">READY</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            Authorized Third-Party Verifier
          </div>
        </div>
      )}
    </aside>
  );
};

export default VerifierSidebar;
