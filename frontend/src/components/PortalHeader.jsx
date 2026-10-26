import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Shield,
  Building2,
  FileCheck2,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  User,
  CheckCircle2,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal.jsx';

export const PortalHeader = ({ portalType, portalName, subtitle, icon: Icon, badgeText, badgeColor }) => {
  const { user, logout, alertCount } = useAuth();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="bg-white border-b border-gov-border sticky top-0 z-30 shadow-2xs">
        {/* Tricolor Government Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" />

        <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          
          {/* Left: Portal Identity */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gov-navy text-white flex items-center justify-center shrink-0 shadow-xs border border-slate-700">
              {Icon ? <Icon className="w-5 h-5 text-amber-400" /> : <Shield className="w-5 h-5 text-amber-400" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-black text-gov-navy tracking-tight truncate">
                  APAARSetu
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-slate-700 truncate">
                  {portalName}
                </span>
                {badgeText && (
                  <span className={`hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded border leading-none ${badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {badgeText}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {subtitle || (user?.institution?.name ? `${user.institution.name} (${user.institution.code})` : 'AICTE Regulatory Prototype')}
              </p>
            </div>
          </div>

          {/* Right: Actions, Global Search, Notifications, User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Global Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-500 text-xs transition-colors"
              title="Search records (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline font-medium">Search...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-white rounded border border-slate-200 text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className="p-2 rounded-lg text-slate-500 hover:text-gov-navy hover:bg-slate-100 transition-colors relative"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {alertCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              {/* Notification dropdown */}
              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gov-border py-2 z-50 text-xs animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between font-bold text-slate-800">
                    <span>Recent System Alerts</span>
                    <span className="text-[10px] text-gov-teal font-medium">Live Stream</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    <div className="p-3 hover:bg-slate-50">
                      <div className="font-semibold text-slate-800">Potential Duplicate Detected</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">APAAR 2026-9090-1122 active across 2 institutions.</div>
                      <div className="text-[10px] text-slate-400 mt-1">2 mins ago</div>
                    </div>
                    <div className="p-3 hover:bg-slate-50">
                      <div className="font-semibold text-slate-800">Intake Sanction Updated</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Academic Year 2024-25 intake validated against quota limits.</div>
                      <div className="text-[10px] text-slate-400 mt-1">1 hour ago</div>
                    </div>
                  </div>
                  <div className="p-2 border-t border-slate-100 text-center">
                    <button
                      type="button"
                      onClick={() => setShowNotificationMenu(false)}
                      className="text-[11px] font-bold text-gov-teal hover:underline"
                    >
                      Close Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Logout Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gov-navy/10 text-gov-navy flex items-center justify-center font-bold text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left max-w-[140px]">
                  <div className="text-xs font-bold text-slate-800 truncate leading-tight">
                    {user?.name || 'Authorized User'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate leading-tight font-medium">
                    {user?.designation || user?.role || 'Staff'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gov-border py-2 z-50 text-xs animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="font-bold text-slate-800">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{user?.email}</p>
                    <span className="inline-block mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Role: {user?.role}
                    </span>
                  </div>

                  <div className="py-1">
                    {portalType === 'institution' && (
                      <Link
                        to="/institution/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <Sliders className="w-3.5 h-3.5 text-slate-400" />
                        <span>Institution Settings</span>
                      </Link>
                    )}
                    {portalType === 'platform' && (
                      <Link
                        to="/platform/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <Sliders className="w-3.5 h-3.5 text-slate-400" />
                        <span>Platform Settings</span>
                      </Link>
                    )}
                    {portalType === 'verifier' && (
                      <Link
                        to="/verifier/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Officer Profile</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-bold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Secure Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default PortalHeader;
