/**
 * Simple in-memory rate limiter for production use
 * For high-traffic production, use Redis-based rate limiter
 */

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

/**
 * Rate limit a request by IP or identifier
 * Returns true if within limit, false if exceeded
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): boolean {
  const now = Date.now();
  const record = store[identifier];

  // If no record or window has expired, create new record
  if (!record || now > record.resetTime) {
    store[identifier] = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    return true;
  }

  // Within window - increment counter
  record.count++;

  // Check if exceeded limit
  if (record.count > config.maxRequests) {
    return false;
  }

  return true;
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

/**
 * Clean up old records periodically
 * Call this occasionally to prevent memory bloat
 */
export function cleanupExpiredRecords() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of Object.entries(store)) {
    if (now > value.resetTime) {
      delete store[key];
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Rate Limit] Cleaned up ${cleaned} expired records`);
  }
}

// Clean up every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredRecords, 5 * 60 * 1000);
}








