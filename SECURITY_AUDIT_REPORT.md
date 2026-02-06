# Raport audytu bezpieczeństwa – FabioLe

**Data audytu:** luty 2025  
**Ostatnia aktualizacja:** luty 2025 (po wdrożeniu planu bezpieczeństwa: getErrorMessageSafe, blokada skryptów, rate limit admin, CSRF na zmianie hasła/email/usunięciu konta, npm audit w CI, hook zdarzeń bezpieczeństwa)  
**Zakres:** pełny skan projektu + porównanie z OWASP Top 10:2025, Next.js Data Security, Next.js Authentication Best Practices 2025

---

## 1. Kontekst architektury (rekomendacje 2025)

### Next.js – aktualne rekomendacje

- **Middleware do auth:** unika się używania globalnego middleware do autentykacji (m.in. CVE-2025-29927); preferowany jest model **Data Access Layer** z weryfikacją blisko dostępu do danych.
- **Data Access Layer:** centralna warstwa dostępu do danych z autoryzacją i zwracaniem minimalnych DTO.
- **Zero Trust:** Server Components nie ufają implicit requestowi; autoryzacja przy każdym dostępie do wrażliwych zasobów.

### Stan projektu

| Aspekt | Status | Uwagi |
|--------|--------|-------|
| Brak root `middleware.ts` | ✅ | Brak globalnego middleware – zgodne z rekomendacjami |
| `requireAdmin()` na stronach | ✅ | Autoryzacja na poziomie stron (np. layout) |
| API Routes – `withAdminAuth` / `authMiddleware` | ✅ | Autoryzacja przy trasach API |
| Centralizacja dostępu do danych | ⚠️ | UserService, AdminUserService, repozytoria – częściowy DAL, brak wyraźnego wzorca DAL jak w Next.js |
| `server-only` | ✅ | `db/client`, `session`, `password`, `redis`, `auth/validate`, `auth/helpers` – `import 'server-only'` |

---

## 2. OWASP Top 10:2025 – mapa ryzyk

### A01:2025 – Broken Access Control

| Obszar | Status | Szczegóły |
|--------|--------|-----------|
| Admin routes | ✅ | `withAdminAuth` wymaga sesji admina |
| User data API | ✅ | `authMiddleware` + dane z sesji (np. `context.user.email`) |
| Upload URL (`/api/user/avatar/upload-url`) | ✅ | `targetUserId` walidowany przez `isValidUuid()`, path traversal zablokowany |
| Admin users `[id]` | ✅ | UUID walidowany przez `isValidUuid()` we wszystkich trasach `[id]` |
| Admin entity routes (avaliacoes, perimetros, pesagens) | ✅ | Numeryczne ID walidowane przez `isValidNumericId()` |

### A02:2025 – Security Misconfiguration

| Obszar | Status | Szczegóły |
|--------|--------|-----------|
| `poweredByHeader: false` | ✅ | W `next.config` |
| Nagłówki bezpieczeństwa w `next.config` | ✅ | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy |
| **CSP, HSTS, Permissions-Policy** | ✅ | Zastosowane w `next.config.ts` – CSP, HSTS (prod), Permissions-Policy; R2 w `connect-src` |
| `serverActions.allowedOrigins` | ✅ | Domeny + IP `57.128.218.55` zachowane (na życzenie) |

### A03:2025 – Software Supply Chain Failures

| Obszar | Status | Szczegóły |
|--------|--------|-----------|
| Next.js 16.0.10 | ✅ | Wersja ≥ 16.0.7 – załatana dla CVE-2025-66478 |
| React 19.2.3 | ✅ | Wersja załatana dla React2Shell |
| Zależności | ✅ | `npm audit --audit-level=high` w CI (job `audit` przed deployem) |

### A04:2025 – Cryptographic Failures

| Obszar | Status | Szczegóły |
|--------|--------|-----------|
| Hasła | ✅ | bcrypt, `hashPassword` przed zapisem |
| Sesja JWT | ✅ | `jose`, HS256, `SESSION_SECRET` z env |
| Sesja cookies | ✅ | HttpOnly, Secure (prod), SameSite=strict |

### A05:2025 – Injection

| Obszar | Status | Szczegóły |
|--------|--------|-----------|
| Prisma | ✅ | Parametryzowane zapytania, brak raw SQL |
| Walidacja inputu | ✅ | Zod (np. auth), sanitizacja (SanitizationMiddleware), `sanitizeString` w admin users PUT |
| XSS | ✅ | `sanitizeObject`, sanityzacja pól tekstowych w admin users (name, surname, email, goals, notes itd.) |

### A06:2025 – Insecure Design

| Obszar | Status | Szczegóły |
|--------|--------|-----------|
| Auth flow | ✅ | Rate limiting, lockout, CSRF na rejestracji oraz na change-password, delete-account, change-email (request/verify) |
| Separacja ról | ✅ | Admin vs User, sprawdzanie roli przy wrażliwych operacjach |

### A07:2025 – Authentication Failures

| Obszar | Status | Szczegóły |
|--------|--------|-----------|
| Login | ✅ | Rate limit, IP lockout, account lockout, hashowanie |
| Rejestracja | ✅ | CSRF, Zod, hashowanie, walidacja siły hasła |
| Session | ✅ | JWT, HttpOnly cookies (po ostatnich zmianach – bez legacy JSON) |
| Hasła | ✅ | Bcrypt, brak plain-text fallback (po ostatnich zmianach) |

### A08:2025 – Software or Data Integrity Failures

| Obszar | Status | Szczegóły |
|--------|--------|-----------|
| JWT | ✅ | Podpis, weryfikacja |
| CSRF | ✅ | Double Submit Cookie, Origin/Referer |
| Skrypty migracyjne | ✅ | Skrypty w `src/scripts` blokowane w produkcji (chyba że `ALLOW_DANGEROUS_SCRIPTS=1`); hashowanie włączone |

### A09:2025 – Security Logging & Alerting Failures

| Obszar | Status | Szczegóły |
|--------|--------|-----------|
| Logger | ✅ | Logowanie błędów, lockoutów, nieudanych logowań |
| Alerting | ✅ | Hook `emitSecurityEvent` (ACCOUNT_LOCKOUT, IP_RATE_LIMIT, CSRF_VIOLATION, REDIS_*_FAIL_OPEN); domyślnie logowanie, możliwość podłączenia Sentry/Datadog przez `setSecurityEventHook` |

### A10:2025 – Mishandling of Exceptional Conditions

| Obszar | Status | Szczegóły |
|--------|--------|-----------|
| Błędy API | ✅ | `ApiResponse.error` ukrywa szczegóły w produkcji |
| Komunikaty błędów w API | ✅ | W odpowiedziach do klienta używane jest `getErrorMessageSafe()` – w produkcji tylko generyczny komunikat |
| Redis / lockout | ✅ | „Fail open" celowe (awaria Redis nie blokuje logowania). Zalecany monitoring: logi „Failed to check account lockout", „Failed to record IP attempt" oraz zdarzenie REDIS_LOCKOUT_FAIL_OPEN / REDIS_IP_RATE_LIMIT_FAIL_OPEN z hooka |

---

## 3. Szczegółowe ustalenia

### 3.1. Nagłówki bezpieczeństwa (CSP, HSTS) – zaimplementowane

**Plik:** `next.config.ts`

CSP, HSTS i Permissions-Policy są stosowane przez `headers()` w `next.config.ts`:
- Content-Security-Policy (default-src, script-src, style-src, img-src, connect-src, itd.),
- Strict-Transport-Security (HSTS) w produkcji,
- Permissions-Policy.

Domena R2 (`*.r2.cloudflarestorage.com`, `*.r2.dev`) jest uwzględniona w `connect-src` dla uploadu awatarów.

### 3.2. Walidacja parametrów `[id]` w trasach admin

**Zaimplementowane:** UUID walidowane przez `isValidUuid()` we wszystkich trasach `/api/admin/users/[id]/*`. Numeryczne ID w trasach avaliacoes, perimetros, pesagens walidowane przez `isValidNumericId()`.

### 3.3. Endpoint upload URL – path traversal

**Zaimplementowane:** `targetUserId` jest walidowany przez `isValidUuid()` przed użyciem. Whitelist rozszerzeń plików w upload/avatar (`jpg`, `jpeg`, `png`, `webp`, `gif`). Walidacja `avatarUrl` przez `isSafeAvatarUrl()` przed zapisem w bazie.

### 3.4. `server-only`

**Zaimplementowane:** Moduły `db/client.ts`, `session.ts`, `password.ts`, `redis.ts`, `auth/validate.ts`, `auth/helpers.ts` używają `import 'server-only'`.

### 3.5. `serverActions.allowedOrigins`

**Plik:** `next.config.ts`

Domeny produkcyjne oraz IP `57.128.218.55` są zachowane w `allowedOrigins` i `allowedDevOrigins`.

---

## 4. Mocne strony

- Autentykacja: rate limiting, lockout, CSRF (rejestracja, change-password, delete-account, change-email), walidacja siły hasła.
- Sesje: JWT, cookies HttpOnly, Secure, SameSite (bez legacy JSON).
- Prisma: brak raw SQL, brak typowych zagrożeń injection.
- Next.js i React: wersje załatałe pod kątem React2Shell.
- Autoryzacja admin: `withAdminAuth` (z rate limitem), `requireAdmin`.
- Nagłówki: CSP, HSTS, Permissions-Policy, X-Frame-Options, X-Content-Type-Options.
- Walidacja: Zod na auth, sanitizacja inputów, UUID i ID numeryczne.
- Upload: walidacja UUID, whitelist rozszerzeń, walidacja avatarUrl.
- Moduły serwerowe: `server-only` w db, session, auth, password, redis.

---

## 5. Plan naprawczy – stan

| Priorytet | Zadanie | Status |
|-----------|---------|--------|
| P0 | Włączenie nagłówków CSP/HSTS | ✅ Zastosowane w `next.config.ts` |
| P1 | Walidacja UUID dla `id` i `targetUserId` | ✅ Wszystkie trasy admin users, upload-url, avatar/update |
| P1 | Walidacja `targetUserId` (path traversal) | ✅ `isValidUuid()` |
| P2 | `server-only` w modułach serwerowych | ✅ db, session, password, redis, auth |
| P2 | Sanityzacja pól tekstowych w admin users PUT | ✅ `sanitizeString`, `sanitizeEmail` |
| P2 | Walidacja `avatarUrl` | ✅ `isSafeAvatarUrl()` |
| P2 | Whitelist rozszerzeń w upload/avatar | ✅ jpg, jpeg, png, webp, gif |
| P2 | Walidacja numerycznych ID (avaliacoes, perimetros, pesagens) | ✅ `isValidNumericId()` |
| P2 | R2 w CSP `connect-src` | ✅ Domyślnie `*.r2.cloudflarestorage.com`, `*.r2.dev` |
| P3 | Uruchamianie `npm audit` w CI | ✅ Wykonane – job `audit` w `.github/workflows/deploy.yml` (`npm audit --audit-level=high`) |
| P3 | Monitoring/alerting przy lockoutach | ✅ Hook `emitSecurityEvent` w `src/lib/security/securityEvents.ts`; wywołania przy lockout, IP rate limit, CSRF, Redis fail-open |

---

## 6. Monitoring zdarzeń bezpieczeństwa

Przeszukiwanie logów po słowach kluczowych:
- **Account Lockout:** „Account Lockout Triggered”
- **IP rate limit:** „IP Rate Limit Triggered”
- **CSRF:** „CSRF Violation” lub „CSRF Validation Failure”
- **Redis fail-open:** „Failed to check account lockout”, „Failed to record IP attempt”

Opcjonalnie: w kodzie ustaw `setSecurityEventHook()` (moduł `@/lib/security/securityEvents`) i przekieruj zdarzenia do zewnętrznego systemu (Sentry, Datadog, e-mail). Typy zdarzeń: `ACCOUNT_LOCKOUT`, `IP_RATE_LIMIT`, `CSRF_VIOLATION`, `REDIS_LOCKOUT_FAIL_OPEN`, `REDIS_IP_RATE_LIMIT_FAIL_OPEN`.

---

## 7. Zależności – do weryfikacji

Zalecane okresowe uruchamianie:

```bash
npm audit
```

oraz sprawdzanie aktualności Next.js i React w kontekście advisory’ów bezpieczeństwa.

---

*Raport wygenerowany na podstawie analizy kodu, OWASP Top 10:2025, dokumentacji Next.js i praktyk bezpieczeństwa dla Next.js 2025.*
