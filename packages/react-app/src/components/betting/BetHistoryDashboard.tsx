import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Card, Badge, Alert, LoadingSpinner, PrimaryButton, SecondaryButton } from '@/components/common';
import { BetCard } from '@/components/betting';
import { useBetHistory } from '@/hooks/useBetHistory';
import { useWallet } from '@/hooks/useWallet';

interface BetHistoryDashboardProps {
  dark?: boolean;
  onViewBetDetails?: (betId: number) => void;
}

/**
 * BetHistoryDashboard component displays a user's betting history and statistics
 */
const BetHistoryDashboard: React.FC<BetHistoryDashboardProps> = ({ 
  dark = true,
  onViewBetDetails
}) => {
  const { isConnected, formatAddress, address } = useWallet();
  const { 
    isLoading, 
    userBets, 
    createdBets, 
    participatedBets, 
    completedBets,
    activeBets, 
    betStats 
  } = useBetHistory();

  const [activeTab, setActiveTab] = useState<'all' | 'created' | 'joined' | 'active' | 'completed'>('all');

  // Get bets based on active tab
  const getActiveBets = () => {
    switch (activeTab) {
      case 'all':
        return userBets;
      case 'created':
        return createdBets;
      case 'joined':
        return participatedBets;
      case 'active':
        return activeBets;
      case 'completed':
        return completedBets;
      default:
        return userBets;
    }
  };

  const displayBets = getActiveBets();

  // Format amount with ethers
  const formatAmount = (amount: bigint) => {
    return `${parseFloat(ethers.formatEther(amount)).toLocaleString(undefined, { maximumFractionDigits: 2 })} MOCK`;
  };

  // Class for dark mode styling
  const darkModeClass = dark ? 'bg-gray-800 text-white border-gray-700' : '';

  if (!isConnected) {
    return (
      <Card 
        title="Bet History" 
        className={darkModeClass}
      >
        <Alert type="info">Please connect your wallet to view your betting history.</Alert>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card 
        title={
          <div className="flex items-center justify-between w-full">
            <h2>Bet History</h2>
            <Badge variant="primary">{formatAddress(address || '')}</Badge>
          </div>
        } 
        className={darkModeClass}
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`rounded-lg p-4 ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={dark ? 'text-white/50' : 'text-gray-600'}>Total Bets</div>
                <div className="text-2xl font-bold">{userBets.length}</div>
              </div>
              <div className={`rounded-lg p-4 ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={dark ? 'text-white/50' : 'text-gray-600'}>Created</div>
                <div className="text-2xl font-bold">{betStats.totalCreated}</div>
              </div>
              <div className={`rounded-lg p-4 ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={dark ? 'text-white/50' : 'text-gray-600'}>Win/Loss</div>
                <div className="text-2xl font-bold">{betStats.totalWon}/{betStats.totalLost}</div>
              </div>
              <div className={`rounded-lg p-4 ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={dark ? 'text-white/50' : 'text-gray-600'}>Total Stake</div>
                <div className="text-xl font-bold truncate">{formatAmount(betStats.totalStake)}</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 pb-2">
              <SecondaryButton 
                onClick={() => setActiveTab('all')}
                className={activeTab === 'all' ? 'bg-indigo-800/50' : ''}
              >
                All ({userBets.length})
              </SecondaryButton>
              <SecondaryButton 
                onClick={() => setActiveTab('created')}
                className={activeTab === 'created' ? 'bg-indigo-800/50' : ''}
              >
                Created ({createdBets.length})
              </SecondaryButton>
              <SecondaryButton 
                onClick={() => setActiveTab('joined')}
                className={activeTab === 'joined' ? 'bg-indigo-800/50' : ''}
              >
                Joined ({participatedBets.length})
              </SecondaryButton>
              <SecondaryButton 
                onClick={() => setActiveTab('active')}
                className={activeTab === 'active' ? 'bg-indigo-800/50' : ''}
              >
                Active ({activeBets.length})
              </SecondaryButton>
              <SecondaryButton 
                onClick={() => setActiveTab('completed')}
                className={activeTab === 'completed' ? 'bg-indigo-800/50' : ''}
              >
                Completed ({completedBets.length})
              </SecondaryButton>
            </div>

            {/* Bet list */}
            {displayBets.length === 0 ? (
              <div className="py-8 text-center">
                <p className={dark ? 'text-white/50' : 'text-gray-500'}>No bets found for this filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayBets.map((bet) => (
                  <BetCard 
                    key={bet.id} 
                    bet={bet}
                    dark={dark}
                    onViewDetails={onViewBetDetails}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default BetHistoryDashboard; 