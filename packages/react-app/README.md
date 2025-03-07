# BETM3 React Application

This is a React application for interacting with the BETM3 betting smart contracts.

## Overview

The BETM3 React application provides a user-friendly interface for interacting with the betting smart contracts deployed on the Celo blockchain. Users can:

- Connect their wallet
- Create betting contracts
- Create bets with specific conditions
- Join existing bets
- Submit and finalize resolutions

## Development

### Prerequisites

- Node.js (>= 16.0.0)
- Yarn

### Setup

1. Install dependencies:

```bash
yarn install
```

2. Set up environment variables:

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_BETTING_FACTORY_ADDRESS=your_factory_address
NEXT_PUBLIC_MOCK_TOKEN_ADDRESS=your_token_address
```

### Running the Application

```bash
yarn dev
```

### Building for Production

```bash
yarn build
```

## Testing

The BETM3 React application uses Jest and React Testing Library for testing.

### Running Tests

```bash
yarn test
```

### Running Tests with Coverage

```bash
yarn test --coverage
```

### Test Structure

- `components/__tests__/`: Tests for React components
- `contexts/__tests__/`: Tests for React hooks and contexts

### Testing Patterns

#### Component Tests

Component tests focus on:
- Rendering the component with different props
- Verifying the DOM output
- Testing user interactions

Example:

```tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BettingInterface from '../BettingInterface';

// Mock dependencies
jest.mock('@/contexts/useBetting', () => ({
  useBetting: jest.fn()
}));

// Import the mocked module
import { useBetting } from '@/contexts/useBetting';

describe('BettingInterface Component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders connect wallet button when no wallet is connected', () => {
    (useBetting as jest.Mock).mockReturnValue({
      address: null,
      // other mock values...
    });

    render(<BettingInterface />);
    
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });
});
```

#### Hook Tests

Hook tests focus on:
- Initial state
- State updates
- Async operations
- Error handling

Example:

```tsx
import { renderHook } from '@testing-library/react-hooks';
import { useBetting } from '../useBetting';

describe('useBetting Hook', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useBetting());
    
    expect(result.current.address).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
```

## Directory Structure

```
packages/react-app/
├── src/                # Source code directory
│   ├── components/     # React components
│   │   ├── betting/   # Betting-related components
│   │   ├── layout/    # Layout components
│   │   └── common/    # Reusable components (buttons, etc.)
│   └── hooks/         # Custom React hooks
│       ├── useBetting.ts   # Hook for betting functionality
│       ├── useWeb3.ts      # Hook for web3 interactions
│       ├── index.ts        # Hook exports
│       └── __tests__/     # Hook tests
├── pages/             # Next.js pages
├── public/            # Static assets
├── styles/            # CSS and styling
├── jest.config.js     # Jest configuration
├── jest.setup.js      # Jest setup file
├── tsconfig.json      # TypeScript configuration
├── next.config.js     # Next.js configuration
└── tailwind.config.js # Tailwind CSS configuration
```

## Environment Setup

The application uses several environment files:

- `.env`: Base environment variables
- `.env.test`: Test-specific environment variables
- `.env.local`: Local development variables (not committed to git)

## Contract Interaction

The application interacts with the following smart contracts:

- `BettingManagerFactory`: Creates and manages betting contracts
- `NoLossBetMulti`: Handles the bets, stakes, and resolutions
- `MockToken`: ERC20 token used for staking

The ABIs for these contracts are stored in the `abis/` directory.
