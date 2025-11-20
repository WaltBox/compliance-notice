import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

interface SubmitUpgradeRequest {
  beagleProgramId: string;
  firstName: string;
  lastName: string;
  selectedUpgrade: 'upgrade_5k' | 'upgrade_10k' | 'upgrade_20k';
  selectedUpgradePrice: string;
}

/**
 * POST /api/upgrade-selections
 * Tenant endpoint - submit upgrade selection
 */
export async function POST(request: NextRequest) {
  try {
    const body: SubmitUpgradeRequest = await request.json();

    // Validate required fields
    if (!body.beagleProgramId || !body.firstName || !body.lastName || !body.selectedUpgrade) {
      return NextResponse.json(
        { error: 'Missing required fields: beagleProgramId, firstName, lastName, selectedUpgrade' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Verify the program exists
    const program = await prisma.beagleProgram.findUnique({
      where: { id: body.beagleProgramId },
    });

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Create the upgrade selection
    const response = await prisma.upgradeSelection.create({
      data: {
        beagleProgramId: body.beagleProgramId,
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        selectedUpgrade: body.selectedUpgrade,
        selectedUpgradePrice: body.selectedUpgradePrice,
      },
    });

    return NextResponse.json(
      {
        data: {
          id: response.id,
          createdAt: response.createdAt.toISOString(),
        },
      } as ApiResponse<any>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting upgrade selection:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

