import { useCallback } from 'react';

/**
 * Hook for handling timestamp extraction, formatting and validation
 * Extracted from the original test.tsx implementation
 */
export const useTimestamp = () => {
  /**
   * Extracts a valid Unix timestamp from various timestamp formats
   * Handles large compound numbers with embedded timestamps
   * 
   * @param bigTimestamp The timestamp to extract (can be a bigint, number, or string)
   * @returns The extracted Unix timestamp as a number
   */
  const extractTimestamp = useCallback((bigTimestamp: bigint | number | string): number => {
    // Convert to string first for unified handling
    const timestampStr = bigTimestamp.toString();
    
    // Handle cases where we have a simple Unix timestamp
    if (timestampStr.length <= 10) {
      return Number(timestampStr);
    }
    
    // For large numbers with embedded timestamps, try different extraction methods
    
    // Method 1: Extract the last 10 digits (common Unix timestamp length)
    if (timestampStr.length > 10) {
      const lastTenDigits = timestampStr.slice(-10);
      const extractedTimestamp = parseInt(lastTenDigits, 10);
      
      // Validate the extracted timestamp (should be a recent date, not in the distant past or future)
      const now = Math.floor(Date.now() / 1000);
      const fiveYearsInSeconds = 5 * 365 * 24 * 60 * 60;
      
      if (!isNaN(extractedTimestamp) && 
          extractedTimestamp > now - fiveYearsInSeconds && 
          extractedTimestamp < now + fiveYearsInSeconds) {
        console.log("Extracted timestamp (last 10 digits):", {
          original: timestampStr,
          extracted: lastTenDigits,
          asNumber: extractedTimestamp,
          asDate: new Date(extractedTimestamp * 1000).toLocaleString()
        });
        return extractedTimestamp;
      }
    }
    
    // Method 2: Try to find a valid timestamp embedded in the middle
    // This looks for any 10-digit sequence that could be a valid timestamp
    if (timestampStr.length >= 10) {
      for (let i = 0; i <= timestampStr.length - 10; i++) {
        const potentialTimestamp = parseInt(timestampStr.substring(i, i + 10), 10);
        const now = Math.floor(Date.now() / 1000);
        const fiveYearsInSeconds = 5 * 365 * 24 * 60 * 60;
        
        if (!isNaN(potentialTimestamp) && 
            potentialTimestamp > now - fiveYearsInSeconds && 
            potentialTimestamp < now + fiveYearsInSeconds) {
          console.log(`Found embedded timestamp at position ${i}:`, {
            original: timestampStr,
            extracted: timestampStr.substring(i, i + 10),
            asNumber: potentialTimestamp,
            asDate: new Date(potentialTimestamp * 1000).toLocaleString()
          });
          return potentialTimestamp;
        }
      }
    }
    
    // Method 3: Assume the timestamp is in milliseconds instead of seconds
    const asMilliseconds = Number(bigTimestamp);
    if (!isNaN(asMilliseconds)) {
      const asSeconds = Math.floor(asMilliseconds / 1000);
      const now = Math.floor(Date.now() / 1000);
      const fiveYearsInSeconds = 5 * 365 * 24 * 60 * 60;
      
      if (asSeconds > now - fiveYearsInSeconds && asSeconds < now + fiveYearsInSeconds) {
        console.log("Interpreted as milliseconds:", {
          original: timestampStr,
          asSeconds: asSeconds,
          asDate: new Date(asSeconds * 1000).toLocaleString()
        });
        return asSeconds;
      }
    }
    
    // If all else fails, return the current timestamp and log a warning
    console.warn("Could not extract a valid timestamp from:", timestampStr);
    return Math.floor(Date.now() / 1000);
  }, []);

  /**
   * Calculates the time remaining or time elapsed from a timestamp
   * Formats it into a human-readable format
   * 
   * @param timestamp Unix timestamp to calculate from
   * @param referenceTime Optional reference time (default: now)
   * @returns Object with formatted remaining time and related info
   */
  const formatTimeRemaining = useCallback((timestamp: number, referenceTime?: Date) => {
    try {
      const targetDate = new Date(timestamp * 1000);
      const now = referenceTime || new Date();
      
      const timeDiff = targetDate.getTime() - now.getTime();
      const isExpired = timeDiff <= 0;
      
      if (isExpired) {
        // Format time elapsed since expiration
        const elapsedMs = Math.abs(timeDiff);
        const elapsedSec = Math.floor(elapsedMs / 1000);
        const elapsedMin = Math.floor(elapsedSec / 60);
        const elapsedHours = Math.floor(elapsedMin / 60);
        const elapsedDays = Math.floor(elapsedHours / 24);
        
        let elapsed;
        if (elapsedDays > 0) {
          elapsed = `${elapsedDays}d ago`;
        } else if (elapsedHours > 0) {
          elapsed = `${elapsedHours}h ago`;
        } else if (elapsedMin > 0) {
          elapsed = `${elapsedMin}m ago`;
        } else {
          elapsed = `just now`;
        }
        
        return { 
          formatted: formatTimestamp(timestamp),
          remaining: elapsed, 
          isExpired: true,
          percentageRemaining: 0,
          rawTimestamp: timestamp,
          dateObject: targetDate
        };
      } else {
        // Format remaining time until expiration
        const remainingMs = Math.abs(timeDiff);
        const remainingSec = Math.floor(remainingMs / 1000);
        const remainingMin = Math.floor(remainingSec / 60);
        const remainingHours = Math.floor(remainingMin / 60);
        const remainingDays = Math.floor(remainingHours / 24);
        
        let remaining;
        if (remainingDays > 0) {
          remaining = `${remainingDays}d`;
        } else if (remainingHours > 0) {
          remaining = `${remainingHours}h ${remainingMin % 60}m`;
        } else if (remainingMin > 0) {
          remaining = `${remainingMin}m`;
        } else {
          remaining = `${remainingSec}s`;
        }
        
        return { 
          formatted: formatTimestamp(timestamp),
          remaining, 
          isExpired: false,
          percentageRemaining: 100, // Calculate percentage if needed
          rawTimestamp: timestamp,
          dateObject: targetDate
        };
      }
    } catch (e) {
      console.error("Error formatting time remaining:", e);
      return { 
        formatted: "Unknown", 
        remaining: null,
        rawTimestamp: timestamp
      };
    }
  }, []);

  /**
   * Formats a Unix timestamp into a human-readable date string
   * 
   * @param timestamp Unix timestamp to format
   * @returns Formatted date string
   */
  const formatTimestamp = useCallback((timestamp: number): string => {
    try {
      const date = new Date(timestamp * 1000);
      
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      console.error("Error formatting timestamp:", e);
      return "Invalid Date";
    }
  }, []);

  /**
   * Creates a Future date by adding minutes to the current time
   * 
   * @param minutesToAdd Minutes to add to current time
   * @returns ISO string of the future date
   */
  const getFutureDate = useCallback((minutesToAdd: number): string => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutesToAdd);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.toISOString();
  }, []);

  /**
   * Checks if a date is at least minimum minutes from now
   * 
   * @param dateStr Date string to validate
   * @param minimumMinutes Minimum minutes in the future (default: 5)
   * @returns Boolean indicating if date is valid
   */
  const isValidFutureDate = useCallback((dateStr: string, minimumMinutes: number = 5): boolean => {
    const inputDate = new Date(dateStr);
    const now = new Date();
    const minFutureDate = new Date(now.getTime() + (minimumMinutes * 60 * 1000));
    return inputDate >= minFutureDate;
  }, []);

  return {
    extractTimestamp,
    formatTimeRemaining,
    formatTimestamp,
    getFutureDate,
    isValidFutureDate
  };
};

export default useTimestamp; 