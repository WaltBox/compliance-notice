import twilio from 'twilio';

interface SendSMSResult {
  success: boolean;
  sid?: string; // Twilio message SID
  error?: string;
}

interface SendBulkSMSResult {
  totalAttempted: number;
  successful: number;
  failed: number;
  results: Array<{
    phoneNumber: string;
    success: boolean;
    sid?: string;
    error?: string;
  }>;
}

// Initialize Twilio client
function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured');
  }

  return twilio(accountSid, authToken);
}

/**
 * Sends a single SMS message
 */
export async function sendSMS(
  phoneNumber: string,
  message: string
): Promise<SendSMSResult> {
  try {
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!twilioPhoneNumber) {
      return {
        success: false,
        error: 'Twilio phone number not configured',
      };
    }

    const client = getTwilioClient();
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    return {
      success: true,
      sid: result.sid,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send SMS',
    };
  }
}

/**
 * Sends SMS messages to multiple recipients
 * Respects rate limiting to avoid Twilio throttling
 */
export async function sendBulkSMS(
  recipients: Array<{
    phoneNumber: string;
    message: string;
  }>,
  delayMs: number = 100 // Delay between sends in milliseconds
): Promise<SendBulkSMSResult> {
  const results: SendBulkSMSResult['results'] = [];
  let successful = 0;
  let failed = 0;

  try {
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!twilioPhoneNumber) {
      return {
        totalAttempted: recipients.length,
        successful: 0,
        failed: recipients.length,
        results: recipients.map((r) => ({
          phoneNumber: r.phoneNumber,
          success: false,
          error: 'Twilio phone number not configured',
        })),
      };
    }

    const client = getTwilioClient();

    for (let i = 0; i < recipients.length; i++) {
      const { phoneNumber, message } = recipients[i];

      try {
        console.log(`[Twilio] Sending SMS to ${phoneNumber}...`);
        const result = await client.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: phoneNumber,
        });

        console.log(`[Twilio] Successfully sent to ${phoneNumber} (SID: ${result.sid}, Status: ${result.status})`);
        results.push({
          phoneNumber,
          success: true,
          sid: result.sid,
        });
        successful++;
      } catch (err) {
        console.error(`[Twilio] Failed to send to ${phoneNumber}:`, err);
        results.push({
          phoneNumber,
          success: false,
          error: err instanceof Error ? err.message : 'Failed to send SMS',
        });
        failed++;
      }

      // Add delay between sends to avoid rate limiting
      // (except after the last message)
      if (i < recipients.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  } catch (err) {
    return {
      totalAttempted: recipients.length,
      successful: 0,
      failed: recipients.length,
      results: recipients.map((r) => ({
        phoneNumber: r.phoneNumber,
        success: false,
        error: err instanceof Error ? err.message : 'Bulk send failed',
      })),
    };
  }

  return {
    totalAttempted: recipients.length,
    successful,
    failed,
    results,
  };
}

/**
 * Validates if Twilio is properly configured
 */
export function validateTwilioConfig(): { valid: boolean; error?: string } {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid) {
    return { valid: false, error: 'TWILIO_ACCOUNT_SID not configured' };
  }

  if (!authToken) {
    return { valid: false, error: 'TWILIO_AUTH_TOKEN not configured' };
  }

  if (!phoneNumber) {
    return { valid: false, error: 'TWILIO_PHONE_NUMBER not configured' };
  }

  return { valid: true };
}

