'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface OptOutResponse {
  id: string;
  firstName: string;
  lastName: string;
  optedOutOfTenantLiabilityWaiver: boolean;
  optedOutOfRentersKit: boolean;
  createdAt: string;
}

interface FormData {
  id: string;
  responses: OptOutResponse[];
}

interface ProgramData {
  id: string;
  propertyManagerName: string;
  form?: FormData | null;
}

/**
 * Admin page for viewing opt-out responses
 * Route: /admin/beagle-programs/[id]/responses
 */
export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [program, setProgram] = useState<ProgramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleExportCSV = () => {
    if (!program?.form?.responses) return;

    // Create CSV headers
    const headers = ['First Name', 'Last Name', 'Opted Out - Liability Waiver', 'Opted Out - Renters Kit', 'Submitted Date'];
    
    // Create CSV rows
    const rows = program.form.responses.map((response) => [
      `"${response.firstName}"`,
      `"${response.lastName}"`,
      response.optedOutOfTenantLiabilityWaiver ? 'Yes' : 'No',
      response.optedOutOfRentersKit ? 'Yes' : 'No',
      new Date(response.createdAt).toLocaleString(),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${program.propertyManagerName}-responses-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchProgram = async () => {
      if (!programId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/admin/beagle-programs/${programId}/responses`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Program or form not found');
          }
          throw new Error('Failed to fetch responses');
        }

        const data = await response.json();
        setProgram(data.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch responses');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId]);

  return (
    <div className="min-h-screen bg-beagle-light font-bricolage">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/admin/beagle-programs"
              className="text-beagle-orange hover:underline text-sm font-semibold"
            >
              ← Back to Notices
            </Link>
            {program?.form?.responses && program.form.responses.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="bg-beagle-orange text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-opacity-90 transition-all"
              >
                Export as CSV
              </button>
            )}
          </div>
          <h1 className="text-2xl font-bold text-beagle-dark">
            {program ? `Responses - ${program.propertyManagerName}` : 'Responses'}
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-beagle-dark">Loading responses...</p>
          </div>
        ) : !program?.form ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">No form configured for this notice</p>
            <Link
              href={`/admin/beagle-programs/${programId}`}
              className="text-beagle-orange font-semibold hover:underline"
            >
              Configure the form
            </Link>
          </div>
        ) : program.form.responses.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No responses yet</p>
          </div>
        ) : (
          <div>
            {/* Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-beagle-dark mb-4">Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-beagle-light rounded p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Responses</p>
                  <p className="text-2xl font-bold text-beagle-dark">
                    {program.form.responses.length}
                  </p>
                </div>
                <div className="bg-beagle-light rounded p-4">
                  <p className="text-sm text-gray-600 mb-1">Opted Out of Liability Waiver</p>
                  <p className="text-2xl font-bold text-beagle-orange">
                    {program.form.responses.filter((r) => r.optedOutOfTenantLiabilityWaiver).length}
                  </p>
                </div>
                <div className="bg-beagle-light rounded p-4">
                  <p className="text-sm text-gray-600 mb-1">Opted Out of Renters Kit</p>
                  <p className="text-2xl font-bold text-beagle-orange">
                    {program.form.responses.filter((r) => r.optedOutOfRentersKit).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Responses Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-beagle-light border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark">
                      Liability Waiver
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark">
                      Renters Kit
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {program.form.responses.map((response) => (
                    <tr
                      key={response.id}
                      className="border-b border-gray-200 hover:bg-beagle-light transition-colors"
                    >
                      <td className="px-6 py-3 text-sm text-beagle-dark font-medium">
                        {response.firstName} {response.lastName}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            response.optedOutOfTenantLiabilityWaiver
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {response.optedOutOfTenantLiabilityWaiver ? 'Opted Out' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            response.optedOutOfRentersKit
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {response.optedOutOfRentersKit ? 'Opted Out' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {new Date(response.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

