import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimitRedis, getClientIP } from '@/lib/redis-rate-limit';
import { validateOptOutResponse, sanitizeText } from '@/lib/validators';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

interface SubmitOptOutRequest {
  formId: string;
  firstName: string;
  lastName: string;
  optedOutOfTenantLiabilityWaiver: boolean;
  optedOutOfRentersKit: boolean;
  selectedUpgrade?: 'upgrade_5k' | 'upgrade_10k' | 'upgrade_20k' | null;
  selectedUpgradePrice?: string;
}

/**
 * POST /api/opt-out-responses
 * Tenant endpoint - submit opt-out response
 * Rate limited: 10 requests per 15 minutes per IP (distributed via Redis)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (distributed via Redis, falls back to in-memory)
    const clientIP = getClientIP(request);
    const isAllowed = await rateLimitRedis(clientIP, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 10,
    });

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' } as ApiResponse<null>,
        { status: 429 }
      );
    }

    const body: SubmitOptOutRequest = await request.json();

    // Input validation
    const validationErrors = validateOptOutResponse(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.formId || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: formId, firstName, lastName' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate that at least one product is selected
    if (!body.optedOutOfTenantLiabilityWaiver && !body.optedOutOfRentersKit) {
      return NextResponse.json(
        { error: 'Must opt out of at least one product' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Verify the form exists
    const form = await prisma.form.findUnique({
      where: { id: body.formId },
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Create the opt-out response (with sanitized input)
    const response = await prisma.optOutResponse.create({
      data: {
        formId: body.formId,
        firstName: sanitizeText(body.firstName),
        lastName: sanitizeText(body.lastName),
        optedOutOfTenantLiabilityWaiver: body.optedOutOfTenantLiabilityWaiver,
        optedOutOfRentersKit: body.optedOutOfRentersKit,
        selectedUpgrade: body.selectedUpgrade || null,
        selectedUpgradePrice: body.selectedUpgradePrice || null,
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
    console.error('Error submitting opt-out response:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

