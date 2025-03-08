import React from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { BetData } from '@/types/betting';

interface BetCardProps {
  bet: BetData;
  isSelected?: boolean;
  onClick?: () => void;
  showActions?: boolean;
  dark?: boolean;
}

/**
 * BetCard component displays a card with bet information
 */
const BetCard: React.FC<BetCardProps> = ({ 
  bet, 
  isSelected = false, 
  onClick, 
  showActions = true,
  dark = true
}) => {
  // Format address for display
  const formatAddress = (addr: string): string => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Calculate the yes percentage if not provided
  let yesPercent: number;
  const totalStake = Number(bet.yesStake) + Number(bet.noStake);
  
  if (totalStake > 0) {
    yesPercent = Math.round((Number(bet.yesStake) / totalStake) * 100);
  } else {
    yesPercent = 50; // Default to 50% if no stakes
  }
  
  // Format total stake
  const formattedTotalStake = bet.totalStake 
    ? `${parseFloat(ethers.formatEther(bet.totalStake)).toLocaleString(undefined, { maximumFractionDigits: 2 })} MOCK` 
    : "0.00 MOCK";
  
  // Determine end date display - use the endDate from the bet if available
  const endDateDisplay = bet.endDate || "Unknown";

  // Determine status color and text
  let statusColor = "";
  let statusText = "";
  
  if (bet.resolved) {
    statusColor = "bg-purple-900/30 text-purple-300";
    statusText = "Resolved";
  } else if (bet.status === 'expired') {
    statusColor = "bg-yellow-900/30 text-yellow-300";
    statusText = "Expired";
  } else {
    statusColor = "bg-indigo-900/30 text-indigo-300";
    statusText = "Active";
  }

  // Background and border styles based on dark mode
  const bgClass = dark 
    ? "border-white/10 bg-white/5 backdrop-blur-sm" 
    : "border-gray-200 bg-white";
  
  const textClass = dark 
    ? "text-white" 
    : "text-gray-800";
  
  const mutedTextClass = dark 
    ? "text-white/50" 
    : "text-gray-500";
  
  const hoverClass = dark 
    ? "hover:border-indigo-500/50" 
    : "hover:border-indigo-500/20";

  return (
    <div 
      className={`border rounded-xl overflow-hidden ${bgClass} ${hoverClass} transition-all duration-200 group ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500/50' : ''}`}
      onClick={onClick}
    >
      <div className={`p-6 ${onClick ? 'cursor-pointer' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <span className={`text-xs ${mutedTextClass}`}>#{bet.id}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>{statusText}</span>
        </div>
        
        <h3 className={`text-lg font-medium mb-4 group-hover:text-indigo-300 transition-colors ${textClass}`}>
          {bet.question}
        </h3>
        
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className={mutedTextClass}>End date:</span>
            <span className={`${textClass} ${bet.status === 'expired' ? 'text-yellow-300' : ''}`}>{endDateDisplay}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className={mutedTextClass}>Total stake:</span>
            <span className={`${textClass} font-medium`}>{formattedTotalStake}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className={mutedTextClass}>Creator:</span>
            <span className={`${textClass} font-mono text-xs`}>{formatAddress(bet.creator)}</span>
          </div>
          
          {/* User participation */}
          {bet.userParticipation && (
            <div className="flex justify-between text-sm">
              <span className={mutedTextClass}>Your role:</span>
              <span className={`${bet.userParticipation.isCreator ? 'text-green-300' : (bet.userParticipation.hasJoined ? 'text-blue-300' : mutedTextClass)}`}>
                {bet.userParticipation.isCreator 
                  ? 'Creator' 
                  : bet.userParticipation.hasJoined 
                    ? 'Participant' 
                    : 'None'}
              </span>
            </div>
          )}
          
          {/* Prediction probability bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs">
              <span className={textClass}>No ({100 - yesPercent}%)</span>
              <span className={textClass}>Yes ({yesPercent}%)</span>
            </div>
            <div className={`w-full h-2 ${dark ? 'bg-white/10' : 'bg-gray-200'} rounded-full overflow-hidden`}>
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                style={{ width: `${yesPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className={`pt-4 border-t ${dark ? 'border-white/10' : 'border-gray-200'}`}>
            <Link href={`/test?betId=${bet.id}`} className="w-full block">
              <button className="w-full py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all text-white">
                {bet.resolved ? 'View Result' : (bet.status === 'expired' ? 'Submit Resolution' : 'Participate')}
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BetCard; 