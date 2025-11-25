import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/auth';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/beagle-programs/[id]/responses
 * Admin endpoint - fetch opt-out responses for a program
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // Get the program and its form with responses + upgrade selections
    const program = await prisma.beagleProgram.findUnique({
      where: { id: params.id },
      include: {
        form: {
          include: {
            responses: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        upgradeSelections: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    if (!program.form) {
      return NextResponse.json(
        { error: 'No form configured for this program' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const response: ApiResponse<any> = {
      data: {
        id: program.id,
        propertyManagerName: program.propertyManagerName,
        form: {
          id: program.form.id,
          responses: program.form.responses.map((r) => ({
            id: r.id,
            firstName: r.firstName,
            lastName: r.lastName,
            optedOutOfTenantLiabilityWaiver: r.optedOutOfTenantLiabilityWaiver,
            optedOutOfRentersKit: r.optedOutOfRentersKit,
            selectedUpgrade: r.selectedUpgrade,
            selectedUpgradePrice: r.selectedUpgradePrice,
            createdAt: r.createdAt.toISOString(),
          })),
        },
        upgradeSelections: program.upgradeSelections.map((u) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          selectedUpgrade: u.selectedUpgrade,
          selectedUpgradePrice: u.selectedUpgradePrice,
          createdAt: u.createdAt.toISOString(),
        })),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

