# Migracja do Prisma jako głównej bazy danych

## Przegląd zmian

Projekt został zaktualizowany tak, aby **Prisma (PostgreSQL)** była główną bazą danych, a **Google Sheets** pełniła rolę backupu. Wszystkie operacje zapisu i odczytu używają teraz Prisma jako źródła prawdy.

## Architektura

### Przed migracją
- Google Sheets jako główna baza danych
- Prisma używana tylko w niektórych miejscach
- Mieszane źródła danych

### Po migracji
- **Prisma (PostgreSQL)** - główna baza danych (source of truth)
- **Google Sheets** - backup (synchronizowany w tle, non-blocking)

## Zmiany w kodzie

### 1. AuthService (`src/lib/api/services/AuthService.ts`)
- ✅ Login: używa Prisma jako głównej bazy
- ✅ Register: tworzy użytkownika w Prisma, następnie synchronizuje do Google Sheets (backup)
- ✅ Wszystkie operacje zapisu używają Prisma jako głównej bazy

### 2. Change Email (`src/app/api/auth/change-email/route.ts`)
- ✅ Sprawdza i aktualizuje email w Prisma
- ✅ Synchronizuje zmiany do Google Sheets (backup, non-blocking)

### 3. Skrypt importu (`src/scripts/importFromSheets.ts`)
- ✅ Zaktualizowany do używania nowego Prisma Client
- ✅ Importuje wszystkie dane z Google Sheets do Prisma
- ✅ Obsługuje użytkowników, pesagens, perimetros, avaliacoes

### 4. Nowe moduły synchronizacji

#### `src/lib/sync/infoDataSync.ts`
- `syncUserToInfoData(userId)` - synchronizuje pojedynczego użytkownika do InfoData sheet
- `syncAllUsersToInfoData()` - synchronizuje wszystkich użytkowników (pełny backup)

#### `src/lib/sync/sheetsSync.ts` (już istniał)
- `syncUserToSheet(userId)` - synchronizuje pełne dane użytkownika do jego arkusza

## Instrukcje migracji

### Krok 1: Import danych z Google Sheets do Prisma

Uruchom skrypt importu:

```bash
npm run tsx src/scripts/importFromSheets.ts
```

Lub jeśli masz skrypt w package.json:

```bash
npm run import:sheets
```

Skrypt:
- Importuje wszystkich użytkowników z InfoData do Prisma
- Importuje pesagens, perimetros, avaliacoes dla każdego użytkownika
- Zachowuje istniejące UUID
- Aktualizuje istniejących użytkowników lub tworzy nowych

### Krok 2: Weryfikacja

Sprawdź czy wszystkie dane zostały zaimportowane:

```sql
-- W Prisma Studio lub bezpośrednio w bazie
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM pesagens;
SELECT COUNT(*) FROM perimetros;
SELECT COUNT(*) FROM avaliacoes;
```

### Krok 3: Synchronizacja wsteczna (opcjonalnie)

Jeśli chcesz zsynchronizować wszystkie dane z Prisma z powrotem do Google Sheets:

```typescript
import { syncAllUsersToInfoData } from '@/lib/sync/infoDataSync';
import { db } from '@/lib/db/client';

// Synchronizuj InfoData
await syncAllUsersToInfoData();

// Synchronizuj arkusze użytkowników
const users = await db.user.findMany();
for (const user of users) {
  await syncUserToSheet(user.id);
}
```

## Jak działa synchronizacja

### Operacje zapisu

1. **Zapis do Prisma** (główna baza)
   - Wszystkie operacje zapisu najpierw trafiają do Prisma
   - Operacja kończy się sukcesem jeśli zapis do Prisma się powiódł

2. **Backup do Google Sheets** (w tle, non-blocking)
   - Po udanym zapisie do Prisma, dane są synchronizowane do Google Sheets
   - Jeśli synchronizacja się nie powiedzie, operacja nadal jest uznawana za udaną
   - Błędy synchronizacji są logowane ale nie przerywają głównej operacji

### Operacje odczytu

- Wszystkie operacje odczytu używają **Prisma** jako źródła danych
- Google Sheets nie jest już używane do odczytu danych użytkowników

## Ważne uwagi

### ⚠️ Google Sheets nadal otrzymuje dane

Google Sheets będzie nadal otrzymywać nowe rekordy i aktualizacje jako backup. To oznacza, że:

- Nowi użytkownicy będą dodawani do InfoData sheet
- Zmiany w danych użytkowników będą synchronizowane do ich arkuszy
- Pesagens, perimetros, avaliacoes będą synchronizowane

### 🔄 Synchronizacja dwukierunkowa (opcjonalna)

Jeśli chcesz, aby Google Sheets mogło również dodawać rekordy (np. ręcznie przez trenera), możesz:

1. Uruchomić okresowy skrypt synchronizacji z Google Sheets do Prisma
2. Stworzyć endpoint API do ręcznej synchronizacji

**UWAGA**: Obecnie synchronizacja jest jednokierunkowa: Prisma → Google Sheets

## Konfiguracja Prisma 7

Projekt używa Prisma 7, która wymaga:

1. **Schema bez `url` w datasource**:
   ```prisma
   datasource db {
     provider = "postgresql"
     // url jest teraz w PrismaClient constructor
   }
   ```

2. **Adapter w PrismaClient**:
   ```typescript
   import { PrismaPg } from '@prisma/adapter-pg';
   import { Pool } from 'pg';
   
   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   const adapter = new PrismaPg(pool);
   
   export const db = new PrismaClient({ adapter });
   ```

## Testowanie

Po migracji przetestuj:

1. ✅ Rejestracja nowego użytkownika
2. ✅ Logowanie użytkownika
3. ✅ Zmiana emaila
4. ✅ Dodawanie pesagens/perimetros/avaliacoes
5. ✅ Sprawdzenie czy dane są synchronizowane do Google Sheets

## Rollback (w razie potrzeby)

Jeśli potrzebujesz wrócić do poprzedniej architektury:

1. Przywróć zmiany w `AuthService.ts`
2. Przywróć zmiany w `change-email/route.ts`
3. Użyj Google Sheets jako głównej bazy (jak wcześniej)

## Wsparcie

W razie problemów sprawdź:
- Logi aplikacji dla błędów synchronizacji
- Prisma Studio do weryfikacji danych
- Google Sheets do weryfikacji backupu

