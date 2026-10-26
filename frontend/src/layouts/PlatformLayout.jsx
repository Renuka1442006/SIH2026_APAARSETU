import React from 'react';
import { Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { PortalHeader } from '../components/PortalHeader.jsx';
import { PlatformSidebar } from '../components/PlatformSidebar.jsx';

export const PlatformLayout = () => {
  return (
    <div className="min-h-screen bg-gov-page flex flex-col font-sans text-gov-charcoal antialiased">
      <PortalHeader
        portalType="platform"
        portalName="Platform Admin Portal"
        subtitle="National Directorate • Apex Accreditation & Intake Oversight"
        icon={Shield}
        badgeText="National Apex Root"
        badgeColor="bg-purple-100 text-purple-800 border-purple-200"
      />
      <div className="flex-1 flex overflow-hidden">
        <PlatformSidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PlatformLayout;
