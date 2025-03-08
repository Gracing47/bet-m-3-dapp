# BETM3 DApp - Refactoring Plan

This document outlines a plan to refactor the monolithic `test.tsx` file into a more maintainable structure of components and hooks.

## Current Issues

- **Excessive File Size**: The current `test.tsx` file is over 3,000 lines of code
- **Mixed Concerns**: UI, state management, and business logic are tightly coupled
- **Difficult Maintenance**: Bug fixes and feature additions are complex
- **Poor Reusability**: Code cannot be easily shared between pages
- **Testing Challenges**: Monolithic structure makes unit testing difficult

## Proposed Directory Structure

```
src/
├── components/
│   ├── betting/
│   │   ├── BetCard.tsx           # Individual bet display
│   │   ├── BetList.tsx           # List of bets with filtering
│   │   ├── CreateBetForm.tsx     # Form for creating new bets
│   │   ├── JoinBetPanel.tsx      # UI for joining a bet
│   │   ├── ResolutionPanel.tsx   # UI for resolving bets
│   │   ├── BetStatusBadge.tsx    # Status indicator component
│   │   └── TimestampDisplay.tsx  # Formatted time display
│   ├── common/
│   │   ├── Button.tsx            # Reusable button component
│   │   ├── Input.tsx             # Form input components
│   │   ├── Card.tsx              # Card container
│   │   ├── LoadingSpinner.tsx    # Loading indicator
│   │   └── ErrorDisplay.tsx      # Error message component
│   └── layout/
│       ├── Header.tsx            # Page header with wallet connection
│       ├── Footer.tsx            # Page footer
│       ├── Tabs.tsx              # Tab navigation
│       └── PageContainer.tsx     # Main page layout wrapper
├── hooks/
│   ├── useBetting.ts             # Core betting contract interactions
│   ├── useTimestamp.ts           # Timestamp extraction and formatting
│   ├── useWallet.ts              # Wallet connection and management
│   ├── useBlockchainTime.ts      # Blockchain time utilities
│   └── useBetStatus.ts           # Bet status calculations
├── utils/
│   ├── constants.ts              # App-wide constants
│   ├── contractHelpers.ts        # Contract interaction utilities
│   ├── formatters.ts             # Data formatting functions
│   └── validators.ts             # Input validation functions
├── pages/
│   ├── index.tsx                 # Landing page
│   ├── MyBets.tsx                # User's bets page (created and joined)
│   ├── ExploreBets.tsx           # Browse all active bets
│   ├── BetDetails.tsx            # Single bet details view
│   └── test.tsx                  # Simplified test page
└── assets/
    └── abis/                     # Contract ABIs
        └── NoLossBetMulti.json   # Betting contract ABI
```

## Extraction Process (Phase 1)

1. **Extract Common Utilities First**
   - Move constants and simple utility functions
   - Create formatting helpers for addresses, dates, etc.
   - Implement validation functions

2. **Create Core Hooks**
   - Extract `useTimestamp` hook for timestamp handling
   - Create `useWallet` hook for wallet connections
   - Implement `useBetting` hook for contract interactions

3. **Build UI Components**
   - Create reusable base components (Button, Input, etc.)
   - Build betting-specific components (BetCard, BetList, etc.)
   - Implement layout components

## Page Implementation (Phase 2)

1. **Create MyBets Page**
   - Focus on displaying user's bets (created and joined)
   - Implement filtering and sorting
   - Support bet interaction (join, resolve, finalize)

2. **Create ExploreBets Page**
   - Browse all available bets
   - Implement search and filtering
   - Allow joining from this page

3. **Create BetDetails Page**
   - Show complete information about a single bet
   - Display participants and stakes
   - Support all bet actions

## Refactoring Timeline

### Week 1: Foundation
- Extract constants and utilities
- Create basic hooks structure
- Build common UI components

### Week 2: Core Components
- Implement betting-specific components
- Connect components to hooks
- Create layout structure

### Week 3: Pages
- Implement MyBets page
- Create ExploreBets page
- Build BetDetails page
- Simplify test page

### Week 4: Testing & Polish
- Write unit tests for components and hooks
- Add error handling
- Implement loading states
- Refine user experience

## Immediate Next Steps

1. Create the base directory structure
2. Extract timestamp utilities to `useTimestamp` hook
3. Create the wallet connection hook
4. Build BetCard component
5. Implement a first version of the MyBets page 