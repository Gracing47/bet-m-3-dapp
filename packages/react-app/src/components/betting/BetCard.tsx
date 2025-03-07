import React from 'react';
import { Card, Badge, PrimaryButton, SecondaryButton } from '../common';

export type BetStatus = 'open' | 'active' | 'resolved' | 'claimed' | 'expired';

interface BetCardProps {
  id: string;
  title: string;
  description?: string;
  creator: string;
  totalStake: string;
  endTime?: Date;
  status: BetStatus;
  options?: string[];
  selectedOption?: string;
  onPlaceBet?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export function BetCard({
  id,
  title,
  description,
  creator,
  totalStake,
  endTime,
  status,
  options = [],
  selectedOption,
  onPlaceBet,
  onViewDetails,
  className = '',
}: BetCardProps) {
  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Format time remaining
  const getTimeRemaining = (endDate?: Date) => {
    if (!endDate) return 'No deadline';
    
    const now = new Date();
    if (now > endDate) return 'Expired';
    
    const diffMs = endDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHrs}h remaining`;
    } else if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m remaining`;
    } else {
      return `${diffMins}m remaining`;
    }
  };

  // Status badge variant
  const getStatusBadge = (betStatus: BetStatus) => {
    const statusConfig: Record<BetStatus, { variant: string; label: string }> = {
      open: { variant: 'primary', label: 'Open' },
      active: { variant: 'info', label: 'Active' },
      resolved: { variant: 'success', label: 'Resolved' },
      claimed: { variant: 'secondary', label: 'Claimed' },
      expired: { variant: 'gray', label: 'Expired' },
    };
    
    const config = statusConfig[betStatus];
    
    return (
      <Badge 
        variant={config.variant as any} 
        size="sm"
        rounded
      >
        {config.label}
      </Badge>
    );
  };

  return (
    <Card 
      className={`${className} hover:shadow-md transition-shadow duration-200`}
      hoverable
    >
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-lg font-medium text-gray-900 truncate">{title}</h3>
          {getStatusBadge(status)}
        </div>
        
        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        )}
        
        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Creator: </span>
            <span className="font-mono">{formatAddress(creator)}</span>
          </div>
          <div>
            <span className="text-gray-500">Total Stake: </span>
            <span className="font-medium">{totalStake}</span>
          </div>
          {endTime && (
            <div className="sm:col-span-2">
              <span className="text-gray-500">Time: </span>
              <span>{getTimeRemaining(endTime)}</span>
            </div>
          )}
        </div>
        
        {/* Options */}
        {options.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
            <div className="flex flex-wrap gap-2">
              {options.map((option, index) => (
                <Badge
                  key={index}
                  variant={selectedOption === option ? 'primary' : 'gray'}
                  className="cursor-pointer"
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          {onViewDetails && (
            <SecondaryButton
              onClick={onViewDetails}
              widthFull
            >
              View Details
            </SecondaryButton>
          )}
          
          {onPlaceBet && status === 'open' && (
            <PrimaryButton
              onClick={onPlaceBet}
              widthFull
            >
              Place Bet
            </PrimaryButton>
          )}
        </div>
      </div>
    </Card>
  );
}

export default BetCard; 