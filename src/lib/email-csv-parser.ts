/**
 * CSV parser for email tenant lists
 * Supports both full property management exports and simple Tenant/Email CSVs
 */

import Papa from 'papaparse';
import { extractFirstName, extractFullName } from './tenant-parser';

export interface TenantRow {
  tenant: string;          // Full name as appears in CSV
  firstName: string;       // Extracted first name for personalization
  fullName: string;        // First Last format (no middle)
  email: string;
}

export interface InvalidRow {
  rowNum: number;
  data: string;
  reason: string;
}

export interface ParseResult {
  valid: TenantRow[];
  invalid: InvalidRow[];
  stats: {
    total: number;
    validCount: number;
    invalidCount: number;
  };
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim().toLowerCase());
}

/**
 * Find tenant/name column - flexible matching
 */
function findTenantColumn(headers: string[]): string | null {
  const variations = [
    'tenant',
    'tenant name',
    'name',
    'full name',
    'resident',
    'resident name'
  ];
  
  const lowerHeaders = headers.map(h => h.toLowerCase());
  
  for (const variation of variations) {
    const index = lowerHeaders.indexOf(variation);
    if (index !== -1) return headers[index];
  }
  
  return null;
}

/**
 * Find email column - flexible matching
 */
function findEmailColumn(headers: string[]): string | null {
  const variations = [
    'email',
    'emails',
    'email address',
    'email addresses',
    'e-mail',
    'e-mail address'
  ];
  
  const lowerHeaders = headers.map(h => h.toLowerCase());
  
  for (const variation of variations) {
    const index = lowerHeaders.indexOf(variation);
    if (index !== -1) return headers[index];
  }
  
  return null;
}

export function parseEmailCSV(csvContent: string): ParseResult {
  try {
    // Parse CSV with PapaParse
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim()
    });

    if (!parsed.data || parsed.data.length === 0) {
      throw new Error('CSV file is empty');
    }

    const headers = Object.keys(parsed.data[0] || {});
    console.log('CSV columns found:', headers);

    // Find required columns with flexible matching
    const tenantCol = findTenantColumn(headers);
    const emailCol = findEmailColumn(headers);

    if (!tenantCol || !emailCol) {
      const missing = [];
      if (!tenantCol) missing.push('name/tenant column');
      if (!emailCol) missing.push('email column');
      
      throw new Error(
        `Could not find required columns: ${missing.join(' and ')}\n\n` +
        `Found columns: ${headers.join(', ')}\n\n` +
        `Required:\n` +
        `- Name column: "Tenant", "Name", "Full Name", etc.\n` +
        `- Email column: "Email", "Emails", "Email Address", etc.`
      );
    }

    console.log('Using columns:', { 
      tenant: tenantCol, 
      email: emailCol
    });

    const valid: TenantRow[] = [];
    const invalid: InvalidRow[] = [];

    // Parse rows
    parsed.data.forEach((row: any, index: number) => {
      const tenant = row[tenantCol]?.trim();
      const email = row[emailCol]?.trim();

      // Skip empty rows or header rows
      if (!tenant || tenant === '' || tenant.toLowerCase() === 'total') {
        return;
      }

      // Check email exists
      if (!email || email === '') {
        invalid.push({
          rowNum: index + 2,
          data: `${tenant}, ${email}`,
          reason: 'No email address'
        });
        return;
      }

      // Validate email format
      if (!isValidEmail(email)) {
        invalid.push({
          rowNum: index + 2,
          data: `${tenant}, ${email}`,
          reason: 'Invalid email format'
        });
        return;
      }

      // Add to valid list
      valid.push({
        tenant,
        firstName: extractFirstName(tenant),
        fullName: extractFullName(tenant),
        email: email.toLowerCase()
      });
    });

    console.log('Parse complete:', {
      valid: valid.length,
      invalid: invalid.length,
      sampleValid: valid.slice(0, 3)
    });

    return {
      valid,
      invalid,
      stats: {
        total: valid.length + invalid.length,
        validCount: valid.length,
        invalidCount: invalid.length
      }
    };
  } catch (error: any) {
    console.error('CSV parse error:', error);
    throw error;
  }
}


