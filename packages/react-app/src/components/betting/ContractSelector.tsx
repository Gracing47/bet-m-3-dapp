import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Select, PrimaryButton } from '../common';

interface ContractSelectorProps {
  bettingContracts: string[];
  isLoading: boolean;
  onSelectContract: (contractAddress: string) => Promise<boolean>;
  onCreateContract: () => Promise<void>;
  onGetContracts: () => Promise<string[]>;
}

/**
 * ContractSelector component allows users to select from existing betting contracts
 * or create new ones.
 */
const ContractSelector: React.FC<ContractSelectorProps> = ({
  bettingContracts,
  isLoading,
  onSelectContract,
  onCreateContract,
  onGetContracts,
}) => {
  const [selectedContract, setSelectedContract] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Format address for display (0x1234...5678)
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Convert contract addresses to options for the Select component
  const contractOptions = [
    { value: '', label: 'Select a betting contract' },
    ...bettingContracts.map(address => ({
      value: address,
      label: formatAddress(address),
    })),
  ];

  // Handle contract selection
  const handleSelectContract = async (value: string) => {
    if (!value) return;
    
    setError(null);
    setSelectedContract(value);
    
    try {
      const success = await onSelectContract(value);
      if (!success) {
        setError('Failed to load contract data');
      }
    } catch (err) {
      setError('Error selecting contract: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Handle contract creation
  const handleCreateContract = async () => {
    setError(null);
    try {
      await onCreateContract();
      // Refresh the contract list after creating a new one
      refreshContracts();
    } catch (err) {
      setError('Error creating contract: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Refresh the list of contracts
  const refreshContracts = async () => {
    setRefreshing(true);
    try {
      await onGetContracts();
    } catch (err) {
      setError('Error refreshing contracts: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh contracts on initial load
  useEffect(() => {
    refreshContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Betting Contract</h2>
      
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="w-full md:w-2/3">
          <Select
            label="Select a betting contract"
            options={contractOptions}
            onChange={handleSelectContract}
            value={selectedContract}
            disabled={isLoading || refreshing}
            error={error || undefined}
            fullWidth
          />
        </div>
        
        <div className="w-full md:w-1/3">
          <PrimaryButton
            onClick={handleCreateContract}
            disabled={isLoading || refreshing}
            loading={isLoading}
            widthFull
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Contract
          </PrimaryButton>
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
      
      {bettingContracts.length === 0 && !isLoading && !refreshing && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md text-gray-600 text-sm">
          No betting contracts found. Create your first contract to get started.
        </div>
      )}
    </div>
  );
};

export default ContractSelector;
