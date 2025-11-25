import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateSlug, getDefaultPageTitle, getDefaultProgramSubheading } from '@/lib/utils';
import type { ApiResponse, CreateBeagleProgramRequest, BeagleProgramData, PaginatedApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/beagle-programs
 * Admin endpoint - returns paginated list of programs
 * @query page - page number (default: 1)
 * @query pageSize - page size (default: 10, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // if (!await verifyAdminSession(request)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') || '10'));
    const search = searchParams.get('search') || '';

    // Build filter for search
    const where = search.trim() 
      ? {
          OR: [
            { propertyManagerName: { contains: search, mode: 'insensitive' as const } },
            { propertyManagerSlug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const total = await prisma.beagleProgram.count({ where });
    const programs = await prisma.beagleProgram.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        form: {
          include: {
            responses: true,
          },
        },
        upgradeSelections: true,
      },
    });

    const formattedPrograms = programs.map(program => {
      // Count total responses (opt-outs + upgrades)
      const optOutCount = program.form?.responses?.length || 0;
      const upgradeCount = program.upgradeSelections?.length || 0;
      const responseCount = optOutCount + upgradeCount;

      return {
        ...program,
        createdAt: program.createdAt.toISOString(),
        updatedAt: program.updatedAt.toISOString(),
        selectedProducts: (program.selectedProducts as any) || [],
        responseCount,
      };
    }) as BeagleProgramData[];

    const response: PaginatedApiResponse<BeagleProgramData> = {
      data: formattedPrograms,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching beagle notices:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/beagle-programs
 * Admin endpoint - create a new program
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    const body: CreateBeagleProgramRequest = await request.json();

    // Validate required fields
    if (!body.propertyManagerName || !body.insuranceVerificationUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: propertyManagerName, insuranceVerificationUrl' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = body.propertyManagerSlug || generateSlug(body.propertyManagerName);

    // Check if slug already exists
    const existing = await prisma.beagleProgram.findUnique({
      where: { propertyManagerSlug: slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Program with slug "${slug}" already exists` } as ApiResponse<null>,
        { status: 409 }
      );
    }

    const program = await prisma.beagleProgram.create({
      data: {
        propertyManagerName: body.propertyManagerName,
        propertyManagerSlug: slug,
        insuranceVerificationUrl: body.insuranceVerificationUrl,
        webviewUrl: body.webviewUrl || null,
        selectedProducts: JSON.parse(JSON.stringify(body.selectedProducts || [])),
        isPublished: false,
        noticeTitle: body.noticeTitle || null,
        noticeIntroText: body.noticeIntroText || null,
        noticeInsuranceText: body.noticeInsuranceText || null,
        insuranceNotRequired: body.insuranceNotRequired || false,
      },
    });

    // Create form with opt-out configuration if provided
    if (body.form) {
      await prisma.form.create({
        data: {
          beagleProgramId: program.id,
          tenantLiabilityWaiverCanOptOut: body.form.tenantLiabilityWaiverCanOptOut || false,
          rentersKitCanOptOut: body.form.rentersKitCanOptOut || false,
        },
      });
    }

    const response: ApiResponse<BeagleProgramData> = {
      data: {
        ...program,
        createdAt: program.createdAt.toISOString(),
        updatedAt: program.updatedAt.toISOString(),
        selectedProducts: (program.selectedProducts as any) || [],
      } as BeagleProgramData,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating beagle notice:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

