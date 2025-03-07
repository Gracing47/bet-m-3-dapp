import React, { useState, useEffect } from 'react';
import { Input, PrimaryButton } from '../common';

interface StakeInputProps {
  onStake: (amount: string) => void;
  maxAmount?: string;
  minAmount?: string;
  defaultAmount?: string;
  symbol?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function StakeInput({
  onStake,
  maxAmount = '0',
  minAmount = '0',
  defaultAmount = '',
  symbol = 'ETH',
  isLoading = false,
  disabled = false,
  className = '',
}: StakeInputProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [error, setError] = useState<string | null>(null);

  // Validate amount when it changes
  useEffect(() => {
    validateAmount(amount);
  }, [amount, maxAmount, minAmount]);

  const validateAmount = (value: string) => {
    setError(null);
    
    if (!value || value === '') {
      setError('Amount is required');
      return false;
    }
    
    // Check if it's a valid number
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setError('Invalid amount');
      return false;
    }
    
    // Check min amount
    const numMinAmount = parseFloat(minAmount);
    if (numValue < numMinAmount) {
      setError(`Minimum amount is ${minAmount} ${symbol}`);
      return false;
    }
    
    // Check max amount
    const numMaxAmount = parseFloat(maxAmount);
    if (numValue > numMaxAmount) {
      setError(`Maximum amount is ${maxAmount} ${symbol}`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (validateAmount(amount)) {
      onStake(amount);
    }
  };

  const handleSetMax = () => {
    setAmount(maxAmount);
  };

  return (
    <div className={`${className}`}>
      <div className="mb-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Stake Amount
          </label>
          <span className="text-xs text-gray-500">
            Balance: {maxAmount} {symbol}
          </span>
        </div>
        
        <div className="mt-1 relative rounded-md shadow-sm">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            error={error || undefined}
            disabled={disabled || isLoading}
            className="pr-16"
            fullWidth
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              type="button"
              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-primary hover:bg-primary hover:bg-opacity-10 focus:outline-none mr-8"
              onClick={handleSetMax}
              disabled={disabled || isLoading}
            >
              MAX
            </button>
            <span className="text-gray-500 pr-3">{symbol}</span>
          </div>
        </div>
      </div>
      
      <PrimaryButton
        onClick={handleSubmit}
        disabled={!!error || disabled || isLoading}
        loading={isLoading}
        widthFull
      >
        Place Stake
      </PrimaryButton>
    </div>
  );
}

export default StakeInput; 