import React from 'react';
import { ethers } from 'ethers';
import { Card, LoadingSpinner } from '@/components/common';

interface BetStatsProps {
  totalBets: number;
  activeBets: number;
  resolvedBets: number;
  totalStaked: bigint;
  largestBet: bigint;
  participantCount: number;
  isLoading?: boolean;
  dark?: boolean;
}

/**
 * BetStats component displays statistics about the betting platform
 */
const BetStats: React.FC<BetStatsProps> = ({
  totalBets,
  activeBets,
  resolvedBets,
  totalStaked,
  largestBet,
  participantCount,
  isLoading = false,
  dark = true
}) => {
  // Format currency values
  const formatAmount = (amount: bigint): string => {
    return `${parseFloat(ethers.formatEther(amount)).toLocaleString(undefined, {
      maximumFractionDigits: 2
    })} MOCK`;
  };

  // Calculate percentages
  const activePercentage = totalBets > 0 ? Math.round((activeBets / totalBets) * 100) : 0;
  const resolvedPercentage = totalBets > 0 ? Math.round((resolvedBets / totalBets) * 100) : 0;

  // Determine styling based on dark mode
  const bgClass = dark ? 'bg-gray-800' : 'bg-white';
  const textClass = dark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = dark ? 'text-white/50' : 'text-gray-500';
  const cardClass = dark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200';

  return (
    <Card className={`${bgClass} border-0 shadow-sm`}>
      <div className="p-4">
        <h2 className={`text-lg font-medium mb-4 ${textClass}`}>Platform Statistics</h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${cardClass}`}>
                <div className={`text-sm ${mutedTextClass}`}>Total Bets</div>
                <div className={`text-2xl font-bold ${textClass}`}>{totalBets}</div>
              </div>
              <div className={`p-4 rounded-lg ${cardClass}`}>
                <div className={`text-sm ${mutedTextClass}`}>Active Bets</div>
                <div className={`text-2xl font-bold ${textClass}`}>{activeBets}</div>
              </div>
              <div className={`p-4 rounded-lg ${cardClass}`}>
                <div className={`text-sm ${mutedTextClass}`}>Participants</div>
                <div className={`text-2xl font-bold ${textClass}`}>{participantCount}</div>
              </div>
              <div className={`p-4 rounded-lg ${cardClass}`}>
                <div className={`text-sm ${mutedTextClass}`}>Total Staked</div>
                <div className={`text-xl font-bold truncate ${textClass}`}>{formatAmount(totalStaked)}</div>
              </div>
            </div>

            {/* Bet distribution */}
            <div className={`p-4 rounded-lg ${cardClass}`}>
              <h3 className={`text-sm font-medium mb-3 ${textClass}`}>Bet Status Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${mutedTextClass}`}>Active</span>
                    <span className={`text-sm ${mutedTextClass}`}>{activePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${activePercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${mutedTextClass}`}>Resolved</span>
                    <span className={`text-sm ${mutedTextClass}`}>{resolvedPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${resolvedPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${mutedTextClass}`}>Expired</span>
                    <span className={`text-sm ${mutedTextClass}`}>{100 - activePercentage - resolvedPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-yellow-500 h-2.5 rounded-full" 
                      style={{ width: `${100 - activePercentage - resolvedPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${cardClass}`}>
                <div className={`text-sm ${mutedTextClass} mb-1`}>Largest Bet</div>
                <div className={`text-xl font-bold ${textClass}`}>{formatAmount(largestBet)}</div>
              </div>
              <div className={`p-4 rounded-lg ${cardClass}`}>
                <div className={`text-sm ${mutedTextClass} mb-1`}>Avg. Stake per Bet</div>
                <div className={`text-xl font-bold ${textClass}`}>
                  {totalBets > 0 
                    ? formatAmount(totalStaked / BigInt(totalBets)) 
                    : '0.00 MOCK'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BetStats; 