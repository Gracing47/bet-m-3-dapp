import React, { useState } from 'react';
import { Container } from '@/components/layout';
import { BetCreation } from '@/components/betting';
import { Alert } from '@/components/common';
import { useBetting, useWallet } from '@/hooks';
import { useRouter } from 'next/router';

export default function CreateBetPage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { createBet, isLoading } = useBetting();
  const [error, setError] = useState<string | null>(null);

  const handleCreateBet = async (
    amount: string,
    condition: string,
    durationDays: number,
    prediction: boolean
  ) => {
    try {
      setError(null);
      const result = await createBet(amount, condition, durationDays, prediction);
      
      // If successful, wait 2 seconds then redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
      return result;
    } catch (err: any) {
      console.error("Error creating bet:", err);
      setError(err.message || "Failed to create bet. Please try again.");
      throw err;
    }
  };

  return (
    <Container maxWidth="md" className="py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Create a New Bet</h1>
        <p className="text-gray-400 mb-8 text-center">
          Set up a no-loss bet and invite others to participate
        </p>
        
        {!isConnected ? (
          <Alert type="warning">
            Please connect your wallet to create a bet.
          </Alert>
        ) : (
          <>
            {error && (
              <Alert 
                type="error" 
                className="mb-6"
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            
            <BetCreation 
              onCreateBet={handleCreateBet}
              isLoading={isLoading}
              minStake="1"
              maxStake="1000"
            />
            
            <div className="mt-8 bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-3">How No-Loss Betting Works</h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <p>
                  <span className="font-medium text-indigo-400">1. Create a Bet:</span>{' '}
                  Specify a question with a yes/no outcome, stake your tokens, and pick your prediction.
                </p>
                <p>
                  <span className="font-medium text-indigo-400">2. Others Join:</span>{' '}
                  Participants can join with their own tokens, taking the opposite position.
                </p>
                <p>
                  <span className="font-medium text-indigo-400">3. Resolution:</span>{' '}
                  When the bet duration ends, the outcome is submitted and verified.
                </p>
                <p>
                  <span className="font-medium text-indigo-400">4. Rewards:</span>{' '}
                  Winners receive their original stake plus a proportional share of the opposing side's stake.
                </p>
                <p className="font-medium text-white">
                  Your principal is protected — even if you lose, you get your stake back minus a small 1% platform fee.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </Container>
  );
} 