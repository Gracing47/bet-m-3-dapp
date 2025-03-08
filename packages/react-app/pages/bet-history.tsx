import React from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/layout';
import { BetHistoryDashboard } from '@/components/betting';
import { Alert } from '@/components/common';
import { useWallet } from '@/hooks';

export default function BetHistoryPage() {
  const router = useRouter();
  const { isConnected } = useWallet();

  // Handler for viewing bet details
  const handleViewBetDetails = (betId: number) => {
    router.push(`/test?betId=${betId}`);
  };

  return (
    <Container maxWidth="full" className="py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">Your Betting History</h1>
        
        {!isConnected ? (
          <Alert type="warning">
            Please connect your wallet to view your betting history.
          </Alert>
        ) : (
          <BetHistoryDashboard 
            onViewBetDetails={handleViewBetDetails}
          />
        )}
      </div>
    </Container>
  );
} 