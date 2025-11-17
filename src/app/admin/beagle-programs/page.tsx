'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { BeagleProgramData, PaginatedApiResponse } from '@/types';

/**
 * Admin page for listing all Beagle programs
 * Route: /admin/beagle-programs
 */
export default function AdminProgramsListPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<BeagleProgramData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/admin/beagle-programs?page=${page}&pageSize=${pageSize}`
        );

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
  }, [page, pageSize]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-beagle-light font-bricolage">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-beagle-dark">Beagle Programs</h1>
            <p className="text-gray-600 mt-1">{total} program(s)</p>
          </div>
          <Link
            href="/admin/beagle-programs/new"
            className="bg-beagle-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90"
          >
            + New Program
          </Link>
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
        ) : (
          <div>
            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-beagle-light border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark">
                      Property Manager
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-beagle-dark">
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
                  {programs.map((program) => (
                    <tr
                      key={program.id}
                      className="border-b border-gray-200 hover:bg-beagle-light transition-colors"
                    >
                      <td className="px-6 py-3 text-sm text-beagle-dark font-medium">
                        {program.propertyManagerName}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {program.propertyManagerSlug}
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
                      <td className="px-6 py-3 text-sm text-right">
                        <button
                          onClick={() => router.push(`/admin/beagle-programs/${program.id}`)}
                          className="text-beagle-orange font-semibold hover:underline"
                        >
                          Edit
                        </button>
                        {program.isPublished && (
                          <>
                            <span className="text-gray-300 mx-2">•</span>
                            <a
                              href={`/programs/${program.propertyManagerSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-beagle-orange font-semibold hover:underline"
                            >
                              View Public
                            </a>
                          </>
                        )}
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

