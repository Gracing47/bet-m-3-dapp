/**
 * Utility functions for formatting data
 */
import { formatUnits } from 'ethers';
import { ADDRESS_DISPLAY_LENGTH } from '../constants/app';

/**
 * Shortens an Ethereum address for display
 * @param address The full address to shorten
 * @param chars Number of characters to show at each end
 * @returns Shortened address like 0x1234...5678
 */
export function shortenAddress(address: string, chars: number = ADDRESS_DISPLAY_LENGTH): string {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Format a bigint value as a human-readable number
 * @param value BigInt value (wei)
 * @param decimals Number of decimals
 * @returns Formatted string
 */
export function formatTokenAmount(value: bigint, decimals: number = 18): string {
  if (!value) return '0';
  
  return formatUnits(value, decimals);
}

/**
 * Format a date from a timestamp
 * @param timestamp Unix timestamp
 * @returns Formatted date string
 */
export function formatDate(timestamp: bigint | number): string {
  if (!timestamp) return '';
  
  // Convert to milliseconds if needed
  const timestampMs = typeof timestamp === 'bigint' 
    ? Number(timestamp) * 1000 
    : timestamp * 1000;
  
  return new Date(timestampMs).toLocaleString();
}

/**
 * Calculate time remaining from now until a future timestamp
 * @param timestamp Unix timestamp in the future
 * @returns Human-readable time remaining, or 'Expired' if in the past
 */
export function timeRemaining(timestamp: bigint | number): string {
  if (!timestamp) return '';
  
  // Convert to milliseconds if needed
  const timestampMs = typeof timestamp === 'bigint'
    ? Number(timestamp) * 1000
    : timestamp * 1000;
  
  const now = Date.now();
  const diff = timestampMs - now;
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${days}d ${hours}h ${minutes}m`;
} 