import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth, AuthProvider, getDashboardRouteForRole } from './context/AuthContext.jsx';
import { RefreshCw } from 'lucide-react';

// Landing Page & Login
import { LandingPage } from './pages/LandingPage.jsx';
import { Login } from './pages/Login.jsx';

// Portal Layouts
import { InstitutionLayout } from './layouts/InstitutionLayout.jsx';
import { PlatformLayout } from './layouts/PlatformLayout.jsx';
import { VerifierLayout } from './layouts/VerifierLayout.jsx';

// Portal 1: Institution Admin Pages
import { InstitutionDashboard } from './pages/InstitutionDashboard.jsx';
import { StudentRecords } from './pages/StudentRecords.jsx';
import { AddStudent } from './pages/AddStudent.jsx';
import { BulkUpload } from './pages/BulkUpload.jsx';
import { DocumentVerification } from './pages/DocumentVerification.jsx';
import { CrossInstitutionValidation } from './pages/CrossInstitutionValidation.jsx';
import { AdmissionCompliance } from './pages/AdmissionCompliance.jsx';
import { CredentialVerification } from './pages/CredentialVerification.jsx';
import { ReportsAnalytics } from './pages/ReportsAnalytics.jsx';
import { InstitutionSettings } from './pages/InstitutionSettings.jsx';

// Portal 2: Platform Admin Pages
import { AicteDashboard } from './pages/AicteDashboard.jsx';
import { InstitutionDirectory } from './pages/InstitutionDirectory.jsx';
import { InstitutionOnboarding } from './pages/InstitutionOnboarding.jsx';
import { VerificationCases } from './pages/VerificationCases.jsx';
import { AiAlerts } from './pages/AiAlerts.jsx';
import { UserRoleManagement } from './pages/UserRoleManagement.jsx';
import { RegulatoryPolicies } from './pages/RegulatoryPolicies.jsx';
import { AuditLogs } from './pages/AuditLogs.jsx';
import { PlatformSettings } from './pages/PlatformSettings.jsx';

// Portal 3: Verification Officer Pages
import { VerifierDashboard } from './pages/VerifierDashboard.jsx';
import { VerifierCases } from './pages/VerifierCases.jsx';
import { VerifierCaseDetail } from './pages/VerifierCaseDetail.jsx';
import { VerifierCaseReview } from './pages/VerifierCaseReview.jsx';
import { VerifierHistory } from './pages/VerifierHistory.jsx';
import { VerifierNotifications } from './pages/VerifierNotifications.jsx';
import { VerifierProfile } from './pages/VerifierProfile.jsx';

// Role-Based Route Guard with automatic unauthorized redirection
function RoleProtectedRoute({ allowedRole, children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gov-navy flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3 text-white">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-sm font-semibold tracking-wide">
            Validating Role Credentials & Session Handshake...
          </p>
          <span className="text-xs text-slate-300 font-mono">
            APAARSetu PostgreSQL Trust Gateway Active
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    // Reject direct URL tampering and redirect user to their authorized portal
    const targetDashboard = getDashboardRouteForRole(user.role);
    return <Navigate to={targetDashboard} replace />;
  }

  return children;
}

// Global Role Redirector for legacy routes (/overview, /dashboard, etc.)
function AuthenticatedRedirector() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gov-navy flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const target = getDashboardRouteForRole(user.role);
  return <Navigate to={target} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Dedicated Login Portal */}
          <Route path="/login" element={<Login />} />

          {/* ========================================================= */}
          {/* PORTAL 1: INSTITUTION ADMIN (/institution/*)             */}
          {/* ========================================================= */}
          <Route
            path="/institution"
            element={
              <RoleProtectedRoute allowedRole="INSTITUTION_ADMIN">
                <InstitutionLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/institution/dashboard" replace />} />
            <Route path="dashboard" element={<InstitutionDashboard />} />
            <Route path="students" element={<StudentRecords />} />
            <Route path="students/new" element={<AddStudent />} />
            <Route path="bulk-upload" element={<BulkUpload />} />
            <Route path="document-verification" element={<DocumentVerification />} />
            <Route path="cross-institution" element={<CrossInstitutionValidation />} />
            <Route path="compliance" element={<AdmissionCompliance />} />
            <Route path="qr-verification" element={<CredentialVerification />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="settings" element={<InstitutionSettings />} />
          </Route>

          {/* ========================================================= */}
          {/* PORTAL 2: PLATFORM ADMIN (/platform/*)                   */}
          {/* ========================================================= */}
          <Route
            path="/platform"
            element={
              <RoleProtectedRoute allowedRole="AICTE_ADMIN">
                <PlatformLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/platform/dashboard" replace />} />
            <Route path="dashboard" element={<AicteDashboard />} />
            <Route path="institutions" element={<InstitutionDirectory />} />
            <Route path="institutions/new" element={<InstitutionOnboarding />} />
            <Route path="cross-institution" element={<CrossInstitutionValidation />} />
            <Route path="compliance" element={<AdmissionCompliance />} />
            <Route path="cases" element={<VerificationCases />} />
            <Route path="alerts" element={<AiAlerts />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="users" element={<UserRoleManagement />} />
            <Route path="policies" element={<RegulatoryPolicies />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<PlatformSettings />} />
          </Route>

          {/* ========================================================= */}
          {/* PORTAL 3: VERIFICATION OFFICER (/verifier/*)              */}
          {/* ========================================================= */}
          <Route
            path="/verifier"
            element={
              <RoleProtectedRoute allowedRole="VERIFIER">
                <VerifierLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/verifier/dashboard" replace />} />
            <Route path="dashboard" element={<VerifierDashboard />} />
            <Route path="cases" element={<VerifierCases />} />
            <Route path="cases/:caseId" element={<VerifierCaseDetail />} />
            <Route path="cases/:caseId/review" element={<VerifierCaseReview />} />
            <Route path="document-verification" element={<DocumentVerification />} />
            <Route path="duplicate-review" element={<CrossInstitutionValidation />} />
            <Route path="qr-verification" element={<CredentialVerification />} />
            <Route path="history" element={<VerifierHistory />} />
            <Route path="notifications" element={<VerifierNotifications />} />
            <Route path="profile" element={<VerifierProfile />} />
          </Route>

          {/* Convenience & Legacy Aliases */}
          <Route path="/overview" element={<AuthenticatedRedirector />} />
          <Route path="/dashboard" element={<AuthenticatedRedirector />} />
          <Route path="/students" element={<AuthenticatedRedirector />} />
          <Route path="/compliance" element={<AuthenticatedRedirector />} />
          <Route path="/cases" element={<AuthenticatedRedirector />} />
          <Route path="/audit-logs" element={<AuthenticatedRedirector />} />
          <Route path="/settings" element={<AuthenticatedRedirector />} />
          <Route path="/bulk-upload" element={<AuthenticatedRedirector />} />
          <Route path="/qr-verification" element={<AuthenticatedRedirector />} />

          {/* Global Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
