# Security audit – vulnerabilities and fixes

This document summarizes security findings and applied fixes. See also [API_SECURITY.md](./API_SECURITY.md) for route protection overview.

---

## 1. CSRF on state-changing user routes (fixed)

**Finding:** `POST /api/user/avatar/update` and `POST /api/upload/avatar` did not validate CSRF. A malicious site could trigger avatar update or presigned URL generation if the user was logged in (e.g. form POST with SameSite=Lax in some navigations).

**Fix:**
- Both routes now call `validateCsrfToken(req)` at the start and return 403 if validation fails.
- `AvatarUpload.tsx` sends `X-CSRF-Token` (via `getCsrfToken()`) when calling `/api/user/avatar/update`.

**Files:** `src/app/api/user/avatar/update/route.ts`, `src/app/api/upload/avatar/route.ts`, `src/components/AvatarUpload.tsx`.

---

## 2. XSS risk from `dangerouslySetInnerHTML` (fixed)

**Finding:** In `ForgotPasswordForm.tsx`, cooldown messages were set with HTML strings (e.g. `Podes reenviar o código em <strong>${seconds}</strong> segundos.`) and rendered with `dangerouslySetInnerHTML`. The values were derived from local state (numbers), not from the API, but the pattern was unsafe: any future use of server or user input in that path could lead to XSS.

**Fix:**
- Removed all `dangerouslySetInnerHTML` usage in that component.
- Cooldown text is now rendered with React elements: `cooldownSeconds` is stored in state and rendered as `<strong>{resendMessage.cooldownSeconds}</strong>` inside fixed copy. No raw HTML from strings.

**Files:** `src/components/auth/AuthModal/ForgotPasswordForm.tsx`.

---

## 3. Session and cookies (verified)

- **auth_session:** Set with `httpOnly`, `sameSite: 'strict'`, `secure` in production. Good.
- **csrf-token:** Readable by JS (required for Double Submit Cookie). `sameSite: 'lax'`. OK.
- Redirects: All redirect targets are fixed strings (`/`, `/auth/login`, `/admin/dashboard/overview`). No open redirect from user input.

---

## 4. Authorization and IDOR (verified)

- **User data:** `GET /api/user/data` uses `context.user` from auth middleware; data is always for the logged-in user (by email). No `userId` in request.
- **Avatar upload-url / update:** Accept optional `userId` for admin use. Non-admin callers are restricted to own user via `session.uuid`; admin role is checked with DB before allowing another user.
- **Admin routes:** All under `withAdminAuth` (session + admin role). Resource IDs (e.g. user id, pesagem id) are from URL params and validated (e.g. UUID format); admin can only act on existing resources.

---

## 5. Input validation and sanitization (verified)

- **Avatar URL:** `isSafeAvatarUrl()` blocks `javascript:`, allows only safe `data:image/...` and `https://` (and relative paths). Used in `/api/user/avatar/update`.
- **UUIDs:** `isValidUuid()` used for user/resource IDs; rejects path traversal (`..`, `/`, `\`).
- **Numeric/string fields:** Sanitizers used in bulk/update APIs (e.g. `sanitizeValue`, `sanitizeStringValue`).
- **SQL:** Prisma parameterized queries; `$queryRaw` used only with literal `SELECT 1` (no user input).

---

## 6. Recommendations (optional hardening)

- **Avatar URL allowlist:** `isSafeAvatarUrl` currently allows any `https://` URL. To restrict to your CDN/R2 domain only, add an allowlist (e.g. `*.r2.dev`, your domain) and reject other hosts. Trade-off: breaks existing external avatar URLs if any.
- **Rate limit on avatar update:** Consider applying the same rate limit as other user mutations (e.g. same as API rate limit) to avoid abuse of DB/cache updates.
- **Error messages in production:** `getErrorMessageSafe()` already hides internal details in production. Ensure no `Logger` call logs full request body or tokens.
- **CSP:** `next.config.ts` documents future tightening (nonce/hash to remove `unsafe-inline`). Proceed when tooling allows.

---

## 7. Security testing

- **Headers:** `scripts/security-headers.ps1` – checks X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy, Permissions-Policy; HSTS in production.
- **Routes:** `scripts/security-routes.ps1` – unauthenticated access to `/dashboard`, `/admin`, `/api/admin/stats`, `/api/user/data` returns redirect or 401/403.

Run against local or staging, e.g.:

```powershell
$env:BASE_URL = "http://localhost:3000"
.\scripts\security-headers.ps1
.\scripts\security-routes.ps1
```
