import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { ApiResponse, UpdateBeagleProgramRequest, BeagleProgramData } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/beagle-programs/[id]
 * Admin endpoint - fetch a single program for editing
 */
export async function GET(
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

/**
 * PUT /api/admin/beagle-programs/[id]
 * Admin endpoint - update a program
 */
export async function PUT(
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

    const body: UpdateBeagleProgramRequest = await request.json();

    // Update the program
    const updated = await prisma.beagleProgram.update({
      where: { id: params.id },
      data: {
        ...(body.propertyManagerName !== undefined && { propertyManagerName: body.propertyManagerName }),
        ...(body.propertyManagerSlug !== undefined && { propertyManagerSlug: body.propertyManagerSlug }),
        ...(body.insuranceVerificationUrl !== undefined && { insuranceVerificationUrl: body.insuranceVerificationUrl }),
        ...(body.webviewUrl !== undefined && { webviewUrl: body.webviewUrl }),
        ...(body.selectedProducts !== undefined && { selectedProducts: JSON.parse(JSON.stringify(body.selectedProducts)) }),
      },
    });

    // Update or create form configuration if provided
    if (body.form) {
      const existingForm = await prisma.form.findUnique({
        where: { beagleProgramId: params.id },
      });

      if (existingForm) {
        await prisma.form.update({
          where: { beagleProgramId: params.id },
          data: {
            tenantLiabilityWaiverCanOptOut: body.form.tenantLiabilityWaiverCanOptOut || false,
            rentersKitCanOptOut: body.form.rentersKitCanOptOut || false,
          },
        });
      } else {
        await prisma.form.create({
          data: {
            beagleProgramId: params.id,
            tenantLiabilityWaiverCanOptOut: body.form.tenantLiabilityWaiverCanOptOut || false,
            rentersKitCanOptOut: body.form.rentersKitCanOptOut || false,
          },
        });
      }
    }

    const response: ApiResponse<BeagleProgramData> = {
      data: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        selectedProducts: (updated.selectedProducts as any) || [],
      } as BeagleProgramData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating beagle notice:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

