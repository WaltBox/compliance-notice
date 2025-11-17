import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { ApiResponse, BeagleProgramData } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/beagle-programs?slug={propertyManagerSlug}
 * Returns the program content for public web view (only where isPublished = true)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Missing required query parameter: slug' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const program = await prisma.beagleProgram.findUnique({
      where: { propertyManagerSlug: slug },
    });

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    if (!program.isPublished) {
      return NextResponse.json(
        { error: 'Program not published' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const response: ApiResponse<BeagleProgramData> = {
      data: {
        ...program,
        createdAt: program.createdAt.toISOString(),
        updatedAt: program.updatedAt.toISOString(),
        selectedProducts: (program.selectedProducts as any) || [],
      } as BeagleProgramData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching beagle notice:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

