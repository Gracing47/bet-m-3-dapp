import React, { useState } from 'react';
import { Card, Select, PrimaryButton, Alert } from '../common';

interface ResolutionPanelProps {
  betId: string;
  options: string[];
  onResolve: (option: string) => Promise<void>;
  isCreator: boolean;
  isResolved: boolean;
  winningOption?: string;
  className?: string;
}

export function ResolutionPanel({
  betId,
  options,
  onResolve,
  isCreator,
  isResolved,
  winningOption,
  className = '',
}: ResolutionPanelProps) {
  const [selectedOption, setSelectedOption] = useState<string>(winningOption || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    setError(null);
  };

  const handleResolve = async () => {
    if (!selectedOption) {
      setError('Please select an outcome');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      await onResolve(selectedOption);
      
      setSuccess('Bet has been successfully resolved!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve bet');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCreator && !isResolved) {
    return null;
  }

  return (
    <Card 
      className={`${className}`}
      title="Bet Resolution"
    >
      {error && (
        <Alert 
          type="error" 
          className="mb-4"
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          type="success" 
          className="mb-4"
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {isResolved ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-1">Bet Resolved</h4>
            <p className="text-sm text-green-700">
              This bet has been resolved with the outcome: <span className="font-medium">{winningOption}</span>
            </p>
          </div>
          
          {!isCreator && (
            <div className="mt-4">
              <PrimaryButton
                onClick={() => {/* Claim winnings logic */}}
                widthFull
              >
                Claim Winnings
              </PrimaryButton>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            As the creator of this bet, you can resolve it by selecting the winning outcome.
          </p>
          
          <Select
            label="Select Winning Outcome"
            options={options.map(option => ({ value: option, label: option }))}
            value={selectedOption}
            onChange={handleOptionChange}
            fullWidth
          />
          
          <PrimaryButton
            onClick={handleResolve}
            loading={isSubmitting}
            disabled={isSubmitting || !selectedOption}
            widthFull
          >
            Resolve Bet
          </PrimaryButton>
        </div>
      )}
    </Card>
  );
}

export default ResolutionPanel; 