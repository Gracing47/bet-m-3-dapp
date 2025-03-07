import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Badge, LoadingSpinner } from '../common';
import { BetCard, BetStatus } from './BetCard';

export interface Bet {
  id: string;
  title: string;
  description?: string;
  creator: string;
  totalStake: string;
  endTime?: Date;
  status: BetStatus;
  options: string[];
}

interface BetListProps {
  bets: Bet[];
  isLoading?: boolean;
  onPlaceBet?: (betId: string) => void;
  onViewDetails?: (betId: string) => void;
  className?: string;
}

type SortOption = 'newest' | 'oldest' | 'highestStake' | 'endingSoon';
type FilterOption = 'all' | BetStatus;

export function BetList({
  bets,
  isLoading = false,
  onPlaceBet,
  onViewDetails,
  className = '',
}: BetListProps) {
  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  
  // Filtered and sorted bets
  const [displayedBets, setDisplayedBets] = useState<Bet[]>([]);
  
  // Apply filtering and sorting whenever dependencies change
  useEffect(() => {
    let result = [...bets];
    
    // Apply filtering
    if (filterBy !== 'all') {
      result = result.filter(bet => bet.status === filterBy);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        bet => 
          bet.title.toLowerCase().includes(query) || 
          (bet.description && bet.description.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => (b.id > a.id ? 1 : -1)); // Assuming id has timestamp info
        break;
      case 'oldest':
        result.sort((a, b) => (a.id > b.id ? 1 : -1));
        break;
      case 'highestStake':
        result.sort((a, b) => {
          const stakeA = parseFloat(a.totalStake);
          const stakeB = parseFloat(b.totalStake);
          return stakeB - stakeA;
        });
        break;
      case 'endingSoon':
        result.sort((a, b) => {
          if (!a.endTime) return 1;
          if (!b.endTime) return -1;
          return a.endTime.getTime() - b.endTime.getTime();
        });
        break;
    }
    
    setDisplayedBets(result);
  }, [bets, searchQuery, sortBy, filterBy]);

  // Empty state
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No bets found</h3>
      <p className="text-gray-500">
        {searchQuery || filterBy !== 'all' 
          ? 'Try adjusting your filters or search query' 
          : 'Be the first to create a bet!'}
      </p>
    </div>
  );

  // Loading state
  const renderLoadingState = () => (
    <div className="flex justify-center items-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <Card 
      className={`${className}`}
      title="Available Bets"
    >
      {/* Filters and search */}
      <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div className="w-full sm:w-1/3">
          <Input
            placeholder="Search bets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Select
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'open', label: 'Open' },
              { value: 'active', label: 'Active' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'claimed', label: 'Claimed' },
              { value: 'expired', label: 'Expired' },
            ]}
            value={filterBy}
            onChange={(value) => setFilterBy(value as FilterOption)}
          />
          
          <Select
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'highestStake', label: 'Highest Stake' },
              { value: 'endingSoon', label: 'Ending Soon' },
            ]}
            value={sortBy}
            onChange={(value) => setSortBy(value as SortOption)}
          />
        </div>
      </div>
      
      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {displayedBets.length} of {bets.length} bets
      </div>
      
      {/* Bets list */}
      {isLoading ? (
        renderLoadingState()
      ) : displayedBets.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-4">
          {displayedBets.map((bet) => (
            <BetCard
              key={bet.id}
              id={bet.id}
              title={bet.title}
              description={bet.description}
              creator={bet.creator}
              totalStake={bet.totalStake}
              endTime={bet.endTime}
              status={bet.status}
              options={bet.options}
              onPlaceBet={onPlaceBet ? () => onPlaceBet(bet.id) : undefined}
              onViewDetails={onViewDetails ? () => onViewDetails(bet.id) : undefined}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export default BetList; 