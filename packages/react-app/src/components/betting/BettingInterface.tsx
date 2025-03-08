import { useEffect, useState } from 'react';
import { Card, PrimaryButton, SecondaryButton, Badge, Input, Select, Alert, LoadingSpinner } from '@/components/common';
import { BetList, BetCreation, WalletConnection } from '@/components/betting';
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

  const [activeView, setActiveView] = useState<'all' | 'open' | 'resolved' | 'yours' | 'create'>('all');
  const [selectedContract, setSelectedContract] = useState<string>('');
  const [contractsInitialized, setContractsInitialized] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredBets, setFilteredBets] = useState(bets);
  const [showContractSelector, setShowContractSelector] = useState(false);

  // Initialize contracts
  useEffect(() => {
    const init = async () => {
      if (bettingContracts.length > 0 && !contractsInitialized) {
        // Select the first contract by default
        await selectBettingContract(bettingContracts[0]);
        setSelectedContract(bettingContracts[0]);
        setContractsInitialized(true);
      }
    };
    
    init();
  }, [bettingContracts, contractsInitialized, selectBettingContract]);

  // Filter bets based on activeView and searchTerm
  useEffect(() => {
    if (!bets.length) {
      setFilteredBets([]);
      return;
    }

    let filtered = [...bets];
    
    // Apply view filter
    if (activeView === 'open') {
      filtered = filtered.filter(bet => !bet.resolved);
    } else if (activeView === 'resolved') {
      filtered = filtered.filter(bet => bet.resolved);
    } else if (activeView === 'yours' && address) {
      filtered = filtered.filter(bet => bet.creator.toLowerCase() === address.toLowerCase());
    }
    
    // Apply search filter (search by ID or condition)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(bet => 
        bet.id.toString().includes(term) || 
        term.startsWith('bet #') ? bet.id.toString() === term.replace('bet #', '') :
        bet.condition.toLowerCase().includes(term)
      );
    }
    
    setFilteredBets(filtered);
  }, [bets, activeView, searchTerm, address]);

  // Create a new betting contract
  const handleCreateContract = async () => {
    if (!address) return;
    
    try {
      await createBettingContract();
      await getBettingContracts();
    } catch (error) {
      console.error("Error creating contract:", error);
    }
  };

  // Handle contract selection
  const handleSelectContract = async (contractAddress: string) => {
    if (contractAddress === selectedContract) return;
    
    try {
      await selectBettingContract(contractAddress);
      setSelectedContract(contractAddress);
      await getBets();
      setShowContractSelector(false);
    } catch (error) {
      console.error("Error selecting contract:", error);
    }
  };

  if (!address) {
    return (
      <div className="text-center py-10">
        <Alert type="info" title="Wallet Connection Required">
          Please connect your wallet to use the betting platform.
        </Alert>
        <div className="mt-6">
          <WalletConnection 
            isConnected={false}
            onConnect={connectWallet}
            onDisconnect={() => {}}
          />
        </div>
      </div>
    );
  }

  if (bettingContracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Card className="w-full max-w-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-4">Welcome to BETM3!</h3>
          <p className="mb-6 text-gray-600">No betting contracts found. Create your first contract to get started.</p>
          <PrimaryButton
            onClick={handleCreateContract}
            loading={isLoading}
            disabled={isLoading}
            title="Create Betting Contract"
          />
        </Card>
      </div>
    );
  }

  if (activeView === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create New Bet</h1>
          <SecondaryButton 
            onClick={() => setActiveView('all')}
            title="Back to Bets"
          />
        </div>
        <BetCreation 
          onCreateBet={createBet}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Betting Market</h1>
          <p className="text-gray-600">ID: {selectedContract.substring(0, 8)}...</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-100 text-blue-800">
            Total Bets: {bets.length}
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            Open: {bets.filter(bet => !bet.resolved).length}
          </Badge>
          <Badge className="bg-purple-100 text-purple-800">
            Resolved: {bets.filter(bet => bet.resolved).length}
          </Badge>
        </div>
      </div>

      {/* Contract selector (minimized but accessible) */}
      <div className="relative">
        <SecondaryButton
          onClick={() => setShowContractSelector(!showContractSelector)}
          title={showContractSelector ? "Hide Contracts" : "Select Contract"}
          className="text-sm px-3 py-1"
        />
        
        {showContractSelector && (
          <Card className="absolute top-full left-0 z-10 mt-2 p-4 w-80 shadow-lg">
            <h3 className="text-sm font-semibold mb-2">Select Betting Contract</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {bettingContracts.map((contract, index) => (
                <div 
                  key={contract}
                  className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${selectedContract === contract ? 'bg-blue-50 border border-blue-200' : ''}`}
                  onClick={() => handleSelectContract(contract)}
                >
                  <div className="font-mono text-xs">Contract #{index + 1}</div>
                  <div className="text-sm truncate">{contract.substring(0, 10)}...{contract.substring(contract.length - 6)}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <SecondaryButton
                onClick={handleCreateContract}
                loading={isLoading}
                disabled={isLoading}
                title="+ New Contract"
                className="w-full text-sm"
              />
            </div>
          </Card>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex overflow-x-auto p-1 bg-gray-50 rounded-lg">
          <button 
            onClick={() => setActiveView('all')}
            className={`px-4 py-2 text-sm rounded-md ${activeView === 'all' ? 'bg-white shadow font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            All Bets
          </button>
          <button 
            onClick={() => setActiveView('open')}
            className={`px-4 py-2 text-sm rounded-md ${activeView === 'open' ? 'bg-white shadow font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Open Bets
          </button>
          <button 
            onClick={() => setActiveView('resolved')}
            className={`px-4 py-2 text-sm rounded-md ${activeView === 'resolved' ? 'bg-white shadow font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Resolved
          </button>
          <button 
            onClick={() => setActiveView('yours')}
            className={`px-4 py-2 text-sm rounded-md ${activeView === 'yours' ? 'bg-white shadow font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Your Bets
          </button>
        </div>

        <div className="flex gap-3">
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search by ID or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-w-[240px]"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Create Bet Button */}
          <PrimaryButton
            onClick={() => setActiveView('create')}
            title="+ Create Bet"
          />
        </div>
      </div>

      {/* Bets List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredBets.length > 0 ? (
        <BetList 
          bets={filteredBets}
          onJoinBet={joinBet}
          onSubmitResolution={submitResolution}
          onFinalizeResolution={finalizeResolution}
          userAddress={address || ''}
          isLoading={isLoading}
        />
      ) : (
        <Card className="p-8 text-center">
          <p className="text-lg text-gray-600 mb-4">No bets found matching your criteria.</p>
          <SecondaryButton 
            onClick={() => {
              setActiveView('all');
              setSearchTerm('');
            }}
            title="Clear Filters"
          />
        </Card>
      )}
    </div>
  );
}
