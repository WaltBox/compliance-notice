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
 * Validate opt-in response
 */
export function validateOptInResponse(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!validateName(data.firstName)) {
    errors.push({ field: 'firstName', message: 'Invalid first name' });
  }

  if (!validateName(data.lastName)) {
    errors.push({ field: 'lastName', message: 'Invalid last name' });
  }

  if (typeof data.optedInToTenantLiabilityWaiver !== 'boolean') {
    errors.push({
      field: 'optedInToTenantLiabilityWaiver',
      message: 'Invalid value',
    });
  }

  if (typeof data.optedInToRentersKit !== 'boolean') {
    errors.push({ field: 'optedInToRentersKit', message: 'Invalid value' });
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

/**
 * Validate and sanitize opt-out request
 */
export function validateAndSanitizeOptOutRequest(data: any): {
  valid: boolean;
  error?: string;
  data?: {
    formId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    optedOutOfTenantLiabilityWaiver: boolean;
    optedOutOfRentersKit: boolean;
  };
} {
  if (!data.formId || typeof data.formId !== 'string') {
    return { valid: false, error: 'Invalid form ID' };
  }

  const errors = validateOptOutResponse(data);
  if (errors.length > 0) {
    return { valid: false, error: errors[0].message };
  }

  // Phone number is required
  if (!data.phoneNumber || typeof data.phoneNumber !== 'string' || !data.phoneNumber.trim()) {
    return { valid: false, error: 'Phone number is required' };
  }

  return {
    valid: true,
    data: {
      formId: data.formId.trim(),
      firstName: sanitizeText(data.firstName),
      lastName: sanitizeText(data.lastName),
      phoneNumber: sanitizeText(data.phoneNumber),
      optedOutOfTenantLiabilityWaiver: Boolean(data.optedOutOfTenantLiabilityWaiver),
      optedOutOfRentersKit: Boolean(data.optedOutOfRentersKit),
    },
  };
}

/**
 * Validate and sanitize opt-in request
 */
export function validateAndSanitizeOptInRequest(data: any): {
  valid: boolean;
  error?: string;
  data?: {
    formId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    optedInToTenantLiabilityWaiver: boolean;
    optedInToRentersKit: boolean;
  };
} {
  if (!data.formId || typeof data.formId !== 'string') {
    return { valid: false, error: 'Invalid form ID' };
  }

  const errors = validateOptInResponse(data);
  if (errors.length > 0) {
    return { valid: false, error: errors[0].message };
  }

  // Phone number is required
  if (!data.phoneNumber || typeof data.phoneNumber !== 'string' || !data.phoneNumber.trim()) {
    return { valid: false, error: 'Phone number is required' };
  }

  return {
    valid: true,
    data: {
      formId: data.formId.trim(),
      firstName: sanitizeText(data.firstName),
      lastName: sanitizeText(data.lastName),
      phoneNumber: sanitizeText(data.phoneNumber),
      optedInToTenantLiabilityWaiver: Boolean(data.optedInToTenantLiabilityWaiver),
      optedInToRentersKit: Boolean(data.optedInToRentersKit),
    },
  };
}

/**
 * Validate and sanitize upgrade selection request
 */
export function validateAndSanitizeUpgradeRequest(data: any): {
  valid: boolean;
  error?: string;
  data?: {
    beagleProgramId: string;
    firstName: string;
    lastName: string;
    selectedUpgrade: string;
    selectedUpgradePrice: string;
  };
} {
  if (!data.beagleProgramId || typeof data.beagleProgramId !== 'string') {
    return { valid: false, error: 'Invalid program ID' };
  }

  const errors = validateUpgradeSelection(data);
  if (errors.length > 0) {
    return { valid: false, error: errors[0].message };
  }

  return {
    valid: true,
    data: {
      beagleProgramId: data.beagleProgramId.trim(),
      firstName: sanitizeText(data.firstName),
      lastName: sanitizeText(data.lastName),
      selectedUpgrade: data.selectedUpgrade,
      selectedUpgradePrice: sanitizeText(data.selectedUpgradePrice || ''),
    },
  };
}

