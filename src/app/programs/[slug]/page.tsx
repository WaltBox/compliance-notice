import React from 'react';
import { notFound } from 'next/navigation';
import BeagleProgramPagePreview from '@/components/BeagleProgramPagePreview';
import type { BeagleProgramData } from '@/types';

interface ProgramPageProps {
  params: {
    slug: string;
  };
}

/**
 * Public tenant-facing program page
 * Route: /programs/[slug]
 * Fetches published program data and renders the Beagle layout
 */
export default async function ProgramPage({ params }: ProgramPageProps) {
  try {
    // Fetch program data from API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/beagle-programs?slug=${params.slug}`, {
      cache: 'no-store', // Ensure fresh data on each request
    });

    if (!response.ok) {
      notFound();
    }

    const data = await response.json();
    const program: BeagleProgramData = data.data;

    if (!program) {
      notFound();
    }

    return <BeagleProgramPagePreview program={program} />;
  } catch (error) {
    console.error('Error loading program:', error);
    notFound();
  }
}

/**
 * Generate static metadata for the page
 */
export async function generateMetadata({ params }: ProgramPageProps) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/beagle-programs?slug=${params.slug}`);

    if (!response.ok) {
      return {
        title: 'Program Not Found',
      };
    }

    const data = await response.json();
    const program: BeagleProgramData = data.data;

    return {
      title: program.pageTitle,
      description: program.introText.substring(0, 160),
    };
  } catch {
    return {
      title: 'Beagle Program',
    };
  }
}

