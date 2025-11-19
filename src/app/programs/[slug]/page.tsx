import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import BeagleProgramPagePreview from '@/components/BeagleProgramPagePreview';
import type { BeagleProgramData } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProgramPageProps {
  params: {
    slug: string;
  };
}

/**
 * Public tenant-facing program page
 * Route: /programs/[slug]
 * Fetches published program data directly from database
 */
export default async function ProgramPage({ params }: ProgramPageProps) {
  try {
    const program = await prisma.beagleProgram.findUnique({
      where: { propertyManagerSlug: params.slug },
      include: { form: true },
    });

    if (!program || !program.isPublished) {
      notFound();
    }

    const data: BeagleProgramData = {
      ...program,
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString(),
      selectedProducts: (program.selectedProducts as any) || [],
    };

    return <BeagleProgramPagePreview program={data} form={program.form} />;
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
    const program = await prisma.beagleProgram.findUnique({
      where: { propertyManagerSlug: params.slug },
    });

    if (!program?.isPublished) {
      return { title: 'Beagle Notice' };
    }

    return {
      title: `Insurance Verification - ${program.propertyManagerName}`,
      description: 'Beagle notice. Renters insurance made simple.',
    };
  } catch {
    return { title: 'Beagle Notice' };
  }
}

