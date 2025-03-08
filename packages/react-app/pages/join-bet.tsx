import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Container } from '@/components/layout';
import { 
  Card, 
  PrimaryButton, 
  SecondaryButton, 
  Alert, 
  Badge, 
  Input, 
  LoadingSpinner, 
  Select 
} from '@/components/common';
import { BetCard } from '@/components/betting';
import { useBetting, useWallet } from '@/hooks';
import { BetData } from '@/types/betting';
import { useRouter } from 'next/router';

export default function JoinBetPage() {
  const router = useRouter();
  const { isConnected, address } = useWallet();
  const { bets, getBets, joinBet, isLoading } = useBetting();
  
  const [filteredBets, setFilteredBets] = useState<BetData[]>([]);
  const [selectedBet, setSelectedBet] = useState<BetData | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('10');
  const [prediction, setPrediction] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [joinInProgress, setJoinInProgress] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'newest'>('active');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load bets when the component mounts
  useEffect(() => {
    const loadBets = async () => {
      try {
        await getBets();
      } catch (err) {
        console.error("Error loading bets:", err);
      }
    };

    if (isConnected) {
      loadBets();
    }
  }, [isConnected, getBets]);

  // Filter and sort bets
  useEffect(() => {
    if (!bets || bets.length === 0) {
      setFilteredBets([]);
      return;
    }

    // Only show active bets that the user hasn't created
    let filtered = bets.filter(bet => {
      // Filter out bets created by the current user
      if (bet.creator === address) return false;
      
      // Filter out non-active bets if active filter is selected
      if (filter === 'active' && bet.status !== 'active') return false;
      
      // Filter by search term
      if (searchTerm && !bet.question.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });

    // Sort bets
    if (filter === 'newest') {
      filtered = filtered.sort((a, b) => Number(b.creationTime) - Number(a.creationTime));
    }

    setFilteredBets(filtered);
  }, [bets, address, filter, searchTerm]);

  // Handle joining a bet
  const handleJoinBet = async () => {
    if (!selectedBet) {
      setError("Please select a bet to join");
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError("Please enter a valid stake amount");
      return;
    }

    setError(null);
    setJoinInProgress(true);

    try {
      await joinBet(selectedBet.betIdOnChain, stakeAmount, prediction);
      setSuccess(true);
      
      // Reset form and selection
      setTimeout(() => {
        setSelectedBet(null);
        setStakeAmount('10');
        setPrediction(true);
        setSuccess(false);
        getBets(); // Refresh the list of bets
      }, 3000);
    } catch (err: any) {
      console.error("Error joining bet:", err);
      setError(err.message || "Failed to join bet. Please try again.");
    } finally {
      setJoinInProgress(false);
    }
  };

  // Handle clicking on a bet
  const handleBetClick = (bet: BetData) => {
    setSelectedBet(bet);
    
    // Default to the opposite of the creator's prediction
    // This is a simplification - you might want to determine the creator's prediction differently
    if (bet.yesStake > bet.noStake) {
      setPrediction(false); // Creator likely chose Yes, so default to No
    } else {
      setPrediction(true); // Creator likely chose No, so default to Yes
    }
  };

  // Format amount with ethers
  const formatAmount = (amount: bigint) => {
    return `${parseFloat(ethers.formatEther(amount)).toLocaleString(undefined, { maximumFractionDigits: 2 })} MOCK`;
  };

  return (
    <Container maxWidth="full" className="py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Join a Bet</h1>
        <p className="text-gray-400 mb-8 text-center">
          Browse open bets and participate with your prediction
        </p>
        
        {!isConnected ? (
          <Alert type="warning" className="max-w-md mx-auto">
            Please connect your wallet to join bets.
          </Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Bet list */}
            <div className="lg:col-span-2">
              {/* Filters */}
              <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search bets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white w-full"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <SecondaryButton
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1 ${filter === 'all' ? 'bg-indigo-700' : 'bg-gray-700'}`}
                    >
                      All
                    </SecondaryButton>
                    <SecondaryButton
                      onClick={() => setFilter('active')}
                      className={`px-3 py-1 ${filter === 'active' ? 'bg-indigo-700' : 'bg-gray-700'}`}
                    >
                      Active
                    </SecondaryButton>
                    <SecondaryButton
                      onClick={() => setFilter('newest')}
                      className={`px-3 py-1 ${filter === 'newest' ? 'bg-indigo-700' : 'bg-gray-700'}`}
                    >
                      Newest
                    </SecondaryButton>
                  </div>
                </div>
              </div>

              {/* Bet list */}
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : filteredBets.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700 p-8 text-center">
                  <p className="text-gray-300 mb-4">No bets available to join</p>
                  <PrimaryButton 
                    onClick={() => router.push('/create-bet')}
                    className="bg-gradient-to-r from-pink-600 to-purple-600"
                  >
                    Create a New Bet
                  </PrimaryButton>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredBets.map((bet) => (
                    <BetCard 
                      key={bet.id} 
                      bet={bet}
                      isSelected={selectedBet?.id === bet.id}
                      onClick={() => handleBetClick(bet)}
                      dark={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right column - Join form */}
            <div>
              <Card className="bg-gray-800 border border-gray-700 sticky top-24">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Join Selected Bet</h2>
                  
                  {success && (
                    <Alert 
                      type="success" 
                      className="mb-6"
                      onClose={() => setSuccess(false)}
                    >
                      Successfully joined the bet!
                    </Alert>
                  )}
                  
                  {error && (
                    <Alert 
                      type="error" 
                      className="mb-6"
                      onClose={() => setError(null)}
                    >
                      {error}
                    </Alert>
                  )}
                  
                  {selectedBet ? (
                    <div className="space-y-6">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="font-medium text-white mb-2">{selectedBet.question}</h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">Created by:</span>
                          <span className="text-gray-300 font-mono">{`${selectedBet.creator.substring(0, 6)}...${selectedBet.creator.substring(selectedBet.creator.length - 4)}`}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-gray-300">Total stake:</span>
                          <span className="text-white">{formatAmount(selectedBet.totalStake)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-gray-300">Expires:</span>
                          <span className="text-white">{selectedBet.endDate}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                          Your Stake Amount
                        </label>
                        <Input
                          id="amount"
                          type="number"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          placeholder="Enter stake amount"
                          min="1"
                          className="w-full bg-gray-700 border-gray-600 text-white"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          Minimum stake: 1 MOCK
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Your Prediction
                        </label>
                        <div className="flex border border-gray-600 rounded-md overflow-hidden">
                          <button
                            type="button"
                            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                              prediction 
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                            onClick={() => setPrediction(true)}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                              !prediction 
                                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                            onClick={() => setPrediction(false)}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      
                      <PrimaryButton
                        onClick={handleJoinBet}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                        disabled={joinInProgress}
                      >
                        {joinInProgress ? (
                          <div className="flex items-center justify-center">
                            <LoadingSpinner size="sm" className="mr-2" />
                            <span>Joining Bet...</span>
                          </div>
                        ) : (
                          'Join Bet'
                        )}
                      </PrimaryButton>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">
                        Select a bet from the list to join
                      </p>
                      <svg 
                        className="mx-auto h-12 w-12 text-gray-500" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1} 
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
} 