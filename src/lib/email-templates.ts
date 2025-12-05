/**
 * Email template for insurance notices
 */

export interface NoticeEmailParams {
  tenantFirstName: string;
  customMessage: string;
  linkUrl: string;
  linkText: string;
  propertyManagementName?: string;
  partnerLogoUrl?: string;
}

export function insuranceNoticeTemplate({
  tenantFirstName,
  customMessage,
  linkUrl,
  linkText,
  propertyManagementName,
  partnerLogoUrl,
}: NoticeEmailParams): string {
  const showPartnerLogo = partnerLogoUrl && partnerLogoUrl.trim();
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .beagle-orange { color: #FF7A00; }
    .beagle-dark { color: #1a1a1a; }
    @media (max-width: 600px) {
      .container { width: 100% !important; padding: 0 20px !important; }
      .header-padding { padding: 20px 20px 16px 20px !important; }
      .content-padding { padding: 24px 20px !important; }
      .footer-padding { padding: 16px 20px !important; }
      .logo-img { height: 32px !important; }
      .partner-logo { height: 32px !important; }
      .divider { margin: 0 12px !important; }
      .button { padding: 14px 32px !important; font-size: 15px !important; }
      .message-text { font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Container -->
        <table width="560" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); max-width: 100%;" class="container">
          
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 32px 40px 24px 40px; border-bottom: 2px solid #FF7A00; text-align: center;" class="header-padding">
              <img src="https://www.beaglenotice.com/images/beagle-logo.png" alt="Beagle" style="height: 40px; display: inline-block; margin-right: ${showPartnerLogo ? '12px' : '0'};${showPartnerLogo ? ' vertical-align: middle;' : ''}" class="logo-img">
              ${showPartnerLogo ? `<span style="color: #d1d5db; margin: 0 8px; vertical-align: middle;" class="divider">|</span><img src="${partnerLogoUrl}" alt="Partner Logo" style="height: 40px; display: inline-block; margin-left: 8px; vertical-align: middle;" class="partner-logo">` : ''}
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px;" class="content-padding">
              
              <!-- Greeting -->
              <p style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 14px; line-height: 1.4; font-weight: 500; letter-spacing: 0.5px;">
                Hi ${tenantFirstName},
              </p>
              
              <!-- Custom Message -->
              <p style="margin: 0 0 32px 0; color: #4a4a4a; font-size: 15px; line-height: 1.7; white-space: pre-line;" class="message-text">
${customMessage}
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${linkUrl}" style="background-color: #FF7A00; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; letter-spacing: 0.3px; transition: all 0.2s ease;" class="button">
                      ${linkText}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px; line-height: 1.5; text-align: center;">
                Or copy and paste this link in your browser:<br/>
                <span style="color: #FF7A00; word-break: break-all;">${linkUrl}</span>
              </p>

              <!-- Email Signature -->
              <p style="margin: 32px 0 0 0; color: #4a4a4a; font-size: 14px; line-height: 1.6; text-align: left;">
                Sincerely,<br/>
                ${propertyManagementName || 'Your Property Manager'}
              </p>
              
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="height: 1px; background-color: #e5e7eb;"></td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;" class="footer-padding">
              <div style="margin-bottom: 16px;">
                <img src="https://www.beaglenotice.com/images/beagledog.png" alt="Beagle Dog" style="height: 32px; display: inline-block;" class="logo-img">
              </div>
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 12px; line-height: 1.5; font-weight: 500;">
                Beagle Labs, LLC
              </p>
              ${propertyManagementName ? `<p style="margin: 0 0 12px 0; color: #FF7A00; font-size: 12px; line-height: 1.5; font-weight: 600;">${propertyManagementName}</p>` : ''}
              <p style="margin: 0; color: #9ca3af; font-size: 11px; line-height: 1.6;">
                Questions? Reach out to Beagle customer support at jack@beagleforpm.com
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}

export function createPlainTextEmail({
  tenantFirstName,
  customMessage,
  linkUrl,
  propertyManagementName,
}: {
  tenantFirstName: string;
  customMessage: string;
  linkUrl: string;
  propertyManagementName?: string;
}): string {
  return `Hi ${tenantFirstName},

${customMessage}

${linkUrl}

Sincerely,
${propertyManagementName || 'Your Property Manager'}

Questions? Reach out to Beagle customer support at jack@beagleforpm.com`;
}

export const DEFAULT_MESSAGES = {
  complianceNotice:
    "Your lease requires renters insurance, and you don't have a policy on file. You have been automatically enrolled in Beagle coverage, submit your own policy from the link below to unenroll.",

  optOut:
    "Hi! We are offering optional coverage through Beagle.\n\nThis coverage has been set up for you automatically, but you can opt out at any time.\n\nPlease follow the link below if you wish to learn more or opt-out of the program.",

  optIn:
    "Your property manager has partnered with Beagle to offer convenient renters insurance coverage. Click below to learn more or enroll.",
};

