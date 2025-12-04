import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/auth';

interface DailyCountResponse {
  success: boolean;
  totalMessagesSentToday?: number;
  successfulToday?: number;
  failedToday?: number;
  dailyLimit?: number;
  remainingQuota?: number;
  error?: string;
}

// Daily SMS limit (can be adjusted based on Twilio plan)
const DAILY_SMS_LIMIT = 1000;

export async function GET(
  request: NextRequest
): Promise<NextResponse<DailyCountResponse>> {
  try {
    // Verify authentication
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as DailyCountResponse,
        { status: 401 }
      );
    }

    // Get today's date (start of day UTC)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // Get tomorrow's date (start of day UTC)
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

    // Query campaigns created today
    const todaysCampaigns = await prisma.smsCampaignLog.findMany({
      where: {
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    });

    // Calculate totals
    const totalMessagesSentToday = todaysCampaigns.reduce(
      (sum, campaign) => sum + campaign.totalRecipients,
      0
    );

    const successfulToday = todaysCampaigns.reduce(
      (sum, campaign) => sum + campaign.successfulSends,
      0
    );

    const failedToday = todaysCampaigns.reduce(
      (sum, campaign) => sum + campaign.failedSends,
      0
    );

    const remainingQuota = Math.max(0, DAILY_SMS_LIMIT - totalMessagesSentToday);

    return NextResponse.json(
      {
        success: true,
        totalMessagesSentToday,
        successfulToday,
        failedToday,
        dailyLimit: DAILY_SMS_LIMIT,
        remainingQuota,
      } as DailyCountResponse,
      { status: 200 }
    );
  } catch (err) {
    console.error('Daily count error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch daily count',
      } as DailyCountResponse,
      { status: 500 }
    );
  }
}

