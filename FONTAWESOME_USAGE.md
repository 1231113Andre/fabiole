# Font Awesome Pro - Instrukcja użycia

Font Awesome Pro został zintegrowany z projektem. Oto jak używać ikon:

## Podstawowe użycie

### Solid Icons (domyślne)
```tsx
<i className="fas fa-user"></i>
```

### Light Icons
```tsx
<i className="fal fa-user"></i>
```

### Regular Icons
```tsx
<i className="far fa-user"></i>
```

### Thin Icons
```tsx
<i className="fat fa-user"></i>
```

### Brands Icons
```tsx
<i className="fab fa-instagram"></i>
```

## Przykłady w komponentach React

### Przykład 1: Ikona w przycisku
```tsx
<button className="btn-primary">
  <i className="fas fa-dumbbell mr-2"></i>
  Treino
</button>
```

### Przykład 2: Ikony społecznościowe
```tsx
<a href="https://www.instagram.com/pt_fabiole" target="_blank" rel="noopener noreferrer">
  <i className="fab fa-instagram text-2xl"></i>
</a>
```

### Przykład 3: Ikona z klasami Tailwind
```tsx
<i className="fas fa-check-circle text-green-500 text-xl"></i>
```

## Dostępne style

- **Solid** (`fas`): Grube, wypełnione ikony (domyślne)
- **Light** (`fal`): Cienkie ikony
- **Regular** (`far`): Regularne ikony
- **Thin** (`fat`): Bardzo cienkie ikony
- **Brands** (`fab`): Ikony marek (Instagram, Facebook, LinkedIn, etc.)
- **Duotone** (`fad`): Ikony duotone (wymaga dodatkowej konfiguracji)

## Popularne ikony dla platformy treningowej

- `fa-dumbbell` - Trening
- `fa-user` - Użytkownik
- `fa-calendar` - Kalendarz
- `fa-chart-line` - Statystyki
- `fa-heart` - Zdrowie
- `fa-fire` - Intensywność
- `fa-trophy` - Osiągnięcia
- `fa-clock` - Czas
- `fa-weight` - Waga
- `fa-ruler` - Pomiary

## Więcej informacji

Pełna dokumentacja Font Awesome: https://fontawesome.com/docs

