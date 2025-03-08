# Senior Developer Instructions for DApp UI Development with React, TypeScript & Tailwind

## Overview
Diese Dokumentation bietet klare Anweisungen zur effizienten Implementierung einer wiederverwendbaren und minimalistischen UI für die BETM3 "No Loss Betting" dezentralisierte Anwendung (DApp) mit React, TypeScript und Tailwind CSS.

## Projektstruktur
Für Skalierbarkeit und Wartbarkeit folgt das Projekt dieser Struktur:

```
src/
├── components/
│   ├── ui/                # Wiederverwendbare UI-Komponenten
│   │   ├── Button.tsx     # Aktionsschaltflächen
│   │   ├── Card.tsx       # Container für Inhaltsblöcke
│   │   ├── Input.tsx      # Formular-Eingabefelder
│   │   └── Container.tsx  # Responsive Layout-Container
│   ├── betting/           # Wett-spezifische Komponenten
│   │   ├── BetCard.tsx    # Einzelne Wett-Anzeige
│   │   ├── BetList.tsx    # Liste aller Wetten
│   │   └── BetForm.tsx    # Formular zum Erstellen neuer Wetten
│   ├── layout/            # Layout-Komponenten
│   │   ├── Header.tsx     # Kopfbereich mit Navigation
│   │   └── Footer.tsx     # Fußbereich
│   └── wallet/            # Wallet-Komponenten
│       └── WalletModal.tsx # Wallet-Verbindungsdialog
├── hooks/                 # Custom React Hooks
│   ├── useBetting.ts      # Betting-Logik
│   └── useWallet.ts       # Wallet-Integration
└── pages/                 # Seiten-Komponenten
    ├── index.tsx          # Startseite
    └── betting.tsx        # Wett-Hauptseite
```

## Komponenten-Breakdown

### 1. UI-Komponenten (`@/components/ui`)
Wiederverwendbare Basis-UI-Komponenten für konsistentes Styling:

#### Button Komponente
```tsx
// @/components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  ...props 
}) => {
  // Implementation...
};
```

#### Card Komponente
```tsx
// @/components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

export const Card = ({
  children,
  className = '',
  shadow = 'md',
  padding = 'md',
  border = true,
  ...props
}) => {
  // Implementation...
};

// Zusätzliche Komponenten: CardHeader, CardTitle, CardContent, CardFooter
```

### 2. Betting-Komponenten

#### BetCard Komponente
Wiederverwendbare Komponente zur Anzeige einzelner Wetten:

```tsx
interface BetCardProps {
  id: string;
  question: string;
  endTime: Date;
  totalStake: string;
  creator: string;
  status: 'open' | 'closed' | 'resolved';
  outcome?: boolean;
  onStake: (betId: string, outcome: boolean) => void;
}

const BetCard: React.FC<BetCardProps> = ({ 
  id, 
  question, 
  endTime, 
  totalStake,
  creator,
  status,
  outcome,
  onStake 
}) => (
  <Card className="hover:shadow-md transition-all">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <CardTitle className="text-base">{question}</CardTitle>
        <Badge variant={status === 'open' ? 'primary' : status === 'closed' ? 'warning' : 'success'}>
          {status}
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">ID:</span>
          <span className="font-mono">{id.substring(0, 8)}...</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Endet am:</span>
          <span>{new Date(endTime).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Gesamteinsatz:</span>
          <span>{totalStake} CELO</span>
        </div>
      </div>
      
      {status === 'open' && (
        <div className="mt-4 flex gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            fullWidth 
            onClick={() => onStake(id, true)}
          >
            Ja
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            fullWidth 
            onClick={() => onStake(id, false)}
          >
            Nein
          </Button>
        </div>
      )}
      
      {status === 'resolved' && outcome !== undefined && (
        <div className="mt-4 text-center font-medium">
          Ergebnis: {outcome ? 'Ja' : 'Nein'}
        </div>
      )}
    </CardContent>
  </Card>
);
```

#### BetList Komponente
Komponente zur Anzeige und Filterung von Wetten:

```tsx
interface BetListProps {
  bets: Array<{
    id: string;
    question: string;
    endTime: Date;
    totalStake: string;
    creator: string;
    status: 'open' | 'closed' | 'resolved';
    outcome?: boolean;
  }>;
  onStake: (betId: string, outcome: boolean) => void;
}

const BetList: React.FC<BetListProps> = ({ bets, onStake }) => {
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredBets = bets
    .filter(bet => filter === 'all' || bet.status === filter)
    .filter(bet => 
      bet.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bet.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Suche nach Wetten..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<SearchIcon className="h-4 w-4" />}
          fullWidth
        />
        
        <div className="flex">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            Alle
          </Button>
          <Button
            variant={filter === 'open' ? 'primary' : 'ghost'}
            onClick={() => setFilter('open')}
            size="sm"
          >
            Offen
          </Button>
          <Button
            variant={filter === 'closed' ? 'primary' : 'ghost'}
            onClick={() => setFilter('closed')}
            size="sm"
          >
            Beendet
          </Button>
          <Button
            variant={filter === 'resolved' ? 'primary' : 'ghost'}
            onClick={() => setFilter('resolved')}
            size="sm"
          >
            Aufgelöst
          </Button>
        </div>
      </div>
      
      {filteredBets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Keine Wetten gefunden.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBets.map(bet => (
            <BetCard
              key={bet.id}
              {...bet}
              onStake={onStake}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

### 3. Wallet-Komponenten

#### WalletModal Komponente

```tsx
interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: string | null;
  balance?: string | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  address,
  balance,
  onConnect,
  onDisconnect
}) => {
  // Implementation...
};
```

## Implementierungsschritte

### 1. Mobile-First Ansatz
Alle Komponenten werden nach dem "Mobile-First"-Prinzip entwickelt:

1. Layout mit Flexbox und Grid für responsive Designs
2. Breakpoint-Präfixe verwenden: `sm:`, `md:`, `lg:`
3. Touch-optimierte Elemente (größere Klickbereiche)
4. Vermeidung horizontalen Scrollens

```tsx
// Beispiel für Mobile-First Card Layout
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

### 2. Betting-Interface

Die Hauptseite für Wetten sollte folgende Struktur haben:

```tsx
// pages/betting.tsx
import React, { useState, useEffect } from 'react';
import { Container } from '@/components/ui';
import { BetList, BetForm } from '@/components/betting';
import { useBetting } from '@/hooks/useBetting';

const BettingPage: React.FC = () => {
  const { bets, createBet, stakeBet } = useBetting();
  const [showForm, setShowForm] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <Container>
        <h1 className="text-2xl font-bold mb-6">BETM3 Wetten</h1>
        
        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'secondary' : 'primary'}
          >
            {showForm ? 'Schließen' : 'Neue Wette erstellen'}
          </Button>
        </div>
        
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Neue Wette erstellen</CardTitle>
            </CardHeader>
            <CardContent>
              <BetForm onSubmit={createBet} />
            </CardContent>
          </Card>
        )}
        
        <BetList bets={bets} onStake={stakeBet} />
      </Container>
    </div>
  );
};

export default BettingPage;
```

## Leistung & Optimierung

### Code-Splitting
Verwende dynamische Imports für große Komponenten:

```tsx
const BettingPage = React.lazy(() => import('./pages/betting'));

// In der App-Komponente:
<Suspense fallback={<div>Wird geladen...</div>}>
  <BettingPage />
</Suspense>
```

### Memoization
Optimiere Renderings mit React.memo und useMemo:

```tsx
const BetCard = React.memo(({ id, question, ...rest }) => {
  // Implementation...
});

// In Listen-Komponenten:
const filteredBets = useMemo(() => {
  return bets.filter(/* Filterlogik */);
}, [bets, filter, searchQuery]);
```

### Tailwind Optimierung
- Verwende JIT-Modus für kleinere CSS-Bundles
- Extrahiere wiederholte Klassen in eigene Komponenten
- Benutze `@apply` für komplexe, wiederholte Stile

```css
/* In Ihrer globalen CSS-Datei */
@layer components {
  .card-hover {
    @apply hover:shadow-md transition-all duration-200 hover:-translate-y-1;
  }
}
```

## Best Practices

### Komponenten-Design
1. **Atomares Design**: UI in kleine, wiederverwendbare Teile aufteilen
2. **Komposition über Vererbung**: Komponenten durch Komposition kombinieren
3. **Prop-Drilling vermeiden**: Kontext oder Hooks für gemeinsame Daten verwenden

### Mobile-First
1. **Flexible Layouts**: Flex/Grid für adaptive Layouts
2. **Touch-optimiert**: Größere Touch-Targets (min. 44x44px)
3. **Offline Unterstützung**: Service Worker für Offline-Funktionalität implementieren

### Performance
1. **Code-Splitting**: Lazy-Loading für Routen und große Komponenten
2. **Virtualisierung**: Lange Listen mit `react-window` oder `react-virtualized` rendern
3. **Memoization**: `React.memo`, `useMemo` und `useCallback` für teure Berechnungen

## Zusätzliche Ressourcen

- [Tailwind CSS Dokumentation](https://tailwindcss.com/docs)
- [React TypeScript Cheatsheet](https://github.com/typescript-cheatsheets/react)
- [React Performance Optimierung](https://reactjs.org/docs/optimizing-performance.html)

Diese Anweisungen sollen die Effizienz, Skalierbarkeit und Wartbarkeit der BETM3 DApp UI maximieren. 