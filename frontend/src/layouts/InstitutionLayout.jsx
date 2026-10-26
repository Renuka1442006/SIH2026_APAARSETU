import React from 'react';
import { Outlet } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { PortalHeader } from '../components/PortalHeader.jsx';
import { InstitutionSidebar } from '../components/InstitutionSidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const InstitutionLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gov-page flex flex-col font-sans text-gov-charcoal antialiased">
      <PortalHeader
        portalType="institution"
        portalName="Institution Admin Portal"
        subtitle={user?.institution ? `${user.institution.name} • AISHE: ${user.institution.aisheCode || user.institution.code}` : 'Institution Administration Node'}
        icon={Building2}
        badgeText={`AICTE Code: ${user?.institution?.code || '1-001'}`}
        badgeColor="bg-blue-100 text-blue-800 border-blue-200"
      />
      <div className="flex-1 flex overflow-hidden">
        <InstitutionSidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstitutionLayout;
