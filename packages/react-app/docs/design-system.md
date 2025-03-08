# BETM3 DApp Design-System

## Übersicht

Dieses Dokument beschreibt das einheitliche Design-System für die BETM3 dezentrale Wett-Plattform. Es dient als zentrale Referenz für alle UI-Komponenten, Stile und Muster, die in der Anwendung verwendet werden.

## Grundprinzipien

- **Mobile-First:** Alle Designs beginnen mit der mobilen Ansicht und werden dann für größere Bildschirme erweitert
- **Minimalistisch & Funktional:** Fokus auf Benutzererfahrung ohne Ablenkungen
- **Konsistenz:** Einheitliche Komponenten, Abstände und Farben in der gesamten Anwendung
- **Zugänglichkeit:** Alle Komponenten entsprechen mindestens WCAG AA-Standards

## Farbpalette

| Variable | Hex-Wert | Verwendung |
|----------|----------|------------|
| `primary` | `#3B82F6` | Primäre Aktionen, wichtige UI-Elemente |
| `primary-dark` | `#2563EB` | Hover-Status für primäre Elemente |
| `secondary` | `#10B981` | Sekundäre Aktionen, Erfolgsbenachrichtigungen |
| `warning` | `#F59E0B` | Warnungen, ausstehende Status |
| `danger` | `#EF4444` | Fehler, destruktive Aktionen |
| `gray-50` | `#F9FAFB` | Hintergrund |
| `gray-100` | `#F3F4F6` | Komponenten-Hintergrund, Rahmen |
| `gray-700` | `#374151` | Primärer Text |
| `gray-500` | `#6B7280` | Sekundärer Text |

```tsx
// Beispiel-Implementation in tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
        },
        secondary: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
    },
  },
};
```

## Typografie

| Element | Klasse | Beschreibung |
|---------|--------|-------------|
| Titel H1 | `text-3xl font-bold` | Hauptüberschriften, Seitentitel |
| Titel H2 | `text-2xl font-semibold` | Abschnittstitel |
| Titel H3 | `text-xl font-medium` | Komponententitel |
| Body | `text-base` | Standard-Fließtext |
| Small | `text-sm` | Untergeordnete Informationen, Labels |
| Tiny | `text-xs` | Fußnoten, rechtliche Hinweise |

Die Anwendung verwendet als Standardschrift Inter, mit System-Fallbacks:

```css
font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
```

## Abstandssystem

Wir verwenden Tailwind's Standard-Abstandsskala mit einigen wichtigen Abständen:

| Klasse | Verwendung |
|--------|------------|
| `p-4` | Standard-Innenabstand für Karten und Container |
| `gap-4` | Standard-Abstand zwischen Elementen |
| `space-y-4` | Vertikaler Abstand für gestapelte Elemente |
| `mb-6` | Standardabstand unter Abschnitten |
| `mt-4` | Standardabstand über Elementen |

## Schatten und Elevation

| Klasse | Verwendung |
|--------|------------|
| `shadow-sm` | Subtile Erhebung (Buttons, Input-Felder) |
| `shadow` | Standard-Erhebung (Karten) |
| `shadow-md` | Mittlere Erhebung (Dropdowns, Tooltips) |
| `shadow-lg` | Hohe Erhebung (Modals, Dialoge) |

## Animationen und Übergänge

Für verbesserte Benutzererfahrung verwenden wir subtile Übergänge:

```css
.transition-standard {
  @apply transition-all duration-200 ease-in-out;
}

.hover-lift {
  @apply transition-transform duration-200 hover:-translate-y-1;
}
```

## UI-Komponenten

### Buttons

Wir verwenden vier Hauptvarianten:

1. **Primary Button**
   ```tsx
   <Button variant="primary">Wette erstellen</Button>
   ```

2. **Secondary Button**
   ```tsx
   <Button variant="secondary">Abbrechen</Button>
   ```

3. **Ghost Button**
   ```tsx
   <Button variant="ghost">Mehr erfahren</Button>
   ```

4. **Danger Button**
   ```tsx
   <Button variant="danger">Löschen</Button>
   ```

Größenvarianten: `sm`, `md` (Standard), `lg`

### Karten

```tsx
<Card shadow="md" padding="md">
  <CardHeader>
    <CardTitle>Kartentitel</CardTitle>
  </CardHeader>
  <CardContent>
    Karteninhalt
  </CardContent>
  <CardFooter>
    Kartenfußbereich
  </CardFooter>
</Card>
```

### Input-Felder

```tsx
<Input 
  label="Wettbeschreibung"
  placeholder="Beschreibe deine Wette..."
  leftIcon={<PencilIcon />}
  error="Fehlertext (optional)"
/>
```

### Badges für Status

```tsx
<Badge variant="primary">Aktiv</Badge>
<Badge variant="warning">Ausstehend</Badge>
<Badge variant="success">Erfolgreich</Badge>
<Badge variant="danger">Geschlossen</Badge>
```

## Responsive Breakpoints

| Breakpoint | Mindestbreite | Beschreibung |
|------------|--------------|-------------|
| `sm` | 640px | Kleine Tablets, große Mobilgeräte |
| `md` | 768px | Tablets, kleine Laptops |
| `lg` | 1024px | Desktop, große Tablets |
| `xl` | 1280px | Große Desktops |

## Layout-Grundsätze

### Container

Für Inhaltsabschnitte:

```tsx
<Container maxWidth="lg" padding={true}>
  {/* Seiteninhalt */}
</Container>
```

### Grid-System

Für responsive Layouts:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Karten oder andere wiederholte Elemente */}
</div>
```

## Best Practices

### Mobile-First Entwicklung

- Beginne immer mit der mobilen Version und erweitere dann für größere Bildschirme
- Verwende `sm:`, `md:`, `lg:` Präfixe für responsive Anpassungen
- Stelle sicher, dass Touch-Targets mindestens 44x44px groß sind

```tsx
// Beispiel für mobile-first Button
<button className="w-full py-3 sm:w-auto sm:px-6">Button</button>
```

### Konsistente Komponenten-API

- Halte Prop-Namen konsistent (z.B. immer `onClick` statt manchmal `onPress`)
- Verwende TypeScript für klare Typdefinitionen
- Dokumentiere jede Komponente mit JSDoc-Kommentaren

### Performance-Optimierungen

- Verwende `@apply` für häufig wiederkehrende Klassen-Kombinationen
- Stelle sicher, dass PurgeCSS korrekt konfiguriert ist
- Nutze TailwindCSS JIT-Modus für kleinere Bundle-Größen

## Implementierungsbeispiele

### Standard Betting Card

```tsx
<BetCard
  id="bet-123"
  question="Wird ETH im Jahr 2025 20.000$ erreichen?"
  endTime={new Date("2025-12-31")}
  totalStake="1250.75"
  creator="0x12345..."
  status="open"
  onStake={(id, outcome) => console.log(id, outcome)}
/>
```

### Filter-Komponente

```tsx
<div className="flex flex-col sm:flex-row gap-2">
  <Button 
    variant={filter === 'all' ? 'primary' : 'ghost'} 
    size="sm" 
    onClick={() => setFilter('all')}
  >
    Alle
  </Button>
  <Button 
    variant={filter === 'open' ? 'primary' : 'ghost'} 
    size="sm" 
    onClick={() => setFilter('open')}
  >
    Offen
  </Button>
  {/* Weitere Filter */}
</div>
```

## Nächste Schritte

- Integration von Dark Mode
- Erweiterte Animationen für besseres Feedback
- Internationalisierung (i18n) Support

## Ressourcen

- [Tailwind CSS Dokumentation](https://tailwindcss.com/docs)
- [Tailwind UI - Offizielle Komponenten](https://tailwindui.com)
- [Headless UI - Zugängliche UI-Komponenten](https://headlessui.dev)
- [Heroicons - Passende Icon-Bibliothek](https://heroicons.com) 