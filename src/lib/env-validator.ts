/**
 * Validate required environment variables on startup
 */

export function validateEnvironment() {
  const errors: string[] = [];

  // Required for database
  if (!process.env.DATABASE_URL) {
    errors.push('Missing DATABASE_URL environment variable');
  }

  // Required for API
  if (!process.env.NEXT_PUBLIC_API_URL) {
    errors.push('Missing NEXT_PUBLIC_API_URL environment variable');
  }

  // Required for Supabase auth
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }

  // Optional but recommended for auth verification
  if (!process.env.SUPABASE_JWT_SECRET) {
    console.warn('[Env] Warning: SUPABASE_JWT_SECRET not set. Auth verification may fail.');
  }

  // Optional but highly recommended for high-volume deployments
  if (!process.env.REDIS_URL) {
    console.warn('[Env] Warning: REDIS_URL not set. Using in-memory rate limiting (not distributed).');
    console.warn('[Env] For high-volume deployments, set REDIS_URL="redis://user:password@host:port"');
  }

  // If we're in production, be strict
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SUPABASE_JWT_SECRET) {
      errors.push('SUPABASE_JWT_SECRET is required in production');
    }
    if (!process.env.REDIS_URL) {
      console.warn('[Env] ⚠️  REDIS_URL not set in production. This may cause issues with high volume.');
    }
  }

  if (errors.length > 0) {
    console.error('[Env Validation Failed]');
    errors.forEach((err) => console.error(`  - ${err}`));
    throw new Error(`Environment validation failed: ${errors.join(', ')}`);
  }

  console.log('[Env] ✓ All required environment variables are set');
}

