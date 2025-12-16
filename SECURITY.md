# Security Implementation

## Overview
Comprehensive security implementation following OWASP best practices with performance optimizations.

## Security Measures

### 1. CSRF Protection
**Implementation**: Double Submit Cookie pattern (OWASP recommended)
- **Strategy**: Session-based tokens (24h validity) - more performant than per-request
- **Token Generation**: Cryptographically secure, URL-safe Base64 encoded (32 bytes)
- **Validation**: Constant-time comparison to prevent timing attacks
- **Storage**: Cookie (httpOnly=false for JS access) + X-CSRF-Token header
- **Coverage**: All POST, PUT, PATCH, DELETE requests

### 2. Security Headers
**Implementation**: OWASP-compliant security headers
- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-Content-Type-Options**: nosniff (prevents MIME sniffing)
- **X-XSS-Protection**: 1; mode=block (legacy browser protection)
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restricts browser features access
- **Content-Security-Policy**: Strict CSP with Google APIs allowlist
- **Strict-Transport-Security**: HSTS in production (1 year, includeSubDomains, preload)
- **Performance**: Headers cached per environment

### 3. CORS Protection
**Implementation**: Configurable strict CORS policy
- **Origins**: Configurable via `ALLOWED_ORIGINS` env variable
- **Default**: Same-origin only (production), localhost in development
- **Wildcard Support**: Regex-based subdomain matching
- **Credentials**: Configurable via `CORS_ALLOW_CREDENTIALS`
- **Headers/Methods**: Configurable via env variables
- **Performance**: Origins parsed once and cached

### 4. Rate Limiting
**Implementation**: In-memory rate limiting with cleanup
- **Auth Endpoints**: 5 requests / 15 minutes (configurable)
- **API Endpoints**: 100 requests / 15 minutes (configurable)
- **General Endpoints**: 200 requests / 15 minutes (configurable)
- **Storage**: In-memory Map (Redis recommended for production)
- **Cleanup**: Automatic expired entry removal + size limit (10k entries)
- **Headers**: X-RateLimit-* headers for client awareness

### 5. Authentication & Authorization
**Implementation**: Cookie-based session management
- **Session Storage**: HttpOnly cookies (secure in production)
- **Validation**: Edge Runtime compatible (middleware)
- **Protected Routes**: Configurable route protection
- **SameSite**: Strict (strongest CSRF protection)

### 6. Input Validation
**Implementation**: Server-side validation
- **CSRF Token Validation**: All state-changing requests
- **Origin/Referer Validation**: Additional CORS layer
- **Request Validation**: Type checking and sanitization

## Performance Optimizations

- **Cached Headers**: Security headers computed once per environment
- **Cached CORS**: Origin matching precompiled to regex
- **Session Tokens**: Reused for 24h (not regenerated per request)
- **Rate Limit Store**: Efficient Map with automatic cleanup
- **Early Returns**: Fast path for static assets and public routes

## Configuration

All security features are configurable via environment variables in `.env.local`:

- CORS: `ALLOWED_ORIGINS`, `CORS_ALLOW_CREDENTIALS`, `CORS_MAX_AGE`, etc.
- Rate Limiting: `RATE_LIMIT_AUTH_MAX`, `RATE_LIMIT_API_MAX`, etc.
- Security Headers: `CSP_ADDITIONAL_DOMAINS`, `HSTS_MAX_AGE`, etc.

## Files Structure

```
src/lib/security/
  ├── headers.ts      # Security headers configuration
  ├── cors.ts         # CORS configuration
  ├── rateLimit.ts    # Rate limiting implementation
  ├── performance.ts  # Performance utilities
  └── index.ts        # Centralized exports

src/lib/csrf/
  ├── csrf.ts         # Token generation & validation
  ├── validate.ts     # Request validation
  └── index.ts        # CSRF exports

src/middleware.ts     # Security middleware (headers, CORS, rate limiting, CSRF)
```

## Best Practices

1. **CSRF**: Always include X-CSRF-Token header in state-changing requests
2. **Rate Limiting**: Monitor and adjust limits based on usage patterns
3. **CORS**: Use strict origin allowlist in production
4. **Headers**: Keep CSP updated when adding new external resources
5. **Tokens**: Never expose CSRF tokens in logs or client-side storage

