import { useEffect, useState } from 'react';
import PrimaryButton from '@/components/common/Button';
import { useBetting } from '@/hooks/useBetting';

export default function BettingInterface() {
  const {
    address,
    isLoading,
    bettingContracts,
    bets,
    connectWallet,
    getBettingContracts,
    createBettingContract,
    selectBettingContract,
    getBets,
    createBet,
    joinBet,
    submitResolution,
    finalizeResolution,
    adminFinalizeResolution,
  } = useBetting();

  const [betCondition, setBetCondition] = useState<string>('Will ETH reach $5000 by the end of month?');
  const [betDuration, setBetDuration] = useState<number>(7);
  const [betAmount, setBetAmount] = useState<string>('10');
  const [betOutcome, setBetOutcome] = useState<boolean>(true);
  const [selectedContract, setSelectedContract] = useState<string>('');
  const [selectedBetId, setSelectedBetId] = useState<number | null>(null);
  const [joinBetAmount, setJoinBetAmount] = useState<string>('10');
  const [joinBetOutcome, setJoinBetOutcome] = useState<boolean>(true);
  const [resolutionOutcome, setResolutionOutcome] = useState<boolean>(true);
  const [adminOutcome, setAdminOutcome] = useState<boolean>(true);
  const [isCancel, setIsCancel] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  useEffect(() => {
    // If there's a selected contract, get the bets for it
    if (selectedContract) {
      selectBettingContract(selectedContract).then(() => {
        getBets();
      });
    }
  }, [selectedContract, getBets, selectBettingContract]);

  // Handle contract creation
  const handleCreateContract = async () => {
    const tx = await createBettingContract();
    if (tx) {
      setTransactionHash(tx.hash);
      await getBettingContracts();
    }
  };

  // Handle bet creation
  const handleCreateBet = async () => {
    const tx = await createBet(betAmount, betCondition, betDuration, betOutcome);
    if (tx) {
      setTransactionHash(tx.hash);
    }
  };

  // Handle joining a bet
  const handleJoinBet = async () => {
    if (selectedBetId === null) return;
    
    const tx = await joinBet(selectedBetId, joinBetAmount, joinBetOutcome);
    if (tx) {
      setTransactionHash(tx.hash);
    }
  };

  // Handle submitting a resolution
  const handleSubmitResolution = async () => {
    if (selectedBetId === null) return;
    
    const tx = await submitResolution(selectedBetId, resolutionOutcome);
    if (tx) {
      setTransactionHash(tx.hash);
    }
  };

  // Handle finalizing a resolution
  const handleFinalizeResolution = async () => {
    if (selectedBetId === null) return;
    
    const tx = await finalizeResolution(selectedBetId);
    if (tx) {
      setTransactionHash(tx.hash);
    }
  };

  // Handle admin finalizing a resolution
  const handleAdminFinalizeResolution = async () => {
    if (selectedBetId === null) return;
    
    const tx = await adminFinalizeResolution(selectedBetId, adminOutcome, isCancel);
    if (tx) {
      setTransactionHash(tx.hash);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-2xl font-bold">BETM3 Betting Interface</h2>
      
      {!address ? (
        <PrimaryButton 
          loading={isLoading} 
          onClick={connectWallet} 
          title="Connect Wallet" 
          widthFull
        />
      ) : (
        <>
          <div className="text-sm">Connected: {address}</div>
          
          {transactionHash && (
            <div className="bg-green-100 p-2 rounded-md text-sm">
              <p>Transaction successful:</p> 
              <a 
                href={`https://alfajores-blockscout.celo-testnet.org/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {transactionHash.substring(0, 10)}...
              </a>
            </div>
          )}
          
          <div className="border p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Factory Operations</h3>
            <div className="flex gap-2">
              <PrimaryButton 
                loading={isLoading} 
                onClick={handleCreateContract} 
                title="Create Betting Contract" 
                widthFull
              />
              <PrimaryButton 
                loading={isLoading} 
                onClick={getBettingContracts} 
                title="Refresh Contracts" 
                widthFull
              />
            </div>
          </div>
          
          {bettingContracts.length > 0 && (
            <div className="border p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Betting Contracts</h3>
              <select 
                value={selectedContract} 
                onChange={(e) => setSelectedContract(e.target.value)}
                className="w-full p-2 border rounded-md mb-2"
              >
                <option value="">Select a contract</option>
                {bettingContracts.map((contract, index) => (
                  <option key={index} value={contract}>
                    {contract.substring(0, 10)}...{contract.substring(contract.length - 8)}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {selectedContract && (
            <div className="border p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Create New Bet</h3>
              <input
                type="text"
                placeholder="Bet Condition"
                value={betCondition}
                onChange={(e) => setBetCondition(e.target.value)}
                className="w-full border rounded p-2 mb-2"
              />
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Duration (days)"
                  value={betDuration}
                  onChange={(e) => setBetDuration(Number(e.target.value))}
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Amount"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="border rounded p-2"
                />
                <select
                  value={betOutcome.toString()}
                  onChange={(e) => setBetOutcome(e.target.value === "true")}
                  className="border rounded p-2"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
              <PrimaryButton 
                loading={isLoading} 
                onClick={handleCreateBet} 
                title="Create Bet" 
                widthFull
              />
            </div>
          )}
          
          {bets.length > 0 && (
            <div className="border p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Available Bets</h3>
              <select 
                value={selectedBetId !== null ? selectedBetId.toString() : ''} 
                onChange={(e) => setSelectedBetId(Number(e.target.value))}
                className="w-full p-2 border rounded-md mb-2"
              >
                <option value="">Select a bet</option>
                {bets.map((bet) => (
                  <option key={bet.id} value={bet.id}>
                    Bet #{bet.id}: {bet.condition.substring(0, 30)}...
                  </option>
                ))}
              </select>
              
              {selectedBetId !== null && (
                <div className="mt-4">
                  <h4 className="font-medium">Selected Bet Details</h4>
                  <div className="bg-gray-100 p-2 rounded text-sm mb-4">
                    <p><span className="font-bold">Condition:</span> {bets[selectedBetId].condition}</p>
                    <p><span className="font-bold">Creator:</span> {bets[selectedBetId].creator.substring(0, 10)}...</p>
                    <p><span className="font-bold">True stake:</span> {Number(bets[selectedBetId].totalStakeTrue) / 1e18} tokens</p>
                    <p><span className="font-bold">False stake:</span> {Number(bets[selectedBetId].totalStakeFalse) / 1e18} tokens</p>
                    <p><span className="font-bold">Resolved:</span> {bets[selectedBetId].resolved ? 'Yes' : 'No'}</p>
                    {bets[selectedBetId].resolved && (
                      <p><span className="font-bold">Winner:</span> {bets[selectedBetId].winningOutcome ? 'True' : 'False'}</p>
                    )}
                  </div>
                  
                  {!bets[selectedBetId].resolved && (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium mb-2">Join Bet</h4>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Amount"
                            value={joinBetAmount}
                            onChange={(e) => setJoinBetAmount(e.target.value)}
                            className="border rounded p-2"
                          />
                          <select
                            value={joinBetOutcome.toString()}
                            onChange={(e) => setJoinBetOutcome(e.target.value === "true")}
                            className="border rounded p-2"
                          >
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        </div>
                        <PrimaryButton 
                          loading={isLoading} 
                          onClick={handleJoinBet} 
                          title="Join Bet" 
                          widthFull
                        />
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium mb-2">Submit Resolution</h4>
                        <div className="mb-2">
                          <select
                            value={resolutionOutcome.toString()}
                            onChange={(e) => setResolutionOutcome(e.target.value === "true")}
                            className="w-full border rounded p-2"
                          >
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        </div>
                        <PrimaryButton 
                          loading={isLoading} 
                          onClick={handleSubmitResolution} 
                          title="Submit Resolution" 
                          widthFull
                        />
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium mb-2">Finalize Resolution</h4>
                        <PrimaryButton 
                          loading={isLoading} 
                          onClick={handleFinalizeResolution} 
                          title="Finalize Resolution" 
                          widthFull
                        />
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium mb-2">Admin Finalize Resolution</h4>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <select
                            value={adminOutcome.toString()}
                            onChange={(e) => setAdminOutcome(e.target.value === "true")}
                            className="border rounded p-2"
                          >
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isCancel}
                              onChange={(e) => setIsCancel(e.target.checked)}
                              className="mr-2"
                            />
                            <label>Cancel bet</label>
                          </div>
                        </div>
                        <PrimaryButton 
                          loading={isLoading} 
                          onClick={handleAdminFinalizeResolution} 
                          title="Admin Finalize" 
                          widthFull
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 