import React from 'react';
import { Outlet } from 'react-router-dom';
import { FileCheck2 } from 'lucide-react';
import { PortalHeader } from '../components/PortalHeader.jsx';
import { VerifierSidebar } from '../components/VerifierSidebar.jsx';

export const VerifierLayout = () => {
  return (
    <div className="min-h-screen bg-gov-page flex flex-col font-sans text-gov-charcoal antialiased">
      <PortalHeader
        portalType="verifier"
        portalName="Verification Officer Portal"
        subtitle="Dispute Investigation, Document Adjudication & QR Trust Station"
        icon={FileCheck2}
        badgeText="Authorized Agency"
        badgeColor="bg-amber-100 text-amber-800 border-amber-200"
      />
      <div className="flex-1 flex overflow-hidden">
        <VerifierSidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VerifierLayout;
