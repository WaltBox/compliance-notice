import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateSlug, getDefaultPageTitle, getDefaultProgramSubheading } from '@/lib/utils';
import type { ApiResponse, CreateBeagleProgramRequest, BeagleProgramData, PaginatedApiResponse } from '@/types';

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

    const total = await prisma.beagleProgram.count();
    const programs = await prisma.beagleProgram.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    const formattedPrograms = programs.map(program => ({
      ...program,
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString(),
      selectedProducts: (program.selectedProducts as any) || [],
    })) as BeagleProgramData[];

    const response: PaginatedApiResponse<BeagleProgramData> = {
      data: formattedPrograms,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching Beagle programs:', error);
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
        selectedProducts: body.selectedProducts || [],
        isPublished: false,
      },
    });

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
    console.error('Error creating Beagle program:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

