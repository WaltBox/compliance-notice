/**
 * POST /api/admin/send-notices
 * Send insurance notices via email to tenants
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';
import { sendEmail } from '@/lib/sendgrid';
import {
  insuranceNoticeTemplate,
  createPlainTextEmail,
} from '@/lib/email-templates';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface TenantEmail {
  tenant: string;
  firstName?: string;  // Optional, will be extracted if not provided
  email: string;
  property?: string;
  unit?: string;
}

interface SendNoticesRequest {
  tenants: TenantEmail[];
  config: {
    subject: string;
    customMessage: string;
    linkUrl: string;
    linkText: string;
    propertyManagementName?: string;
    partnerLogoUrl?: string;
  };
}

interface EmailResult {
  tenant: string;
  email: string;
  success: boolean;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: SendNoticesRequest = await request.json();

    // Validate request
    if (!body.tenants || !Array.isArray(body.tenants) || body.tenants.length === 0) {
      return NextResponse.json(
        { error: 'No tenants provided' },
        { status: 400 }
      );
    }

    if (!body.config?.customMessage || !body.config?.linkUrl) {
      return NextResponse.json(
        { error: 'Custom message and link URL required' },
        { status: 400 }
      );
    }

    // Create campaign log entry
    const campaignId = `campaign_${Date.now()}`;
    const campaign = await prisma.emailCampaignLog.create({
      data: {
        campaignId,
        subject: body.config.subject || 'Action Required: Renters Insurance',
        messagePreview: body.config.customMessage.substring(0, 100),
        totalRecipients: body.tenants.length,
        successfulSends: 0,
        failedSends: 0,
      },
    });

    const results: EmailResult[] = [];
    let successCount = 0;
    let failedCount = 0;

    // Send emails
    for (const tenant of body.tenants) {
      if (!tenant.email) {
        results.push({
          tenant: tenant.tenant,
          email: '',
          success: false,
          error: 'No email address',
        });
        failedCount++;

        // Log failed email to database
        await prisma.emailRecipient.create({
          data: {
            campaignId: campaign.id,
            tenantName: tenant.tenant,
            firstName: tenant.firstName || extractFirstName(tenant.tenant),
            email: '',
            status: 'failed',
            error: 'No email address',
            property: tenant.property,
            unit: tenant.unit,
          },
        });

        continue;
      }

      try {
        const firstName = tenant.firstName || extractFirstName(tenant.tenant);

        const html = insuranceNoticeTemplate({
          tenantFirstName: firstName,
          customMessage: body.config.customMessage,
          linkUrl: body.config.linkUrl,
          linkText: body.config.linkText || 'Get Renters Insurance',
          propertyManagementName: body.config.propertyManagementName,
          partnerLogoUrl: body.config.partnerLogoUrl,
        });

        const text = createPlainTextEmail({
          tenantFirstName: firstName,
          customMessage: body.config.customMessage,
          linkUrl: body.config.linkUrl,
          propertyManagementName: body.config.propertyManagementName,
        });

        const result = await sendEmail({
          to: tenant.email,
          subject: body.config.subject || 'Action Required: Renters Insurance',
          html,
          text,
          propertyManagementName: body.config.propertyManagementName,
        });

        if (result.success) {
          results.push({
            tenant: tenant.tenant,
            email: tenant.email,
            success: true,
          });
          successCount++;

          // Log successful email to database
          await prisma.emailRecipient.create({
            data: {
              campaignId: campaign.id,
              tenantName: tenant.tenant,
              firstName,
              email: tenant.email,
              status: 'sent',
              property: tenant.property,
              unit: tenant.unit,
            },
          });
        } else {
          results.push({
            tenant: tenant.tenant,
            email: tenant.email,
            success: false,
            error: result.error,
          });
          failedCount++;

          // Log failed email to database
          await prisma.emailRecipient.create({
            data: {
              campaignId: campaign.id,
              tenantName: tenant.tenant,
              firstName,
              email: tenant.email,
              status: 'failed',
              error: result.error,
              property: tenant.property,
              unit: tenant.unit,
            },
          });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          tenant: tenant.tenant,
          email: tenant.email,
          success: false,
          error: errorMsg,
        });
        failedCount++;

        // Log failed email to database
        await prisma.emailRecipient.create({
          data: {
            campaignId: campaign.id,
            tenantName: tenant.tenant,
            firstName: tenant.firstName || extractFirstName(tenant.tenant),
            email: tenant.email,
            status: 'failed',
            error: errorMsg,
            property: tenant.property,
            unit: tenant.unit,
          },
        });
      }

      // Rate limit: 10/second (100ms per email)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Update campaign log with final counts
    await prisma.emailCampaignLog.update({
      where: { id: campaign.id },
      data: {
        successfulSends: successCount,
        failedSends: failedCount,
      },
    });

    return NextResponse.json({
      success: true,
      campaignId,
      total: body.tenants.length,
      successful: successCount,
      failed: failedCount,
      results,
    });
  } catch (error) {
    console.error('Send notices error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

function extractFirstName(fullName: string): string {
  // Handle "LastName, FirstName" format
  if (fullName.includes(',')) {
    const parts = fullName.split(',');
    return parts[1].trim().split(/\s+/)[0];
  }
  // Handle "FirstName LastName" format
  return fullName.trim().split(/\s+/)[0];
}

