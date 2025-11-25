/**
 * Redis-based rate limiter for distributed systems
 * Perfect for handling thousands of concurrent requests
 */

import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let connectionError: Error | null = null;

/**
 * Initialize Redis connection
 */
async function getRedisClient(): Promise<RedisClientType | null> {
  // If already connected, return it
  if (redisClient) {
    try {
      await redisClient.ping();
      return redisClient;
    } catch (err) {
      console.warn('[Redis] Connection lost, attempting to reconnect...');
      redisClient = null;
    }
  }

  // If Redis not configured, return null (fallback to in-memory)
  if (!process.env.REDIS_URL) {
    if (!connectionError) {
      connectionError = new Error('REDIS_URL not configured');
      console.warn('[Redis] Warning: REDIS_URL not set. Using in-memory rate limiting (not distributed).');
      console.warn('[Redis] For production, set REDIS_URL="redis://user:password@host:port"');
    }
    return null;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          const delay = Math.min(retries * 50, 500);
          return delay;
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error('[Redis] Error:', err);
      connectionError = err;
      redisClient = null;
    });

    await redisClient.connect();
    console.log('[Redis] ✓ Connected successfully');
    connectionError = null;
    return redisClient;
  } catch (err) {
    connectionError = err instanceof Error ? err : new Error(String(err));
    console.error('[Redis] Failed to connect:', connectionError.message);
    console.warn('[Redis] Falling back to in-memory rate limiting');
    return null;
  }
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

/**
 * Rate limit a request using Redis (distributed)
 * If Redis unavailable, uses in-memory fallback
 */
export async function rateLimitRedis(
  identifier: string,
  config: RateLimitConfig
): Promise<boolean> {
  const client = await getRedisClient();
  const key = `rate-limit:${identifier}`;

  try {
    if (client) {
      // Use Redis
      const count = await client.incr(key);

      if (count === 1) {
        // Set expiry for first request in window
        await client.expire(key, Math.ceil(config.windowMs / 1000));
      }

      return count <= config.maxRequests;
    } else {
      // Fallback to in-memory (not distributed, but better than nothing)
      return inMemoryRateLimit(identifier, config);
    }
  } catch (err) {
    console.error('[Redis] Rate limit error:', err);
    // Fallback to in-memory on error
    return inMemoryRateLimit(identifier, config);
  }
}

/**
 * In-memory rate limiter (fallback when Redis unavailable)
 */
const inMemoryStore: Record<string, { count: number; resetTime: number }> = {};

function inMemoryRateLimit(identifier: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const record = inMemoryStore[identifier];

  if (!record || now > record.resetTime) {
    inMemoryStore[identifier] = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    return true;
  }

  record.count++;
  return record.count <= config.maxRequests;
}

/**
 * Cleanup Redis connection (call on app shutdown)
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('[Redis] ✓ Connection closed');
      redisClient = null;
    } catch (err) {
      console.error('[Redis] Error closing connection:', err);
    }
  }
}

/**
 * Get Redis connection status
 */
export function getRedisStatus(): {
  connected: boolean;
  error: string | null;
  configured: boolean;
} {
  return {
    connected: !!redisClient,
    error: connectionError?.message || null,
    configured: !!process.env.REDIS_URL,
  };
}

