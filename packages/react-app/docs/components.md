# Web3 DApp UI Komponenten (React, Tailwind CSS & Yarn)

## Farbschema

### Primary & Secondary Farben

**Implementiertes Farbschema in Tailwind:**

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo-600
          light: '#6366F1',   // Indigo-500
          dark: '#3730A3'     // Indigo-800
        },
        secondary: {
          DEFAULT: '#10B981', // Emerald-500
          light: '#34D399',   // Emerald-400
          dark: '#047857'     // Emerald-700
        }
      }
    }
  }
};
```

### Nutzung der Farben

- **Primary:** Hauptaktionen, Buttons, Wallet-Verbindungen
- **Secondary:** Sekundäre Aktionen, Statusanzeigen, Hinweise

## Implementierte Komponenten

### Common Components (`src/components/common/`)

#### Buttons
- ✅ `PrimaryButton`: Hauptaktionen, Wallet-Verbindung
  ```jsx
  import { PrimaryButton } from '../components/common';
  
  <PrimaryButton 
    onClick={handleAction}
    loading={isLoading}
    disabled={isDisabled}
    widthFull
  >
    Connect Wallet
  </PrimaryButton>
  ```

- ✅ `SecondaryButton`: Sekundäre Aktionen, Filter
  ```jsx
  import { SecondaryButton } from '../components/common';
  
  <SecondaryButton 
    onClick={handleAction}
    className="mt-2"
  >
    View Details
  </SecondaryButton>
  ```

- ✅ `IconButton`: Für Aktionen mit Icons
  ```jsx
  import { IconButton } from '../components/common';
  
  <IconButton 
    onClick={handleAction}
    icon={<svg>...</svg>}
    label="Close"
  />
  ```

#### Formularelemente
- ✅ `Input`: Text- und Nummerneingaben
  ```jsx
  import { Input } from '../components/common';
  
  <Input
    label="Username"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    error={errors.username}
    helperText="Enter your username"
    fullWidth
  />
  ```

- ✅ `Select`: Dropdown-Auswahl
  ```jsx
  import { Select } from '../components/common';
  
  <Select
    label="Choose an option"
    options={[
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' }
    ]}
    value={selectedOption}
    onChange={(value) => setSelectedOption(value)}
    error={errors.option}
    fullWidth
  />
  ```

- ✅ `Switch`: Toggle-Funktionen
  ```jsx
  import { Switch } from '../components/common';
  
  <Switch
    checked={isEnabled}
    onChange={(checked) => setIsEnabled(checked)}
    label="Enable feature"
  />
  ```

#### Feedback-Komponenten
- ✅ `LoadingSpinner`: Ladezustände
  ```jsx
  import { LoadingSpinner } from '../components/common';
  
  <LoadingSpinner 
    size="md" 
    color="primary" 
  />
  ```

- ✅ `Alert`: Erfolgs- und Fehlermeldungen
  ```jsx
  import { Alert } from '../components/common';
  
  <Alert 
    type="success" 
    title="Success!"
    onClose={() => setShowAlert(false)}
  >
    Your transaction was successful.
  </Alert>
  ```

- ✅ `Badge`: Statusanzeigen
  ```jsx
  import { Badge } from '../components/common';
  
  <Badge 
    variant="success" 
    size="md" 
    rounded
  >
    Active
  </Badge>
  ```

#### Layout-Elemente
- ✅ `Card`: Container für Inhalte
  ```jsx
  import { Card } from '../components/common';
  
  <Card 
    title="Card Title"
    footer={<div>Card Footer</div>}
    hoverable
    bordered
  >
    Card content goes here.
  </Card>
  ```

- ✅ `Modal`: Overlay-Dialoge
  ```jsx
  import { Modal, PrimaryButton } from '../components/common';
  
  <Modal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    title="Confirmation"
    footer={
      <PrimaryButton onClick={handleConfirm}>Confirm</PrimaryButton>
    }
  >
    Are you sure you want to proceed?
  </Modal>
  ```

- ✅ `Tooltip`: Kontextuelle Hilfe
  ```jsx
  import { Tooltip } from '../components/common';
  
  <Tooltip 
    content="This is helpful information"
    position="top"
    delay={300}
  >
    <span>Hover me</span>
  </Tooltip>
  ```

### Layout Components (`src/components/layout/`)

- ✅ `Header`: Navigation und Wallet-Status (bereits vorhanden)
  ```jsx
  import { Header } from '../components/layout';
  
  <Header />
  ```

- ✅ `Footer`: Links und Informationen (bereits vorhanden)
  ```jsx
  import { Footer } from '../components/layout';
  
  <Footer />
  ```

- ✅ `Container`: Content Wrapper
  ```jsx
  import { Container } from '../components/layout';
  
  <Container maxWidth="lg" padding>
    Page content goes here.
  </Container>
  ```

- ✅ `Sidebar`: Navigation
  ```jsx
  import { Sidebar } from '../components/layout';
  
  <Sidebar
    items={[
      { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
      { label: 'Bets', href: '/bets', icon: <BetsIcon /> }
    ]}
    collapsible
  />
  ```

### Betting Components (`src/components/betting/`)

- ✅ `BettingInterface`: Hauptkomponente (bereits vorhanden)
  ```jsx
  import { BettingInterface } from '../components/betting';
  
  <BettingInterface />
  ```

- ✅ `WalletConnection`: Wallet-Management
  ```jsx
  import { WalletConnection } from '../components/betting';
  
  <WalletConnection
    isConnected={isConnected}
    address={address}
    balance={balance}
    chainId={chainId}
    onConnect={handleConnect}
    onDisconnect={handleDisconnect}
    isLoading={isConnecting}
    error={connectionError}
  />
  ```

- ✅ `BetCard`: Einzelne Wettanzeige
  ```jsx
  import { BetCard } from '../components/betting';
  
  <BetCard
    id="bet-123"
    title="Will ETH reach $5000 by end of 2023?"
    description="Betting on Ethereum price milestone"
    creator="0x1234...5678"
    totalStake="10 ETH"
    endTime={new Date('2023-12-31')}
    status="open"
    options={['Yes', 'No']}
    onPlaceBet={handlePlaceBet}
    onViewDetails={handleViewDetails}
  />
  ```

- ✅ `StakeInput`: Einsatz-Management
  ```jsx
  import { StakeInput } from '../components/betting';
  
  <StakeInput
    onStake={handleStake}
    maxAmount="10.5"
    minAmount="0.1"
    defaultAmount="1.0"
    symbol="ETH"
    isLoading={isStaking}
  />
  ```

- ✅ `ResolutionPanel`: Ergebnis-Einreichung
  ```jsx
  import { ResolutionPanel } from '../components/betting';
  
  <ResolutionPanel
    betId="bet-123"
    options={['Yes', 'No']}
    onResolve={handleResolve}
    isCreator={isCreator}
    isResolved={isResolved}
    winningOption={winningOption}
  />
  ```

- ✅ `BetCreation`: Multi-Step-Formular zum Erstellen neuer Wetten
  ```jsx
  import { BetCreation } from '../components/betting';
  
  <BetCreation
    onSubmit={handleCreateBet}
    isLoading={isCreating}
  />
  ```

## Mobile-First Ansatz

Alle Komponenten wurden mit einem Mobile-First-Ansatz implementiert:

- Responsive Layouts mit Tailwind-Breakpoints:
  - `sm`: 640px - Kleine Tablets und große Smartphones
  - `md`: 768px - Tablets im Hochformat
  - `lg`: 1024px - Tablets im Querformat und kleine Desktops
  - `xl`: 1280px - Standard Desktops

- Beispiel für responsive Anpassungen:
  ```jsx
  <div className="flex flex-col sm:flex-row">
    {/* Stapelt Elemente auf mobilen Geräten, nebeneinander auf größeren Bildschirmen */}
  </div>
  ```

## Cursor-Interaktionen

Konsistente Cursor-Zustände für bessere Benutzerführung:

- **Interaktive Elemente:**
  ```html
  className="cursor-pointer"
  ```

- **Deaktivierte Elemente:**
  ```html
  className="cursor-not-allowed opacity-50"
  ```

- **Ladezustände:**
  ```html
  className="cursor-wait"
  ```

## Accessibility

Alle Komponenten wurden mit Barrierefreiheit im Fokus entwickelt:

- ARIA-Labels für interaktive Elemente
- Tastaturnavigation
- Fokus-Management für Modals
- Farbkontrast nach WCAG AA-Standards

## Projektverwaltung mit Yarn

Effiziente Paketverwaltung:

```shell
# Installation neuer Pakete
yarn add <package-name>

# Regelmäßige Updates
yarn upgrade

# Lokaler Entwicklungsserver
yarn dev

# Produktion Build
yarn build
```

## Nächste Schritte

- Implementierung weiterer Betting-spezifischer Komponenten:
  - `BetList`: Liste aller aktiven Wetten
  - `ContractSelector`: Auswahl verschiedener Betting-Contracts
  - `FinalizationControls`: Steuerelemente für den Abschluss von Wetten
  - `OutcomeDisplay`: Detaillierte Anzeige von Wett-Ergebnissen