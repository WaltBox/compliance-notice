import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimitRedis, getClientIP } from '@/lib/redis-rate-limit';
import { validateUpgradeSelection, sanitizeText } from '@/lib/validators';
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
 * Rate limited: 20 requests per 15 minutes per IP (distributed via Redis)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (distributed via Redis, falls back to in-memory)
    const clientIP = getClientIP(request);
    const isAllowed = await rateLimitRedis(clientIP, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 20,
    });

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' } as ApiResponse<null>,
        { status: 429 }
      );
    }

    const body: SubmitUpgradeRequest = await request.json();

    // Input validation
    const validationErrors = validateUpgradeSelection(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors } as ApiResponse<null>,
        { status: 400 }
      );
    }

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

    // Create the upgrade selection (with sanitized input)
    const response = await prisma.upgradeSelection.create({
      data: {
        beagleProgramId: body.beagleProgramId,
        firstName: sanitizeText(body.firstName),
        lastName: sanitizeText(body.lastName),
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

