/**
 * Utility functions for blockchain interactions
 */
import { BrowserProvider, Contract } from 'ethers';
import { Ethereum } from '../types';

/**
 * Check if a wallet is connected
 * @returns true if a wallet is connected
 */
export async function isWalletConnected(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false;
  }
  
  try {
    const provider = new BrowserProvider(window.ethereum as Ethereum);
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
}

/**
 * Request connection to a wallet
 * @returns Address of the connected wallet
 */
export async function connectWallet(): Promise<string | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('No wallet found. Please install MetaMask or another wallet.');
    return null;
  }
  
  try {
    const provider = new BrowserProvider(window.ethereum as Ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
}

/**
 * Create a Contract instance with the proper signer
 * @param address Contract address
 * @param abi Contract ABI
 * @returns Contract instance
 */
export async function getContract(address: string, abi: any[]): Promise<Contract | null> {
  if (typeof window === 'undefined' || !window.ethereum || !address || !abi) {
    return null;
  }
  
  try {
    const provider = new BrowserProvider(window.ethereum as Ethereum);
    const signer = await provider.getSigner();
    return new Contract(address, abi, signer);
  } catch (error) {
    console.error('Error creating contract instance:', error);
    return null;
  }
} 