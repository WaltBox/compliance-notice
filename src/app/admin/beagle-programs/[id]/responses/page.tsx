'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getAdminToken, clearAdminToken } from '@/lib/auth';

interface OptOutResponse {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  optedOutOfTenantLiabilityWaiver: boolean;
  optedOutOfRentersKit: boolean;
  selectedUpgrade?: string | null;
  selectedUpgradePrice?: string | null;
  createdAt: string;
  type: 'optout'; // Mark as opt-out type
}

interface OptInResponse {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  optedInToTenantLiabilityWaiver: boolean;
  optedInToRentersKit: boolean;
  createdAt: string;
  type: 'optin'; // Mark as opt-in type
}

interface UpgradeSelectionResponse {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  selectedUpgrade: string;
  selectedUpgradePrice: string;
  createdAt: string;
  type: 'upgrade'; // Mark as upgrade type
}

interface FormData {
  id: string;
  optOutResponses?: OptOutResponse[];
  optInResponses?: OptInResponse[];
  responses?: OptOutResponse[]; // Backwards compatibility
}

interface ProgramData {
  id: string;
  propertyManagerName: string;
  form?: FormData | null;
  upgradeSelections?: UpgradeSelectionResponse[];
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
  const [filterType, setFilterType] = useState<'all' | 'optout' | 'optin' | 'upgrade'>('all');

  // Helper to get upgrade display name
  const getUpgradeDisplayName = (upgradeId: string) => {
    const upgradeMap: Record<string, string> = {
      'upgrade_5k': '+5k content',
      'upgrade_10k': '+10k content',
      'upgrade_20k': '+20k content',
    };
    return upgradeMap[upgradeId] || upgradeId;
  };

  // Get all responses combined and filtered
  const getAllResponses = () => {
    // Try new structure first (optOutResponses, optInResponses), fall back to legacy (responses)
    const optoutResponses = (program?.form?.optOutResponses || program?.form?.responses || []).map(r => ({ ...r, type: 'optout' as const }));
    const optinResponses = (program?.form?.optInResponses || []).map(r => ({ ...r, type: 'optin' as const }));
    const upgradeResponses = (program?.upgradeSelections || []).map(u => ({
      ...u,
      type: 'upgrade' as const,
      optedOutOfTenantLiabilityWaiver: false,
      optedOutOfRentersKit: false,
    }));
    return [...optoutResponses, ...optinResponses, ...upgradeResponses];
  };

  const getFilteredResponses = () => {
    const allResponses = getAllResponses();
    if (filterType === 'all') return allResponses;
    if (filterType === 'optout') return allResponses.filter(r => r.type === 'optout');
    if (filterType === 'optin') return allResponses.filter(r => r.type === 'optin');
    if (filterType === 'upgrade') return allResponses.filter(r => r.type === 'upgrade');
    return allResponses;
  };

  const filteredResponses = getFilteredResponses();
  const allResponses = getAllResponses();

  const handleExportCSV = () => {
    // Create CSV headers - expanded for opt-in and phone number
    const headers = ['First Name', 'Last Name', 'Phone Number', 'Response Type', 'Opted Out - Liability Waiver', 'Opted In - Liability Waiver', 'Selected Upgrade', 'Opted Out - Renters Kit', 'Opted In - Renters Kit', 'Submitted Date'];
    
    // Create CSV rows based on filtered responses
    const rows = filteredResponses.map((response) => {
      if (response.type === 'optout') {
        const optout = response as OptOutResponse;
        return [
          `"${optout.firstName}"`,
          `"${optout.lastName}"`,
          `"${(response as any).phoneNumber || ''}"`,
          'Opt-out',
          optout.optedOutOfTenantLiabilityWaiver ? 'Yes' : 'No',
          'N/A',
          optout.selectedUpgrade ? `Upgrade ${getUpgradeDisplayName(optout.selectedUpgrade)}` : 'None',
          optout.optedOutOfRentersKit ? 'Yes' : 'No',
          'N/A',
          new Date(optout.createdAt).toLocaleString(),
        ];
      } else if (response.type === 'optin') {
        const optin = response as OptInResponse;
        return [
          `"${optin.firstName}"`,
          `"${optin.lastName}"`,
          `"${(response as any).phoneNumber || ''}"`,
          'Opt-in',
          'N/A',
          optin.optedInToTenantLiabilityWaiver ? 'Yes' : 'No',
          'None',
          'N/A',
          optin.optedInToRentersKit ? 'Yes' : 'No',
          new Date(optin.createdAt).toLocaleString(),
        ];
      } else {
        const upgrade = response as UpgradeSelectionResponse;
        return [
          `"${upgrade.firstName}"`,
          `"${upgrade.lastName}"`,
          `"${(response as any).phoneNumber || ''}"`,
          'Upgrade',
          'No',
          'N/A',
          `Upgrade ${getUpgradeDisplayName(upgrade.selectedUpgrade)}`,
          'No',
          'N/A',
          new Date(upgrade.createdAt).toLocaleString(),
        ];
      }
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filterSuffix = filterType === 'all' ? '' : `-${filterType === 'optin' ? 'opt-in' : filterType}`;
    link.setAttribute('href', url);
    link.setAttribute('download', `${program?.propertyManagerName}-responses${filterSuffix}-${new Date().toISOString().split('T')[0]}.csv`);
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
        const token = getAdminToken();
        
        if (!token) {
          clearAdminToken();
          router.push('/admin/login');
          return;
        }

        const response = await fetch(`/api/admin/beagle-programs/${programId}/responses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          clearAdminToken();
          router.push('/admin/login');
          return;
        }

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Program or form not found');
          }
          throw new Error('Failed to fetch responses');
        }

        const data = await response.json();
        console.log('=== DEBUG: Responses Page ===');
        console.log('API Response:', data);
        console.log('All Responses:', (() => {
          const optout = (data.data.form?.optOutResponses || data.data.form?.responses || []).map((r: any) => ({ ...r, type: 'optout' }));
          const optin = (data.data.form?.optInResponses || []).map((r: any) => ({ ...r, type: 'optin' }));
          const upgrade = (data.data.upgradeSelections || []).map((u: any) => ({ ...u, type: 'upgrade' }));
          return [...optout, ...optin, ...upgrade];
        })());
        console.log('=== END DEBUG ===');
        setProgram(data.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch responses');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId, router]);

  return (
    <div className="min-h-screen bg-beagle-light font-bricolage">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-3">
            <Link
              href="/admin/beagle-programs"
              className="text-beagle-orange hover:underline text-sm font-semibold"
            >
              ← Back to Notices
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-beagle-dark">
            {program ? `Responses - ${program.propertyManagerName}` : 'Responses'}
          </h1>
        </div>
      </header>

      {/* Filter Buttons */}
      {allResponses.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-7xl mx-auto flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filterType === 'all'
                  ? 'bg-beagle-orange text-white'
                  : 'bg-gray-100 text-beagle-dark hover:bg-gray-200'
              }`}
            >
              All ({allResponses.length})
            </button>
            {(program?.form?.optOutResponses || program?.form?.responses) && (program.form.optOutResponses || program.form.responses || []).length > 0 && (
              <button
                onClick={() => setFilterType('optout')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterType === 'optout'
                    ? 'bg-beagle-orange text-white'
                    : 'bg-gray-100 text-beagle-dark hover:bg-gray-200'
                }`}
              >
                Opt-outs ({(program.form.optOutResponses || program.form.responses || []).length})
              </button>
            )}
            {program?.form?.optInResponses && program.form.optInResponses.length > 0 && (
              <button
                onClick={() => setFilterType('optin')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterType === 'optin'
                    ? 'bg-beagle-orange text-white'
                    : 'bg-gray-100 text-beagle-dark hover:bg-gray-200'
                }`}
              >
                Opt-ins ({program.form.optInResponses.length})
              </button>
            )}
            {program?.upgradeSelections && program.upgradeSelections.length > 0 && (
              <button
                onClick={() => setFilterType('upgrade')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterType === 'upgrade'
                    ? 'bg-beagle-orange text-white'
                    : 'bg-gray-100 text-beagle-dark hover:bg-gray-200'
                }`}
              >
                Upgrades ({program.upgradeSelections.length})
              </button>
            )}
          </div>
        </div>
      )}

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
        ) : allResponses.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No responses yet</p>
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No {filterType === 'optout' ? 'opt-out' : filterType === 'optin' ? 'opt-in' : filterType === 'upgrade' ? 'upgrade' : ''} responses</p>
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
                    {allResponses.length}
                  </p>
                </div>
                <div className="bg-beagle-light rounded p-4">
                  <p className="text-sm text-gray-600 mb-1">Opted Out of Liability Waiver</p>
                  <p className="text-2xl font-bold text-beagle-orange">
                    {allResponses.filter((r) => (r as OptOutResponse).optedOutOfTenantLiabilityWaiver).length}
                  </p>
                </div>
                <div className="bg-beagle-light rounded p-4">
                  <p className="text-sm text-gray-600 mb-1">Opted In to Liability Waiver</p>
                  <p className="text-2xl font-bold text-beagle-orange">
                    {allResponses.filter((r) => (r as OptInResponse).optedInToTenantLiabilityWaiver).length}
                  </p>
                </div>
                <div className="bg-beagle-light rounded p-4">
                  <p className="text-sm text-gray-600 mb-1">Opted Out of Renters Kit</p>
                  <p className="text-2xl font-bold text-beagle-orange">
                    {allResponses.filter((r) => (r as OptOutResponse).optedOutOfRentersKit).length}
                  </p>
                </div>
                <div className="bg-beagle-light rounded p-4">
                  <p className="text-sm text-gray-600 mb-1">Opted In to Renters Kit</p>
                  <p className="text-2xl font-bold text-beagle-orange">
                    {allResponses.filter((r) => (r as OptInResponse).optedInToRentersKit).length}
                  </p>
                </div>
                <div className="bg-beagle-light rounded p-4">
                  <p className="text-sm text-gray-600 mb-1">Selected Upgrades</p>
                  <p className="text-2xl font-bold text-beagle-orange">
                    {allResponses.filter((r) => r.selectedUpgrade).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Export Button */}
            {filteredResponses.length > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={handleExportCSV}
                  className="bg-beagle-orange text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-opacity-90 transition-all"
                >
                  Export {filterType === 'all' ? 'All' : filterType === 'optout' ? 'Opt-outs' : filterType === 'optin' ? 'Opt-ins' : 'Upgrades'} as CSV
                </button>
              </div>
            )}

            {/* Responses Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-beagle-light border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark">
                      Liability Waiver
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark">
                      Renters Kit
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark">
                      Upgrade Selected
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResponses.map((response) => (
                    <tr
                      key={response.id}
                      className="border-b border-gray-200 hover:bg-beagle-light transition-colors"
                    >
                      <td className="px-6 py-3 text-sm text-beagle-dark font-medium">
                        {response.firstName} {response.lastName}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {(response as any).phoneNumber 
                          ? (response as any).phoneNumber 
                          : '—'}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          response.type === 'optout' ? 'bg-red-100 text-red-700' :
                          response.type === 'optin' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {response.type === 'optout' ? 'Opt-Out' : response.type === 'optin' ? 'Opt-In' : 'Upgrade'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {response.type === 'optout' ? (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              (response as OptOutResponse).optedOutOfTenantLiabilityWaiver
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {(response as OptOutResponse).optedOutOfTenantLiabilityWaiver ? 'Opted Out' : 'No'}
                          </span>
                        ) : response.type === 'optin' ? (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              (response as OptInResponse).optedInToTenantLiabilityWaiver
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {(response as OptInResponse).optedInToTenantLiabilityWaiver ? 'Opted In' : 'No'}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {response.type === 'optout' ? (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              (response as OptOutResponse).optedOutOfRentersKit
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {(response as OptOutResponse).optedOutOfRentersKit ? 'Opted Out' : 'No'}
                          </span>
                        ) : response.type === 'optin' ? (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              (response as OptInResponse).optedInToRentersKit
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {(response as OptInResponse).optedInToRentersKit ? 'Opted In' : 'No'}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {response.selectedUpgrade ? (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {getUpgradeDisplayName(response.selectedUpgrade)}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">—</span>
                        )}
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

