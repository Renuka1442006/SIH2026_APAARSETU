import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UploadCloud,
  FileCheck2,
  ShieldAlert,
  Building2,
  QrCode,
  FileText,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Building,
} from 'lucide-react';

export const InstitutionSidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // 10 Dedicated Institution Admin navigation items
  const navItems = [
    {
      to: '/institution/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      description: 'Institution Intake & Verification Overview',
    },
    {
      to: '/institution/students',
      label: 'Student Records',
      icon: Users,
      badge: null,
      description: 'Enrolment directory, search, filter, edit',
    },
    {
      to: '/institution/students/new',
      label: 'Add Student',
      icon: UserPlus,
      badge: 'Form',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Single student enrolment form',
    },
    {
      to: '/institution/bulk-upload',
      label: 'Bulk CSV Upload',
      icon: UploadCloud,
      badge: 'CSV',
      badgeColor: 'bg-teal-50 text-gov-teal border-teal-200',
      description: 'Batch student intake with pre-validation',
    },
    {
      to: '/institution/document-verification',
      label: 'Document Verification',
      icon: FileCheck2,
      badge: 'AI OCR',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Marksheet & certificate validation',
    },
    {
      to: '/institution/cross-institution',
      label: 'Cross-Institution Matches',
      icon: ShieldAlert,
      badge: 'Alerts',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
      description: 'Potential duplicate enrolments involving this college',
    },
    {
      to: '/institution/compliance',
      label: 'Admission Compliance',
      icon: Building2,
      badge: null,
      description: 'Approved regular vs supernumerary capacity',
    },
    {
      to: '/institution/qr-verification',
      label: 'QR Credentials',
      icon: QrCode,
      badge: null,
      description: 'Issue & manage tamper-evident credentials',
    },
    {
      to: '/institution/reports',
      label: 'Reports',
      icon: FileText,
      badge: null,
      description: 'Institutional verification & compliance reports',
    },
    {
      to: '/institution/settings',
      label: 'Institution Settings',
      icon: Sliders,
      badge: null,
      description: 'College profile, contacts & authorized staff',
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
              Institution Portal
            </div>
            <div className="text-xs font-bold text-gov-navy mt-0.5 truncate">
              {user?.institution?.code ? `Code: ${user.institution.code}` : 'Assigned College'}
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <Building className="w-5 h-5 text-gov-teal" />
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

      {/* Quick Action Footer */}
      {!collapsed && (
        <div className="p-3 bg-slate-50/80 border-t border-gov-border text-[11px] text-slate-500">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span>SCOPE: LOCAL INST</span>
            <span className="text-emerald-700 font-bold">ACTIVE</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {user?.institution?.name || 'Assigned Institution Node'}
          </div>
        </div>
      )}
    </aside>
  );
};

export default InstitutionSidebar;
