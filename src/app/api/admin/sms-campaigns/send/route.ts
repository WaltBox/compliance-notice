import { NextRequest, NextResponse } from 'next/server';
import { parseTenantCSV, personalizeMessage, validateMessageLength } from '@/lib/sms-parser';
import { sendBulkSMS, validateTwilioConfig } from '@/lib/twilio';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/auth';

interface SendCampaignRequest {
  csvContent: string; // Raw CSV content
  messageTemplate: string; // Template with {{firstName}}, {{lastName}}, {{fullName}}
}

interface SendCampaignResponse {
  success: boolean;
  message?: string;
  totalAttempted?: number;
  successful?: number;
  failed?: number;
  details?: Array<{
    phoneNumber: string;
    success: boolean;
    error?: string;
  }>;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SendCampaignResponse>> {
  try {
    // Verify authentication
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as SendCampaignResponse,
        { status: 401 }
      );
    }

    // Validate Twilio configuration
    const twilioCheck = validateTwilioConfig();
    if (!twilioCheck.valid) {
      return NextResponse.json(
        { success: false, error: twilioCheck.error } as SendCampaignResponse,
        { status: 500 }
      );
    }

    const body: SendCampaignRequest = await request.json();

    // Validate inputs
    if (!body.csvContent || typeof body.csvContent !== 'string') {
      return NextResponse.json(
        { success: false, error: 'CSV content is required' } as SendCampaignResponse,
        { status: 400 }
      );
    }

    if (!body.messageTemplate || typeof body.messageTemplate !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message template is required' } as SendCampaignResponse,
        { status: 400 }
      );
    }

    // Parse CSV
    const parseResult = parseTenantCSV(body.csvContent);
    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json(
        { success: false, error: parseResult.error } as SendCampaignResponse,
        { status: 400 }
      );
    }

    // Personalize messages for each tenant
    const recipients = parseResult.data.map((tenant) => ({
      phoneNumber: tenant.phoneNumber,
      message: personalizeMessage(body.messageTemplate, tenant),
    }));

    // Send SMS via Twilio
    const sendResult = await sendBulkSMS(recipients);

    // Extract admin email from verified user
    const adminEmail = admin.email || 'admin';

    // Log campaign to database (optional)
    try {
      await prisma.smsCampaignLog.create({
        data: {
          adminEmail,
          totalRecipients: sendResult.totalAttempted,
          successfulSends: sendResult.successful,
          failedSends: sendResult.failed,
          messagePreview: body.messageTemplate.substring(0, 100),
          status: sendResult.failed === 0 ? 'completed' : 'partial',
        },
      });
    } catch (err) {
      console.error('Failed to log campaign:', err);
      // Don't fail the response if logging fails
    }

    return NextResponse.json(
      {
        success: sendResult.failed === 0,
        message: `Sent ${sendResult.successful} of ${sendResult.totalAttempted} messages`,
        totalAttempted: sendResult.totalAttempted,
        successful: sendResult.successful,
        failed: sendResult.failed,
        details: sendResult.results,
      } as SendCampaignResponse,
      { status: 200 }
    );
  } catch (err) {
    console.error('SMS campaign send error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to send campaign',
      } as SendCampaignResponse,
      { status: 500 }
    );
  }
}

