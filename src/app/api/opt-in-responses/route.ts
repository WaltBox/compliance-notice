import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { validateAndSanitizeOptInRequest } from '@/lib/validators';

export const dynamic = 'force-dynamic';

/**
 * POST /api/opt-in-responses
 * 
 * Handle opt-in form submissions from public tenants
 * - Rate limited to prevent abuse
 * - Input validated and sanitized
 * - Stores opt-in preferences in database
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const isAllowed = rateLimit(clientIP, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10,
    });
    
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate and sanitize input
    const validationResult = validateAndSanitizeOptInRequest(body);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.error || 'Invalid input' },
        { status: 400 }
      );
    }

    const {
      formId,
      firstName,
      lastName,
      phoneNumber,
      optedInToTenantLiabilityWaiver,
      optedInToRentersKit,
    } = validationResult.data;

    // Verify form exists
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { beagleProgram: true },
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Verify opt-in is enabled for at least one product
    if (!form.tenantLiabilityWaiverCanOptIn && !form.rentersKitCanOptIn) {
      return NextResponse.json(
        { error: 'Opt-in is not available for this program' },
        { status: 400 }
      );
    }

    // Verify at least one product is selected
    if (!optedInToTenantLiabilityWaiver && !optedInToRentersKit) {
      return NextResponse.json(
        { error: 'Please select at least one product' },
        { status: 400 }
      );
    }

    // Create opt-in response
    const optInResponse = await prisma.optInResponse.create({
      data: {
        formId,
        firstName,
        lastName,
        phoneNumber: phoneNumber || '(555) 000-0000',
        optedInToTenantLiabilityWaiver,
        optedInToRentersKit,
      },
    });

    return NextResponse.json(
      {
        data: optInResponse,
        message: 'Opt-in response submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting opt-in response:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit opt-in response' },
      { status: 500 }
    );
  }
}

