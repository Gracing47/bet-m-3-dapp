# BETM3 Betting Components Guide

This guide provides detailed information about the betting-specific components in the BETM3 application, their purpose, props, and how they interact with each other.

## Component Overview

The betting components are located in `src/components/betting/` and form the core functionality of the application:

```
src/components/betting/
├── BetCard.tsx
├── BetCreation.tsx
├── BetList.tsx
├── BettingInterface.tsx
├── ContractSelector.tsx
├── ResolutionPanel.tsx
├── StakeInput.tsx
├── WalletConnection.tsx
└── index.ts
```

## Component Hierarchy

The components are organized in a hierarchical structure:

```
BettingInterface
├── WalletConnection
├── ContractSelector
├── BetCreation
└── BetList
    └── BetCard
        ├── StakeInput
        └── ResolutionPanel
```

## Detailed Component Descriptions

### BettingInterface

The main orchestrator component that manages the overall betting experience.

**Purpose:**
- Serves as the container for all betting-related functionality
- Manages the state of the betting application
- Coordinates interactions between child components

**Key Features:**
- Wallet connection management
- Contract selection and creation
- Bet listing and filtering
- Bet creation workflow

**Usage:**
```jsx
import { BettingInterface } from '@/components/betting';

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BettingInterface />
    </div>
  );
}
```

### ContractSelector

Allows users to select from existing betting contracts or create new ones.

**Purpose:**
- Provides an interface for selecting different betting contracts
- Enables creation of new betting contracts

**Props:**
```typescript
interface ContractSelectorProps {
  bettingContracts: string[];
  isLoading: boolean;
  onSelectContract: (contractAddress: string) => Promise<boolean>;
  onCreateContract: () => Promise<void>;
  onGetContracts: () => Promise<string[]>;
}
```

**Key Features:**
- Dropdown selection of available contracts
- Contract creation button
- Error handling for contract operations
- Address formatting for better readability

**Usage:**
```jsx
<ContractSelector
  bettingContracts={contracts}
  isLoading={isLoading}
  onSelectContract={handleSelectContract}
  onCreateContract={handleCreateContract}
  onGetContracts={fetchContracts}
/>
```

### BetList

Displays a list of available bets with filtering options.

**Purpose:**
- Shows all available bets in the selected contract
- Provides filtering and sorting capabilities

**Props:**
```typescript
interface BetListProps {
  bets: Bet[];
  isLoading: boolean;
  onJoinBet: (betId: string, option: string, amount: string) => Promise<void>;
  onResolveBet: (betId: string, winningOption: string) => Promise<void>;
  userAddress: string | null;
}
```

**Key Features:**
- Responsive grid layout for bet cards
- Empty state handling
- Loading state visualization
- Error handling

**Usage:**
```jsx
<BetList
  bets={bets}
  isLoading={isLoadingBets}
  onJoinBet={handleJoinBet}
  onResolveBet={handleResolveBet}
  userAddress={address}
/>
```

### BetCard

Displays information about an individual bet.

**Purpose:**
- Shows detailed information about a specific bet
- Provides interfaces for joining and resolving bets

**Props:**
```typescript
interface BetCardProps {
  bet: Bet;
  userAddress: string | null;
  onJoinBet: (betId: string, option: string, amount: string) => Promise<void>;
  onResolveBet: (betId: string, winningOption: string) => Promise<void>;
}
```

**Key Features:**
- Displays bet title, description, and status
- Shows creator information
- Displays options and current stakes
- Provides interface for joining a bet
- Shows resolution controls for bet creators

**Usage:**
```jsx
<BetCard
  bet={bet}
  userAddress={address}
  onJoinBet={handleJoinBet}
  onResolveBet={handleResolveBet}
/>
```

### BetCreation

Multi-step form for creating new bets.

**Purpose:**
- Guides users through the process of creating a new bet

**Props:**
```typescript
interface BetCreationProps {
  onCreateBet: (betData: BetCreationData) => Promise<void>;
  isLoading: boolean;
}
```

**Key Features:**
- Multi-step form with validation
- Title and description inputs
- Option configuration
- Deadline setting
- Stake amount specification

**Usage:**
```jsx
<BetCreation
  onCreateBet={handleCreateBet}
  isLoading={isCreatingBet}
/>
```

### StakeInput

Input component for specifying stake amounts.

**Purpose:**
- Allows users to input stake amounts for bets

**Props:**
```typescript
interface StakeInputProps {
  onStake: (amount: string) => void;
  maxAmount?: string;
  minAmount?: string;
  defaultAmount?: string;
  symbol?: string;
  isLoading?: boolean;
  error?: string;
}
```

**Key Features:**
- Numeric input with validation
- Min/max amount enforcement
- Token symbol display
- Loading state handling

**Usage:**
```jsx
<StakeInput
  onStake={handleStake}
  maxAmount="10.0"
  minAmount="0.1"
  defaultAmount="1.0"
  symbol="CELO"
  isLoading={isStaking}
  error={stakeError}
/>
```

### ResolutionPanel

Controls for resolving bets.

**Purpose:**
- Provides an interface for bet creators to resolve bets

**Props:**
```typescript
interface ResolutionPanelProps {
  betId: string;
  options: string[];
  isCreator: boolean;
  isResolved: boolean;
  winningOption?: string;
  onResolveBet: (betId: string, winningOption: string) => Promise<void>;
}
```

**Key Features:**
- Option selection for resolution
- Resolution submission
- Creator-only access control
- Resolution status display

**Usage:**
```jsx
<ResolutionPanel
  betId={bet.id}
  options={bet.options}
  isCreator={isCreator}
  isResolved={bet.isResolved}
  winningOption={bet.winningOption}
  onResolveBet={handleResolveBet}
/>
```

### WalletConnection

Handles wallet connection and displays wallet information.

**Purpose:**
- Provides an interface for connecting to a wallet
- Displays wallet information and connection status

**Props:**
```typescript
interface WalletConnectionProps {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnecting: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  error: string | null;
}
```

**Key Features:**
- Connect/disconnect wallet functionality
- Address display with copy functionality
- Balance display
- Network information
- Error handling

**Usage:**
```jsx
<WalletConnection
  address={address}
  balance={balance}
  chainId={chainId}
  isConnecting={isConnecting}
  onConnect={handleConnect}
  onDisconnect={handleDisconnect}
  error={connectionError}
/>
```

## Component Interactions

The betting components interact with each other in the following ways:

1. **BettingInterface** orchestrates all components and manages the overall state
2. **WalletConnection** handles wallet connectivity, which is required for all betting operations
3. **ContractSelector** allows users to select or create betting contracts
4. **BetCreation** enables users to create new bets within the selected contract
5. **BetList** displays all bets from the selected contract
6. **BetCard** shows individual bet details and provides interfaces for interaction
7. **StakeInput** is used within BetCard for joining bets
8. **ResolutionPanel** is used within BetCard for resolving bets

## State Management

The betting components rely on the `useBetting` hook for state management and blockchain interactions. This hook provides:

- Wallet connection state and functions
- Contract interaction methods
- Bet data and operations
- Loading and error states

## Styling Approach

The betting components use Tailwind CSS for styling with a consistent approach:

- Responsive design with mobile-first approach
- Consistent color scheme using theme variables
- Accessible UI elements with proper contrast
- Loading and error states with visual feedback

## Best Practices

When working with the betting components, follow these best practices:

1. **Component Composition**: Use the existing component hierarchy and avoid bypassing parent components
2. **State Management**: Use the `useBetting` hook for all blockchain interactions
3. **Error Handling**: Always handle errors and provide user feedback
4. **Loading States**: Show loading indicators for all asynchronous operations
5. **Responsive Design**: Ensure all components work well on different screen sizes
6. **Accessibility**: Maintain accessibility standards in all components

## Future Enhancements

Potential enhancements for the betting components include:

1. **Advanced Filtering**: Add more filtering options to BetList
2. **Bet Categories**: Implement categorization for bets
3. **Social Features**: Add sharing and social interaction capabilities
4. **Analytics**: Implement bet performance analytics
5. **Notifications**: Add real-time notifications for bet events
