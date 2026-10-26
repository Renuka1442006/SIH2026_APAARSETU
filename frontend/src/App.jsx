import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Sidebar } from './components/Sidebar.jsx';

// Landing Page & Login
import { LandingPage } from './pages/LandingPage.jsx';
import { Login } from './pages/Login.jsx';

// 10 Master Portal Pages
import { Overview } from './pages/Overview.jsx';
import { StudentRecords } from './pages/StudentRecords.jsx';
import { DocumentVerification } from './pages/DocumentVerification.jsx';
import { CrossInstitutionValidation } from './pages/CrossInstitutionValidation.jsx';
import { AdmissionCompliance } from './pages/AdmissionCompliance.jsx';
import { VerificationCases } from './pages/VerificationCases.jsx';
import { QrVerification } from './pages/QrVerification.jsx';
import { ReportsAnalytics } from './pages/ReportsAnalytics.jsx';
import { AuditLogs } from './pages/AuditLogs.jsx';
import { Settings } from './pages/Settings.jsx';

// Ingestion & Workflows
import { BulkUpload } from './pages/BulkUpload.jsx';
import { RefreshCw } from 'lucide-react';

// Route Guard for Authenticated Portal Shell
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gov-navy flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3 text-white">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-sm font-semibold tracking-wide">
            Initializing APAARSetu National Regulatory Portal...
          </p>
          <span className="text-xs text-slate-300 font-mono">
            Checking Cryptographic Signatures & Session Handshake
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Authenticated Application Shell (Navbar + Sidebar + Main Workspace)
function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gov-page flex flex-col font-sans text-gov-charcoal antialiased">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
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

          {/* Authenticated Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/overview" element={<Overview />} />
            <Route path="/students" element={<StudentRecords />} />
            <Route path="/document-verification" element={<DocumentVerification />} />
            <Route path="/cross-institution" element={<CrossInstitutionValidation />} />
            <Route path="/compliance" element={<AdmissionCompliance />} />
            <Route path="/cases" element={<VerificationCases />} />
            <Route path="/qr-verification" element={<QrVerification />} />
            <Route path="/reports" element={<ReportsAnalytics />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/settings" element={<Settings />} />

            {/* Ingestion & Workflows */}
            <Route path="/bulk-upload" element={<BulkUpload />} />

            {/* Convenience Aliases & Deep Links */}
            <Route path="/credentials" element={<QrVerification />} />
            <Route path="/review-cases" element={<VerificationCases />} />
            <Route path="/intake" element={<AdmissionCompliance />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/validation-results" element={<CrossInstitutionValidation />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
