'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAdminToken, clearAdminToken, isTokenExpired } from '@/lib/auth';
import type { BeagleProgramData, PaginatedApiResponse } from '@/types';

const PUBLIC_DOMAIN = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : 'https://www.beaglenotice.com';

/**
 * Admin page for listing all beagle notices
 * Route: /admin/beagle-programs
 */
export default function AdminProgramsListPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<BeagleProgramData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = getAdminToken();
    if (!token || isTokenExpired(token)) {
      clearAdminToken();
      router.push('/admin/login');
      return;
    }
    setAuthenticated(true);
  }, [router]);

  const handleLogout = () => {
    clearAdminToken();
    router.push('/admin/login');
  };

  // Debounce search query
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page when searching
    }, 500); // Wait 500ms after user stops typing

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  // Fetch programs when page changes (initial load or pagination)
  useEffect(() => {
    if (!authenticated) return;

    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const token = getAdminToken();
        if (!token) {
          throw new Error('No auth token');
        }

        // If we have a search query, include it in the request
        const queryParams = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          ...(debouncedSearch.trim() && { search: debouncedSearch }),
        });

        const response = await fetch(`/api/admin/beagle-programs?${queryParams}`, {
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
          throw new Error('Failed to fetch programs');
        }

        const data: PaginatedApiResponse<BeagleProgramData> = await response.json();
        setPrograms(data.data);
        setTotal(data.total);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch programs');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [page, pageSize, debouncedSearch, authenticated, router]);

  const totalPages = Math.ceil(total / pageSize);

  // Use the fetched programs directly (server-side filtering is handled in the API)
  // No need for client-side filtering anymore
  const filteredPrograms = programs;

  return (
    <div className="min-h-screen bg-beagle-light font-bricolage">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-beagle-dark">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/beagle-programs/new"
                className="bg-beagle-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90"
              >
                + New Notice
              </Link>
              <button
                onClick={handleLogout}
                className="text-beagle-dark px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex gap-8">
            <Link
              href="/admin/beagle-programs"
              className="py-4 px-2 border-b-2 border-beagle-orange text-beagle-orange font-semibold"
            >
              Notices
            </Link>
            <Link
              href="/admin/notice-sender"
              className="py-4 px-2 border-b-2 border-transparent text-gray-600 font-semibold hover:text-beagle-dark hover:border-gray-300 transition"
            >
              Notice Sender
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, slug, URL, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-11 border border-gray-300 rounded-lg font-bricolage focus:outline-none focus:border-beagle-orange focus:ring-1 focus:ring-beagle-orange transition"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          {!loading && programs.length === 0 && total > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              No results found. Try a different search term.
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-beagle-dark">Loading programs...</p>
          </div>
        ) : programs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">No programs created yet</p>
            <Link
              href="/admin/beagle-programs/new"
              className="text-beagle-orange font-semibold hover:underline"
            >
              Create your first program
            </Link>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-600 mb-2">No programs found matching <span className="font-semibold">"{searchQuery}"</span></p>
            <p className="text-xs text-gray-500">Try searching by name, slug, URL, or tags</p>
          </div>
        ) : (
          <div>
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {debouncedSearch ? (
                  <>
                    Found <span className="font-semibold text-beagle-dark">{filteredPrograms.length}</span> of <span className="font-semibold text-beagle-dark">{total}</span> program(s) matching "{debouncedSearch}"
                  </>
                ) : (
                  <>
                    Showing <span className="font-semibold text-beagle-dark">{filteredPrograms.length}</span> of <span className="font-semibold text-beagle-dark">{total}</span> program(s)
                  </>
                )}
              </p>
              {debouncedSearch && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-beagle-orange hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-beagle-light border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark w-2/5">
                      Property Manager
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark w-1/4">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-beagle-dark">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrograms.map((program) => (
                    <tr
                      key={program.id}
                      className="border-b border-gray-200 hover:bg-beagle-light transition-colors"
                    >
                      <td className="px-6 py-3 text-sm text-beagle-dark font-medium">
                        <div className="flex items-center gap-2">
                          <span className="truncate" title={program.propertyManagerName}>
                            {program.propertyManagerName.length > 25
                              ? `${program.propertyManagerName.substring(0, 25)}...`
                              : program.propertyManagerName}
                          </span>
                          {program.tags && program.tags.length > 0 && (
                            <div className="flex gap-1 flex-shrink-0">
                              {program.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-block px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full whitespace-nowrap"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 truncate" title={program.propertyManagerSlug}>
                        <span className="text-xs">{program.propertyManagerSlug.length > 20 ? `${program.propertyManagerSlug.substring(0, 20)}...` : program.propertyManagerSlug}</span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            program.isPublished
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {program.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {new Date(program.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                          <button
                            onClick={() => router.push(`/admin/beagle-programs/${program.id}`)}
                            className="text-beagle-orange font-semibold hover:underline text-xs"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300">•</span>
                          <div className="relative">
                            <button
                              onClick={() => router.push(`/admin/beagle-programs/${program.id}/responses`)}
                              className="text-beagle-orange font-semibold hover:underline text-xs"
                            >
                              Responses
                            </button>
                            {program.responseCount !== undefined && program.responseCount > 0 && (
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap -mt-1">
                                ({program.responseCount})
                              </div>
                            )}
                          </div>
                          {program.isPublished && (
                            <>
                              <span className="text-gray-300">•</span>
                              <a
                                href={`${PUBLIC_DOMAIN}/programs/${program.propertyManagerSlug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-beagle-orange font-semibold hover:underline text-xs"
                              >
                                View
                              </a>
                              <span className="text-gray-300">•</span>
                              <button
                                onClick={() => {
                                  const url = `${PUBLIC_DOMAIN}/programs/${program.propertyManagerSlug}`;
                                  const plainText = `Hi! Your lease requires renters insurance. Follow this link to explore our new partnership with Beagle and meet your lease requirement: ${url}`;
                                  const htmlText = `Hi! Your lease requires renters insurance. Follow this link to explore our new partnership with Beagle and meet your lease requirement: <a href="${url}">${url}</a>`;
                                  
                                  // Copy to clipboard with both plain text and HTML formats
                                  const blob = new Blob([htmlText], { type: 'text/html' });
                                  const richTextItem = new ClipboardItem({
                                    'text/html': blob,
                                    'text/plain': new Blob([plainText], { type: 'text/plain' }),
                                  });
                                  navigator.clipboard.write([richTextItem]);
                                  setCopiedId(program.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="text-beagle-orange font-semibold hover:underline text-xs"
                                title="Copy notice message to clipboard"
                              >
                                {copiedId === program.id ? '✓ Copied!' : 'Copy'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded ${
                      page === p
                        ? 'bg-beagle-orange text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

