/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate default page title from property manager name
 */
export function getDefaultPageTitle(propertyManagerName: string): string {
  return `Insurance Verification – ${propertyManagerName}`;
}

/**
 * Generate default program subheading
 */
export function getDefaultProgramSubheading(): string {
  return 'See the renter protections and services that you have access to.';
}

