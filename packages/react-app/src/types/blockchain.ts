/**
 * Blockchain types
 */

export interface Web3State {
  address: string | null;
}

export interface Web3Hook extends Web3State {
  getUserAddress: () => Promise<void>;
  sendCUSD: (to: string, amount: string) => Promise<any>;
  signTransaction: () => Promise<string>;
}

// Define Ethereum object that exists on the window
export interface Ethereum {
  request: (args: {method: string; params?: any[]}) => Promise<any>;
  on: (event: string, callback: (accounts: string[]) => void) => void;
  removeListener: (event: string, callback: (accounts: string[]) => void) => void;
  isMetaMask?: boolean;
} 