'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken, clearAdminToken, isTokenExpired } from '@/lib/auth';
import SimpleAdminEditor from '@/components/SimpleAdminEditor';
import type { BeagleProgramData } from '@/types';

interface EditProgramPageProps {
  params: {
    id: string;
  };
}

/**
 * Admin page for editing an existing beagle notice
 * Route: /admin/beagle-programs/[id]
 */
export default function EditProgramPage({ params }: EditProgramPageProps) {
  const router = useRouter();
  const [program, setProgram] = useState<BeagleProgramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = getAdminToken();
    if (!token || isTokenExpired(token)) {
      clearAdminToken();
      router.push('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const token = getAdminToken();
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/admin/beagle-programs/${params.id}`, {
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
            setError('Program not found');
          } else {
            throw new Error('Failed to fetch program');
          }
          return;
        }

        const data = await response.json();
        setProgram(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch program');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-beagle-light font-bricolage flex items-center justify-center">
        <p className="text-beagle-dark">Loading program...</p>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-beagle-light font-bricolage flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Program not found'}</p>
          <button
            onClick={() => router.push('/admin/beagle-programs')}
            className="text-beagle-orange font-semibold hover:underline"
          >
            Back to programs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beagle-light font-bricolage">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-beagle-dark">
                Edit Program
              </h1>
              <p className="text-gray-600 mt-1">{program.propertyManagerName}</p>
            </div>
            <button
              onClick={() => router.push('/admin/beagle-programs')}
              className="text-beagle-orange font-semibold hover:underline"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4">
        <SimpleAdminEditor program={program} isNew={false} />
      </main>
    </div>
  );
}

