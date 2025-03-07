import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@/hooks/useWallet';
import WalletModal from '@/components/wallet/WalletModal';
import { Button, Card, CardContent, Container, Input } from '@/components/ui';
import { Badge } from '@/components/common';
import { ethers, Contract } from 'ethers';
import NoLossBetMultiABI from "@/assets/abis/NoLossBetMulti.json";
import { ALFAJORES_CONTRACTS } from '@/constants/contracts';
import Modal from '@/components/common/Modal';
import { MockTokenMinter } from '@/components/token';
// Alfajores Testnet Configuration
const ALFAJORES_CONFIG = {
  chainId: '0xaef3',
  chainName: 'Alfajores Testnet',
  nativeCurrency: {
    name: 'Alfajores Celo',
    symbol: 'CELO',
    decimals: 18
  },
  rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
  blockExplorerUrls: ['https://alfajores-blockscout.celo-testnet.org']
};

// Betting Contract Configuration
const MOCK_TOKEN_ADDRESS = ALFAJORES_CONTRACTS.MOCK_TOKEN_ADDRESS || "";

// Hardcoded NoLossBetMulti contract address for testing
// In a real app, this would come from the BettingManagerFactory
const BETTING_CONTRACT_ADDRESS = "0x0"; // Replace with actual deployed contract address 

// Contract Address
const NO_LOSS_BET_MULTI_ADDRESS = process.env.NEXT_PUBLIC_NO_LOSS_BET_MULTI_ADDRESS || "";

// Simple loading spinner component
const LoadingSpinner = () => (
  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
);

// Component Testing Page
export default function TestPage() {
  const router = useRouter();
  const { address, balance, connect, disconnect } = useWallet();
  
  // State Management
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [activeTestSection, setActiveTestSection] = useState<string>('wallet');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [contractAddressInput, setContractAddressInput] = useState<string>('');
  const [createBetData, setCreateBetData] = useState({
    question: '',
    endDate: '',
    stake: '0.1',
    prediction: true
  });
  const [selectedBet, setSelectedBet] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState('0.1');
  const [prediction, setPrediction] = useState<boolean | null>(null);
  const [bets, setBets] = useState<any[]>([]);
  const [isLoadingBets, setIsLoadingBets] = useState(false);
  const [loadBetsError, setLoadBetsError] = useState('');
  const [joinBetStatus, setJoinBetStatus] = useState<'idle' | 'approving' | 'joining' | 'success' | 'error'>('idle');
  const [joinBetTxHash, setJoinBetTxHash] = useState('');
  const [joinBetError, setJoinBetError] = useState('');
  const [timeTravelMode, setTimeTravelMode] = useState(false);
  const [simulatedFutureDate, setSimulatedFutureDate] = useState<Date | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'disconnected' | 'connected' | 'wrong_network'>('disconnected');
  
  // Bet Creation State
  const [createBetStatus, setCreateBetStatus] = useState<'idle' | 'approving' | 'creating' | 'success' | 'error'>('idle');
  const [createBetTxHash, setCreateBetTxHash] = useState('');
  const [createBetError, setCreateBetError] = useState('');
  
  // Load active bets on component mount if in join bet section
  useEffect(() => {
    if (activeTestSection === 'joinBet' && address && networkStatus === 'connected') {
      loadActiveBets();
    }
  }, [activeTestSection, address, networkStatus]);
  
  // Function to load active bets from the contract
  const loadActiveBets = async () => {
    if (!window.ethereum || !address) {
      setLoadBetsError("Please connect your wallet to view active bets");
      return;
    }
    
    setIsLoadingBets(true);
    setLoadBetsError('');
    
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
      
      // Get contract code to see if there's anything useful
      try {
        const contractCode = await provider.getCode(NO_LOSS_BET_MULTI_ADDRESS);
        console.log("Contract code length:", contractCode.length);
      } catch (e) {
        console.log("Could not get contract code:", e);
      }
      
      // Get total number of bets
      const totalBets = await contract.betCounter();
      console.log("Total bets:", totalBets.toString());
      
      // Fetch all bets
      const fetchedBets = [];
      for (let i = 0; i < Number(totalBets); i++) {
        try {
          // Use the correct method name from the contract
          const bet = await contract.getBetDetails(i);
          
          // Debug raw timestamp value
          const rawTimestamp = bet[2];
          
          // Try to figure out the timestamp logic used in the contract
          const isUnixTimestamp = Number(rawTimestamp) > 1000000000; // Unix timestamps are typically 10+ digits
          const possibleMinutesDuration = Number(rawTimestamp) < 10000 ? Number(rawTimestamp) : null;
          const now = Math.floor(Date.now() / 1000); // Current Unix timestamp
          
          // Analyze the timestamp
          const timestampAnalysis = {
            rawValue: rawTimestamp?.toString() || 'undefined',
            asNumber: Number(rawTimestamp),
            isLikelyUnixTimestamp: isUnixTimestamp,
            possibleMinutesDuration: possibleMinutesDuration,
            currentUnixTime: now,
            differenceFromNow: Number(rawTimestamp) - now,
            humanReadableDate: isUnixTimestamp ? new Date(Number(rawTimestamp) * 1000).toString() : 'Not a Unix timestamp',
            isInFuture: Number(rawTimestamp) > now,
            minutesInFuture: isUnixTimestamp ? Math.floor((Number(rawTimestamp) - now) / 60) : null,
            hoursInFuture: isUnixTimestamp ? Math.floor((Number(rawTimestamp) - now) / 3600) : null,
            daysInFuture: isUnixTimestamp ? Math.floor((Number(rawTimestamp) - now) / 86400) : null
          };
          
          console.log(`Bet #${i+1} timestamp analysis:`, timestampAnalysis);
          
          // Decode the contract getBetDetails return values for better understanding
          try {
            const betABI = [
              "function getBetDetails(uint256 _betId) external view returns (address creator, string condition, uint256 expirationDate, bool resolved, uint256 yesStake, uint256 noStake, bool finalized, bool outcome)"
            ];
            const iface = new ethers.Interface(betABI);
            
            // Create a mock result data 
            const values = [
              bet[0], // creator
              bet[1], // condition
              bet[2], // expirationDate  
              bet[3], // resolved
              bet[4], // yesStake
              bet[5], // noStake
              bet[6], // finalized
              bet[7]  // outcome
            ];
            
            console.log(`Bet #${i+1} decoded contract data:`, {
              creator: bet[0],
              condition: bet[1],
              expirationDate: bet[2].toString(),
              resolved: bet[3],
              yesStake: ethers.formatEther(bet[4]),
              noStake: ethers.formatEther(bet[5]),
              finalized: bet[6],
              outcome: bet[7]
            });
            
          } catch (e) {
            console.log(`Error decoding bet #${i+1} data:`, e);
          }
          
          const safeISOString = (timestamp: any) => {
            try {
              const date = new Date(Number(timestamp) * 1000);
              return !isNaN(date.getTime()) ? date.toISOString() : "Invalid Date";
            } catch (e) {
              return "Invalid Date";
            }
          };
          
          console.log(`Bet #${i+1} raw timestamp:`, {
            rawValue: rawTimestamp?.toString() || 'undefined',
            asNumber: Number(rawTimestamp),
            unixTimeFromNumber: safeISOString(rawTimestamp),
            isFinite: isFinite(Number(rawTimestamp)),
            asDateValid: !isNaN(new Date(Number(rawTimestamp) * 1000).getTime())
          });
          
          // Convert timestamp to date safely with extensive debugging
          let expirationDate = "Unknown";
          let debugInfo: Record<string, any> = {};
          
          try {
            // Handle different timestamp formats
            const timestamp = Number(rawTimestamp);
            debugInfo.timestamp = timestamp;
            debugInfo.isNumber = !isNaN(timestamp);
            debugInfo.isPositive = timestamp > 0;
            
            // Detect how the timestamp is stored - Unix timestamp or relative minutes
            let dateObj: Date | null = null;
            
            if (isNaN(timestamp) || timestamp <= 0 || timestamp >= 8640000000) {
              // Invalid timestamp - use fallback date based on bet ID to make them distinct
              const offsetMinutes = (i + 1) * 5; // 5 minutes per bet ID
              dateObj = new Date(Date.now() + offsetMinutes * 60 * 1000);
              debugInfo.timeCase = "fallback - invalid timestamp";
            } else if (timestamp > 1600000000) {
              // It's likely a Unix timestamp (seconds since Jan 1, 1970)
              // 1600000000 was in 2020, so any timestamp greater than this is definitely an absolute time
              debugInfo.timeCase = "unix timestamp";
              dateObj = new Date(timestamp * 1000); // Convert seconds to milliseconds
            } else if (timestamp < 10000) {
              // If it's a very small number, it might be relative minutes or days
              // We need to check the contract to confirm this interpretation
              debugInfo.timeCase = "small value - possible duration";
              
              // For now, let's assume it's minutes and convert to an end date
              const minutesToMs = timestamp * 60 * 1000;
              // Add to current time
              dateObj = new Date(Date.now() + minutesToMs);
            } else {
              // For any other cases, use the standard interpretation (Unix timestamp)
              debugInfo.timeCase = "default - treating as unix timestamp";
              dateObj = new Date(timestamp * 1000);
            }
            
            debugInfo.dateObj = dateObj?.toString() || "null";
            debugInfo.isValidDate = !isNaN(dateObj?.getTime() || NaN);
            
            if (dateObj && !isNaN(dateObj.getTime())) {
              expirationDate = dateObj.toISOString();
            }
          } catch (dateError: any) {
            console.warn(`Error processing date for bet #${i+1}:`, dateError);
            debugInfo.error = dateError.message;
          }
          
          console.log(`Bet #${i+1} date processing debug:`, debugInfo);
          
          // Debug log for raw bet data
          console.log(`Raw Bet #${i+1} data:`, {
            creator: bet[0],
            question: bet[1],
            expirationTimestamp: bet[2]?.toString() || 'undefined',
            resolved: bet[3],
            yesStake: bet[4]?.toString() || '0',
            noStake: bet[5]?.toString() || '0',
            finalized: bet[6],
            outcome: bet[7]
          });
          
          // Format the data properly based on the contract's return structure
          const formattedBet = {
            id: i + 1,
            condition: bet[1] || "No description", // question/condition is at index 1
            creator: bet[0],   // creator is at index 0
            expirationDate: expirationDate,
            createdAt: new Date().toISOString(), // Use current time as fallback if not available
            totalStake: (bet[4] || BigInt(0)) + (bet[5] || BigInt(0)), // Add BigInts directly with fallbacks
            yesStake: bet[4] || BigInt(0),  // yesStake is at index 4
            noStake: bet[5] || BigInt(0),   // noStake is at index 5
            resolved: bet[3],  // resolved is at index 3
            outcome: bet[7],   // outcome is at index 7
            status: bet[3] ? 'resolved' : 'active',
            // Add blockchain data for debugging
            rawTimestamp: bet[2]?.toString() || 'undefined',
            betIdOnChain: i, // This is the actual ID on-chain (0-indexed)
            explorerLink: `https://explorer.celo.org/alfajores/address/${NO_LOSS_BET_MULTI_ADDRESS}`
          };
          
          console.log(`Formatted bet #${i+1}:`, {
            ...formattedBet,
            totalStake: typeof formattedBet.totalStake === 'bigint' ? ethers.formatEther(formattedBet.totalStake) : '0',
            yesStake: typeof formattedBet.yesStake === 'bigint' ? ethers.formatEther(formattedBet.yesStake) : '0',
            noStake: typeof formattedBet.noStake === 'bigint' ? ethers.formatEther(formattedBet.noStake) : '0'
          });
          
          // Get all bets, including resolved ones (the user wants to see them all)
          fetchedBets.push(formattedBet);
        } catch (error) {
          console.error(`Error fetching bet #${i+1}:`, error);
        }
      }
      
      setBets(fetchedBets);
      console.log("All bets loaded:", fetchedBets.length);
      
    } catch (error) {
      console.error("Error loading bets:", error);
      setLoadBetsError("Failed to load bets. Please try again.");
    } finally {
      setIsLoadingBets(false);
    }
  };
  
  // Function to join a bet
  const joinBet = async (betId: string, amount: string, userPrediction: boolean) => {
    if (!address || !window.ethereum || networkStatus !== 'connected') {
      setJoinBetError("Please ensure you are connected to Alfajores");
      return;
    }
    
    setJoinBetStatus('approving');
    setJoinBetTxHash('');
    setJoinBetError('');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Convert amount to wei
      const amountInWei = ethers.parseEther(amount);
      
      // First approve token spending
      const tokenABI = [
        "function approve(address spender, uint256 amount) returns (bool)",
        "function balanceOf(address account) view returns (uint256)",
        "function allowance(address owner, address spender) view returns (uint256)"
      ];
      
      console.log("Creating token contract instance...");
      const mockToken = new ethers.Contract(
        ALFAJORES_CONTRACTS.MOCK_TOKEN_ADDRESS,
        tokenABI,
        signer
      );
      
      // Check balance before proceeding
      const userBalance = await mockToken.balanceOf(address);
      console.log("User balance:", ethers.formatEther(userBalance), "MOCK");
      
      if (userBalance < amountInWei) {
        setJoinBetStatus('error');
        setJoinBetError(`Insufficient MOCK token balance. You have ${ethers.formatEther(userBalance)} MOCK, but need ${amount} MOCK.`);
        return;
      }
      
      console.log("Approving token transfer...");
      const approveTx = await mockToken.approve(NO_LOSS_BET_MULTI_ADDRESS, amountInWei);
      console.log("Approval transaction sent:", approveTx.hash);
      
      // Wait for approval to be mined
      await approveTx.wait();
      console.log("Approval confirmed!");
      
      setJoinBetStatus('joining');
      
      // Create betting contract instance
      const betABI = [
        "function joinBet(uint256 _betId, uint256 _stake, bool _prediction) external"
      ];
      
      const bettingContract = new ethers.Contract(
        NO_LOSS_BET_MULTI_ADDRESS,
        betABI,
        signer
      );
      
      // Join the bet
      console.log(`Joining bet ${betId} with ${amount} MOCK, prediction: ${userPrediction}`);
      const tx = await bettingContract.joinBet(parseInt(betId), amountInWei, userPrediction);
      console.log("Transaction sent:", tx.hash);
      setJoinBetTxHash(tx.hash);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log("Join transaction confirmed:", receipt);
      
      setJoinBetStatus('success');
      
      // Reset join bet form
      setSelectedBet(null);
      setBetAmount('0.1');
      setPrediction(null);
      
      // Reload bets to show updated information
      await loadActiveBets();
      
    } catch (error) {
      console.error("Error joining bet:", error);
      setJoinBetStatus('error');
      
      // Check for specific error messages in the error object
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("user rejected")) {
        setJoinBetError("Transaction was rejected. Please try again.");
      } else if (errorMessage.includes("insufficient funds")) {
        setJoinBetError("You don't have enough CELO to pay for transaction fees.");
      } else if (errorMessage.includes("Participant already joined") || 
                errorMessage.includes("execution reverted") && errorMessage.includes("Participant already joined")) {
        setJoinBetError("You have already joined this bet. You cannot join the same bet multiple times.");
      } else {
        // For other errors, provide a more user-friendly message
        setJoinBetError("Failed to join bet. This could be because you've already joined or the bet has expired.");
      }
    }
  };
  
  // Check network on load
  useEffect(() => {
    const checkNetwork = async () => {
      if (!address) {
        setNetworkStatus('disconnected');
        return;
      }
      
      try {
        if (window.ethereum) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (chainId === ALFAJORES_CONFIG.chainId) {
            setNetworkStatus('connected');
          } else {
            setNetworkStatus('wrong_network');
          }
        }
      } catch (error) {
        console.error('Error checking network:', error);
        setNetworkStatus('disconnected');
      }
    };
    
    checkNetwork();
  }, [address]);
  
  // Switch to Alfajores Testnet
  const switchToAlfajores = async () => {
    if (!window.ethereum) return;
    
    try {
      // Try to switch to Alfajores
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ALFAJORES_CONFIG.chainId }],
      });
      setNetworkStatus('connected');
    } catch (switchError: any) {
      // If the network isn't added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: ALFAJORES_CONFIG.chainId,
                chainName: ALFAJORES_CONFIG.chainName,
                nativeCurrency: ALFAJORES_CONFIG.nativeCurrency,
                rpcUrls: ALFAJORES_CONFIG.rpcUrls,
                blockExplorerUrls: ALFAJORES_CONFIG.blockExplorerUrls
              },
            ],
          });
          setNetworkStatus('connected');
        } catch (addError) {
          console.error('Error adding Alfajores network:', addError);
        }
      } else {
        console.error('Error switching to Alfajores:', switchError);
      }
    }
  };
  
  // Create a bet on the NoLossBetMulti contract
  const handleCreateBet = async (contractAddress: string) => {
    if (!address || !window.ethereum || networkStatus !== 'connected') {
      setCreateBetError("Please ensure you are connected to Alfajores and the contract address is set");
      return;
    }
    
    if (!createBetData.question || !createBetData.endDate || !createBetData.stake) {
      setCreateBetError("Please fill all required fields");
      return;
    }

    // Calculate minutes until end date
    const now = new Date();
    const endDate = new Date(createBetData.endDate);
    const durationMinutes = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60));
    
    if (durationMinutes < 5) {
      setCreateBetStatus('error');
      setCreateBetError("End date must be at least 5 minutes from now. Please adjust the time.");
      return;
    }

    setCreateBetStatus('approving');
    setCreateBetTxHash('');
    setCreateBetError('');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      
      // Convert duration to days with proper precision for the contract
      // Multiply by 1e18 to maintain precision when converting to BigInt
      const durationDays = Math.ceil(durationMinutes / (24 * 60) * 1e18);
      
      // Log detailed information about the duration calculation
      console.log("Duration calculation debug:", {
        endDateString: createBetData.endDate,
        parsedEndDate: endDate.toString(),
        nowDate: now.toString(),
        durationMinutesRaw: (endDate.getTime() - now.getTime()) / (1000 * 60),
        durationMinutesCeiled: durationMinutes,
        durationDaysRaw: durationMinutes / (24 * 60),
        durationDaysFinal: durationDays,
        endDateUnixTimestamp: Math.floor(endDate.getTime() / 1000)
      });
      
      // Convert stake to wei
      const stakeInWei = ethers.parseEther(createBetData.stake);
      
      // First approve token spending
      const tokenABI = [
        "function approve(address spender, uint256 amount) returns (bool)",
        "function balanceOf(address account) view returns (uint256)",
        "function allowance(address owner, address spender) view returns (uint256)"
      ];
      
      console.log("Creating contract instances...");
      console.log("MOCK_TOKEN_ADDRESS:", ALFAJORES_CONTRACTS.MOCK_TOKEN_ADDRESS);
      console.log("Contract Address:", contractAddress);
      
      const mockToken = new ethers.Contract(
        ALFAJORES_CONTRACTS.MOCK_TOKEN_ADDRESS, 
        tokenABI, 
        signer
      );
      
      // Check balance before proceeding
      const userBalance = await mockToken.balanceOf(address);
      console.log("User balance:", ethers.formatEther(userBalance), "MOCK");
      
      if (userBalance < stakeInWei) {
        setCreateBetStatus('error');
        setCreateBetError(`Insufficient MOCK token balance. You have ${ethers.formatEther(userBalance)} MOCK, but need ${createBetData.stake} MOCK.`);
        return;
      }
      
      console.log("Approving token transfer...");
      const approveTx = await mockToken.approve(contractAddress, stakeInWei);
      console.log("Approval transaction sent:", approveTx.hash);
      
      // Wait for approval to be mined
      await approveTx.wait();
      console.log("Approval confirmed!");
      
      setCreateBetStatus('creating');
      
      // Bet Contract ABI - just the createBet function
      const betABI = [
        "function createBet(uint256 _stake, string calldata _condition, uint256 _durationDays, bool _creatorPrediction) external"
      ];
      
      // Then create bet on the NoLossBetMulti contract
      const bettingContract = new ethers.Contract(contractAddress, betABI, signer);
      console.log("Creating bet with duration (days):", durationDays);
      
      // Create a decoder to decode the transaction data
      const iface = new ethers.Interface(betABI);
      
      // For better transparency, let's decode what we're about to send
      const calldata = iface.encodeFunctionData("createBet", [
        stakeInWei,
        createBetData.question,
        BigInt(durationDays),
        createBetData.prediction
      ]);
      
      console.log("Transaction calldata:", calldata);
      console.log("Decoded transaction data:", iface.parseTransaction({ data: calldata }));
      
      const tx = await bettingContract.createBet(
        stakeInWei,
        createBetData.question,
        BigInt(durationDays),
        createBetData.prediction
      );
      
      console.log("Transaction sent:", tx.hash);
      setCreateBetTxHash(tx.hash);
      
      // Store important transaction data
      const createBetCallData = {
        txHash: tx.hash,
        decodedData: {
          stake: createBetData.stake + " MOCK",
          question: createBetData.question,
          durationDays: Number(durationDays) / 1e18,
          durationMinutes: durationMinutes,
          endDateLocal: endDate.toString(),
          endDateUnixTimestamp: Math.floor(endDate.getTime() / 1000),
          creatorPrediction: createBetData.prediction ? "Yes" : "No"
        },
        explorerLink: `https://explorer.celo.org/alfajores/tx/${tx.hash}`
      };
      
      console.log("Create Bet Transaction Details:", createBetCallData);
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      setCreateBetStatus('success');
      
      // Show transaction details more prominently
      alert(`Bet created successfully!\n\nTransaction details have been logged to the console.\nCheck the explorer link for more details: ${createBetCallData.explorerLink}`);
      
      // Reset form
      setCreateBetData({ 
        question: '', 
        endDate: '', 
        stake: '0.1',
        prediction: true
      });
      
    } catch (error) {
      console.error("Error creating bet:", error);
      setCreateBetStatus('error');
      
      // More helpful error messages
      if (error instanceof Error) {
        if (error.message.includes("user rejected transaction")) {
          setCreateBetError("Transaction was rejected. Please try again.");
        } else if (error.message.includes("insufficient funds")) {
          setCreateBetError("You don't have enough CELO to pay for transaction fees.");
        } else {
          setCreateBetError(error.message);
        }
      } else {
        setCreateBetError("Unknown error occurred. Check the console for details.");
      }
    }
  };
  
  // Demo Functions
  const handlePlaceBet = () => {
    if (!selectedBet || prediction === null) return;
    joinBet(selectedBet, betAmount, prediction);
  };
  
  // Check if a bet is expired based on real or simulated time
  const isBetExpired = (expirationDate: Date) => {
    if (simulatedFutureDate) {
      return expirationDate < simulatedFutureDate;
    }
    return expirationDate < new Date();
  };

  // Function to get the display status of a bet
  const getBetDisplayStatus = (bet: any) => {
    // If the bet is actually resolved on-chain, respect that status
    if (bet.resolved) {
      return 'resolved';
    }
    
    // If we're in time travel mode and the bet would be expired in our simulated future
    if (timeTravelMode && simulatedFutureDate && new Date(bet.expiration) < simulatedFutureDate) {
      return 'simulatedResolved';
    }
    
    // Otherwise show actual status
    return bet.status;
  };

  // Function to get the display status color and label
  const getBetStatusDisplay = (status: string) => {
    switch (status) {
      case 'resolved':
        return { label: 'Resolved', color: 'bg-purple-100 text-purple-800' };
      case 'simulatedResolved':
        return { label: 'Simulated Resolved', color: 'bg-yellow-100 text-yellow-800' };
      case 'active':
      default:
        return { label: 'Active', color: 'bg-green-100 text-green-800' };
    }
  };

  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Function to set contract address
  const saveContractAddress = () => {
    if (ethers.isAddress(contractAddressInput)) {
      setContractAddress(contractAddressInput);
      setContractAddressInput('');
    } else {
      alert('Please enter a valid Ethereum address');
    }
  };

  const handleSubmitResolution = async (betId: string, outcome: boolean) => {
    try {
      setIsBusy(true);
      // Add your resolution submission logic here
      console.log(`Submitting resolution for bet ${betId} with outcome ${outcome}`);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error submitting resolution:', error);
    } finally {
      setIsBusy(false);
    }
  };

  const handleFinalizeResolution = async (betId: string) => {
    try {
      setIsBusy(true);
      // Add your finalization logic here
      console.log(`Finalizing resolution for bet ${betId}`);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error finalizing resolution:', error);
    } finally {
      setIsBusy(false);
    }
  };

  // Helper function to get a future date with proper formatting
  const getFutureDate = (minutesToAdd: number): string => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutesToAdd);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.toISOString().slice(0, 16);
  };

  // Helper function to validate end date
  const isValidEndDate = (dateStr: string): boolean => {
    const endDate = new Date(dateStr);
    const now = new Date();
    const durationMinutes = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60));
    return durationMinutes >= 5;
  };

  // Function to format date and calculate remaining time
  const formatDate = (dateString: string, createdAtString: string) => {
    try {
      // Handle different date formats or invalid dates
      let date: Date;
      
      // Try to parse the date in different formats
      if (!dateString || dateString === "Invalid Date") {
        console.log("Invalid date string:", dateString);
        return { formatted: "Unknown", remaining: null };
      }
      
      // Try to convert from timestamp if it's a number
      if (!isNaN(Number(dateString))) {
        date = new Date(Number(dateString));
      } else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log("Invalid date after parsing:", dateString);
        return { formatted: "Unknown", remaining: null };
      }
      
      const now = new Date();
      const diff = date.getTime() - now.getTime();
      
      // Format date
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      const formatted = `${day}.${month}.${year} ${hours}:${minutes}`;
      
      // Calculate remaining time
      if (diff <= 0) {
        return { 
          formatted, 
          remaining: "Expired", 
          isExpired: true,
          dateObject: date.toString(),
          nowTime: now.toString(), 
          diffMs: diff
        };
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours_remaining = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes_remaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds_remaining = Math.floor((diff % (1000 * 60)) / 1000);
      
      let remaining = "";
      if (days > 0) {
        remaining += `${days}d `;
      }
      if (hours_remaining > 0 || days > 0) {
        remaining += `${hours_remaining}h `;
      }
      remaining += `${minutes_remaining}m`;
      
      // For short durations (less than 5 minutes), show seconds too
      if (days === 0 && hours_remaining === 0 && minutes_remaining < 5) {
        remaining += ` ${seconds_remaining}s`;
      }
      
      // Calculate percentage of time remaining for progress bar
      let percentageRemaining = 100;
      try {
        if (createdAtString) {
          const createdAt = new Date(createdAtString);
          if (!isNaN(createdAt.getTime())) {
            const totalDuration = date.getTime() - createdAt.getTime();
            const elapsedDuration = now.getTime() - createdAt.getTime();
            percentageRemaining = Math.max(0, Math.min(100, 100 - (elapsedDuration / totalDuration * 100)));
          }
        }
      } catch (e) {
        console.log("Error calculating percentage:", e);
        // Default to 50% if we can't calculate
        percentageRemaining = 50;
      }
      
      return { 
        formatted, 
        remaining, 
        isExpired: false,
        percentageRemaining,
        // Additional debug data
        rawDateString: dateString,
        rawDate: date.toString(),
        totalMilliseconds: diff,
        calculatedDays: days,
        calculatedHours: hours_remaining,
        calculatedMinutes: minutes_remaining,
        calculatedSeconds: seconds_remaining
      };
    } catch (e) {
      console.log("Error in formatDate:", e, "for date:", dateString);
      return { formatted: "Unknown", remaining: null };
    }
  };

  // Render Test UI
  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white mb-8">
        <Container maxWidth="xl" className="py-8">
          <h1 className="text-3xl font-bold">BETM3 Component Testing Page</h1>
          <p className="opacity-80 mt-2">Teste alle Komponenten und Flows in einer isolierten Umgebung</p>
          
          <div className="flex items-center mt-6 gap-4">
            <Button 
              onClick={() => !address ? setWalletModalOpen(true) : null}
              className="bg-white/90 text-blue-900 hover:bg-white font-medium shadow-sm"
            >
              {address ? `${formatAddress(address)} | ${balance} CELO` : "Wallet verbinden"}
            </Button>
            
            {address && (
              <Button 
                variant="ghost" 
                className="border border-white/30 text-white hover:bg-white/10"
                onClick={disconnect}
              >
                Wallet trennen
              </Button>
            )}
          </div>
        </Container>
      </div>
      
      <Container maxWidth="xl">
        {/* Sections Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex -mb-px space-x-1 overflow-x-auto">
            {/* Tab buttons */}
            {['wallet', 'mintMock', 'createBet', 'joinBet', 'activeBets', 'resolvedBets'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveTestSection(section)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTestSection === section
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {section === 'wallet' ? 'Wallet Connection' :
                 section === 'mintMock' ? 'Mint MOCK' :
                 section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1')}
              </button>
            ))}
            
            {/* Time Travel Feature Button */}
            <button
              onClick={() => setTimeTravelMode(!timeTravelMode)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                timeTravelMode
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⏰ Time Travel
            </button>
          </nav>
        </div>
        
        {/* Time Travel Controls (if enabled) */}
        {timeTravelMode && (
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-800">Time Travel Simulator</h3>
                  <p className="text-sm text-gray-600">Simulate future dates to test bet resolution without affecting the actual blockchain state.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Jump to date:</label>
                    <Input 
                      type="date" 
                      value={simulatedFutureDate ? simulatedFutureDate.toISOString().split('T')[0] : ''} 
                      onChange={(e) => {
                        if (e.target.value) {
                          setSimulatedFutureDate(new Date(e.target.value));
                        } else {
                          setSimulatedFutureDate(null);
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Quick Jump:</label>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-purple-600 border border-purple-200"
                        onClick={() => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          setSimulatedFutureDate(tomorrow);
                        }}
                      >
                        +1 Day
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-purple-600 border border-purple-200"
                        onClick={() => {
                          const nextWeek = new Date();
                          nextWeek.setDate(nextWeek.getDate() + 7);
                          setSimulatedFutureDate(nextWeek);
                        }}
                      >
                        +1 Week
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-purple-600 border border-purple-200"
                        onClick={() => {
                          setSimulatedFutureDate(null);
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {simulatedFutureDate && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">Simulation Mode Active:</span> You are viewing the UI as if it were{' '}
                    <span className="font-mono">{simulatedFutureDate.toLocaleDateString()} {simulatedFutureDate.toLocaleTimeString()}</span>. 
                    Any bets with expiration dates before this time will appear as eligible for resolution.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Test Sections */}
        <div className="space-y-12">
          {/* Wallet Connection Section */}
          {(activeTestSection === 'wallet' || activeTestSection === 'allFlows') && (
            <section className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h2 className="text-2xl font-semibold">1. Wallet Connection</h2>
                <p className="text-gray-600 mt-1">Test the wallet connection and disconnection flow</p>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  {!address ? (
                    <div className="text-center py-10">
                      <div className="mx-auto w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Connect your wallet</h3>
                      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        Connect to Alfajores Testnet to join bets on the NoLossBetMulti contract
                      </p>
                      <Button 
                        onClick={() => setWalletModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm"
                      >
                        Connect Wallet
                      </Button>
                    </div>
                  ) : networkStatus !== 'connected' ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4">Please switch to the Alfajores Testnet</p>
                      <Button 
                        onClick={switchToAlfajores}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        Switch to Alfajores
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Bet Listing Section */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Active Bets</h3>
                          <Button 
                            size="sm" 
                            onClick={loadActiveBets}
                            variant="ghost"
                            className="text-blue-600"
                            disabled={isLoadingBets}
                          >
                            <LoadingSpinner />
                            {isLoadingBets ? 'Loading...' : 'Refresh'}
                          </Button>
                        </div>
                        
                        {isLoadingBets && (
                          <div className="text-center py-10">
                            <LoadingSpinner />
                            <p className="mt-2 text-gray-600">Loading active bets...</p>
                          </div>
                        )}
                        
                        {loadBetsError && (
                          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                            <p className="font-medium">Error loading bets</p>
                            <p className="text-sm">{loadBetsError}</p>
                          </div>
                        )}
                        
                        {!isLoadingBets && !loadBetsError && (
                          <div className="space-y-4">
                            {/* Active Bets List */}
                            {bets.map((bet) => {
                              const betStatus = getBetDisplayStatus(bet);
                              return (
                                <div 
                                  key={bet.id}
                                  className={`border rounded-lg overflow-hidden ${
                                    selectedBet === bet.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
                                  }`}
                                >
                                  <div 
                                    className={`p-4 cursor-pointer ${selectedBet === bet.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                    onClick={() => {
                                      setSelectedBet(selectedBet === bet.id ? null : bet.id);
                                      if (selectedBet !== bet.id) {
                                        setPrediction(null);
                                      }
                                    }}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-md">
                                            Bet #{bet.id}
                                          </span>
                                          <Badge 
                                            className={
                                              betStatus === 'resolved' ? 'bg-purple-100 text-purple-800' : 
                                              betStatus === 'simulatedResolved' ? 'bg-yellow-100 text-yellow-800' : 
                                              'bg-green-100 text-green-800'
                                            }
                                          >
                                            {betStatus === 'resolved' ? 'Resolved' : 
                                             betStatus === 'simulatedResolved' ? 'Simulated Resolved' : 
                                             'Active'}
                                          </Badge>
                                          {betStatus === 'simulatedResolved' && (
                                            <span className="text-xs text-yellow-600 italic">
                                              (Time Travel Simulation)
                                            </span>
                                          )}
                                        </div>
                                        <h4 className="font-medium text-gray-800">{bet.condition}</h4>
                                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                          <div className="flex items-center gap-1 text-gray-600">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {(() => {
                                              const timeInfo = formatDate(bet.expirationDate, bet.createdAt);
                                              return (
                                                <div className="flex flex-col">
                                                  <span>Ends: {timeInfo.formatted}</span>
                                                  {timeInfo.remaining && (
                                                    <div className="mt-1">
                                                      {timeInfo.isExpired ? (
                                                        <span className="text-xs font-medium text-red-600">Expired</span>
                                                      ) : (
                                                        <div>
                                                          <span className="text-xs font-medium text-blue-700">{timeInfo.remaining} remaining</span>
                                                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                                            <div 
                                                              className="bg-blue-600 h-1 rounded-full" 
                                                              style={{ width: `${timeInfo.percentageRemaining}%` }}
                                                            ></div>
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })()}
                                          </div>
                                          <div className="flex items-center gap-1 text-gray-600">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span>Total: {typeof bet.totalStake === 'bigint' 
                                              ? parseFloat(ethers.formatEther(bet.totalStake)).toFixed(2) 
                                              : "0.00"} MOCK</span>
                                          </div>
                                          <div className="flex items-center gap-1 text-gray-600">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            <span>Yes: {typeof bet.yesStake === 'bigint' 
                                              ? parseFloat(ethers.formatEther(bet.yesStake)).toFixed(2) 
                                              : "0.00"} MOCK</span>
                                          </div>
                                          <div className="flex items-center gap-1 text-gray-600">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>No: {typeof bet.noStake === 'bigint' 
                                              ? parseFloat(ethers.formatEther(bet.noStake)).toFixed(2) 
                                              : "0.00"} MOCK</span>
                                          </div>
                                        </div>
                                        <div className="mt-2 flex items-center gap-1 text-gray-600 text-sm">
                                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <span>Creator: {formatAddress(bet.creator)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Action panel for selected bet */}
                                  {selectedBet === bet.id && (
                                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                                      {betStatus === 'simulatedResolved' || betStatus === 'resolved' ? (
                                        <div className="space-y-4">
                                          <h4 className="font-medium text-gray-800">Resolution Actions</h4>
                                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                                            <p className="text-sm text-yellow-800">
                                              This bet has expired and is ready for resolution. In a real scenario, participants would vote on the outcome.
                                            </p>
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Submit Resolution Outcome:</label>
                                            <div className="flex gap-3">
                                              <Button 
                                                onClick={() => handleSubmitResolution(bet.id, true)}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                disabled={isBusy}
                                              >
                                                {isBusy ? 'Processing...' : 'TRUE'}
                                              </Button>
                                              <Button 
                                                onClick={() => handleSubmitResolution(bet.id, false)}
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                disabled={isBusy}
                                              >
                                                {isBusy ? 'Processing...' : 'FALSE'}
                                              </Button>
                                            </div>
                                          </div>
                                          
                                          <div className="pt-4 border-t border-gray-200">
                                            <Button
                                              onClick={() => handleFinalizeResolution(bet.id)}
                                              disabled={isBusy}
                                            >
                                              {isBusy ? 'Processing...' : 'Finalize Resolution'}
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-4">
                                          <h4 className="font-medium text-gray-800">Join this bet</h4>
                                          <div className="space-y-3">
                                            <div>
                                              <label htmlFor={`betAmount-${bet.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                Your Stake (MOCK)
                                              </label>
                                              <Input
                                                id={`betAmount-${bet.id}`}
                                                type="number"
                                                min="0.1"
                                                step="0.1"
                                                placeholder="0.1"
                                                value={betAmount}
                                                onChange={(e) => setBetAmount(e.target.value)}
                                                fullWidth
                                              />
                                              <p className="text-xs text-gray-500 mt-1">
                                                Minimum stake: 0.1 MOCK tokens
                                              </p>
                                            </div>
                                            <div>
                                              <span className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Prediction
                                              </span>
                                              <div className="grid grid-cols-2 gap-4">
                                                <Button
                                                  variant={prediction === true ? 'primary' : 'ghost'} 
                                                  onClick={() => setPrediction(true)}
                                                  className={prediction === true ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                                                >
                                                  Yes
                                                </Button>
                                                <Button 
                                                  variant={prediction === false ? 'primary' : 'ghost'}
                                                  onClick={() => setPrediction(false)}
                                                  className={prediction === false ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                                                >
                                                  No
                                                </Button>
                                              </div>
                                            </div>
                                            <Button
                                              disabled={!betAmount || prediction === null || isBusy}
                                              onClick={() => handlePlaceBet()}
                                              className="w-full mt-4"
                                            >
                                              Place Bet
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            
                            {bets.length === 0 && !isLoadingBets && (
                              <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No active bets found</p>
                                <Button 
                                  variant="ghost" 
                                  className="mt-4"
                                  onClick={() => setActiveTestSection('createBet')}
                                >
                                  Create a Bet
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Info section */}
                      <div className="border-t border-gray-200 pt-6 mt-6">
                        <h3 className="text-lg font-medium mb-4">How to Join a Bet</h3>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <ol className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start gap-2">
                              <span className="font-bold">1.</span>
                              <span>Click on a bet from the list above to select it.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold">2.</span>
                              <span>Enter your stake amount (minimum 0.1 MOCK tokens).</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold">3.</span>
                              <span>Choose your prediction (Yes or No).</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold">4.</span>
                              <span>Click 'Join Bet' and confirm the transaction in your wallet.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold">5.</span>
                              <span>After the bet ends, you'll either receive your stake back plus a share of the yield (if you win) or just your stake back (if you lose).</span>
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}
          
          {/* Mint MOCK Section */}
          {(activeTestSection === 'mintMock' || activeTestSection === 'allFlows') && (
            <section className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h2 className="text-2xl font-semibold">Mint MOCK Tokens</h2>
                <p className="text-gray-600 mt-1">Get test tokens for betting on the NoLossBetMulti contract</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">MOCK Token Information</h3>
                      <p className="text-sm text-gray-600">
                        MOCK tokens are used for testing the betting functionality. You can mint them for free on the Alfajores testnet.
                      </p>
                      
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div>
                          <span className="text-sm text-gray-500">Token Address:</span>
                          <p className="font-mono text-sm break-all">{ALFAJORES_CONTRACTS.MOCK_TOKEN_ADDRESS}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Network:</span>
                          <p>Celo Alfajores Testnet</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Symbol:</span>
                          <p>MOCK</p>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <a
                          href={`https://explorer.celo.org/alfajores/address/${ALFAJORES_CONTRACTS.MOCK_TOKEN_ADDRESS}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                        >
                          View on Block Explorer
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    {!address ? (
                      <div className="text-center py-6">
                        <p className="text-gray-600 mb-4">Connect your wallet to mint MOCK tokens</p>
                        <Button onClick={() => setWalletModalOpen(true)}>
                          Connect Wallet
                        </Button>
                      </div>
                    ) : networkStatus !== 'connected' ? (
                      <div className="text-center py-6">
                        <p className="text-gray-600 mb-4">Please switch to the Alfajores Testnet</p>
                        <Button 
                          onClick={switchToAlfajores}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          Switch to Alfajores
                        </Button>
                      </div>
                    ) : (
                      <MockTokenMinter 
                        onSuccess={() => {
                          // Optional: Show success message
                          console.log("Successfully minted MOCK tokens");
                        }}
                        onError={(error) => {
                          // Optional: Show error message
                          console.error("Error minting tokens:", error);
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>
          )}
          
          {/* Create Bet Section */}
          {(activeTestSection === 'createBet' || activeTestSection === 'allFlows') && (
            <section className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h2 className="text-2xl font-semibold">
                  {activeTestSection === 'createBet' ? '2' : '3'}. Create Bet
                </h2>
                <p className="text-gray-600 mt-1">Create a new bet on the NoLossBetMulti contract</p>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  {!address ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4">Connect your wallet to create a bet</p>
                      <Button onClick={() => setWalletModalOpen(true)}>
                        Connect Wallet
                      </Button>
                    </div>
                  ) : networkStatus !== 'connected' ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4">Please switch to the Alfajores Testnet</p>
                      <Button 
                        onClick={switchToAlfajores}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        Switch to Alfajores
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        {/* Bet Creation Form */}
                        <div className="bg-white rounded-lg">
                          <div className="space-y-5">
                            <div>
                              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                                Question / Condition
                              </label>
                              <Input
                                id="question"
                                placeholder="E.g., Will BTC reach $100k in 2024?"
                                value={createBetData.question}
                                onChange={(e) => setCreateBetData({...createBetData, question: e.target.value})}
                                fullWidth
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                The question should be clear and have a verifiable yes/no outcome.
                              </p>
                            </div>
                            
                            <div>
                              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                End Date & Time
                              </label>
                              <Input
                                id="endDate"
                                type="datetime-local"
                                value={createBetData.endDate}
                                onChange={(e) => {
                                  const selectedDate = new Date(e.target.value);
                                  if (!isValidEndDate(e.target.value)) {
                                    setCreateBetData({
                                      ...createBetData,
                                      endDate: getFutureDate(5)
                                    });
                                  } else {
                                    setCreateBetData({
                                      ...createBetData,
                                      endDate: e.target.value
                                    });
                                  }
                                }}
                                min={getFutureDate(5)}
                                fullWidth
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Current time: {new Date().toLocaleTimeString()} - End time must be at least 5 minutes from now
                              </p>
                            </div>
                            
                            <div>
                              <label htmlFor="stake" className="block text-sm font-medium text-gray-700 mb-1">
                                Your Stake (MOCK)
                              </label>
                              <Input
                                id="stake"
                                type="number"
                                min="0.1"
                                step="0.1"
                                placeholder="0.1"
                                value={createBetData.stake}
                                onChange={(e) => setCreateBetData({...createBetData, stake: e.target.value})}
                                fullWidth
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Amount of MOCK tokens to stake. Minimum 0.1 MOCK.
                              </p>
                            </div>
                            
                            <div>
                              <span className="block text-sm font-medium text-gray-700 mb-2">
                                Your Prediction
                              </span>
                              <div className="grid grid-cols-2 gap-4">
                                <Button
                                  variant={createBetData.prediction === true ? 'primary' : 'ghost'} 
                                  onClick={() => setCreateBetData({...createBetData, prediction: true})}
                                  className={createBetData.prediction === true ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                                >
                                  Yes
                                </Button>
                                <Button 
                                  variant={createBetData.prediction === false ? 'primary' : 'ghost'}
                                  onClick={() => setCreateBetData({...createBetData, prediction: false})}
                                  className={createBetData.prediction === false ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                                >
                                  No
                                </Button>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Select which outcome you believe will happen.
                              </p>
                            </div>
                            
                            <div className="pt-4">
                              <Button 
                                onClick={() => handleCreateBet(process.env.NEXT_PUBLIC_NO_LOSS_BET_MULTI_ADDRESS || "")}
                                disabled={createBetStatus === 'approving' || createBetStatus === 'creating' || !createBetData.question || !createBetData.endDate || !createBetData.stake}
                                fullWidth
                                className={`${createBetStatus === 'approving' || createBetStatus === 'creating' ? 'opacity-70 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                              >
                                {createBetStatus === 'idle' ? 'Create Bet' : 
                                 createBetStatus === 'approving' ? 'Approving Token Transfer...' :
                                 createBetStatus === 'creating' ? 'Creating Bet...' :
                                 'Create Bet'}
                              </Button>
                            </div>
                            
                            {createBetStatus === 'error' && (
                              <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
                                <h3 className="font-medium mb-1">Error Creating Bet</h3>
                                <p className="text-sm">{createBetError || "An error occurred while creating the bet."}</p>
                              </div>
                            )}
                            
                            {createBetStatus === 'success' && (
                              <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
                                <h3 className="font-medium mb-1">Bet Created Successfully!</h3>
                                <p className="text-sm mb-3">Your bet has been created and is now open for participants.</p>
                                {createBetTxHash && (
                                  <div className="mt-2">
                                    <p className="text-xs mb-1">Transaction Hash:</p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-mono truncate">{createBetTxHash}</span>
                                      <a 
                                        href={`${ALFAJORES_CONFIG.blockExplorerUrls[0]}/tx/${createBetTxHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs underline"
                                      >
                                        View on Explorer
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Info Section */}
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-medium mb-3">How Bets Work</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                  <span className="text-blue-600 font-bold">•</span>
                                  <span>Create a question with a clear Yes/No outcome</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-blue-600 font-bold">•</span>
                                  <span>Set an end date for when the bet closes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-blue-600 font-bold">•</span>
                                  <span>Place your stake and choose your prediction</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-blue-600 font-bold">•</span>
                                  <span>After the end date, a resolution phase begins</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-blue-600 font-bold">•</span>
                                  <span>Everyone gets their initial stake back</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium mb-3">No-Loss System</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm mb-3">
                                In this betting system, you never lose your initial stake. Here's how it works:
                              </p>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>All stakes are preserved and returned after the bet</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>Only the yield is distributed as rewards</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>80% of yield goes to the winning side</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>20% of yield goes to the losing side</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}
          
          {/* Join Bet Section */}
          {(activeTestSection === 'joinBet' || activeTestSection === 'allFlows') && (
            <section className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h2 className="text-2xl font-semibold">3. Join Bet</h2>
                <p className="text-gray-600 mt-1">Join an existing bet on the NoLossBetMulti contract</p>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  {!address ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4">Connect your wallet to join a bet</p>
                      <Button onClick={() => setWalletModalOpen(true)}>
                        Connect Wallet
                      </Button>
                    </div>
                  ) : networkStatus !== 'connected' ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4">Please switch to the Alfajores Testnet</p>
                      <Button 
                        onClick={switchToAlfajores}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        Switch to Alfajores
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Bet Listing Section */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Active Bets</h3>
                          <Button 
                            size="sm" 
                            onClick={loadActiveBets}
                            variant="ghost"
                            className="text-blue-600"
                            disabled={isLoadingBets}
                          >
                            <LoadingSpinner />
                            {isLoadingBets ? 'Loading...' : 'Refresh'}
                          </Button>
                        </div>
                        
                        {isLoadingBets && (
                          <div className="text-center py-10">
                            <LoadingSpinner />
                            <p className="mt-2 text-gray-600">Loading active bets...</p>
                          </div>
                        )}
                        
                        {loadBetsError && (
                          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                            <p className="font-medium">Error loading bets</p>
                            <p className="text-sm">{loadBetsError}</p>
                          </div>
                        )}
                        
                        {!isLoadingBets && !loadBetsError && (
                          <div className="space-y-4">
                            {/* Active Bets List */}
                            {bets.map((bet) => {
                              const betStatus = getBetDisplayStatus(bet);
                              return (
                                <div 
                                  key={bet.id}
                                  className={`border rounded-lg overflow-hidden ${
                                    selectedBet === bet.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
                                  }`}
                                >
                                  <div 
                                    className={`p-4 cursor-pointer ${selectedBet === bet.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                    onClick={() => {
                                      setSelectedBet(selectedBet === bet.id ? null : bet.id);
                                      if (selectedBet !== bet.id) {
                                        setPrediction(null);
                                      }
                                    }}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-md">
                                            Bet #{bet.id}
                                          </span>
                                          <Badge 
                                            className={
                                              betStatus === 'resolved' ? 'bg-purple-100 text-purple-800' : 
                                              betStatus === 'simulatedResolved' ? 'bg-yellow-100 text-yellow-800' : 
                                              'bg-green-100 text-green-800'
                                            }
                                          >
                                            {betStatus === 'resolved' ? 'Resolved' : 
                                             betStatus === 'simulatedResolved' ? 'Simulated Resolved' : 
                                             'Active'}
                                          </Badge>
                                          {betStatus === 'simulatedResolved' && (
                                            <span className="text-xs text-yellow-600 italic">
                                              (Time Travel Simulation)
                                            </span>
                                          )}
                                        </div>
                                        <h4 className="font-medium text-gray-800">{bet.condition}</h4>
                                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                          <div className="flex items-center gap-1 text-gray-600">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {(() => {
                                              const timeInfo = formatDate(bet.expirationDate, bet.createdAt);
                                              return (
                                                <div className="flex flex-col">
                                                  <span>Ends: {timeInfo.formatted}</span>
                                                  {timeInfo.remaining && (
                                                    <div className="mt-1">
                                                      {timeInfo.isExpired ? (
                                                        <span className="text-xs font-medium text-red-600">Expired</span>
                                                      ) : (
                                                        <div>
                                                          <span className="text-xs font-medium text-blue-700">{timeInfo.remaining} remaining</span>
                                                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                                            <div 
                                                              className="bg-blue-600 h-1 rounded-full" 
                                                              style={{ width: `${timeInfo.percentageRemaining}%` }}
                                                            ></div>
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })()}
                                          </div>
                                          <div className="flex items-center gap-1 text-gray-600">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span>Total: {typeof bet.totalStake === 'bigint' 
                                              ? parseFloat(ethers.formatEther(bet.totalStake)).toFixed(2) 
                                              : "0.00"} MOCK</span>
                                          </div>
                                          <div className="flex items-center gap-1 text-gray-600">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            <span>Yes: {typeof bet.yesStake === 'bigint' 
                                              ? parseFloat(ethers.formatEther(bet.yesStake)).toFixed(2) 
                                              : "0.00"} MOCK</span>
                                          </div>
                                          <div className="flex items-center gap-1 text-gray-600">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>No: {typeof bet.noStake === 'bigint' 
                                              ? parseFloat(ethers.formatEther(bet.noStake)).toFixed(2) 
                                              : "0.00"} MOCK</span>
                                          </div>
                                        </div>
                                        <div className="mt-2 flex items-center gap-1 text-gray-600 text-sm">
                                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <span>Creator: {formatAddress(bet.creator)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Action panel for selected bet */}
                                  {selectedBet === bet.id && (
                                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                                      {betStatus === 'simulatedResolved' || betStatus === 'resolved' ? (
                                        <div className="space-y-4">
                                          <h4 className="font-medium text-gray-800">Resolution Actions</h4>
                                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                                            <p className="text-sm text-yellow-800">
                                              This bet has expired and is ready for resolution. In a real scenario, participants would vote on the outcome.
                                            </p>
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Submit Resolution Outcome:</label>
                                            <div className="flex gap-3">
                                              <Button 
                                                onClick={() => handleSubmitResolution(bet.id, true)}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                disabled={isBusy}
                                              >
                                                {isBusy ? 'Processing...' : 'TRUE'}
                                              </Button>
                                              <Button 
                                                onClick={() => handleSubmitResolution(bet.id, false)}
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                disabled={isBusy}
                                              >
                                                {isBusy ? 'Processing...' : 'FALSE'}
                                              </Button>
                                            </div>
                                          </div>
                                          
                                          <div className="pt-4 border-t border-gray-200">
                                            <Button
                                              onClick={() => handleFinalizeResolution(bet.id)}
                                              disabled={isBusy}
                                            >
                                              {isBusy ? 'Processing...' : 'Finalize Resolution'}
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-4">
                                          <h4 className="font-medium text-gray-800">Join this bet</h4>
                                          <div className="space-y-3">
                                            <div>
                                              <label htmlFor={`betAmount-${bet.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                Your Stake (MOCK)
                                              </label>
                                              <Input
                                                id={`betAmount-${bet.id}`}
                                                type="number"
                                                min="0.1"
                                                step="0.1"
                                                placeholder="0.1"
                                                value={betAmount}
                                                onChange={(e) => setBetAmount(e.target.value)}
                                                fullWidth
                                              />
                                              <p className="text-xs text-gray-500 mt-1">
                                                Minimum stake: 0.1 MOCK tokens
                                              </p>
                                            </div>
                                            <div>
                                              <span className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Prediction
                                              </span>
                                              <div className="grid grid-cols-2 gap-4">
                                                <Button
                                                  variant={prediction === true ? 'primary' : 'ghost'} 
                                                  onClick={() => setPrediction(true)}
                                                  className={prediction === true ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                                                >
                                                  Yes
                                                </Button>
                                                <Button 
                                                  variant={prediction === false ? 'primary' : 'ghost'}
                                                  onClick={() => setPrediction(false)}
                                                  className={prediction === false ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                                                >
                                                  No
                                                </Button>
                                              </div>
                                            </div>
                                            <Button
                                              disabled={!betAmount || prediction === null || isBusy}
                                              onClick={() => handlePlaceBet()}
                                              className="w-full mt-4"
                                            >
                                              Place Bet
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            
                            {bets.length === 0 && !isLoadingBets && (
                              <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No active bets found</p>
                                <Button 
                                  variant="ghost" 
                                  className="mt-4"
                                  onClick={() => setActiveTestSection('createBet')}
                                >
                                  Create a Bet
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Info section */}
                      <div className="border-t border-gray-200 pt-6 mt-6">
                        <h3 className="text-lg font-medium mb-4">How to Join a Bet</h3>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <ol className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start gap-2">
                              <span className="font-bold">1.</span>
                              <span>Click on a bet from the list above to select it.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold">2.</span>
                              <span>Enter your stake amount (minimum 0.1 MOCK tokens).</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold">3.</span>
                              <span>Choose your prediction (Yes or No).</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold">4.</span>
                              <span>Click 'Join Bet' and confirm the transaction in your wallet.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold">5.</span>
                              <span>After the bet ends, you'll either receive your stake back plus a share of the yield (if you win) or just your stake back (if you lose).</span>
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}
          
          {/* Active Bets Section */}
          {(activeTestSection === 'activeBets' || activeTestSection === 'allFlows') && (
            <section className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h2 className="text-2xl font-semibold">4. Active Bets</h2>
                <p className="text-gray-600 mt-1">Display and interact with active bets</p>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  {!address ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4">Connect your wallet to view active bets</p>
                      <Button onClick={() => setWalletModalOpen(true)}>
                        Connect Wallet
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Your Active Bets</h3>
                        <Button 
                          variant="ghost" 
                          className="text-sm"
                          onClick={loadActiveBets}
                          disabled={isLoadingBets}
                        >
                          {isLoadingBets ? (
                            <LoadingSpinner />
                          ) : (
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                          {isLoadingBets ? 'Loading...' : 'Refresh'}
                        </Button>
                      </div>
                      
                      {isLoadingBets ? (
                        <div className="text-center py-10">
                          <LoadingSpinner />
                          <p className="mt-2 text-gray-600">Loading active bets...</p>
                        </div>
                      ) : bets.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                          <p className="text-gray-500">You don't have any active bets</p>
                          <Button 
                            variant="ghost" 
                            className="mt-4"
                            onClick={() => setActiveTestSection('createBet')}
                          >
                            Create a Bet
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {bets.map((bet) => {
                            const timeInfo = formatDate(bet.expirationDate, bet.createdAt);
                            const statusDisplay = getBetStatusDisplay(getBetDisplayStatus(bet));
                            
                            return (
                              <div 
                                key={bet.id}
                                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Bet #{bet.id}</span>
                                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${statusDisplay.color}`}>
                                    {statusDisplay.label}
                                  </span>
                                </div>
                                
                                <h4 className="font-medium text-gray-800 mb-3">{bet.condition}</h4>
                                
                                {/* Time remaining section with visual indicator */}
                                <div className="mb-3">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-500">Ends:</span>
                                    <span className="text-sm font-medium">{timeInfo.formatted}</span>
                                  </div>
                                  
                                  {timeInfo.remaining && (
                                    <div className="mt-1">
                                      {timeInfo.isExpired ? (
                                        <div className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded text-center">
                                          Expired
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-blue-700">Time remaining:</span>
                                            <span className="text-xs font-bold">{timeInfo.remaining}</span>
                                          </div>
                                          <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                              className="bg-blue-600 h-2 rounded-full" 
                                              style={{ width: `${timeInfo.percentageRemaining}%` }}
                                            ></div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500">Total:</div>
                                    <div className="font-medium">
                                      {typeof bet.totalStake === 'bigint' 
                                        ? parseFloat(ethers.formatEther(bet.totalStake)).toFixed(2) 
                                        : "0.00"} MOCK
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500">Creator:</div>
                                    <div className="font-medium">{formatAddress(bet.creator)}</div>
                                  </div>
                                  <div className="bg-green-50 p-2 rounded">
                                    <div className="text-xs text-green-700">Yes:</div>
                                    <div className="font-medium">
                                      {typeof bet.yesStake === 'bigint' 
                                        ? parseFloat(ethers.formatEther(bet.yesStake)).toFixed(2) 
                                        : "0.00"} MOCK
                                    </div>
                                  </div>
                                  <div className="bg-red-50 p-2 rounded">
                                    <div className="text-xs text-red-700">No:</div>
                                    <div className="font-medium">
                                      {typeof bet.noStake === 'bigint' 
                                        ? parseFloat(ethers.formatEther(bet.noStake)).toFixed(2) 
                                        : "0.00"} MOCK
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Timestamp and Explorer Link Debug Section */}
                                <div className="bg-gray-50 p-2 rounded mb-3 text-xs text-gray-600">
                                  <div className="font-bold mb-1">Debug Information:</div>
                                  <div className="grid grid-cols-1 gap-1">
                                    <div>Raw Timestamp: {bet.rawTimestamp}</div>
                                    <div>Bet ID on Chain: {bet.betIdOnChain}</div>
                                    {timeInfo.calculatedDays !== undefined && (
                                      <div className="text-xs">
                                        <span className="font-medium">Time Breakdown: </span>
                                        {timeInfo.calculatedDays > 0 && `${timeInfo.calculatedDays}d `}
                                        {timeInfo.calculatedHours}h {timeInfo.calculatedMinutes}m {timeInfo.calculatedSeconds}s
                                        <br />
                                        <span className="font-medium">Total Ms: </span>
                                        {timeInfo.totalMilliseconds?.toLocaleString()}
                                      </div>
                                    )}
                                    <div>
                                      <a 
                                        href={bet.explorerLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center"
                                      >
                                        View Contract on Explorer
                                        <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      </a>
                                    </div>
                                  </div>
                                </div>
                                
                                <Button 
                                  variant="primary" 
                                  fullWidth
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => {
                                    setSelectedBet(bet.id);
                                    setActiveTestSection('joinBet');
                                  }}
                                  disabled={isBetExpired(new Date(bet.expirationDate))}
                                >
                                  {isBetExpired(new Date(bet.expirationDate)) ? 'Bet Expired' : 'Place Bet'}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}
          
          {/* Resolved Bets Section */}
          {(activeTestSection === 'resolvedBets' || activeTestSection === 'allFlows') && (
            <section className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h2 className="text-2xl font-semibold">5. Resolved Bets</h2>
                <p className="text-gray-600 mt-1">View and claim resolved bets</p>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  {!address ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4">Connect your wallet to view resolved bets</p>
                      <Button onClick={() => setWalletModalOpen(true)}>
                        Connect Wallet
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Your Resolved Bets</h3>
                      
                      {bets.filter(bet => bet.status === 'resolved').length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                          <p className="text-gray-500">You don't have any resolved bets</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bets.filter(bet => bet.status === 'resolved').map((bet) => (
                            <div 
                              key={bet.id}
                              className="p-4 border border-gray-200 rounded-lg"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-800">{bet.question}</h4>
                                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                                    <span>Ended: {new Date(bet.expiration).toLocaleDateString()}</span>
                                    <span>Total: {(parseFloat(bet.totalStakeTrue) + parseFloat(bet.totalStakeFalse)).toFixed(2)} MOCK</span>
                                  </div>
                                </div>
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                  Claim available
                                </span>
                              </div>
                              
                              <div className="mt-4 flex gap-2">
                                <Button size="sm">
                                  Claim Rewards
                                </Button>
                                <Button size="sm" variant="ghost">
                                  Details
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </Container>
      
      {/* Global Components */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        address={address}
        balance={balance}
        onConnect={connect}
        onDisconnect={disconnect}
      />
    </div>
  );
} 