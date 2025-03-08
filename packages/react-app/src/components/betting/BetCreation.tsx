import React, { useState } from 'react';
import { Card, PrimaryButton, SecondaryButton, Alert } from '../common';

interface BetCreationProps {
  onCreateBet: (amount: string, condition: string, durationDays: number, prediction: boolean) => Promise<any>;
  isLoading: boolean;
}

const BetCreation: React.FC<BetCreationProps> = ({ onCreateBet, isLoading }) => {
  const [condition, setCondition] = useState<string>('');
  const [amount, setAmount] = useState<string>('10');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [prediction, setPrediction] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleCreateBet = async () => {
    if (!condition.trim()) {
      setError("Please provide a bet condition");
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setError(null);
    
    try {
      await onCreateBet(amount, condition, durationDays, prediction);
      setSuccess(true);
      // Reset form
      setCondition('');
      setAmount('10');
      setDurationDays(7);
      setPrediction(true);
      
      // Clear success message after a delay
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error creating bet:", error);
      setError("Failed to create bet. Please try again.");
    }
  };
  
  const durationOptions = [
    { days: 1, label: '1 day' },
    { days: 3, label: '3 days' },
    { days: 7, label: '1 week' },
    { days: 14, label: '2 weeks' },
    { days: 30, label: '1 month' },
    { days: 90, label: '3 months' }
  ];

  return (
    <Card className="p-6">
      {success && (
        <Alert 
          type="success"
          onClose={() => setSuccess(false)}
        >
          Your bet was created successfully!
        </Alert>
      )}
      
      {error && (
        <Alert 
          type="error"
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      <div className="space-y-6 mt-4">
        {/* Bet Condition */}
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
            Bet Condition
          </label>
          <textarea
            id="condition"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Will ETH reach $5000 by the end of the month?"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">
            Describe the condition in a clear and verifiable way
          </p>
        </div>
        
        {/* Stake Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Initial Stake (cUSD)
          </label>
          <input
            id="amount"
            type="number"
            min="0.1"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        
        {/* Duration */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {durationOptions.map((option) => (
              <button
                key={option.days}
                type="button"
                className={`py-2 px-3 text-sm rounded-md focus:outline-none ${
                  durationDays === option.days
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                onClick={() => setDurationDays(option.days)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Your Prediction */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Prediction
          </label>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              type="button"
              className={`flex-1 py-2 px-4 text-center ${
                prediction 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setPrediction(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 text-center ${
                !prediction 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setPrediction(false)}
            >
              No
            </button>
          </div>
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <SecondaryButton
            onClick={() => {
              setCondition('');
              setAmount('10');
              setDurationDays(7);
              setPrediction(true);
            }}
            title="Reset"
            disabled={isLoading}
          />
          <PrimaryButton
            onClick={handleCreateBet}
            title="Create Bet"
            loading={isLoading}
            disabled={isLoading || !condition.trim()}
          />
        </div>
      </div>
    </Card>
  );
};

export default BetCreation; 