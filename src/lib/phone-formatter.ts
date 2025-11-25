/**
 * Phone number formatting utilities
 */

/**
 * Format a phone number string to (XXX) XXX-XXXX format
 * @param value - Raw phone number input
 * @returns Formatted phone number
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-numeric characters
  const cleaned = value.replace(/\D/g, '');
  
  // If empty, return empty
  if (!cleaned) return '';
  
  // Format based on length
  // (123) 456-7890
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
}

/**
 * Get clean phone number (digits only)
 * @param value - Formatted phone number
 * @returns Phone number with only digits
 */
export function getCleanPhoneNumber(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Check if phone number is valid (10 digits)
 * @param value - Phone number value (formatted or unformatted)
 * @returns true if valid phone number
 */
export function isValidPhoneNumber(value: string): boolean {
  const cleaned = getCleanPhoneNumber(value);
  return cleaned.length === 10;
}

