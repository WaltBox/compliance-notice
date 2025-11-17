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
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    const response = await fetch(
      `${baseUrl}/api/beagle-programs?slug=${params.slug}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      notFound();
    }

    const json = await response.json();
    const program = json?.data as BeagleProgramData;

    if (!program?.id) {
      notFound();
    }

    return <BeagleProgramPagePreview program={program} />;
  } catch (error) {
    console.error('[programs] Error:', error);
    notFound();
  }
}

/**
 * Generate static metadata for the page
 */
export async function generateMetadata({ params }: ProgramPageProps) {
  try {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    
    const response = await fetch(
      `${protocol}://${host}/api/beagle-programs?slug=${params.slug}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return { title: 'Beagle Notice' };
    }

    const json = await response.json();
    const program = json?.data as BeagleProgramData;

    return {
      title: `Insurance Verification - ${program?.propertyManagerName || 'Beagle Notice'}`,
      description: 'Beagle notice. Renters insurance made simple.',
    };
  } catch {
    return { title: 'Beagle Notice' };
  }
}

