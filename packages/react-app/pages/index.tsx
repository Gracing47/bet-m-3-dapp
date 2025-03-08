import { useState, useEffect, useCallback, Fragment } from "react";
import { useWallet } from "@/hooks/useWallet";
import Link from "next/link";
import Image from "next/image";
import { ethers } from "ethers";
import NoLossBetMultiABI from "@/assets/abis/NoLossBetMulti.json";
import useTimestamp from "@/hooks/useTimestamp";
import BetCard from "@/components/betting/BetCard";
import { BetData } from '@/types/betting';
import { Menu, Transition } from '@headlessui/react';
import { 
  PlusCircleIcon, 
  ArrowPathIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightIcon,
  FireIcon,
  GlobeAltIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

// Contract address from environment
const NO_LOSS_BET_MULTI_ADDRESS = process.env.NEXT_PUBLIC_NO_LOSS_BET_MULTI_ADDRESS || "";

export default function Home() {
  const { address, isConnected, connect, disconnect, formatAddress } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [featuredBets, setFeaturedBets] = useState<BetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'disconnected' | 'connected' | 'wrong_network'>('disconnected');
  const { extractTimestamp } = useTimestamp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mockBalance, setMockBalance] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  // Action tabs with Uniswap-inspired style
  const actionTabs = [
    { 
      name: 'Mint Mock', 
      href: '/mint-mock', 
      icon: <CurrencyDollarIcon className="w-4 h-4 mr-1" />,
      gradient: 'from-purple-600 to-blue-600'
    },
    { 
      name: 'Create Bet', 
      href: '/create-bet', 
      icon: <PlusCircleIcon className="w-4 h-4 mr-1" />,
      gradient: 'from-pink-600 to-purple-600'
    },
    { 
      name: 'Join Bet', 
      href: '/join-bet', 
      icon: <ArrowPathIcon className="w-4 h-4 mr-1" />,
      gradient: 'from-indigo-600 to-blue-600'
    },
    { 
      name: 'Resolve Bets', 
      href: '/resolve-bets', 
      icon: <CheckCircleIcon className="w-4 h-4 mr-1" />,
      gradient: 'from-teal-600 to-emerald-600'
    },
  ];

  // Ensure wallet state is only accessed after component mount
  useEffect(() => {
    setMounted(true);
    checkNetwork();
    loadFeaturedBets();
  }, []);

  // Effect to update balances when address changes
  useEffect(() => {
    if (address) {
      getMockTokenBalance();
      getNativeBalance(address);
    } else {
      setMockBalance(null);
      setBalance(null);
    }
  }, [address]);

  // Check network status
  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetworkStatus(chainId === '0xaef3' ? 'connected' : 'wrong_network');
      
      // Get native token balance if we have an address
      if (address) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const nativeBalance = await provider.getBalance(address);
        setBalance(ethers.formatEther(nativeBalance));
      }
      
      // Set up network change listener
      window.ethereum.on('chainChanged', (newChainId: string) => {
        setNetworkStatus(newChainId === '0xaef3' ? 'connected' : 'wrong_network');
        // Update balances on network change
        if (address) {
          getMockTokenBalance();
          getNativeBalance(address);
        }
      });
    } catch (error) {
      console.error("Error checking network:", error);
    }
  }, [address]);

  // Get native token balance
  const getNativeBalance = async (addr: string) => {
    if (!window.ethereum) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const nativeBalance = await provider.getBalance(addr);
      setBalance(ethers.formatEther(nativeBalance));
    } catch (error) {
      console.error("Error getting native balance:", error);
    }
  };

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

  const loadFeaturedBets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to use ethereum provider if available, otherwise fallback to JsonRpcProvider
      let provider;
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        provider = new ethers.JsonRpcProvider("https://alfajores-forno.celo-testnet.org");
      }
      
      const contractAddress = process.env.NEXT_PUBLIC_NO_LOSS_BET_MULTI_ADDRESS || "";
      const contractABI = NoLossBetMultiABI.abi;
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      // Get total number of bets
      const totalBets = await contract.betCounter();
      console.log("Total bets:", totalBets.toString());
      
      // Fetch most recent bets (up to 3)
      const bets: BetData[] = [];
      const startIndex = Math.max(0, Number(totalBets) - 3);
      
      for (let i = startIndex; i < Number(totalBets); i++) {
        try {
          const bet = await contract.getBetDetails(i);
          
          // Get expiration timestamp in milliseconds
          const expirationTimestamp = extractTimestamp(bet[2]);
          const isExpired = Date.now() > expirationTimestamp * 1000;

          // Is this user the creator or participant?
          let isCreator = false;
          let hasJoined = false;
          
          if (address) {
            isCreator = bet[0].toLowerCase() === address.toLowerCase();
            
            try {
              // Only check participation if user is connected
              const userStake = await contract.getParticipantStake(i, address);
              hasJoined = userStake > 0;
            } catch (e) {
              console.log(`Error checking participation for bet #${i+1}:`, e);
            }
          }
          
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
              isCreator,
              hasJoined,
              stake: BigInt(0)
            }
          };
          
          bets.push(formattedBet);
        } catch (e) {
          console.error(`Error loading bet #${i+1}:`, e);
        }
      }
      
      // Sort by newest first
      bets.sort((a, b) => Number(b.id) - Number(a.id));
      setFeaturedBets(bets);
      
    } catch (error) {
      console.error("Error loading featured bets:", error);
      setError("Failed to load featured bets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // Function to get the MOCK token balance
  const getMockTokenBalance = async () => {
    if (!address || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const MOCK_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MOCK_TOKEN_ADDRESS || "";

      // Simple ABI for balance check
      const ABI = ["function balanceOf(address account) external view returns (uint256)"];
      const mockToken = new ethers.Contract(MOCK_TOKEN_ADDRESS, ABI, signer);
      const balance = await mockToken.balanceOf(address);
      
      // Format the balance
      setMockBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error getting MOCK token balance:", error);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration errors
  }

  return (
    <div className="min-h-screen bg-[#0C1425] text-white">
      <div className="relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-r from-fuchsia-600/20 to-indigo-600/20 rounded-full filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-gradient-to-l from-blue-500/20 to-teal-500/20 rounded-full filter blur-3xl opacity-30"></div>
        </div>

        <div className="relative container mx-auto px-4 pt-32 pb-24">
          {/* Hero Content */}
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">
              No-Loss Betting on the Blockchain
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Make predictions, stake tokens, and earn rewards without risk. Your principal is always protected.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/betting" className="inline-block">
                <button className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-indigo-500/20">
                  Launch App
                </button>
              </Link>
              <a 
                href="https://github.com/celo-org/no-loss-dao" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium border border-white/20 hover:bg-white/10 transition-all duration-200"
              >
                View GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works - Minimalist approach */}
      <section className="py-24 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          How BETM3 Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="relative">
            <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center text-white">
              <WalletIcon className="h-4 w-4" />
            </div>
            <div className="border border-white/10 rounded-xl p-6 backdrop-blur-sm bg-white/5 h-full">
              <h3 className="text-xl font-semibold mb-4 pt-3">Connect Your Wallet</h3>
              <p className="text-white/60">
                Connect your wallet to access the BETM3 platform. No sign-up required.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center text-white">
              <ArrowPathIcon className="h-4 w-4" />
            </div>
            <div className="border border-white/10 rounded-xl p-6 backdrop-blur-sm bg-white/5 h-full">
              <h3 className="text-xl font-semibold mb-4 pt-3">Stake on Predictions</h3>
              <p className="text-white/60">
                Choose a bet and stake MOCK tokens. Your principal is always protected.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center text-white">
              <CurrencyDollarIcon className="h-4 w-4" />
            </div>
            <div className="border border-white/10 rounded-xl p-6 backdrop-blur-sm bg-white/5 h-full">
              <h3 className="text-xl font-semibold mb-4 pt-3">Claim Your Rewards</h3>
              <p className="text-white/60">
                When the bet resolves, winners share the yield. Everyone gets their principal back.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Bets */}
      <section className="py-20 container mx-auto px-4 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-indigo-900/20 to-transparent opacity-40"></div>
        
        <div className="relative">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              Trending Predictions
            </h2>
            <Link href="/betting" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-2">
              View all
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-indigo-500 animate-spin"></div>
              <p className="mt-4 text-white/60">Loading predictions...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && !loading && (
            <div className="p-6 border border-red-500/20 bg-red-900/10 rounded-xl text-center">
              <p className="text-red-400">{error}</p>
              <button 
                onClick={loadFeaturedBets}
                className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* No Bets Found */}
          {!loading && !error && featuredBets.length === 0 && (
            <div className="p-8 border border-white/10 rounded-xl text-center">
              <p className="text-white/60">No active predictions found.</p>
              <p className="text-white/40 mt-2 text-sm">Be the first to create a prediction!</p>
              <Link href="/create-bet" className="inline-block mt-4">
                <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg text-sm">
                  Create Prediction
                </button>
              </Link>
            </div>
          )}
          
          {/* Bet Cards - Now using reusable BetCard component */}
          {!loading && !error && featuredBets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredBets.map((bet) => (
                <BetCard 
                  key={bet.id} 
                  bet={bet} 
                  dark={true}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Key Features */}
      <section className="py-24 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          Why Choose BETM3
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="flex gap-5">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-3 h-12 w-12 rounded-lg flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Risk-Free Betting</h3>
                <p className="text-white/60">
                  Your stake is always protected. Even if your prediction is wrong, you'll receive your entire stake back.
                </p>
              </div>
            </div>
            
            <div className="flex gap-5">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-3 h-12 w-12 rounded-lg flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Instant Settlement</h3>
                <p className="text-white/60">
                  Smart contracts automatically settle bets when they expire. No delays, no intermediaries.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="flex gap-5">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-3 h-12 w-12 rounded-lg flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Fully Transparent</h3>
                <p className="text-white/60">
                  All bets are recorded on the blockchain and publicly verifiable. No hidden rules or fees.
                </p>
              </div>
            </div>
            
            <div className="flex gap-5">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-3 h-12 w-12 rounded-lg flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Yield Generation</h3>
                <p className="text-white/60">
                  Stakes generate yield while locked in bets. Winners share the yield, creating real incentives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-blue-900/40"></div>
        
        <div className="relative container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to make your first prediction?</h2>
          <p className="text-white/70 text-lg mb-8">
            Start betting without risk. Connect your wallet and join the next generation of prediction markets.
          </p>
          <Link href="/test" className="inline-block">
            <button className="px-8 py-4 rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-indigo-500/20">
              Launch App
            </button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
                BETM3
              </div>
              <p className="text-white/50 text-sm mt-1">No-Loss Betting Protocol</p>
            </div>
            <div className="flex space-x-6">
              <a href="https://github.com/celo-org/no-loss-dao" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.532 1.03 1.532 1.03.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.022A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.291 2.747-1.022 2.747-1.022.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.934.359.309.678.92.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-white/40 text-sm">
            <p>© 2024 BETM3. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

