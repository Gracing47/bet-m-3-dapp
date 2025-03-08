import React, { useState, useEffect } from 'react';
import { Card, PrimaryButton, SecondaryButton, Alert, Badge, Tooltip, LoadingSpinner, Input } from '@/components/common';

interface BetCreationProps {
  onCreateBet: (amount: string, condition: string, durationDays: number, prediction: boolean) => Promise<any>;
  isLoading: boolean;
  minStake?: string;
  maxStake?: string;
}

type FormStep = 'details' | 'confirmation' | 'success';

const BetCreation: React.FC<BetCreationProps> = ({ 
  onCreateBet, 
  isLoading,
  minStake = '1',
  maxStake = '100'
}) => {
  // Form state
  const [condition, setCondition] = useState<string>('');
  const [amount, setAmount] = useState<string>('10');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [prediction, setPrediction] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<FormStep>('details');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [characterCount, setCharacterCount] = useState<number>(0);

  // Track character count
  useEffect(() => {
    setCharacterCount(condition.length);
  }, [condition]);

  // Validate form on input changes
  useEffect(() => {
    validateForm();
  }, [condition, amount, durationDays]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Condition validation
    if (condition.trim().length === 0) {
      errors.condition = "Bet condition is required";
    } else if (condition.trim().length < 10) {
      errors.condition = "Condition must be at least 10 characters";
    } else if (condition.trim().length > 150) {
      errors.condition = "Condition must be less than 150 characters";
    } else if (!condition.includes('?')) {
      errors.condition = "Condition should be formed as a question";
    }
    
    // Amount validation
    const amountNum = parseFloat(amount);
    const minStakeNum = parseFloat(minStake);
    const maxStakeNum = parseFloat(maxStake);
    
    if (isNaN(amountNum)) {
      errors.amount = "Please enter a valid number";
    } else if (amountNum < minStakeNum) {
      errors.amount = `Minimum stake is ${minStake}`;
    } else if (amountNum > maxStakeNum) {
      errors.amount = `Maximum stake is ${maxStake}`;
    }
    
    setValidationErrors(errors);
  };

  const isFormValid = Object.keys(validationErrors).length === 0 && condition.trim().length > 0;

  const handleCreateBet = async () => {
    if (!isFormValid) {
      setError("Please fix all validation errors before submitting");
      return;
    }

    setError(null);
    
    if (currentStep === 'details') {
      setCurrentStep('confirmation');
      return;
    }
    
    try {
      await onCreateBet(amount, condition, durationDays, prediction);
      setCurrentStep('success');
      
      // Reset form after 5 seconds
      setTimeout(() => {
        resetForm();
      }, 5000);
    } catch (err) {
      console.error("Error creating bet:", err);
      setError("Failed to create bet. Please try again.");
      setCurrentStep('details');
    }
  };
  
  const resetForm = () => {
    setCondition('');
    setAmount('10');
    setDurationDays(7);
    setPrediction(true);
    setError(null);
    setSuccess(false);
    setCurrentStep('details');
    setValidationErrors({});
  };
  
  const durationOptions = [
    { days: 1, label: '1 day' },
    { days: 3, label: '3 days' },
    { days: 7, label: '1 week' },
    { days: 14, label: '2 weeks' },
    { days: 30, label: '1 month' },
    { days: 90, label: '3 months' }
  ];

  // Format date for display
  const formatEndDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render details form step
  const renderDetailsStep = () => (
    <div className="space-y-6">
      {/* Bet Condition */}
      <div>
        <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
          <span>Bet Condition</span>
          <span className={`text-xs ${characterCount > 150 ? 'text-red-500' : 'text-gray-500'}`}>
            {characterCount}/150
          </span>
        </label>
        <textarea
          id="condition"
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary focus:border-primary ${
            validationErrors.condition ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Will ETH reach $5000 by the end of the month?"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        />
        {validationErrors.condition && (
          <p className="mt-1 text-xs text-red-500">
            {validationErrors.condition}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Describe the condition in a clear and verifiable way. Formulate it as a question.
        </p>
      </div>
      
      {/* Stake Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Initial Stake (MOCK)
        </label>
        <input
          id="amount"
          type="number"
          min={minStake}
          max={maxStake}
          step="0.1"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary focus:border-primary ${
            validationErrors.amount ? 'border-red-500' : 'border-gray-300'
          }`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {validationErrors.amount && (
          <p className="mt-1 text-xs text-red-500">
            {validationErrors.amount}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Minimum: {minStake} MOCK, Maximum: {maxStake} MOCK
        </p>
      </div>
      
      {/* Duration */}
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
          Duration (Ends: {formatEndDate(durationDays)})
        </label>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {durationOptions.map((option) => (
            <button
              key={option.days}
              type="button"
              className={`py-2 px-3 text-sm rounded-md focus:outline-none transition-colors ${
                durationDays === option.days
                  ? 'bg-indigo-600 text-white'
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
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              prediction 
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setPrediction(true)}
          >
            Yes
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              !prediction 
                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white' 
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
          onClick={resetForm}
          className="px-4 py-2"
          disabled={isLoading}
        >
          Reset
        </SecondaryButton>
        <PrimaryButton
          onClick={handleCreateBet}
          className="px-4 py-2"
          disabled={isLoading || !isFormValid}
        >
          Continue
        </PrimaryButton>
      </div>
    </div>
  );

  // Render confirmation step
  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Your Bet</h3>
        
        <div className="space-y-4">
          <div>
            <span className="text-sm text-gray-500">Condition:</span>
            <p className="text-gray-900 font-medium">{condition}</p>
          </div>
          
          <div className="flex justify-between">
            <div>
              <span className="text-sm text-gray-500">Your Stake:</span>
              <p className="text-gray-900 font-medium">{amount} MOCK</p>
            </div>
            
            <div>
              <span className="text-sm text-gray-500">Your Prediction:</span>
              <Badge variant={prediction ? "success" : "error"} className="ml-2">
                {prediction ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <span className="text-sm text-gray-500">Duration:</span>
              <p className="text-gray-900 font-medium">{durationDays} days</p>
            </div>
            
            <div>
              <span className="text-sm text-gray-500">Ends on:</span>
              <p className="text-gray-900 font-medium">{formatEndDate(durationDays)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">How it works:</h4>
        <ul className="list-disc list-inside space-y-2 text-sm text-blue-700">
          <li>You're creating a bet with your initial stake of {amount} MOCK</li>
          <li>Others can join on the opposite side of your prediction</li>
          <li>When the bet expires, the outcome must be submitted</li>
          <li>Winners share the total pot proportionally to their stakes</li>
        </ul>
      </div>
      
      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <SecondaryButton
          onClick={() => setCurrentStep('details')}
          className="px-4 py-2"
          disabled={isLoading}
        >
          Back
        </SecondaryButton>
        <PrimaryButton
          onClick={handleCreateBet}
          className="px-4 py-2"
          loading={isLoading}
          disabled={isLoading}
        >
          Create Bet
        </PrimaryButton>
      </div>
    </div>
  );

  // Render success step
  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">Bet Created Successfully!</h3>
      <p className="text-gray-600 mb-6">Your bet has been created and is now active.</p>
      
      <div className="flex justify-center">
        <PrimaryButton
          onClick={resetForm}
          className="px-4 py-2"
        >
          Create Another Bet
        </PrimaryButton>
      </div>
    </div>
  );

  return (
    <Card 
      className="overflow-hidden border border-gray-200 shadow-sm"
      title={
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Create a New Bet</h2>
          {currentStep !== 'success' && (
            <div className="flex items-center space-x-2">
              <span className={`inline-block w-2 h-2 rounded-full ${currentStep === 'details' ? 'bg-indigo-600' : 'bg-gray-300'}`}></span>
              <span className={`inline-block w-2 h-2 rounded-full ${currentStep === 'confirmation' ? 'bg-indigo-600' : 'bg-gray-300'}`}></span>
            </div>
          )}
        </div>
      }
    >
      {error && (
        <Alert 
          type="error"
          onClose={() => setError(null)}
          className="mb-4"
        >
          {error}
        </Alert>
      )}
      
      {currentStep === 'details' && renderDetailsStep()}
      {currentStep === 'confirmation' && renderConfirmationStep()}
      {currentStep === 'success' && renderSuccessStep()}
    </Card>
  );
};

export default BetCreation; 