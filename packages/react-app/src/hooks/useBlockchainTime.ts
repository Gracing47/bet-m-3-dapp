import { useCallback } from 'react';
import { ethers } from 'ethers';
import useTimestamp from './useTimestamp';

type ContractABI = any[];

/**
 * Hook for blockchain time verification and bet expiration checks
 */
export const useBlockchainTime = (contractAddress: string, contractABI: ContractABI) => {
  const { extractTimestamp } = useTimestamp();

  /**
   * Verifies if a bet is expired according to the blockchain
   * Uses multiple methods to ensure accurate results
   * 
   * @param betId The ID of the bet to check
   * @returns Promise resolving to a boolean indicating if the bet is expired
   */
  const verifyBetExpiration = useCallback(async (betId: string): Promise<boolean> => {
    if (!window.ethereum) {
      console.error("Ethereum provider not available");
      return false;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Create a read-only contract instance
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );
      
      // Convert betId to on-chain ID (0-indexed)
      const onChainBetId = parseInt(betId) - 1;
      
      if (isNaN(onChainBetId) || onChainBetId < 0) {
        console.error(`Invalid bet ID: ${betId}`);
        return false;
      }
      
      try {
        // Get bet details from the blockchain
        const betDetails = await contract.getBetDetails(onChainBetId);
        
        // The contract returns expiration timestamp at index 2
        const rawExpirationTimestamp = betDetails[2];
        
        if (!rawExpirationTimestamp) {
          console.error("No expiration timestamp returned from contract");
          return false;
        }
        
        // Extract the actual expiration timestamp
        const expirationTimestamp = extractTimestamp(rawExpirationTimestamp);
        
        // Compare with current blockchain timestamp
        const currentBlock = await provider.getBlock('latest');
        if (!currentBlock || !currentBlock.timestamp) {
          console.error("Could not get latest block timestamp");
          return false;
        }
        
        const blockTimestamp = Number(currentBlock.timestamp);
        
        // Log detailed information for debugging
        console.log(`Blockchain time verification for Bet #${betId}:`, {
          rawExpirationTime: rawExpirationTimestamp.toString(),
          extractedExpirationTime: expirationTimestamp,
          currentBlockTime: blockTimestamp,
          isExpired: expirationTimestamp < blockTimestamp,
          difference: blockTimestamp - expirationTimestamp,
          humanReadableExpiration: new Date(expirationTimestamp * 1000).toLocaleString(),
          humanReadableBlockTime: new Date(blockTimestamp * 1000).toLocaleString(),
          betDetails: {
            creator: betDetails[0],
            condition: betDetails[1],
            expiration: betDetails[2].toString(),
            resolved: betDetails[3],
            totalStakeTrue: ethers.formatEther(betDetails[4]),
            totalStakeFalse: ethers.formatEther(betDetails[5]),
            resolutionFinalized: betDetails[6],
            winningOutcome: betDetails[7]
          }
        });
        
        // DIRECT CONTRACT EXPIRATION CHECK: Try to directly check if the bet is expired
        // by simulating a read-only call to submitResolutionOutcome
        try {
          console.log("Performing direct contract expiration check...");
          
          // Option 1: Try a gas estimation (doesn't perform a transaction)
          // Try to get a boolean from the contract about whether the bet is expired
          const isBetExpiredCheck = await contract.isBetExpired?.(onChainBetId).catch((e: any) => {
            console.log("Contract doesn't have isBetExpired function:", e.message);
            return null;
          });
          
          if (isBetExpiredCheck !== null) {
            console.log("Contract reports bet expiration status:", isBetExpiredCheck);
            return isBetExpiredCheck;
          }
          
          // Option 2: Call isExpired helper if available
          const isExpiredCheck = await contract.isExpired?.(onChainBetId).catch((e: any) => {
            console.log("Contract doesn't have isExpired function:", e.message);
            return null;
          });
          
          if (isExpiredCheck !== null) {
            console.log("Contract reports bet expiration status:", isExpiredCheck);
            return isExpiredCheck;
          }
          
          // Option 3: Use call() to simulate a transaction without sending it
          // This is the most reliable method to check contract validation logic
          const signer = await provider.getSigner();
          const signerContract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          
          try {
            // Simulate a call to check if it would revert
            await signerContract.submitResolutionOutcome.staticCall(onChainBetId, true);
            // If we get here, the call would succeed = bet is expired
            console.log("Simulation successful - bet is expired according to contract");
            return true;
          } catch (error) {
            const errorMessage = String(error);
            if (errorMessage.includes("Bet is not expired yet")) {
              console.log("Simulation confirms bet is NOT expired according to contract");
              return false;
            } else if (errorMessage.includes("already submitted")) {
              // Resolution already submitted, but this means bet is expired
              console.log("Bet is expired but resolution already submitted");
              return true;
            } else {
              // Some other error, log it but default to timestamp comparison
              console.log("Simulation error not related to expiration:", errorMessage);
            }
          }
        } catch (simulationError) {
          console.error("Error in direct contract expiration check:", simulationError);
        }
        
        // Fallback to timestamp comparison if direct check fails
        // Bet is expired if its expiration timestamp is less than current block timestamp
        return expirationTimestamp < blockTimestamp;
      } catch (contractError) {
        console.error(`Error getting bet details for ID ${betId}:`, contractError);
        return false;
      }
    } catch (error) {
      console.error("Error checking on-chain expiration:", error);
      return false;
    }
  }, [contractAddress, contractABI, extractTimestamp]);

  /**
   * Gets the current blockchain timestamp
   * 
   * @returns Promise resolving to the current blockchain timestamp
   */
  const getCurrentBlockTimestamp = useCallback(async (): Promise<number | null> => {
    if (!window.ethereum) {
      console.error("Ethereum provider not available");
      return null;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const currentBlock = await provider.getBlock('latest');
      
      if (!currentBlock || !currentBlock.timestamp) {
        console.error("Could not get latest block timestamp");
        return null;
      }
      
      return Number(currentBlock.timestamp);
    } catch (error) {
      console.error("Error getting current block timestamp:", error);
      return null;
    }
  }, []);

  /**
   * Calculates the time difference between local time and blockchain time
   * 
   * @returns Promise resolving to the time difference in seconds
   */
  const getBlockchainTimeDrift = useCallback(async (): Promise<number | null> => {
    const blockchainTime = await getCurrentBlockTimestamp();
    
    if (blockchainTime === null) {
      return null;
    }
    
    const localTime = Math.floor(Date.now() / 1000);
    const drift = blockchainTime - localTime;
    
    console.log("Blockchain time drift:", {
      blockchainTime,
      localTime,
      driftSeconds: drift,
      driftMinutes: drift / 60,
      driftHours: drift / 3600
    });
    
    return drift;
  }, [getCurrentBlockTimestamp]);

  return {
    verifyBetExpiration,
    getCurrentBlockTimestamp,
    getBlockchainTimeDrift
  };
};

export default useBlockchainTime; 