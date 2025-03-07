# BETM3 React App Source Structure

This directory contains the reorganized source code for the BETM3 React application.

## Directory Structure

```
src/
├── components/              # UI Components
│   ├── betting/             # Betting-specific components
│   │   ├── BettingInterface.tsx
│   │   └── index.ts         # Re-export all components
│   ├── common/              # Reusable UI components
│   │   ├── Button.tsx
│   │   └── index.ts
│   └── layout/              # Layout components
│       ├── Footer.tsx
│       ├── Header.tsx
│       ├── Layout.tsx
│       └── index.ts
│
├── hooks/                   # Custom React hooks
│   ├── useBetting.ts
│   ├── useWeb3.ts
│   └── index.ts             # Re-export all hooks
│
├── utils/                   # Utility functions
│   ├── blockchain.ts        # Blockchain-related utilities
│   ├── formatters.ts        # Data formatting utilities
│   └── index.ts
│
├── constants/               # Application constants
│   ├── contracts.ts         # Contract addresses and configurations
│   ├── app.ts               # App-wide constants
│   └── index.ts
│
├── types/                   # TypeScript type definitions
│   ├── blockchain.ts        # Blockchain-related types
│   ├── betting.ts           # Betting-related types
│   └── index.ts
│
├── services/                # External service integrations
│   ├── blockchain.ts        # Blockchain service functions
│   └── index.ts
│
├── layouts/                 # Page layouts
│   ├── DefaultLayout.tsx
│   └── index.ts
│
├── assets/                  # Static assets (images, icons)
│   └── abis/                # Smart contract ABIs
│       ├── BettingManagerFactory.json
│       ├── NoLossBetMulti.json
│       └── MockToken.json
│
└── index.ts                 # Main entry point with exports
```

## Best Practices

1. **Component Organization**:
   - Each component should be in its own directory with the component file, styles, tests, and any related subcomponents
   - Use index.ts files to re-export components for cleaner imports

2. **Hooks**:
   - Custom hooks should be focused on a single responsibility
   - Use descriptive names that start with "use"

3. **Type Safety**:
   - Define interfaces and types for all component props
   - Use TypeScript features to ensure type safety

4. **Code Splitting**:
   - Split complex components into smaller, more manageable pieces
   - Consider using React.lazy() for code splitting in larger applications

5. **Testing**:
   - Keep tests alongside the components they test
   - Follow testing best practices with arrange-act-assert pattern

## Import Examples

Old imports:
```tsx
import PrimaryButton from './Button';
import { useBetting } from '@/contexts/useBetting';
```

New imports:
```tsx
import { PrimaryButton } from '@/components/common';
import { useBetting } from '@/hooks';
``` 