import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { ApiResponse, BeagleProgramData } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/beagle-programs/[id]/publish
 * Admin endpoint - toggle isPublished boolean
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication check here

    const program = await prisma.beagleProgram.findUnique({
      where: { id: params.id },
    });

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Validate before publishing
    if (!program.isPublished) {
      if (!program.insuranceVerificationUrl) {
        return NextResponse.json(
          { 
            error: 'Cannot publish: missing required field (insuranceVerificationUrl)' 
          } as ApiResponse<null>,
          { status: 400 }
        );
      }
    }

    const updated = await prisma.beagleProgram.update({
      where: { id: params.id },
      data: {
        isPublished: !program.isPublished,
      },
    });

    const response: ApiResponse<BeagleProgramData> = {
      data: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        selectedProducts: (updated.selectedProducts as any) || [],
      } as BeagleProgramData,
      message: updated.isPublished ? 'Program published' : 'Program unpublished',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error toggling publish status:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

