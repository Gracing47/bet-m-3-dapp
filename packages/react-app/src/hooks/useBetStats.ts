import { useState, useEffect } from 'react';
import { useBetting } from './useBetting';
import { BetData } from '@/types/betting';

interface BetStatsData {
  totalBets: number;
  activeBets: number;
  resolvedBets: number;
  expiredBets: number;
  totalStaked: bigint;
  largestBet: bigint;
  participantCount: number;
  isLoading: boolean;
  uniqueAddresses: Set<string>;
  yesVotes: number;
  noVotes: number;
}

/**
 * Hook for gathering platform-wide statistics about bets
 */
export const useBetStats = () => {
  const { bets, isLoading } = useBetting();
  const [stats, setStats] = useState<BetStatsData>({
    totalBets: 0,
    activeBets: 0,
    resolvedBets: 0,
    expiredBets: 0,
    totalStaked: BigInt(0),
    largestBet: BigInt(0),
    participantCount: 0,
    isLoading: true,
    uniqueAddresses: new Set<string>(),
    yesVotes: 0,
    noVotes: 0
  });

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // Process bets to calculate statistics
    calculateStats(bets as unknown as BetData[]);
  }, [bets, isLoading]);

  const calculateStats = (bets: BetData[]) => {
    let totalStakedAmount = BigInt(0);
    let largestBetAmount = BigInt(0);
    let active = 0;
    let resolved = 0;
    let expired = 0;
    let yesVoteCount = 0;
    let noVoteCount = 0;
    
    // Track unique participants
    const uniqueAddresses = new Set<string>();
    
    // Process each bet
    bets.forEach(bet => {
      // Count by status
      if (bet.status === 'active') active++;
      else if (bet.status === 'resolved') resolved++;
      else if (bet.status === 'expired') expired++;
      
      // Track creator
      uniqueAddresses.add(bet.creator);
      
      // Calculate total stake
      const totalBetStake = bet.totalStake || BigInt(0);
      totalStakedAmount += totalBetStake;
      
      // Track largest bet
      if (totalBetStake > largestBetAmount) {
        largestBetAmount = totalBetStake;
      }
      
      // Count yes/no votes
      const yesStake = bet.yesStake || BigInt(0);
      const noStake = bet.noStake || BigInt(0);
      
      if (yesStake > BigInt(0)) yesVoteCount++;
      if (noStake > BigInt(0)) noVoteCount++;
    });
    
    setStats({
      totalBets: bets.length,
      activeBets: active,
      resolvedBets: resolved,
      expiredBets: expired,
      totalStaked: totalStakedAmount,
      largestBet: largestBetAmount,
      participantCount: uniqueAddresses.size,
      isLoading: false,
      uniqueAddresses,
      yesVotes: yesVoteCount,
      noVotes: noVoteCount
    });
  };

  return stats;
};

export default useBetStats; 