import { useEffect } from 'react';
import { BettingInterface, WalletConnection } from '@/components/betting';
import { useWeb3 } from '@/hooks';
import { Alert } from '@/components/common';

export default function BettingPage() {
  const { address, getUserAddress } = useWeb3();

  useEffect(() => {
    // Connect wallet when page loads
    getUserAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Betting Platform</h1>
        <p className="text-lg text-gray-600">
          Create bets, place stakes, and win with our decentralized betting platform.
        </p>
      </div>

      {!address ? (
        <div className="my-16 text-center">
          <Alert 
            type="info" 
            title="Wallet Connection Required"
          >
            Please connect your wallet to use the betting platform.
          </Alert>
          <div className="mt-8">
            <WalletConnection 
              isConnected={!!address}
              address={address || undefined}
              onConnect={getUserAddress}
              onDisconnect={() => {
                // Implement disconnect logic
                console.log('Disconnect wallet');
              }}
            />
          </div>
        </div>
      ) : (
        <BettingInterface />
      )}
    </div>
  );
} 