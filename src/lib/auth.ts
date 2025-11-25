import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify admin JWT token from request headers
 * @param request NextRequest with Authorization header
 * @returns Admin user data or null if invalid
 */
export async function verifyAdminAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.slice(7);

    // Verify token with Supabase
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return user;
  } catch (err) {
    console.error('Auth verification failed:', err);
    return null;
  }
}

/**
 * Check if user is authenticated from localStorage token
 * Used in client components
 */
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
}

/**
 * Set admin token in localStorage
 */
export function setAdminToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('adminToken', token);
}

/**
 * Clear admin token from localStorage
 */
export function clearAdminToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('adminToken');
}

/**
 * Check if token is expired (simple check - doesn't verify signature)
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}


