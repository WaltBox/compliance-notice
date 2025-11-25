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

    // Get the program and its form with opt-out, opt-in, and upgrade responses
    const program = await prisma.beagleProgram.findUnique({
      where: { id: params.id },
      include: {
        form: {
          include: {
            optOutResponses: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                optedOutOfTenantLiabilityWaiver: true,
                optedOutOfRentersKit: true,
                selectedUpgrade: true,
                selectedUpgradePrice: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
            optInResponses: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                optedInToTenantLiabilityWaiver: true,
                optedInToRentersKit: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        upgradeSelections: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            selectedUpgrade: true,
            selectedUpgradePrice: true,
            createdAt: true,
          },
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

    // Log raw data for debugging
    console.log('=== DEBUG: Responses Route ===');
    console.log('OptOut Responses Count:', program.form.optOutResponses?.length);
    console.log('OptIn Responses Count:', program.form.optInResponses?.length);
    console.log('Upgrade Selections Count:', program.upgradeSelections?.length);
    if (program.form.optOutResponses && program.form.optOutResponses.length > 0) {
      console.log('First OptOut Response:', JSON.stringify(program.form.optOutResponses[0], null, 2));
    }
    if (program.form.optInResponses && program.form.optInResponses.length > 0) {
      console.log('First OptIn Response:', JSON.stringify(program.form.optInResponses[0], null, 2));
    }
    if (program.upgradeSelections && program.upgradeSelections.length > 0) {
      console.log('First Upgrade Selection:', JSON.stringify(program.upgradeSelections[0], null, 2));
    }
    console.log('=== END DEBUG ===');

    const response: ApiResponse<any> = {
      data: {
        id: program.id,
        propertyManagerName: program.propertyManagerName,
        form: {
          id: program.form.id,
          // Include both old (responses) and new (optOutResponses) for backwards compatibility
          responses: (program.form.optOutResponses || program.form.responses || []).map((r) => ({
            id: r.id,
            firstName: r.firstName,
            lastName: r.lastName,
            phoneNumber: r.phoneNumber,
            optedOutOfTenantLiabilityWaiver: r.optedOutOfTenantLiabilityWaiver,
            optedOutOfRentersKit: r.optedOutOfRentersKit,
            selectedUpgrade: r.selectedUpgrade,
            selectedUpgradePrice: r.selectedUpgradePrice,
            createdAt: r.createdAt.toISOString(),
          })),
          optOutResponses: (program.form.optOutResponses || program.form.responses || []).map((r) => ({
            id: r.id,
            firstName: r.firstName,
            lastName: r.lastName,
            phoneNumber: r.phoneNumber,
            optedOutOfTenantLiabilityWaiver: r.optedOutOfTenantLiabilityWaiver,
            optedOutOfRentersKit: r.optedOutOfRentersKit,
            selectedUpgrade: r.selectedUpgrade,
            selectedUpgradePrice: r.selectedUpgradePrice,
            createdAt: r.createdAt.toISOString(),
          })),
          optInResponses: (program.form.optInResponses || []).map((r) => ({
            id: r.id,
            firstName: r.firstName,
            lastName: r.lastName,
            phoneNumber: r.phoneNumber,
            optedInToTenantLiabilityWaiver: r.optedInToTenantLiabilityWaiver,
            optedInToRentersKit: r.optedInToRentersKit,
            createdAt: r.createdAt.toISOString(),
          })),
        },
        upgradeSelections: program.upgradeSelections.map((u) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          phoneNumber: u.phoneNumber,
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

