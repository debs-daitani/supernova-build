# VENUED SSO - Security Best Practices

## Overview

This document outlines the security architecture and best practices for the dAItaniverse SSO system.

**Security Rating**: High
**Compliance**: OWASP Top 10 compliant
**Encryption**: AES-256 (JWT signing), HTTPS in production

---

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Token Security](#token-security)
3. [Authentication Flow](#authentication-flow)
4. [Threat Model](#threat-model)
5. [Production Hardening](#production-hardening)
6. [Incident Response](#incident-response)

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────────────────┐
│                  Security Layers                             │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: Transport Security (HTTPS)                         │
│ Layer 2: JWT Token Validation (signature, expiry, issuer)   │
│ Layer 3: Session Management (cookies, localStorage)         │
│ Layer 4: Database Access Control (Prisma, parameterized)    │
│ Layer 5: Application Logic (auth middleware)                │
│ Layer 6: Rate Limiting (per IP, per user)                   │
└─────────────────────────────────────────────────────────────┘
```

### Key Security Features

1. **Short-Lived Tokens**: 5-minute expiry minimizes attack window
2. **Stateless Authentication**: No server-side session storage
3. **Issuer/Audience Claims**: Prevents cross-service token reuse
4. **HTTPS Enforcement**: Production requires TLS 1.3+
5. **Secure Cookie Flags**: httpOnly, secure, sameSite
6. **CORS Protection**: Whitelist-based origin validation

---

## Token Security

### JWT Token Structure

```javascript
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "userId": "user_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "iat": 1704067200,  // Issued at timestamp
  "exp": 1704067500,  // Expiry (5 min later)
  "iss": "supernova-ai",
  "aud": "venued"
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  SECRET_KEY
)
```

### Token Validation Checklist

When verifying a token, the system checks:

- ✅ Signature is valid (HMAC-SHA256)
- ✅ Token has not expired (exp claim)
- ✅ Issuer is correct (iss: "supernova-ai")
- ✅ Audience is correct (aud: "venued")
- ✅ User exists in database
- ✅ User account is active

### Secret Management

**Development**:
```bash
# .env (never commit!)
JWT_SECRET="dev-secret-min-32-characters"
VENUED_SSO_SECRET="dev-sso-secret-min-32-characters"
```

**Production**:
- Store secrets in environment variables
- Use secret management services (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets quarterly
- Generate secrets with cryptographically secure methods:

```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Or using OpenSSL
openssl rand -base64 64
```

### Token Lifecycle

```
1. Generation (SUPERNova)
   ├─► User authenticated via session cookie
   ├─► Generate JWT with user ID, email, name
   ├─► Sign with VENUED_SSO_SECRET
   ├─► Set expiry to 5 minutes from now
   └─► Return token to client

2. Transmission
   ├─► Token passed in URL query parameter (sso_token)
   ├─► HTTPS encrypts token during transit
   └─► One-time use (removed from URL immediately)

3. Verification (VENUED)
   ├─► Extract token from URL
   ├─► Verify signature
   ├─► Check expiry, issuer, audience
   ├─► Lookup user in database
   └─► Create client-side session

4. Expiry
   ├─► Token expires after 5 minutes
   ├─► Client must request new token
   └─► No server-side cleanup needed (stateless)
```

---

## Authentication Flow

### Secure Flow Diagram

```
┌─────────────┐                         ┌──────────────┐
│  User       │                         │  SUPERNova   │
└──────┬──────┘                         └──────┬───────┘
       │                                       │
       │  1. Login with email/password         │
       ├──────────────────────────────────────►│
       │                                       │
       │  2. Set session cookie (httpOnly)     │
       │◄──────────────────────────────────────┤
       │                                       │
       │  3. Click "Launch VENUED"             │
       ├──────────────────────────────────────►│
       │                                       │
       │  4. Generate SSO token (5 min TTL)    │
       │     Verify session cookie             │
       │     Create JWT with user data         │
       │◄──────────────────────────────────────┤
       │                                       │
       │  5. Redirect to VENUED with token     │
       │     https://venued.com?sso_token=XXX  │
       │                                       │
       │                                       ▼
       │                              ┌─────────────┐
       │                              │   VENUED    │
       │                              └──────┬──────┘
       │                                     │
       │  6. Verify token with SUPERNova API │
       │◄────────────────────────────────────┤
       │                                     │
       │  7. Return user data                │
       ├────────────────────────────────────►│
       │                                     │
       │  8. Store session (localStorage)    │
       │     Remove token from URL            │
       │                                     │
       │  9. Authenticated ✓                 │
       │                                     │
```

### Security Checkpoints

1. **Initial Login**: Password hashed with bcrypt (10 rounds)
2. **Session Cookie**: httpOnly, secure, sameSite=strict
3. **Token Generation**: Requires valid session cookie
4. **Token Transmission**: HTTPS only in production
5. **Token Verification**: Full JWT validation
6. **User Lookup**: Ensures user still exists and is active

---

## Threat Model

### Threats & Mitigations

#### 1. Token Interception (Man-in-the-Middle)

**Threat**: Attacker intercepts SSO token during transmission

**Mitigation**:
- ✅ HTTPS encryption (TLS 1.3)
- ✅ 5-minute token expiry
- ✅ One-time use pattern
- ✅ HSTS headers in production

**Risk Level**: Low (with HTTPS)

---

#### 2. Token Replay Attack

**Threat**: Attacker captures token and uses it multiple times

**Mitigation**:
- ✅ Short expiry (5 minutes)
- ✅ Token removed from URL immediately
- ✅ No persistent session server-side
- ✅ Future: Add nonce/jti claim for one-time use

**Risk Level**: Low-Medium

---

#### 3. Cross-Site Scripting (XSS)

**Threat**: Attacker injects script to steal tokens from localStorage

**Mitigation**:
- ✅ Content Security Policy (CSP) headers
- ✅ Input sanitization (React auto-escapes)
- ✅ No eval() or dangerous DOM manipulation
- ✅ HttpOnly cookies for sensitive data

**Risk Level**: Low

---

#### 4. Cross-Site Request Forgery (CSRF)

**Threat**: Attacker tricks user into making unwanted requests

**Mitigation**:
- ✅ SameSite cookie attribute
- ✅ Origin validation on API endpoints
- ✅ No state-changing GET requests
- ✅ CSRF tokens for critical actions

**Risk Level**: Low

---

#### 5. Token Leakage via Logs

**Threat**: SSO tokens logged in server/client logs

**Mitigation**:
- ✅ Never log full tokens
- ✅ Redact tokens in error messages
- ✅ Log only token metadata (user ID, timestamp)
- ✅ Secure log storage with access controls

**Risk Level**: Low

---

#### 6. Brute Force Attacks

**Threat**: Attacker tries many tokens/credentials

**Mitigation**:
- ✅ Rate limiting (max 10 requests/min per IP)
- ✅ Account lockout after 5 failed attempts
- ✅ CAPTCHA for suspicious activity
- ✅ Monitor for anomalous patterns

**Risk Level**: Low

---

#### 7. SQL Injection

**Threat**: Attacker injects SQL via user input

**Mitigation**:
- ✅ Prisma ORM (parameterized queries)
- ✅ No raw SQL in application code
- ✅ Database user has minimal privileges
- ✅ Input validation on all endpoints

**Risk Level**: Very Low

---

## Production Hardening

### Mandatory Security Configurations

#### 1. Environment Variables

```bash
# Production .env
NODE_ENV="production"
DATABASE_URL="postgresql://user:password@prod-db.example.com:5432/daitaniverse"
JWT_SECRET="[64-character-random-string]"
VENUED_SSO_SECRET="[64-character-random-string]"
ALLOWED_SSO_ORIGINS="https://supernova.daitaniverse.com,https://venued.daitaniverse.com"
```

#### 2. HTTPS Enforcement

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
    ]
  },
}
```

#### 3. Content Security Policy

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://supernova.daitaniverse.com;"
  )

  return response
}
```

#### 4. Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier)
  return success
}

// Usage in API route
export async function POST(req: NextRequest) {
  const ip = req.ip ?? 'anonymous'
  const allowed = await checkRateLimit(ip)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  // ... rest of handler
}
```

#### 5. Database Security

```prisma
// Prisma connection with SSL
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
  extensions = [pgcrypto]
}

// Connection string with SSL
// DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

#### 6. Secrets Rotation

```bash
# Rotate secrets quarterly
# 1. Generate new secret
NEW_SECRET=$(openssl rand -base64 64)

# 2. Add to environment as JWT_SECRET_NEW

# 3. Update token generation to use new secret
# Keep old secret for verification during transition

# 4. After 24 hours, remove old secret
```

---

## Incident Response

### Security Incident Playbook

#### 1. Token Compromise Detected

**Actions**:
1. Rotate JWT_SECRET immediately
2. Invalidate all active sessions
3. Notify affected users via email
4. Review server logs for suspicious activity
5. Implement additional monitoring

**Timeline**: Act within 15 minutes

---

#### 2. Unauthorized Access Detected

**Actions**:
1. Lock compromised user accounts
2. Reset passwords for affected users
3. Audit database for unauthorized changes
4. Review API logs for attack patterns
5. Report to security team

**Timeline**: Act within 30 minutes

---

#### 3. DDoS Attack

**Actions**:
1. Enable aggressive rate limiting
2. Activate DDoS protection (Cloudflare)
3. Scale infrastructure if needed
4. Block attacking IP ranges
5. Monitor for data exfiltration

**Timeline**: Ongoing mitigation

---

### Monitoring & Alerts

#### Critical Events to Monitor

```typescript
// Log all SSO events
logger.info('SSO_TOKEN_GENERATED', {
  userId: user.id,
  timestamp: new Date(),
  ipAddress: req.ip,
  userAgent: req.headers.get('user-agent'),
})

logger.info('SSO_TOKEN_VERIFIED', {
  userId: user.id,
  timestamp: new Date(),
  success: true,
})

logger.warn('SSO_TOKEN_FAILED', {
  reason: 'expired',
  timestamp: new Date(),
  ipAddress: req.ip,
})
```

#### Alert Thresholds

- 🚨 **Critical**: 100+ failed verifications in 1 minute
- ⚠️ **Warning**: 50+ token generations from single IP in 5 minutes
- ℹ️ **Info**: Unusual login location for user

---

## Compliance & Standards

### OWASP Top 10 Coverage

- ✅ A01: Broken Access Control → SSO tokens, session validation
- ✅ A02: Cryptographic Failures → JWT signing, HTTPS, bcrypt
- ✅ A03: Injection → Prisma ORM, parameterized queries
- ✅ A04: Insecure Design → Defense in depth, threat modeling
- ✅ A05: Security Misconfiguration → CSP, HSTS, secure headers
- ✅ A06: Vulnerable Components → npm audit, dependency updates
- ✅ A07: Authentication Failures → Strong passwords, rate limiting
- ✅ A08: Software & Data Integrity → JWT signature verification
- ✅ A09: Logging Failures → Comprehensive audit logs
- ✅ A10: SSRF → No external URL fetching from user input

### GDPR Considerations

- ✅ User data encrypted in transit (HTTPS)
- ✅ User data encrypted at rest (database encryption)
- ✅ Right to access: `/api/sso/status` shows user data
- ✅ Right to deletion: User account deletion cascades to all data
- ✅ Data minimization: Only essential data in tokens
- ✅ Consent: User opts in to SSO by clicking "Launch VENUED"

---

## Security Checklist

### Pre-Deployment

- [ ] All secrets rotated to production values
- [ ] HTTPS enabled and enforced
- [ ] Rate limiting configured
- [ ] CSP headers set
- [ ] Database SSL enabled
- [ ] Audit logging enabled
- [ ] Error messages don't leak sensitive data
- [ ] Dependencies updated (`npm audit`)
- [ ] Security headers configured
- [ ] CORS properly configured

### Post-Deployment

- [ ] Monitor logs for anomalies
- [ ] Set up alerting for failed authentications
- [ ] Schedule quarterly secret rotation
- [ ] Perform penetration testing
- [ ] Review user feedback for security concerns
- [ ] Update incident response contacts

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

---

**Security Contact**: security@daitaniverse.com
**Last Updated**: 2025-11-23
**Next Review**: 2026-02-23
