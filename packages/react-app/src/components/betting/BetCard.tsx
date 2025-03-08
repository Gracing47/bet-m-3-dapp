import React from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { BetData } from '@/types/betting';
import { Badge, Card, Tooltip, PrimaryButton, SecondaryButton, LoadingSpinner } from '@/components/common';

interface BetCardProps {
  bet: BetData;
  isSelected?: boolean;
  onClick?: () => void;
  showActions?: boolean;
  dark?: boolean;
  onPlaceBet?: (betId: number, amount: string, prediction: boolean) => Promise<any>;
  onViewDetails?: (betId: number) => void;
  isJoining?: boolean;
}

/**
 * BetCard component displays a card with bet information
 * Enhanced with improved UI elements and interaction states
 */
const BetCard: React.FC<BetCardProps> = ({ 
  bet, 
  isSelected = false, 
  onClick, 
  showActions = true,
  dark = true,
  onPlaceBet,
  onViewDetails,
  isJoining = false
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
  
  if (bet.status === 'active') {
    statusColor = "success";
    statusText = "Active";
  } else if (bet.status === 'expired') {
    statusColor = "warning";
    statusText = "Expired";
  } else if (bet.status === 'resolved') {
    statusColor = "purple";
    statusText = "Resolved";
  }

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Handle view details
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(bet.betIdOnChain);
    }
  };
  
  return (
    <Card 
      title={
        <div className="flex items-center justify-between w-full">
          <div className="truncate max-w-[75%] text-lg font-medium">{bet.question}</div>
          <Badge variant={statusColor as any}>{statusText}</Badge>
        </div>
      }
      className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-primary-light' : ''} ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
      onClick={onClick}
      hoverable={!!onClick}
      bordered
    >
      <div className="space-y-4">
        {/* Bet Info Section */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white/50 text-sm">Creator:</span>
            <Tooltip content={bet.creator} position="top">
              <span className="font-mono">{formatAddress(bet.creator)}</span>
            </Tooltip>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/50 text-sm">Total Stake:</span>
            <span className="font-medium">{formattedTotalStake}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/50 text-sm">Expires:</span>
            <span>{formatDate(endDateDisplay)}</span>
          </div>

          {bet.status === 'resolved' && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-white/50 text-sm">Outcome:</span>
              <span className={bet.winningOutcome ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                {bet.winningOutcome ? 'Yes' : 'No'}
              </span>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-sm mb-1">
            <span>Yes: {yesPercent}%</span>
            <span>No: {100 - yesPercent}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2.5 rounded-full" 
              style={{ width: `${yesPercent}%` }} 
            />
          </div>
        </div>
        
        {/* User Participation */}
        {bet.userParticipation && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center gap-2">
              {bet.userParticipation.isCreator && (
                <Badge variant="primary" size="sm">Creator</Badge>
              )}
              {bet.userParticipation.hasJoined && !bet.userParticipation.isCreator && (
                <Badge variant="success" size="sm">Joined</Badge>
              )}
              {bet.userParticipation.stake > BigInt(0) && (
                <span className="text-sm">
                  Your stake: {parseFloat(ethers.formatEther(bet.userParticipation.stake)).toLocaleString(undefined, { maximumFractionDigits: 2 })} MOCK
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Actions */}
        {showActions && bet.status === 'active' && (
          <div className="mt-4 space-x-2 flex">
            <SecondaryButton 
              onClick={handleViewDetails}
              className="flex-1"
            >
              View Details
            </SecondaryButton>
            
            {onPlaceBet && !bet.userParticipation?.hasJoined && (
              <PrimaryButton 
                onClick={() => onPlaceBet(bet.betIdOnChain, "0.1", true)}
                className="flex-1"
                disabled={isJoining}
              >
                {isJoining ? <LoadingSpinner size="sm" /> : 'Place Bet'}
              </PrimaryButton>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default BetCard; 