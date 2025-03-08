import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Container } from '@/components/layout';
import { 
  Card, 
  PrimaryButton, 
  SecondaryButton, 
  Alert, 
  Badge, 
  LoadingSpinner 
} from '@/components/common';
import { ResolutionPanel } from '@/components/betting';
import { useBetting, useWallet, useBlockchainTime } from '@/hooks';
import { BetData } from '@/types/betting';

export default function ResolveBetsPage() {
  const { isConnected, address } = useWallet();
  const { bets, getBets, submitResolution, finalizeResolution, isLoading } = useBetting();
  const { getCurrentBlockTimestamp } = useBlockchainTime();
  
  const [expiredBets, setExpiredBets] = useState<BetData[]>([]);
  const [selectedBet, setSelectedBet] = useState<BetData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [resolutionInProgress, setResolutionInProgress] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Load bets and current blockchain time when the component mounts
  useEffect(() => {
    const initialize = async () => {
      try {
        await getBets();
        const timestamp = await getCurrentBlockTimestamp();
        setCurrentTime(timestamp);
      } catch (err) {
        console.error("Error initializing:", err);
      }
    };

    if (isConnected) {
      initialize();
    }
  }, [isConnected, getBets, getCurrentBlockTimestamp]);

  // Filter expired bets
  useEffect(() => {
    if (!bets || bets.length === 0 || currentTime === 0) {
      setExpiredBets([]);
      return;
    }

    // Filter for expired bets that the user can resolve
    // Either bets they created, or bets that are expired but not resolved
    const filtered = bets.filter(bet => {
      // Only show expired bets
      if (bet.status !== 'expired') return false;
      
      // Show bets the user created or participated in
      const isCreator = bet.creator === address;
      const hasParticipated = bet.userParticipation?.hasJoined || false;
      
      return isCreator || hasParticipated;
    });

    setExpiredBets(filtered);
  }, [bets, address, currentTime]);

  // Handle submitting resolution
  const handleSubmitResolution = async (betId: number, outcome: boolean) => {
    if (!selectedBet) {
      setError("Please select a bet to resolve");
      return;
    }

    setError(null);
    setSuccess(false);
    setResolutionInProgress(true);

    try {
      await submitResolution(betId, outcome);
      setSuccessMessage('Resolution submitted successfully!');
      setSuccess(true);
      
      // Reset and refresh after success
      setTimeout(() => {
        setSelectedBet(null);
        setSuccess(false);
        getBets(); // Refresh the list of bets
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting resolution:", err);
      setError(err.message || "Failed to submit resolution. Please try again.");
    } finally {
      setResolutionInProgress(false);
    }
  };

  // Handle finalizing resolution
  const handleFinalizeResolution = async (betId: number) => {
    if (!selectedBet) {
      setError("Please select a bet to finalize");
      return;
    }

    setError(null);
    setSuccess(false);
    setResolutionInProgress(true);

    try {
      await finalizeResolution(betId);
      setSuccessMessage('Resolution finalized successfully!');
      setSuccess(true);
      
      // Reset and refresh after success
      setTimeout(() => {
        setSelectedBet(null);
        setSuccess(false);
        getBets(); // Refresh the list of bets
      }, 3000);
    } catch (err: any) {
      console.error("Error finalizing resolution:", err);
      setError(err.message || "Failed to finalize resolution. Please try again.");
    } finally {
      setResolutionInProgress(false);
    }
  };

  // Format amount with ethers
  const formatAmount = (amount: bigint) => {
    return `${parseFloat(ethers.formatEther(amount)).toLocaleString(undefined, { maximumFractionDigits: 2 })} MOCK`;
  };

  // Get status badge
  const getStatusBadge = (status: string, resolved: boolean) => {
    if (status === 'active') {
      return <Badge variant="success">Active</Badge>;
    } else if (status === 'expired' && !resolved) {
      return <Badge variant="warning">Needs Resolution</Badge>;
    } else if (status === 'expired' && resolved) {
      return <Badge variant="primary">Awaiting Finalization</Badge>;
    } else {
      return <Badge variant="purple">Resolved</Badge>;
    }
  };

  return (
    <Container maxWidth="full" className="py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Resolve Bets</h1>
        <p className="text-gray-400 mb-8 text-center">
          Submit and finalize outcomes for expired bets
        </p>
        
        {!isConnected ? (
          <Alert type="warning" className="max-w-md mx-auto">
            Please connect your wallet to resolve bets.
          </Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Expired bet list */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-2">Expired Bets</h2>
                <p className="text-gray-400 text-sm">
                  These bets have expired and are waiting for resolution
                </p>
              </div>

              {/* Bet list */}
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : expiredBets.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700 p-8 text-center">
                  <p className="text-gray-300 mb-4">No expired bets to resolve</p>
                  <SecondaryButton onClick={() => getBets()}>
                    Refresh List
                  </SecondaryButton>
                </Card>
              ) : (
                <div className="space-y-4">
                  {expiredBets.map((bet) => (
                    <Card 
                      key={bet.id}
                      className={`bg-gray-800 border-gray-700 hover:border-indigo-500 transition-colors cursor-pointer ${
                        selectedBet?.id === bet.id ? 'border-indigo-500 ring-1 ring-indigo-500' : ''
                      }`}
                      onClick={() => setSelectedBet(bet)}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <h3 className="text-white font-medium mb-3">{bet.question}</h3>
                          {getStatusBadge(bet.status, bet.resolved)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-400 block">Creator:</span>
                            <span className="text-gray-200 font-mono">{`${bet.creator.substring(0, 6)}...${bet.creator.substring(bet.creator.length - 4)}`}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Total Stake:</span>
                            <span className="text-gray-200">{formatAmount(bet.totalStake)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Expired:</span>
                            <span className="text-gray-200">{bet.endDate}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Your Role:</span>
                            <span className="text-indigo-300">
                              {bet.userParticipation?.isCreator 
                                ? 'Creator' 
                                : bet.userParticipation?.hasJoined 
                                  ? 'Participant' 
                                  : 'None'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-300 text-sm">Yes</span>
                            <span className="text-gray-300 text-sm">{formatAmount(bet.yesStake)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300 text-sm">No</span>
                            <span className="text-gray-300 text-sm">{formatAmount(bet.noStake)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Right column - Resolution form */}
            <div>
              <Card className="bg-gray-800 border border-gray-700 sticky top-24">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Resolution Panel</h2>
                  
                  {success && (
                    <Alert 
                      type="success" 
                      className="mb-6"
                      onClose={() => setSuccess(false)}
                    >
                      {successMessage}
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
                        <h3 className="font-medium text-white mb-3">{selectedBet.question}</h3>
                        <div className="text-sm text-gray-300 mb-2">
                          {selectedBet.resolved 
                            ? "This bet has been resolved and is waiting for finalization."
                            : "Submit the outcome of this bet based on the real-world result."}
                        </div>
                      </div>
                      
                      {/* Resolution controls */}
                      <ResolutionPanel
                        betId={selectedBet.betIdOnChain}
                        options={['Yes', 'No']}
                        onResolve={handleSubmitResolution}
                        isCreator={selectedBet.userParticipation?.isCreator || false}
                        isResolved={selectedBet.resolved}
                        winningOption={selectedBet.winningOutcome}
                      />
                      
                      {/* Finalization button (only show if resolved but not finalized) */}
                      {selectedBet.resolved && !selectedBet.resolutionFinalized && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <p className="text-sm text-gray-300 mb-3">
                            The outcome has been resolved. Finalize now to distribute rewards.
                          </p>
                          <PrimaryButton
                            onClick={() => handleFinalizeResolution(selectedBet.betIdOnChain)}
                            className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                            disabled={resolutionInProgress}
                          >
                            {resolutionInProgress ? (
                              <div className="flex items-center justify-center">
                                <LoadingSpinner size="sm" className="mr-2" />
                                <span>Finalizing...</span>
                              </div>
                            ) : (
                              'Finalize Resolution'
                            )}
                          </PrimaryButton>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">
                        Select an expired bet from the list to resolve
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
                          d="M9 5l7 7-7 7"
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