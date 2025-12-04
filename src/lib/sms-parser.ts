import Papa from 'papaparse';

export interface ParsedTenant {
  firstName: string;
  lastName: string;
  phoneNumber: string; // formatted as E.164: +14155552671
  email?: string;
}

/**
 * Extracts phone number and returns it in E.164 format (+1XXXXXXXXXX)
 * Assumes North American numbers if no country code is provided
 */
export function formatPhoneForTwilio(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // If it's 10 digits, assume US/Canada and prepend +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // If it's 11 digits and starts with 1, use as-is with +
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }

  // If it already has country code (11+ digits)
  if (cleaned.length >= 11) {
    return `+${cleaned}`;
  }

  throw new Error(`Invalid phone number format: ${phoneNumber}`);
}

/**
 * Extracts just the digits from a phone number
 */
export function getCleanPhoneNumber(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Main CSV parser - handles multiple CSV formats
 * Supports:
 * - Standard: First Name, Last Name, Phone Number
 * - With Email: First Name, Last Name, Phone Number, Email
 * - Flexible headers: case-insensitive, handles variations like "Phone", "Phone Number", "Mobile", etc.
 */
export function parseTenantCSV(csvContent: string): {
  success: boolean;
  data?: ParsedTenant[];
  error?: string;
  rowCount?: number;
} {
  try {
    const results = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim().toLowerCase(),
    });

    if (results.errors.length > 0) {
      return {
        success: false,
        error: `CSV parsing error: ${results.errors[0].message}`,
      };
    }

    if (!results.data || results.data.length === 0) {
      return {
        success: false,
        error: 'No data found in CSV',
      };
    }

    const parsedTenants: ParsedTenant[] = [];
    const errors: string[] = [];

    results.data.forEach((row, index) => {
      try {
        // Find the columns - handle various naming conventions
        const firstNameCol = Object.keys(row).find(
          (key) =>
            key.includes('first') && (key.includes('name') || key === 'first')
        );
        const lastNameCol = Object.keys(row).find(
          (key) =>
            key.includes('last') && (key.includes('name') || key === 'last')
        );
        const phoneCol = Object.keys(row).find((key) =>
          /^(phone|mobile|number|phone number|phone number \(mobile\))$/.test(key)
        );
        const emailCol = Object.keys(row).find((key) =>
          /^(email|e-mail|email address)$/.test(key)
        );

        const firstName = firstNameCol ? row[firstNameCol]?.trim() : '';
        const lastName = lastNameCol ? row[lastNameCol]?.trim() : '';
        const phoneNumber = phoneCol ? row[phoneCol]?.trim() : '';
        const email = emailCol ? row[emailCol]?.trim() : undefined;

        // Validate required fields
        if (!firstName || !lastName) {
          errors.push(
            `Row ${index + 2}: Missing first or last name`
          );
          return;
        }

        if (!phoneNumber) {
          errors.push(`Row ${index + 2}: Missing phone number`);
          return;
        }

        // Format phone number
        let formattedPhone: string;
        try {
          formattedPhone = formatPhoneForTwilio(phoneNumber);
        } catch (err) {
          errors.push(
            `Row ${index + 2}: Invalid phone number format (${phoneNumber})`
          );
          return;
        }

        parsedTenants.push({
          firstName,
          lastName,
          phoneNumber: formattedPhone,
          email,
        });
      } catch (err) {
        errors.push(`Row ${index + 2}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    });

    if (parsedTenants.length === 0) {
      return {
        success: false,
        error: errors.join('\n'),
      };
    }

    // If we have some errors but also some valid data, include a warning
    if (errors.length > 0) {
      console.warn('CSV parsing warnings:', errors.join('\n'));
    }

    return {
      success: true,
      data: parsedTenants,
      rowCount: parsedTenants.length,
    };
  } catch (err) {
    return {
      success: false,
      error: `Failed to parse CSV: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

/**
 * Personalizes a message template with tenant data
 * Supports: {{firstName}}, {{lastName}}, {{fullName}}
 */
export function personalizeMessage(
  template: string,
  tenant: ParsedTenant
): string {
  return template
    .replace(/\{\{firstName\}\}/g, tenant.firstName)
    .replace(/\{\{lastName\}\}/g, tenant.lastName)
    .replace(/\{\{fullName\}\}/g, `${tenant.firstName} ${tenant.lastName}`);
}

/**
 * Validates if a message is within SMS character limits (160 chars for standard SMS)
 * Returns true if valid, false if it would require multiple segments
 */
export function validateMessageLength(message: string): {
  valid: boolean;
  charCount: number;
  segmentCount: number;
} {
  const charCount = message.length;
  // SMS segments: 160 chars per segment for standard text, 153 for multi-segment
  const segmentCount = charCount <= 160 ? 1 : Math.ceil(charCount / 153);

  return {
    valid: charCount <= 160,
    charCount,
    segmentCount,
  };
}



