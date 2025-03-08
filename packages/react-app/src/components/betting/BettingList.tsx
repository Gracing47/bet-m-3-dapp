import React, { useState } from 'react';
import { Card, Badge, PrimaryButton, SecondaryButton, Modal, Select } from '../common';
import { Bet } from '@/types/betting';

export interface BetListProps {
  bets: Bet[];
  onJoinBet: (betId: number, amount: string, prediction: boolean) => Promise<any>;
  onSubmitResolution: (betId: number, outcome: boolean) => Promise<any>;
  onFinalizeResolution: (betId: number) => Promise<any>;
  userAddress: string;
  isLoading: boolean;
}

const BetList: React.FC<BetListProps> = ({
  bets,
  onJoinBet,
  onSubmitResolution,
  onFinalizeResolution,
  userAddress,
  isLoading
}) => {
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [joinAmount, setJoinAmount] = useState('10');
  const [joinPrediction, setJoinPrediction] = useState(true);
  const [resolutionOutcome, setResolutionOutcome] = useState(true);
  const [modalType, setModalType] = useState<'join' | 'resolve' | null>(null);

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format token amount with proper decimals
  const formatTokenAmount = (amountStr: string) => {
    try {
      // Safe conversion to display value
      const amount = parseInt(amountStr) / 10**18;
      return amount.toFixed(2);
    } catch (error) {
      console.error("Error formatting token amount:", error);
      return "0.00";
    }
  };

  // Handler for joining a bet
  const handleJoinBet = async () => {
    if (!selectedBet) return;
    
    try {
      await onJoinBet(selectedBet.id, joinAmount, joinPrediction);
      setModalType(null);
    } catch (error) {
      console.error("Error joining bet:", error);
    }
  };

  // Handler for submitting a resolution
  const handleSubmitResolution = async () => {
    if (!selectedBet) return;
    
    try {
      await onSubmitResolution(selectedBet.id, resolutionOutcome);
      setModalType(null);
    } catch (error) {
      console.error("Error submitting resolution:", error);
    }
  };

  // Handler for finalizing a resolution
  const handleFinalizeResolution = async (betId: number) => {
    try {
      await onFinalizeResolution(betId);
    } catch (error) {
      console.error("Error finalizing resolution:", error);
    }
  };

  // Check if user is the bet creator
  const isCreator = (bet: Bet) => {
    return bet.creator.toLowerCase() === userAddress.toLowerCase();
  };

  return (
    <div className="space-y-4">
      {bets.map(bet => (
        <Card key={bet.id} className="p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Bet Info Section */}
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full mr-2">
                    ID: {bet.id}
                  </span>
                  <Badge 
                    className={bet.resolved 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'}
                  >
                    {bet.resolved ? 'Resolved' : 'Open'}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  Created by: {formatAddress(bet.creator)}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{bet.condition}</h3>

              <div className="grid grid-cols-2 gap-4 my-3">
                <div className="bg-blue-50 p-2 rounded text-center">
                  <div className="text-xs uppercase text-gray-500 mb-1">Yes Stake</div>
                  <div className="font-semibold">{formatTokenAmount(bet.totalStakeTrue.toString())} cUSD</div>
                </div>
                <div className="bg-red-50 p-2 rounded text-center">
                  <div className="text-xs uppercase text-gray-500 mb-1">No Stake</div>
                  <div className="font-semibold">{formatTokenAmount(bet.totalStakeFalse.toString())} cUSD</div>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                <span className="inline-block mr-4">
                  <span className="text-gray-500">End:</span> {new Date(Number(bet.expirationTime) * 1000).toLocaleDateString()}
                </span>
                {bet.resolved && (
                  <span className="inline-block">
                    <span className="text-gray-500">Outcome:</span> {bet.winningOutcome ? 'Yes' : 'No'}
                  </span>
                )}
              </div>
            </div>

            {/* Actions Section */}
            <div className="bg-gray-50 p-4 flex flex-col justify-center items-center md:w-48 space-y-2">
              {!bet.resolved ? (
                <>
                  <PrimaryButton
                    onClick={() => {
                      setSelectedBet(bet);
                      setModalType('join');
                    }}
                    title="Join Bet"
                    className="w-full"
                    disabled={isLoading}
                  />
                  
                  {isCreator(bet) && (
                    <SecondaryButton
                      onClick={() => {
                        setSelectedBet(bet);
                        setModalType('resolve');
                      }}
                      title="Submit Outcome"
                      className="w-full"
                      disabled={isLoading}
                    />
                  )}
                </>
              ) : !bet.resolutionFinalized && isCreator(bet) ? (
                <PrimaryButton
                  onClick={() => handleFinalizeResolution(bet.id)}
                  title="Finalize"
                  className="w-full"
                  disabled={isLoading}
                  loading={isLoading}
                />
              ) : (
                <div className="text-sm text-gray-600 text-center">
                  Bet is finalized
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}

      {/* Join Bet Modal */}
      {modalType === 'join' && selectedBet && (
        <Modal 
          isOpen={true} 
          onClose={() => setModalType(null)}
          title={`Join Bet #${selectedBet.id}`}
        >
          <div className="p-4">
            <p className="text-gray-700 mb-4">{selectedBet.condition}</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Prediction</label>
              <Select
                options={[
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' }
                ]}
                value={joinPrediction ? 'true' : 'false'}
                onChange={(value) => setJoinPrediction(value === 'true')}
                fullWidth
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Stake Amount (cUSD)</label>
              <input
                type="number"
                value={joinAmount}
                onChange={(e) => setJoinAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <SecondaryButton
                onClick={() => setModalType(null)}
                title="Cancel"
              />
              <PrimaryButton
                onClick={handleJoinBet}
                title="Join Bet"
                disabled={isLoading}
                loading={isLoading}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Resolve Bet Modal */}
      {modalType === 'resolve' && selectedBet && (
        <Modal 
          isOpen={true} 
          onClose={() => setModalType(null)}
          title={`Resolve Bet #${selectedBet.id}`}
        >
          <div className="p-4">
            <p className="text-gray-700 mb-4">{selectedBet.condition}</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Outcome</label>
              <Select
                options={[
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' }
                ]}
                value={resolutionOutcome ? 'true' : 'false'}
                onChange={(value) => setResolutionOutcome(value === 'true')}
                fullWidth
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <SecondaryButton
                onClick={() => setModalType(null)}
                title="Cancel"
              />
              <PrimaryButton
                onClick={handleSubmitResolution}
                title="Submit Outcome"
                disabled={isLoading}
                loading={isLoading}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BetList; 