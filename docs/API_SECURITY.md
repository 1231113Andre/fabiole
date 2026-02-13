# API routes – authentication and protection

This document lists which API routes require authentication and how they are protected.

## Public routes (no session required)

- **`GET /api/auth/session`** – Returns session payload if cookie valid; otherwise `{ authenticated: false }`. No redirect.
- **`GET /api/csrf`** – Returns CSRF token. Public.
- **`POST /api/auth/login`** – Login. Protected by rate limiting, account lockout, and password hashing.
- **`POST /api/auth/register`** – Registration. Protected by rate limiting and validation.
- **`POST /api/auth/forgot-password/send-code`** – Send password-reset code. Rate limited.
- **`POST /api/auth/forgot-password/verify-code`** – Verify reset code. Rate limited.
- **`POST /api/auth/forgot-password/reset`** – Reset password with code. Rate limited.
- **`POST /api/auth/send-verification`** – Send email verification. Rate limited.
- **`POST /api/auth/verify-code`** – Verify email code. Rate limited.

## Protected user routes (session required)

All require a valid session (e.g. `getSession()`, `getAuthenticatedUser()`, or `authMiddleware({ required: true })`). Mutations that change state also validate CSRF where applicable.

- **`GET /api/user/data`** – User sheet/dashboard data. Uses `authMiddleware({ required: true })`. Returns 401 when not authenticated.
- **`GET /api/user/avatar/upload-url`** – Presigned URL for avatar upload. `getSession()`; 401 if no session. Admins may request URL for another user via `userId`.
- **`POST /api/user/avatar/update`** – Update user avatar URL. `getSession()` + CSRF; 401 if no session, 403 if CSRF invalid. Admins may update another user.
- **`POST /api/upload/avatar`** – Legacy presigned avatar upload. `verifySession(cookie)` + CSRF; 401 if no session, 403 if CSRF invalid.
- **`GET /api/auth/login-history`** – Login history for current user. Uses `verifySession(sessionCookie)`; 401 if no session.
- **`POST /api/auth/change-password`** – Change password. `getAuthenticatedUser()` + CSRF.
- **`POST /api/auth/change-email/request`** – Request email change. `getSession()` + validation.
- **`POST /api/auth/change-email/verify`** – Verify new email. `getSession()` + validation.
- **`POST /api/auth/change-email`** – (Admin) change user email. Admin-only (see admin routes).
- **`DELETE /api/auth/delete-account`** – Delete own account. `getAuthenticatedUser()` + CSRF.

## Admin routes (admin session + rate limit)

All under `/api/admin/*` use the `withAdminAuth` wrapper: session required, admin role verified, and rate limiting applied. Return 401/403 when not authenticated or not admin.

- **`GET /api/admin/stats`** – Dashboard stats.
- **`GET /api/admin/settings`** – Admin settings (GET/POST).
- **`GET /api/admin/roles`** – Roles list.
- **`GET/POST /api/admin/users`** – List/create users.
- **`GET/PUT/DELETE /api/admin/users/[id]`** – User CRUD.
- **`PUT /api/admin/users/[id]/status`** – User status.
- **`POST /api/admin/users/[id]/change-password`** – Admin change user password.
- **`POST /api/admin/users/[id]/change-email`** – Admin change user email.
- **`POST /api/admin/users/[id]/pesagens`** – Create pesagem.
- **`POST /api/admin/users/[id]/pesagens/bulk`** – Bulk pesagens.
- **`POST /api/admin/users/[id]/perimetros`** – Create perimetro.
- **`POST /api/admin/users/[id]/perimetros/bulk`** – Bulk perimetros.
- **`POST /api/admin/users/[id]/avaliacoes`** – Create avaliacao.
- **`POST /api/admin/users/[id]/avaliacoes/bulk`** – Bulk avaliacoes.
- **`PUT/DELETE /api/admin/pesagens/[id]`** – Update/delete pesagem.
- **`PUT/DELETE /api/admin/perimetros/[id]`** – Update/delete perimetro.
- **`PUT/DELETE /api/admin/avaliacoes/[id]`** – Update/delete avaliacao.

## Summary

- **Public:** auth session, csrf, login, register, forgot-password (send-code, verify-code, reset), send-verification, verify-code.
- **Protected (user):** user/data, user/avatar (upload-url, update), upload/avatar, login-history, change-password, change-email (request, verify), delete-account.
- **Protected (admin):** all `/api/admin/*` routes via `withAdminAuth`.
