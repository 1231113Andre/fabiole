# Wygląd Toastów w Projekcie

Projekt zawiera **dwa różne systemy toastów**:

## 1. ToastContainer.tsx - Custom Toast Component

**Lokalizacja:** `src/app/components/ToastContainer.tsx`

### Pozycja
- `fixed top-0 right-0`
- `z-index: 1055`
- `margin-top: 80px`
- Padding: `p-3` (12px)

### Wygląd Toastu

#### Ogólne Style
- `flex items-center`
- `text-white`
- `border-0`
- `rounded-lg`
- `shadow-lg`
- `p-4` (16px padding)
- `mb-3` (12px margin-bottom)
- `min-w-[300px]` (minimalna szerokość 300px)

#### Kolory według typu:

| Typ | Background | Ikona |
|-----|------------|-------|
| **success** | `bg-green-500` | `fa-check-circle` |
| **danger** | `bg-red-500` | `fa-exclamation-circle` |
| **warning** | `bg-yellow-500` | `fa-exclamation-triangle` |
| **info** | `bg-blue-500` | `fa-info-circle` |

#### Przycisk zamknięcia
- `text-white`
- `ml-4` (margin-left)
- `p-2` (padding)
- `hover:opacity-75`
- Ikona SVG (X) `w-4 h-4`

#### Auto-zamknięcie
- Automatycznie zamyka się po **5 sekundach**

---

## 2. NotificationContext.tsx - react-toastify System

**Lokalizacja:** `src/components/NotificationContext.tsx`

### Pozycja
- `position: "top-right"`
- Theme: `"dark"`

### Ustawienia
```javascript
autoClose: 2500          // Zamyka się po 2.5 sekundy
hideProgressBar: true    // Ukrywa pasek postępu
closeOnClick: true       // Zamyka przy kliknięciu
pauseOnHover: true       // Pauzuje przy najechaniu
draggable: false         // Nie można przeciągać
closeButton: false       // Brak przycisku zamknięcia
```

### Wygląd Toastu

#### Ogólne Style
```css
!backdrop-blur-md           /* Efekt rozmycia tła */
!border                     /* Rama */
!rounded-lg                 /* Zaokrąglone rogi */
!shadow-lg                  /* Cień */
!p-3                        /* Padding 12px */
!min-h-0                    /* Minimalna wysokość */
!mb-2                       /* Margin-bottom 8px */
```

#### Kolory według typu:

##### **SUCCESS (SUCESSO)**
- Background: `bg-emerald-950/95`
- Shadow: `shadow-emerald-900/20`
- Border: `border-emerald-500/30`
- Ikona: `fa-duotone fa-check-circle` (kolor: `text-emerald-300`)
- Tytuł: `SUCESSO`

##### **ERROR (ERRO)**
- Background: `bg-red-950/95`
- Shadow: `shadow-red-900/20`
- Border: `border-red-500/30`
- Ikona: `fa-duotone fa-circle-exclamation` (kolor: `text-red-300`)
- Tytuł: `ERRO`

##### **INFO (INFORMAÇÃO)**
- Background: `bg-blue-950/95`
- Shadow: `shadow-blue-900/20`
- Border: `border-blue-500/30`
- Ikona: `fa-duotone fa-circle-info` (kolor: `text-blue-300`)
- Tytuł: `INFORMAÇÃO`

##### **WARNING (AVISO)**
- Background: `bg-amber-950/95`
- Shadow: `shadow-amber-900/20`
- Border: `border-amber-500/30`
- Ikona: `fa-duotone fa-triangle-exclamation` (kolor: `text-amber-300`)
- Tytuł: `AVISO`

##### **LOADING (CARREGANDO)**
- Background: `bg-purple-950/95`
- Shadow: `shadow-purple-900/20`
- Border: `border-purple-500/30`
- Ikona: `fa-duotone fa-spinner-third fa-spin` (obracająca się) (kolor: `text-purple-300`)
- Tytuł: `CARREGANDO`

### Struktura Toastu

```
┌─────────────────────────────────────┐
│ [Ikona]  Tytuł (uppercase)   [Czas]│
│          Tekst wiadomości           │
│          • Szczegóły (opcjonalnie)  │
└─────────────────────────────────────┘
```

#### Szczegóły stylowania:

**Ikona:**
- `text-xl` (20px)
- `mt-0.5` (margin-top)
- Kolor zgodny z typem

**Tytuł:**
- `text-[11px]` (11px)
- `uppercase`
- `font-extrabold`
- `tracking-wider`
- `leading-none`
- Kolor zgodny z ikoną

**Czas (timestamp):**
- `text-[10px]` (10px)
- `text-gray-500`
- `font-medium`
- Format: `HH:mm` (portugalski format czasu)
- Ikona: `fa-duotone fa-clock`

**Wiadomość:**
- `text-[13px]` (13px)
- `text-gray-300`
- `font-medium`
- `leading-relaxed`
- Font: `font-montserrat`
- `m-0` (margin: 0)

**Szczegóły (details) - lista:**
- `mt-2` (margin-top)
- `space-y-1` (odstęp między elementami)
- `list-none` (bez stylu listy)
- `p-0 m-0` (bez padding/margin)
- Każdy element:
  - `text-[13px]`
  - `text-gray-400`
  - `font-montserrat`
  - Ikona: `fa-solid fa-chevron-right` (`text-[8px]`)

### Layout
```css
display: flex
items-start          /* Wyrównanie do góry */
gap-3.5              /* Odstęp 14px między ikoną a treścią */
```

---

## Porównanie

| Cecha | ToastContainer.tsx | NotificationContext.tsx |
|-------|-------------------|------------------------|
| **Pozycja** | top-right, margin-top: 80px | top-right |
| **Tło** | Solidne kolory (green-500, red-500, etc.) | Półprzezroczyste ciemne (950/95) |
| **Ramka** | Brak (border-0) | Kolorowa z przezroczystością |
| **Efekt** | Brak | backdrop-blur-md |
| **Czas auto-zamknięcia** | 5 sekund | 2.5 sekundy |
| **Ikony** | Font Awesome Solid | Font Awesome Duotone |
| **Tytuł** | Brak | TAK (SUCESSO, ERRO, etc.) |
| **Timestamp** | Brak | TAK (format HH:mm) |
| **Szczegóły** | Brak | TAK (lista z chevron) |
| **Close button** | SVG X | Brak (zamyka się kliknięciem) |
| **Biblioteka** | Custom | react-toastify |

---

## Użycie

### ToastContainer.tsx
Prawdopodobnie używany w starszych częściach aplikacji.

### NotificationContext.tsx
Używany przez hook `useNotification()`:
```typescript
const { notify } = useNotification();
notify("Wiadomość", "success");
notify("Błąd", "error", ["Szczegół 1", "Szczegół 2"]);
```

### Bezpośrednie użycie react-toastify
W niektórych miejscach (np. `src/components/AvatarUpload.tsx`) używany jest bezpośrednio `toast` z react-toastify:
```typescript
import { toast } from "react-toastify";
toast.error("Por favor, seleciona uma imagem válida.");
toast.success("Avatar atualizado com sucesso!");
```

Te toasty używają tego samego `ToastContainer` z `NotificationContext.tsx`, więc będą wyglądały zgodnie z konfiguracją tam zdefiniowaną (jeśli `NotificationProvider` jest w layout), lub będą używać domyślnych stylów react-toastify.

---

## Aktywny System

**NotificationProvider jest dodany w `src/app/layout.tsx`**, co oznacza że:
- ✅ **NotificationContext.tsx** (react-toastify) jest **głównym aktywnym systemem** toastów w całej aplikacji
- ⚠️ **ToastContainer.tsx** prawdopodobnie jest kodem legacy i może być używany tylko w starszych częściach aplikacji

Wszystkie toasty z `toast.error()`, `toast.success()` itp. oraz `useNotification()` będą używać stylów z `NotificationContext.tsx`.