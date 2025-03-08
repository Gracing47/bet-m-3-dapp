import { useState, useEffect } from 'react';
import { useWeb3 } from './web3';

interface WalletState {
  isConnecting: boolean;
  connectionError: string | undefined;
}

/**
 * Custom hook for wallet management
 * Provides a clean interface for connecting, disconnecting,
 * and retrieving wallet information
 */
export const useWallet = () => {
  const { address, balance, getUserAddress, disconnect } = useWeb3();
  const [state, setState] = useState<WalletState>({
    isConnecting: false,
    connectionError: undefined,
  });

  const tryConnect = async () => {
    setState(prev => ({ ...prev, isConnecting: true, connectionError: undefined }));
    try {
      await getUserAddress();
      // Store connection preference
      localStorage.setItem('betm3_auto_connect', 'true');
    } catch (error) {
      console.error('Connection error:', error);
      setState(prev => ({
        ...prev,
        connectionError: 'Failed to connect wallet. Please try again.',
      }));
    } finally {
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnectWallet = () => {
    // Clear auto-connect preference
    localStorage.removeItem('betm3_auto_connect');
    disconnect();
  };

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Auto-connect if previously connected
  useEffect(() => {
    const shouldAutoConnect = localStorage.getItem('betm3_auto_connect') === 'true';
    if (shouldAutoConnect && !address) {
      tryConnect();
    }
  }, [address]);

  return {
    address,
    balance,
    isConnected: !!address,
    isConnecting: state.isConnecting,
    connectionError: state.connectionError,
    connect: tryConnect,
    disconnect: disconnectWallet,
    formatAddress,
  };
}; 