# Redis Setup Guide

## Why Redis?

When you send forms to thousands of people, they'll all submit simultaneously. Redis ensures:
- ✅ **Distributed Rate Limiting** - All your server instances share the same limits
- ✅ **Handles Thousands of Requests** - No memory leaks or bottlenecks
- ✅ **Automatic Cleanup** - Expired keys deleted automatically
- ✅ **Fast** - In-memory storage means microsecond responses

---

## Quick Setup (5 minutes)

### Step 1: Get a Redis URL

**Option A: Redis Cloud (Recommended for most users)**
1. Go to https://redis.com/cloud/
2. Sign up (free tier available)
3. Create a database
4. Copy the connection string (looks like: `redis://user:password@host:port`)

**Option B: Docker (For local/testing)**
```bash
docker run -d -p 6379:6379 redis:latest
# Redis available at: redis://localhost:6379
```

**Option C: Heroku (If you use Heroku)**
```bash
heroku addons:create heroku-redis:premium-0
heroku config:get REDIS_URL
```

### Step 2: Add to `.env.local`
```env
REDIS_URL="redis://user:password@host:port"
```

### Step 3: Restart Dev Server
```bash
# Kill current server (Ctrl+C)
npm run dev
```

You'll see in logs:
```
[Redis] ✓ Connected successfully
```

---

## How It Works

### Without Redis (Current - In-Memory Only)
```
User #1 → App Instance 1 (stores in memory)
User #2 → App Instance 2 (different memory - doesn't see User #1!)
User #3 → App Instance 1 (might get through because Instance 1 has different counter)
```
❌ **Problem:** Rate limiting doesn't work across multiple instances!

### With Redis (Distributed)
```
User #1 ─┐
User #2  ├─→ Both check the SAME Redis counter
User #3 ─┘
          → If User #1,2,3 all hit limit, they're all rate-limited
```
✅ **Solution:** All instances share the same rate limit data!

---

## Scaling Your Deployment

### Development (No Redis Needed)
- Single user testing
- Your laptop/dev machine
- In-memory rate limiting is fine

### Production (Redis Required)
- Sending to thousands of people
- Multiple server instances (Vercel Edge Functions, etc.)
- Need true distributed rate limiting

### Performance Impact
- ✅ **With Redis**: Handles 10,000+ concurrent requests
- ⚠️ **Without Redis**: Struggles at 1,000+ concurrent requests

---

## Monitoring Redis

### Check Connection Status
The app logs this on startup:
```
[Redis] ✓ Connected successfully
```

Or if Redis is down:
```
[Redis] Warning: REDIS_URL not configured. Using in-memory rate limiting (not distributed).
```

### Monitor Rate Limits (in production)
Use Redis CLI to see active limit keys:
```bash
redis-cli
> KEYS "rate-limit:*"
> GET "rate-limit:192.168.1.1"
```

### Production Alerts
Monitor for:
- Redis connection failures
- High memory usage
- Slow commands

---

## Troubleshooting

### Issue: Connection refused
```
Error: Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution:** Check Redis is running and `REDIS_URL` is correct

### Issue: Authentication failed
```
Error: WRONGPASS invalid username-password pair
```
**Solution:** Verify username/password in `REDIS_URL`

### Issue: App working but rate limiting not distributed
```
[Redis] Warning: REDIS_URL not configured
```
**Solution:** Make sure `REDIS_URL` is in your deployment environment (not just `.env.local`)

---

## When to Upgrade Redis Tier

| Metric | Action |
|--------|--------|
| < 100 req/sec | Free tier fine |
| 100-1000 req/sec | Consider paid tier ($7-15/mo) |
| > 1000 req/sec | Upgrade to dedicated instance |
| > 10,000 req/sec | Consider Redis Cluster |

---

## Cost Breakdown

| Option | Cost | Good For |
|--------|------|----------|
| Redis Cloud Free | $0 | Dev/testing |
| Redis Cloud Basic | $7-15/mo | Small to medium campaigns |
| Redis Cloud Professional | $30-100+/mo | Large campaigns |
| Self-hosted Docker | ~$0-50 (server cost) | Full control |

---

## How the Code Works

```typescript
// In your endpoints:
import { rateLimitRedis } from '@/lib/redis-rate-limit';

// Usage:
const isAllowed = await rateLimitRedis(clientIP, {
  windowMs: 15 * 60 * 1000,  // 15 minute window
  maxRequests: 10,             // 10 requests per window
});

if (!isAllowed) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

The function:
1. Connects to Redis (with automatic fallback to in-memory)
2. Gets the request counter for the IP
3. Increments it
4. Checks if it exceeds the limit
5. Returns true/false

---

## Next Steps

1. ✅ Choose a Redis provider (Redis Cloud recommended for easiest setup)
2. ✅ Get your Redis URL
3. ✅ Add to `.env.local`
4. ✅ Restart dev server
5. ✅ See `[Redis] ✓ Connected successfully` in logs
6. ✅ You're ready for production scale!

---

**Questions?** Check the `PRODUCTION_READY.md` for full deployment guide.





