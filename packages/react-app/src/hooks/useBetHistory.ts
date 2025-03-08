import { useState, useEffect } from 'react';
import { useWallet } from './useWallet';
import { BetData } from '@/types/betting';
import { useBetting } from './useBetting';

/**
 * Hook for tracking and managing bet history for the current wallet address
 * Provides functionality to track user's betting activity
 */
export const useBetHistory = () => {
  const { address, isConnected } = useWallet();
  const { bets } = useBetting();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userBets, setUserBets] = useState<BetData[]>([]);
  const [createdBets, setCreatedBets] = useState<BetData[]>([]);
  const [participatedBets, setParticipatedBets] = useState<BetData[]>([]);
  const [completedBets, setCompletedBets] = useState<BetData[]>([]);
  const [activeBets, setActiveBets] = useState<BetData[]>([]);
  const [betStats, setBetStats] = useState({
    totalCreated: 0,
    totalJoined: 0,
    totalWon: 0,
    totalLost: 0,
    totalStake: 0n,
    totalWinnings: 0n,
  });

  useEffect(() => {
    if (!isConnected || !address || !bets.length) {
      setIsLoading(false);
      setUserBets([]);
      setCreatedBets([]);
      setParticipatedBets([]);
      setCompletedBets([]);
      setActiveBets([]);
      return;
    }

    setIsLoading(true);

    // Filter bets for the current wallet
    const filtered = bets.filter(bet => {
      const isParticipant = bet.userParticipation?.hasJoined || false;
      const isCreator = bet.userParticipation?.isCreator || false;
      return isParticipant || isCreator;
    });

    // Set user bets
    setUserBets(filtered);

    // Filter by role
    const created = filtered.filter(bet => bet.userParticipation?.isCreator);
    const participated = filtered.filter(bet => bet.userParticipation?.hasJoined && !bet.userParticipation?.isCreator);
    
    // Filter by status
    const completed = filtered.filter(bet => bet.status === 'resolved');
    const active = filtered.filter(bet => bet.status === 'active');

    // Set filtered lists
    setCreatedBets(created);
    setParticipatedBets(participated);
    setCompletedBets(completed);
    setActiveBets(active);

    // Calculate statistics
    let totalWon = 0;
    let totalLost = 0;
    let totalStake = 0n;
    let totalWinnings = 0n;

    completed.forEach(bet => {
      const stake = bet.userParticipation?.stake || 0n;
      totalStake = totalStake + stake;

      if (bet.resolved) {
        // Check if user's prediction matched the outcome
        const userPrediction = bet.userParticipation?.prediction;
        const outcomeMatched = userPrediction === bet.winningOutcome;
        
        if (outcomeMatched) {
          totalWon++;
          // Calculate winnings - simplified, would need logic from smart contract
          // This is just a placeholder
          totalWinnings = totalWinnings + stake * 2n;
        } else {
          totalLost++;
        }
      }
    });

    // Update stats
    setBetStats({
      totalCreated: created.length,
      totalJoined: participated.length,
      totalWon,
      totalLost,
      totalStake,
      totalWinnings,
    });

    setIsLoading(false);
  }, [bets, address, isConnected]);

  return {
    isLoading,
    userBets,
    createdBets,
    participatedBets,
    completedBets,
    activeBets,
    betStats,
  };
};

export default useBetHistory; 