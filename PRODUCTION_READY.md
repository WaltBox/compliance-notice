# Production Deployment Checklist ✅

**Status: Ready for Production** 🚀

This document outlines all production-ready features and deployment requirements.

---

## ✅ Security Features Implemented

### Scalability & Rate Limiting
- ✅ **Redis-based distributed rate limiting** (handles thousands of concurrent requests)
  - Falls back to in-memory if Redis unavailable
  - `/api/opt-out-responses` - 10 req/15 min per IP
  - `/api/upgrade-selections` - 20 req/15 min per IP
- ✅ Automatic reconnection with exponential backoff
- ✅ Connection health monitoring

### Authentication & Authorization
- ✅ Supabase JWT authentication for admin login
- ✅ Token stored securely in localStorage
- ✅ Token validation on every admin request
- ✅ Automatic redirect to login on 401/invalid token
- ✅ Logout functionality clears token
- ✅ Row Level Security (RLS) policies on database
- ✅ Admin-only API endpoints protected

### Input Validation & Sanitization
- ✅ Email validation
- ✅ URL validation
- ✅ Name/text validation (length, format)
- ✅ Input sanitization (removes HTML tags, limits length)
- ✅ HTML sanitization for notice text (preserves <br>, <bold> tags)
- ✅ Form data validation before database insert

### Rate Limiting
- ✅ Public endpoints rate-limited per IP
  - `/api/opt-out-responses` - 10 req/15 min per IP
  - `/api/upgrade-selections` - 20 req/15 min per IP
- ✅ Automatic cleanup of expired rate-limit records
- ✅ 429 (Too Many Requests) response when limit exceeded

### Security Headers
- ✅ X-Frame-Options: DENY (prevent clickjacking)
- ✅ X-Content-Type-Options: nosniff (prevent MIME sniffing)
- ✅ X-XSS-Protection: 1; mode=block (XSS protection)
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy (disable geolocation, microphone, camera)

### Environment Validation
- ✅ Required env vars validated on startup
- ✅ Errors logged if missing critical variables
- ✅ Prevents app from starting with incomplete config

---

## 📋 Environment Variables Required

### Required for All Environments
```env
DATABASE_URL="postgresql://user:pass@host:5432/database"
NEXT_PUBLIC_API_URL="https://yourdomain.com"  # or http://localhost:3000 for dev
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### Required for Production Only
```env
SUPABASE_JWT_SECRET="your-jwt-secret"
NODE_ENV="production"
```

### Highly Recommended for High-Volume Deployments
```env
REDIS_URL="redis://username:password@host:port"
# Or for Redis Cloud: redis://:password@hostname:port
# Works with: Redis Cloud, AWS ElastiCache, Heroku Redis, self-hosted
```

### Optional (for monitoring/logging)
```env
SENTRY_DSN="https://..."  # For error tracking
LOG_LEVEL="info"
```

---

## 🚀 Redis Setup (for High Volume)

### Option 1: Redis Cloud (Easiest, ~$7-15/mo)
1. Go to https://redis.com/cloud/
2. Create free account
3. Create database
4. Copy connection URL
5. Set `REDIS_URL` in your environment

### Option 2: AWS ElastiCache
1. Create Redis cluster in AWS
2. Enable encryption and automatic failover
3. Copy endpoint
4. Set `REDIS_URL="redis://password@endpoint:6379"`

### Option 3: Self-Hosted
```bash
# Docker
docker run -d -p 6379:6379 redis:latest

# Or using Docker Compose
echo 'version: "3"
services:
  redis:
    image: redis:latest
    ports:
      - "6379:6379"' > docker-compose.yml
docker-compose up -d
```

Set `REDIS_URL="redis://localhost:6379"`

---

## 🚀 Deployment Steps

### 1. Pre-Deployment
- [ ] All env vars set in your deployment platform
- [ ] Database backups configured
- [ ] SSL certificate configured
- [ ] CORS origins whitelisted
- [ ] Rate limiting verified working

### 2. Build & Test
```bash
npm run build
npm start
```

### 3. Health Checks
- [ ] Home page loads: `GET /`
- [ ] Public program page loads: `GET /programs/[slug]`
- [ ] Admin login page loads: `GET /admin/login`
- [ ] Login works with correct credentials
- [ ] Admin can create/edit programs
- [ ] Public can submit responses
- [ ] Rate limiting works (test with rapid requests)

### 4. Post-Deployment
- [ ] Monitor error logs
- [ ] Check rate limit stats
- [ ] Verify no console errors in browser DevTools
- [ ] Test on mobile devices
- [ ] Verify SSL certificate is valid
- [ ] Test on different browsers

---

## 🔒 Security Best Practices

### Database (Supabase)
- ✅ RLS policies enabled on all tables
- ✅ Public can only read published programs
- ✅ Admins verified via JWT
- ✅ Automatic backups enabled
- [ ] Regular audit of RLS policies (monthly)
- [ ] Monitor for suspicious queries

### Application
- ✅ HTTPS enforced (configure in deployment)
- ✅ Security headers set
- ✅ Input validated and sanitized
- ✅ Rate limiting on public endpoints
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Regular security scanning

### Admin Accounts
- ✅ Passwords hashed by Supabase
- [ ] Use strong passwords (min 12 characters)
- [ ] Enable 2FA if available in Supabase
- [ ] Regularly audit admin user list

---

## 📊 Monitoring & Alerts

### Key Metrics to Monitor
- Rate limit hits per IP
- API response times
- Database query times
- Error rates
- Admin login attempts (failed logins)

### Recommended Alerts
- [ ] High error rate (>1% of requests)
- [ ] Database connection failures
- [ ] Rate limit abuse (>100 requests/hour from single IP)
- [ ] Admin login failures (>5 in 10 mins from single IP)

---

## 🔄 Ongoing Maintenance

### Daily
- Check error logs
- Monitor rate limiting

### Weekly
- Review API performance
- Check database size
- Verify backups completed

### Monthly
- Security audit
- Update dependencies
- Review admin access logs
- Test disaster recovery

### Quarterly
- Penetration testing (optional)
- Review rate limiting thresholds
- Update security policies

---

## 🐛 Common Issues & Solutions

### Issue: Too many rate-limit rejections
**Solution:** Increase `maxRequests` in rate-limit config, but monitor for abuse

### Issue: Users can't submit responses
**Solution:** Check database connectivity, verify RLS policies allow inserts

### Issue: Admin can't login
**Solution:** Verify Supabase credentials, check JWT_SECRET env var

### Issue: High API latency
**Solution:** Check database indexes, enable caching, review slow queries

---

## 📞 Support & Escalation

### Critical Issues (Site Down)
1. Check status: `GET /` should return 200
2. Check database: Is Supabase up?
3. Check env vars: Are they all set?
4. Restart application
5. Check logs for errors

### Security Issues
1. Do not disclose publicly until fixed
2. Immediately invalidate affected user sessions
3. Run security audit
4. Deploy fix ASAP
5. Notify affected users if data exposed

---

## ✨ Future Enhancements

Consider adding for future versions:
- [ ] Redis-based rate limiting (for distributed systems)
- [ ] Request logging/audit trail
- [ ] Admin activity logging
- [ ] Email notifications for alerts
- [ ] Automated backups to cloud storage
- [ ] CI/CD pipeline with automated tests
- [ ] WebhooksAPI for integrations
- [ ] Multi-language support
- [ ] Dark mode

---

## 📝 Deployment Rollback

If something goes wrong:
1. Identify the problematic deployment
2. Revert to previous working version
3. Investigate logs
4. Fix issue
5. Redeploy with fix

Supabase automatically keeps migration history, so rollbacks are safe.

---

**Last Updated:** November 25, 2025
**Next Review:** December 25, 2025

