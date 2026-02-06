# Raport audytu bezpieczeństwa – FabioLe

**Data audytu:** luty 2025  
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
| Zależności | ⚠️ | Warto regularnie uruchamiać `npm audit` |

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
| Auth flow | ✅ | Rate limiting, lockout, CSRF na rejestracji |
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
| Skrypty migracyjne | ⚠️ | `createUsers.ts` – teraz hashowanie włączone; skrypty powinny być wyłączone w produkcji |

### A09:2025 – Security Logging & Alerting Failures

| Obszar | Status | Szczegóły |
|--------|--------|-----------|
| Logger | ✅ | Logowanie błędów, lockoutów, nieudanych logowań |
| Alerting | ⚠️ | Brak widocznego systemu alertów (np. na wiele błędów auth) |

### A10:2025 – Mishandling of Exceptional Conditions

| Obszar | Status | Szczegóły |
|--------|--------|-----------|
| Błędy API | ✅ | `ApiResponse.error` ukrywa szczegóły w produkcji |
| `getErrorMessage` | ⚠️ | Zwraca `error.message` – może ujawniać informacje wewnętrzne, jeśli przekazane do odpowiedzi klienta |
| Redis / lockout | ⚠️ | W razie błędu Redis – „fail open” (dostęp dozwolony) – celowe, ale warto monitorować |

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

### 3.5. `serverActions.allowedOrigins` – użycie IP

**Plik:** `next.config.ts`

```typescript
serverActions: {
  allowedOrigins: ["57.128.218.55", "localhost:3000"],
}
```

Preferowane jest użycie domen (np. fabiole.com), aby uniknąć problemów przy zmianie adresów IP.

---

## 4. Mocne strony

- Autentykacja: rate limiting, lockout, CSRF, walidacja siły hasła.
- Sesje: JWT, cookies HttpOnly, Secure, SameSite.
- Prisma: brak raw SQL, brak typowych zagrożeń injection.
- Next.js i React: wersje załatałe pod kątem React2Shell.
- Autoryzacja admin: `withAdminAuth`, `requireAdmin`.
- Podstawowe nagłówki: X-Frame-Options, X-Content-Type-Options.
- Walidacja: Zod na auth, sanitizacja inputów.

---

## 5. Plan naprawczy (priorytety)

| Priorytet | Zadanie | Plik(i) |
|-----------|---------|---------|
| P0 | Włączenie nagłówków CSP/HSTS – np. przez middleware lub wrapper odpowiedzi | `middleware.ts` (nowy) lub `BaseRouteHandler` |
| P1 | Walidacja UUID dla `id` i `targetUserId` | `admin/users/[id]`, `upload-url`, ewentualnie helper |
| P1 | Walidacja `targetUserId` w upload-url (UUID + brak path traversal) | `upload-url/route.ts` |
| P2 | Dodanie `server-only` do modułów serwerowych | `db/client`, `session`, `auth` |
| P2 | Zamiana IP na domeny w `serverActions.allowedOrigins` | `next.config.ts` |
| P3 | Uruchamianie `npm audit` w CI | GitHub Actions / CI |
| P3 | Monitoring/alerting przy wielu nieudanych logowaniach | np. Slack/email przy lockoutach |

---

## 6. Zależności – do weryfikacji

Zalecane okresowe uruchamianie:

```bash
npm audit
```

oraz sprawdzanie aktualności Next.js i React w kontekście advisory’ów bezpieczeństwa.

---

*Raport wygenerowany na podstawie analizy kodu, OWASP Top 10:2025, dokumentacji Next.js i praktyk bezpieczeństwa dla Next.js 2025.*
