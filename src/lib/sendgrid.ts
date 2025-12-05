/**
 * SendGrid email service integration
 */

import sgMail from '@sendgrid/mail';

const API_KEY = process.env.SENDGRID_API_KEY;

if (API_KEY) {
  sgMail.setApiKey(API_KEY);
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  propertyManagementName?: string; // Optional PM name for email from header
}

export async function sendEmail({ 
  to, 
  subject, 
  html, 
  text, 
  propertyManagementName 
}: SendEmailParams) {
  try {
    if (!API_KEY) {
      console.error('SENDGRID_API_KEY not configured');
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    await sgMail.send({
      to,
      from: {
        email: 'noreply@beaglenotice.com',
        name: propertyManagementName || 'Beagle Coverage Verification',
      },
      subject,
      html,
      text,
    });

    return { success: true };
  } catch (error: any) {
    console.error('SendGrid error:', error.response?.body || error);
    return {
      success: false,
      error:
        error.response?.body?.errors?.[0]?.message ||
        error.message ||
        'Failed to send email',
    };
  }
}

