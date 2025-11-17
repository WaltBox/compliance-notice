import React from 'react';
import SimpleAdminEditor from '@/components/SimpleAdminEditor';

/**
 * Admin page for creating a new beagle notice
 * Route: /admin/beagle-programs/new
 */
export default function NewProgramPage() {
  return (
    <div className="min-h-screen bg-beagle-light font-bricolage">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-beagle-dark">
            Create New Tenant Liability Program
          </h1>
          <p className="text-gray-600 mt-1">Quick setup for your property management company</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4">
        <SimpleAdminEditor isNew={true} />
      </main>
    </div>
  );
}

export const metadata = {
  title: 'Create A New Notice | Beagle Admin',
};

