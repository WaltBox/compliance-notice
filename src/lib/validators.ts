/**
 * Input validation and sanitization functions
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate name (first/last name)
 */
export function validateName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 100;
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 1 && slug.length <= 100;
}

/**
 * Sanitize text input - remove dangerous characters
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return '';
  
  return text
    .trim()
    .slice(0, 5000) // Max 5000 chars
    .replace(/[<>]/g, ''); // Remove angle brackets
}

/**
 * Sanitize HTML safely - keep basic formatting tags
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return '';

  let sanitized = html.trim().slice(0, 5000);

  // Allow: <br>, <bold>, </bold>, <br/>
  // Remove: script, style, onclick, onerror, etc.
  sanitized = sanitized
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, ''); // Remove event handlers

  return sanitized;
}

/**
 * Validate opt-out response
 */
export function validateOptOutResponse(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!validateName(data.firstName)) {
    errors.push({ field: 'firstName', message: 'Invalid first name' });
  }

  if (!validateName(data.lastName)) {
    errors.push({ field: 'lastName', message: 'Invalid last name' });
  }

  if (typeof data.optedOutOfTenantLiabilityWaiver !== 'boolean') {
    errors.push({
      field: 'optedOutOfTenantLiabilityWaiver',
      message: 'Invalid value',
    });
  }

  if (typeof data.optedOutOfRentersKit !== 'boolean') {
    errors.push({ field: 'optedOutOfRentersKit', message: 'Invalid value' });
  }

  return errors;
}

/**
 * Validate upgrade selection
 */
export function validateUpgradeSelection(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!validateName(data.firstName)) {
    errors.push({ field: 'firstName', message: 'Invalid first name' });
  }

  if (!validateName(data.lastName)) {
    errors.push({ field: 'lastName', message: 'Invalid last name' });
  }

  const validUpgrades = ['upgrade_5k', 'upgrade_10k', 'upgrade_20k'];
  if (!validUpgrades.includes(data.selectedUpgrade)) {
    errors.push({ field: 'selectedUpgrade', message: 'Invalid upgrade' });
  }

  return errors;
}

/**
 * Validate program creation/update
 */
export function validateProgramData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.propertyManagerName || typeof data.propertyManagerName !== 'string') {
    errors.push({
      field: 'propertyManagerName',
      message: 'Property manager name is required',
    });
  }

  if (!validateUrl(data.insuranceVerificationUrl)) {
    errors.push({
      field: 'insuranceVerificationUrl',
      message: 'Invalid insurance verification URL',
    });
  }

  if (data.webviewUrl && !validateUrl(data.webviewUrl)) {
    errors.push({ field: 'webviewUrl', message: 'Invalid webview URL' });
  }

  if (data.noticeTitle && !validateName(data.noticeTitle)) {
    errors.push({ field: 'noticeTitle', message: 'Invalid title' });
  }

  return errors;
}

