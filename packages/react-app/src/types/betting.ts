/**
 * Betting types
 */

/**
 * Represents a bet in the system
 */
export interface Bet {
  id: number;
  creator: string;
  condition: string;
  totalStakeTrue: bigint;
  totalStakeFalse: bigint;
  creationTime: bigint;
  expirationTime: bigint;
  resolved: boolean;
  winningOutcome: boolean;
  resolutionFinalized: boolean;
}

/**
 * The state of the betting hook
 */
export interface BettingState {
  address: string | null;
  isLoading: boolean;
  bettingContracts: string[];
  bets: Bet[];
  transactionHash?: string | null;
}

/**
 * Betting hook return type
 */
export interface BettingHook extends BettingState {
  connectWallet: () => Promise<boolean>;
  getBettingContracts: () => Promise<string[]>;
  createBettingContract: () => Promise<any>;
  selectBettingContract: (contractAddress: string) => Promise<boolean>;
  getBets: () => Promise<Bet[]>;
  createBet: (amount: string, condition: string, durationDays: number, prediction: boolean) => Promise<any>;
  joinBet: (betId: number, amount: string, prediction: boolean) => Promise<any>;
  submitResolution: (betId: number, outcome: boolean) => Promise<any>;
  finalizeResolution: (betId: number) => Promise<any>;
  adminFinalizeResolution: (betId: number, outcome: boolean, cancel: boolean) => Promise<any>;
}

export interface BetData {
  id: string;
  betIdOnChain: number;
  question: string;
  creator: string;
  expirationDate: number;
  endDate: string;
  createdAt: number;
  resolved: boolean;
  yesStake: bigint;
  noStake: bigint;
  totalStake: bigint;
  resolutionFinalized: boolean;
  winningOutcome: boolean;
  status: 'active' | 'resolved' | 'expired';
  userParticipation: {
    isCreator: boolean;
    hasJoined: boolean;
    stake: bigint;
  };
} 