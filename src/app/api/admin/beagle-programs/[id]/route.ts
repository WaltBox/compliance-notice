import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { ApiResponse, UpdateBeagleProgramRequest, BeagleProgramData } from '@/types';

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
        products: (program.products as unknown[]) || [],
      } as BeagleProgramData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching Beagle program:', error);
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
        ...(body.pageTitle !== undefined && { pageTitle: body.pageTitle }),
        ...(body.introText !== undefined && { introText: body.introText }),
        ...(body.insuranceVerificationUrl !== undefined && { insuranceVerificationUrl: body.insuranceVerificationUrl }),
        ...(body.programHeading !== undefined && { programHeading: body.programHeading }),
        ...(body.programSubheading !== undefined && { programSubheading: body.programSubheading }),
        ...(body.products !== undefined && { products: body.products }),
      },
    });

    const response: ApiResponse<BeagleProgramData> = {
      data: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        products: (updated.products as unknown[]) || [],
      } as BeagleProgramData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating Beagle program:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

