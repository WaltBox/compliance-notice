/**
 * Extract first name from "Last, First Middle" format
 * 
 * Examples:
 * "Abbey, Dakota L." → "Dakota"
 * "Abbinante, Joleen D." → "Joleen"
 * "Abu , Dennis" → "Dennis" (handles extra spaces)
 */
export function extractFirstName(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') {
    return 'there'; // Fallback if name is missing
  }
  
  // Remove extra whitespace
  const cleaned = fullName.trim();
  
  // Check if name contains comma (indicates "Last, First" format)
  if (cleaned.includes(',')) {
    // Split by comma
    const parts = cleaned.split(',');
    
    if (parts.length < 2) {
      // No first name after comma
      return parts[0].trim();
    }
    
    // Get everything after comma
    const afterComma = parts[1].trim();
    
    // Split by spaces and get first word (first name)
    const firstNameParts = afterComma.split(/\s+/);
    return firstNameParts[0];
  }
  
  // No comma - assume "First Last" format
  const parts = cleaned.split(/\s+/);
  return parts[0];
}

/**
 * Extract full name in "First Last" format (without middle initial)
 * 
 * Examples:
 * "Abbey, Dakota L." → "Dakota Abbey"
 * "Abbinante, Joleen D." → "Joleen Abbinante"
 */
export function extractFullName(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') {
    return '';
  }
  
  const cleaned = fullName.trim();
  
  if (cleaned.includes(',')) {
    const parts = cleaned.split(',');
    const lastName = parts[0].trim();
    const afterComma = parts[1].trim();
    
    // Get first name only (before any spaces/middle initial)
    const firstName = afterComma.split(/\s+/)[0];
    
    return `${firstName} ${lastName}`;
  }
  
  // Already in "First Last" format
  return cleaned;
}

