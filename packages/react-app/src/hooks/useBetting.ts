import { BrowserProvider, Contract, ethers } from "ethers";
import { useState, useEffect, useCallback } from "react";
import BettingManagerFactoryABI from "@/assets/abis/BettingManagerFactory.json";
import NoLossBetMultiABI from "@/assets/abis/NoLossBetMulti.json";
import MockTokenABI from "@/assets/abis/MockToken.json";
import { Bet } from "@/types/betting";

export const useBetting = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [factoryContract, setFactoryContract] = useState<Contract | null>(null);
  const [bettingContracts, setBettingContracts] = useState<string[]>([]);
  const [currentBettingContract, setCurrentBettingContract] = useState<Contract | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const bettingFactoryAddress = process.env.NEXT_PUBLIC_BETTING_FACTORY_ADDRESS || "";
  const mockTokenAddress = process.env.NEXT_PUBLIC_MOCK_TOKEN_ADDRESS || "";
  
  const connectWallet = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        setIsLoading(true);
        const provider = new BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        setProvider(provider);
        
        const signer = await provider.getSigner();
        setSigner(signer);
        
        const addressFromWallet = await signer.getAddress();
        setAddress(addressFromWallet);
        
        // Initialize factory contract
        const factory = new Contract(
          bettingFactoryAddress,
          BettingManagerFactoryABI.abi,
          signer
        );
        setFactoryContract(factory);
        
        return true;
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    }
    return false;
  }, [bettingFactoryAddress]);
  
  const getBettingContracts = useCallback(async () => {
    if (!factoryContract) return [];
    
    try {
      setIsLoading(true);
      const count = await factoryContract.getBettingContractsCount();
      const contracts = [];
      
      for (let i = 0; i < count; i++) {
        const contractAddress = await factoryContract.getBettingContract(i);
        contracts.push(contractAddress);
      }
      
      setBettingContracts(contracts);
      return contracts;
    } catch (error) {
      console.error("Failed to get betting contracts:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [factoryContract]);
  
  const createBettingContract = useCallback(async () => {
    if (!factoryContract || !signer) return null;
    
    try {
      setIsLoading(true);
      const tx = await factoryContract.createBettingContract(mockTokenAddress);
      const receipt = await tx.wait();
      
      // Refresh contracts list
      await getBettingContracts();
      
      return receipt;
    } catch (error) {
      console.error("Failed to create betting contract:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [factoryContract, getBettingContracts, mockTokenAddress, signer]);
  
  const selectBettingContract = useCallback(async (contractAddress: string) => {
    if (!signer) return false;
    
    try {
      setIsLoading(true);
      const contract = new Contract(
        contractAddress,
        NoLossBetMultiABI.abi,
        signer
      );
      setCurrentBettingContract(contract);
      return true;
    } catch (error) {
      console.error("Failed to select betting contract:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [signer]);
  
  const getBets = useCallback(async () => {
    if (!currentBettingContract) return [];
    
    try {
      setIsLoading(true);
      const betsCount = await currentBettingContract.getBetsCount();
      const bets: Bet[] = [];
      
      for (let i = 0; i < betsCount; i++) {
        const bet = await currentBettingContract.getBetDetails(i);
        bets.push({
          id: i,
          creator: bet.creator,
          condition: bet.condition,
          totalStakeTrue: bet.totalStakeTrue,
          totalStakeFalse: bet.totalStakeFalse,
          creationTime: bet.creationTime,
          expirationTime: bet.expirationTime,
          resolved: bet.resolved,
          winningOutcome: bet.winningOutcome,
          resolutionFinalized: bet.resolutionFinalized,
        });
      }
      
      setBets(bets);
      return bets;
    } catch (error) {
      console.error("Failed to get bets:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [currentBettingContract]);
  
  const createBet = useCallback(async (
    amount: string,
    condition: string,
    durationDays: number,
    prediction: boolean
  ) => {
    if (!currentBettingContract || !signer) return null;
    
    try {
      setIsLoading(true);
      const amountWei = ethers.parseUnits(amount, 18);
      
      // First approve token spending
      const mockToken = new Contract(mockTokenAddress, MockTokenABI.abi, signer);
      const approveTx = await mockToken.approve(await currentBettingContract.getAddress(), amountWei);
      await approveTx.wait();
      
      // Then create bet
      const tx = await currentBettingContract.createBet(
        amountWei,
        condition,
        durationDays,
        prediction
      );
      const receipt = await tx.wait();
      
      // Refresh bets list
      await getBets();
      
      return receipt;
    } catch (error) {
      console.error("Failed to create bet:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentBettingContract, getBets, mockTokenAddress, signer]);
  
  const joinBet = useCallback(async (
    betId: number,
    amount: string,
    prediction: boolean
  ) => {
    if (!currentBettingContract || !signer) return null;
    
    try {
      setIsLoading(true);
      const amountWei = ethers.parseUnits(amount, 18);
      
      // First approve token spending
      const mockToken = new Contract(mockTokenAddress, MockTokenABI.abi, signer);
      const approveTx = await mockToken.approve(await currentBettingContract.getAddress(), amountWei);
      await approveTx.wait();
      
      // Then join bet
      const tx = await currentBettingContract.joinBet(
        betId,
        amountWei,
        prediction
      );
      const receipt = await tx.wait();
      
      // Refresh bets list
      await getBets();
      
      return receipt;
    } catch (error) {
      console.error("Failed to join bet:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentBettingContract, getBets, mockTokenAddress, signer]);
  
  const submitResolution = useCallback(async (
    betId: number,
    outcome: boolean
  ) => {
    if (!currentBettingContract) return null;
    
    try {
      setIsLoading(true);
      const tx = await currentBettingContract.submitResolutionOutcome(
        betId,
        outcome
      );
      const receipt = await tx.wait();
      
      // Refresh bets list
      await getBets();
      
      return receipt;
    } catch (error) {
      console.error("Failed to submit resolution:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentBettingContract, getBets]);
  
  const finalizeResolution = useCallback(async (betId: number) => {
    if (!currentBettingContract) return null;
    
    try {
      setIsLoading(true);
      const tx = await currentBettingContract.finalizeResolution(betId);
      const receipt = await tx.wait();
      
      // Refresh bets list
      await getBets();
      
      return receipt;
    } catch (error) {
      console.error("Failed to finalize resolution:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentBettingContract, getBets]);
  
  const adminFinalizeResolution = useCallback(async (
    betId: number,
    outcome: boolean,
    cancel: boolean
  ) => {
    if (!currentBettingContract) return null;
    
    try {
      setIsLoading(true);
      const tx = await currentBettingContract.adminFinalizeResolution(
        betId,
        outcome,
        cancel
      );
      const receipt = await tx.wait();
      
      // Refresh bets list
      await getBets();
      
      return receipt;
    } catch (error) {
      console.error("Failed to admin finalize resolution:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentBettingContract, getBets]);
  
  return {
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
  };
}; 