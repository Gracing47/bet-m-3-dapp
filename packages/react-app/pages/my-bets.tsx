import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import BetCard from '@/components/betting/BetCard';
import NoLossBetMultiABI from "@/assets/abis/NoLossBetMulti.json";
import useTimestamp from '@/hooks/useTimestamp';
import useBlockchainTime from '@/hooks/useBlockchainTime';
import { BetData } from '@/types/betting';
import { useWallet } from '@/hooks/useWallet';
import { Container } from '@/components/ui/Container';

// Contract address from environment
const NO_LOSS_BET_MULTI_ADDRESS = process.env.NEXT_PUBLIC_NO_LOSS_BET_MULTI_ADDRESS || "";

export default function MyBetsPage() {
  // Use the shared wallet hook
  const { address, isConnected, connect, disconnect, formatAddress } = useWallet();
  const [networkStatus, setNetworkStatus] = useState<'disconnected' | 'connected' | 'wrong_network'>('disconnected');
  
  // Bets state
  const [userBets, setUserBets] = useState<BetData[]>([]);
  const [loadingBets, setLoadingBets] = useState<boolean>(false);
  const [loadBetsError, setLoadBetsError] = useState<string | null>(null);
  
  // Selected bet interaction
  const [selectedBet, setSelectedBet] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  
  // Initialize timestamp hooks
  const { extractTimestamp } = useTimestamp();
  // Initialize blockchain time hook with contract address and ABI
  const blockchainTime = useBlockchainTime(NO_LOSS_BET_MULTI_ADDRESS, NoLossBetMultiABI.abi);
  
  // Check network status
  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetworkStatus(chainId === '0xaef3' ? 'connected' : 'wrong_network');
      
      // Set up network change listener
      window.ethereum.on('chainChanged', (newChainId: string) => {
        setNetworkStatus(newChainId === '0xaef3' ? 'connected' : 'wrong_network');
      });
    } catch (error) {
      console.error("Error checking network:", error);
    }
  }, []);
  
  // Switch to Alfajores network
  const switchToAlfajores = async () => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaef3' }], // Alfajores chainId
      });
    } catch (error: any) {
      // If the error code is 4902, the chain hasn't been added yet
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaef3',
                chainName: 'Alfajores Testnet',
                nativeCurrency: {
                  name: 'Celo',
                  symbol: 'CELO',
                  decimals: 18,
                },
                rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
                blockExplorerUrls: ['https://alfajores.celoscan.io/'],
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding Alfajores network:", addError);
        }
      } else {
        console.error("Error switching to Alfajores network:", error);
      }
    }
  };
  
  // Load user's bets (both created and joined)
  const loadUserBets = async () => {
    if (!window.ethereum || !address || networkStatus !== 'connected') {
      setLoadBetsError("Please connect your wallet to view your bets");
      return;
    }
    
    setLoadingBets(true);
    setLoadBetsError(null);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      console.log("Loading bets from contract address:", NO_LOSS_BET_MULTI_ADDRESS);
      
      // Create contract instance
      const contractABI = NoLossBetMultiABI.abi; 
      const contract = new ethers.Contract(
        NO_LOSS_BET_MULTI_ADDRESS,
        contractABI,
        signer
      );
      
      // Get total number of bets
      const totalBets = await contract.betCounter();
      console.log("Total bets:", totalBets.toString());
      
      // Fetch all bets
      const allBets: BetData[] = [];
      const createdByUser: BetData[] = [];
      const joinedByUser: BetData[] = [];
      
      for (let i = 0; i < Number(totalBets); i++) {
        try {
          // Use the correct method name from the contract
          const bet = await contract.getBetDetails(i);
          
          // Get expiration timestamp in milliseconds
          const expirationTimestamp = extractTimestamp(bet[2]);
          const isExpired = Date.now() > expirationTimestamp * 1000;
          
          // Format bet data
          const formattedBet: BetData = {
            id: (i + 1).toString(), // Display IDs start from 1
            betIdOnChain: i,
            question: bet[1], // Condition is used as the question
            creator: bet[0],
            expirationDate: expirationTimestamp,
            endDate: new Date(expirationTimestamp * 1000).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit'
            }),
            createdAt: Math.floor(Date.now() / 1000) - 86400, // Approximate, 1 day ago
            resolved: bet[3],
            yesStake: bet[4],
            noStake: bet[5],
            totalStake: bet[4] + bet[5],
            resolutionFinalized: bet[6],
            winningOutcome: bet[7],
            status: bet[3] ? 'resolved' : (isExpired ? 'expired' : 'active'),
            userParticipation: {
              isCreator: bet[0].toLowerCase() === address.toLowerCase(),
              hasJoined: false, // Will be updated below
              stake: BigInt(0)
            }
          };
          
          // Determine if user is a participant (non-creator)
          try {
            const userStake = await contract.getParticipantStake(i, address);
            if (userStake > 0) {
              formattedBet.userParticipation.hasJoined = true;
              formattedBet.userParticipation.stake = userStake;
            }
          } catch (e) {
            console.log(`Error checking participation for bet #${i+1}:`, e);
          }
          
          // Add to appropriate categories
          allBets.push(formattedBet);
          
          if (formattedBet.userParticipation.isCreator) {
            createdByUser.push(formattedBet);
          }
          
          if (formattedBet.userParticipation.hasJoined) {
            joinedByUser.push(formattedBet);
          }
        } catch (e) {
          console.log(`Error loading bet #${i+1}:`, e);
        }
      }
      
      // Combine the two lists, ensuring no duplicates
      const combinedBets = [
        ...createdByUser,
        ...joinedByUser.filter(joinedBet => 
          !createdByUser.some(createdBet => createdBet.id === joinedBet.id)
        )
      ];
      
      setUserBets(combinedBets);
      console.log("User bets loaded:", combinedBets.length);
      
    } catch (error) {
      console.error("Error loading bets:", error);
      setLoadBetsError("Failed to load bets. Please try again later.");
    } finally {
      setLoadingBets(false);
    }
  };
  
  // Check blockchain expiration status for a bet
  const checkBetExpiration = async (betId: string) => {
    if (!blockchainTime) return false;
    
    const isExpired = await blockchainTime.verifyBetExpiration(betId);
    return isExpired;
  };
  
  // Effect to connect wallet on mount
  useEffect(() => {
    // Check network when component mounts
    checkNetwork();
  }, [checkNetwork]);
  
  // Effect to load bets when wallet is connected and on the right network
  useEffect(() => {
    if (address && networkStatus === 'connected') {
      loadUserBets();
    }
  }, [address, networkStatus]);
  
  return (
    <Container maxWidth="full" className="py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">My Bets</h1>
        
        {/* Wallet Connection */}
        {!address ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl mb-6 text-center">
            <h2 className="text-xl font-semibold text-indigo-300 mb-3">Connect Your Wallet</h2>
            <p className="text-white/70 mb-4">Connect your wallet to view your bets</p>
            <button
              onClick={connect}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              Connect Wallet
            </button>
          </div>
        ) : networkStatus === 'wrong_network' ? (
          <div className="bg-white/5 backdrop-blur-sm border border-yellow-500/20 p-6 rounded-xl mb-6 text-center">
            <h2 className="text-xl font-semibold text-yellow-300 mb-3">Wrong Network</h2>
            <p className="text-white/70 mb-4">Please switch to Alfajores Testnet to view your bets</p>
            <button
              onClick={switchToAlfajores}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-4 py-2 rounded-xl transition-colors font-medium"
            >
              Switch to Alfajores
            </button>
          </div>
        ) : (
          <>
            {/* Connected Wallet Info */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl mb-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-white/50">Connected as</p>
                <p className="font-mono text-indigo-300">{formatAddress(address)}</p>
              </div>
              <button
                onClick={disconnect}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-xl transition-colors text-sm"
              >
                Disconnect
              </button>
            </div>
            
            {/* Bets List */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-indigo-300">Your Bets</h2>
                <button 
                  onClick={loadUserBets}
                  className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 px-3 py-1 rounded-lg text-sm transition-colors"
                  disabled={loadingBets}
                >
                  {loadingBets ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              
              {/* Loading State */}
              {loadingBets && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-indigo-500 animate-spin"></div>
                  <p className="mt-4 text-white/60">Loading your bets...</p>
                </div>
              )}
              
              {/* Error State */}
              {loadBetsError && (
                <div className="bg-red-900/20 border border-red-500/20 text-red-300 p-4 rounded-xl mb-4">
                  <p className="font-medium">Error loading bets</p>
                  <p className="text-sm">{loadBetsError}</p>
                  <button 
                    onClick={loadUserBets}
                    className="mt-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded-lg text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
              
              {/* No Bets State */}
              {!loadingBets && !loadBetsError && userBets.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/60">You haven't created or joined any bets yet.</p>
                  <p className="text-white/50 mt-2">Create your first bet or join an existing one to get started!</p>
                  <div className="mt-4">
                    <a href="/test" className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Explore Bets
                    </a>
                  </div>
                </div>
              )}
              
              {/* Bets List */}
              {!loadingBets && !loadBetsError && userBets.length > 0 && (
                <div className="space-y-4">
                  {userBets.map((bet) => (
                    <BetCard
                      key={bet.id}
                      bet={bet}
                      isSelected={selectedBet === bet.id}
                      onClick={() => setSelectedBet(selectedBet === bet.id ? null : bet.id)}
                      dark={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Container>
  );
} 