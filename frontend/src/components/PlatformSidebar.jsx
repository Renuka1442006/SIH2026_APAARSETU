import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  ShieldAlert,
  BarChart3,
  AlertTriangle,
  Sparkles,
  FileText,
  Users,
  Gavel,
  History,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';

export const PlatformSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  // 12 Dedicated Platform Admin navigation items
  const navItems = [
    {
      to: '/platform/dashboard',
      label: 'Platform Dashboard',
      icon: LayoutDashboard,
      badge: 'National',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Apex aggregated regulatory metrics',
    },
    {
      to: '/platform/institutions',
      label: 'Institution Directory',
      icon: Building2,
      badge: null,
      description: 'Directory of all participating institutions',
    },
    {
      to: '/platform/institutions/new',
      label: 'Onboard Institution',
      icon: PlusCircle,
      badge: 'New',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Register college & provision admin',
    },
    {
      to: '/platform/cross-institution',
      label: 'National Cross-Validation',
      icon: ShieldAlert,
      badge: 'Collision',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
      description: 'Multi-college duplicate admission alerts',
    },
    {
      to: '/platform/compliance',
      label: 'Compliance Monitoring',
      icon: BarChart3,
      badge: null,
      description: 'National approved intake vs actual enrolments',
    },
    {
      to: '/platform/cases',
      label: 'Case Management',
      icon: AlertTriangle,
      badge: 'Queue',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      description: 'Adjudication queue & reviewer assignment',
    },
    {
      to: '/platform/alerts',
      label: 'AI Alerts & Insights',
      icon: Sparkles,
      badge: 'Explainable',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description: 'Risk assessment & heuristic alerts',
    },
    {
      to: '/platform/reports',
      label: 'Reports & Analytics',
      icon: FileText,
      badge: null,
      description: 'Platform trends & accreditation metrics',
    },
    {
      to: '/platform/users',
      label: 'User & Role Mgmt',
      icon: Users,
      badge: null,
      description: 'Provision staff & manage access roles',
    },
    {
      to: '/platform/policies',
      label: 'Regulatory Policies',
      icon: Gavel,
      badge: 'Rules',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      description: 'Validation thresholds & regulatory rules',
    },
    {
      to: '/platform/audit-logs',
      label: 'Audit Logs',
      icon: History,
      badge: null,
      description: 'Immutable system & governance trail',
    },
    {
      to: '/platform/settings',
      label: 'Platform Settings',
      icon: Sliders,
      badge: null,
      description: 'Integration gateways & demo parameters',
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
              National Oversight
            </div>
            <div className="text-xs font-bold text-gov-navy mt-0.5">
              Platform Administration
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <Shield className="w-5 h-5 text-purple-600" />
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
                        isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-purple-600'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border leading-none ${
                        isActive ? 'bg-purple-900/60 text-white border-purple-500' : item.badgeColor
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
            <span>SCOPE: NATIONAL APEX</span>
            <span className="text-purple-700 font-bold">ROOT</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            AICTE Regulatory Bureau
          </div>
        </div>
      )}
    </aside>
  );
};

export default PlatformSidebar;
