import React, { useState } from 'react';
import { 
  Card, 
  PrimaryButton, 
  SecondaryButton, 
  Input, 
  Select, 
  Alert,
  LoadingSpinner
} from '../common';

interface BetCreationProps {
  onSubmit: (betData: BetData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export interface BetData {
  title: string;
  description: string;
  options: string[];
  endDate: string;
  minimumStake: string;
}

type FormStep = 'details' | 'options' | 'settings' | 'review';

export function BetCreation({
  onSubmit,
  isLoading = false,
  className = '',
}: BetCreationProps) {
  // Form state
  const [currentStep, setCurrentStep] = useState<FormStep>('details');
  const [formData, setFormData] = useState<BetData>({
    title: '',
    description: '',
    options: ['', ''],
    endDate: '',
    minimumStake: '0.01',
  });
  
  // Validation state
  const [errors, setErrors] = useState<Partial<Record<keyof BetData, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Step management
  const steps: FormStep[] = ['details', 'options', 'settings', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);
  
  const goToNextStep = () => {
    if (validateCurrentStep()) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex]);
      }
    }
  };
  
  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  // Form validation
  const validateCurrentStep = (): boolean => {
    const newErrors: Partial<Record<keyof BetData, string>> = {};
    
    if (currentStep === 'details') {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      } else if (formData.title.length < 5) {
        newErrors.title = 'Title must be at least 5 characters';
      }
      
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      }
    }
    
    else if (currentStep === 'options') {
      const validOptions = formData.options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        newErrors.options = 'At least 2 valid options are required';
      }
      
      // Check for duplicate options
      const uniqueOptions = new Set(formData.options.map(opt => opt.trim().toLowerCase()));
      if (uniqueOptions.size !== validOptions.length) {
        newErrors.options = 'Options must be unique';
      }
    }
    
    else if (currentStep === 'settings') {
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
      } else {
        const selectedDate = new Date(formData.endDate);
        const now = new Date();
        if (selectedDate <= now) {
          newErrors.endDate = 'End date must be in the future';
        }
      }
      
      if (!formData.minimumStake) {
        newErrors.minimumStake = 'Minimum stake is required';
      } else {
        const stake = parseFloat(formData.minimumStake);
        if (isNaN(stake) || stake <= 0) {
          newErrors.minimumStake = 'Minimum stake must be greater than 0';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async () => {
    if (validateCurrentStep()) {
      try {
        setFormError(null);
        await onSubmit(formData);
        setFormSuccess('Bet created successfully!');
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            title: '',
            description: '',
            options: ['', ''],
            endDate: '',
            minimumStake: '0.01',
          });
          setCurrentStep('details');
          setFormSuccess(null);
        }, 3000);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Failed to create bet');
      }
    }
  };

  // Form field updates
  const updateFormData = (field: keyof BetData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user makes changes
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Add/remove options
  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };
  
  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return; // Maintain at least 2 options
    
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };
  
  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
    
    // Clear options error when user makes changes
    if (errors.options) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.options;
        return newErrors;
      });
    }
  };

  // Step content rendering
  const renderStepContent = () => {
    switch (currentStep) {
      case 'details':
        return (
          <div className="space-y-4">
            <Input
              label="Bet Title"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="e.g., Will ETH reach $5000 by end of 2023?"
              error={errors.title}
              fullWidth
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Provide details about this bet"
                className={`
                  px-4
                  py-2
                  border
                  rounded-lg
                  w-full
                  focus:outline-none
                  focus:ring-2
                  focus:ring-primary
                  transition duration-200
                  ${errors.description ? 'border-red-500' : 'border-gray-300'}
                `}
                rows={4}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </div>
        );
        
      case 'options':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Betting Options</h3>
              <button
                type="button"
                onClick={addOption}
                className="text-sm text-primary hover:text-primary-dark"
              >
                + Add Option
              </button>
            </div>
            
            {errors.options && (
              <p className="text-sm text-red-500 mt-1">{errors.options}</p>
            )}
            
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    fullWidth
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-gray-400 hover:text-red-500"
                      aria-label="Remove option"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="space-y-4">
            <Input
              label="End Date"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => updateFormData('endDate', e.target.value)}
              error={errors.endDate}
              fullWidth
            />
            
            <Input
              label="Minimum Stake (ETH)"
              type="number"
              value={formData.minimumStake}
              onChange={(e) => updateFormData('minimumStake', e.target.value)}
              placeholder="0.01"
              error={errors.minimumStake}
              fullWidth
            />
          </div>
        );
        
      case 'review':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">{formData.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{formData.description}</p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Options:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600">
                  {formData.options.filter(opt => opt.trim() !== '').map((option, index) => (
                    <li key={index}>{option}</li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">End Date: </span>
                  <span className="font-medium">{new Date(formData.endDate).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Minimum Stake: </span>
                  <span className="font-medium">{formData.minimumStake} ETH</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Progress indicator
  const renderProgressIndicator = () => {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div 
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${index < currentStepIndex ? 'bg-primary text-white' : 
                      index === currentStepIndex ? 'bg-primary-light text-white' : 
                      'bg-gray-200 text-gray-600'}
                  `}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-1 hidden sm:block">
                  {step === 'details' ? 'Details' : 
                   step === 'options' ? 'Options' : 
                   step === 'settings' ? 'Settings' : 'Review'}
                </span>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div 
                  className={`
                    flex-1 h-1 mx-2
                    ${index < currentStepIndex ? 'bg-primary' : 'bg-gray-200'}
                  `}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card 
      className={`${className}`}
      title="Create New Bet"
    >
      {formError && (
        <Alert 
          type="error" 
          className="mb-4"
          onClose={() => setFormError(null)}
        >
          {formError}
        </Alert>
      )}
      
      {formSuccess && (
        <Alert 
          type="success" 
          className="mb-4"
          onClose={() => setFormSuccess(null)}
        >
          {formSuccess}
        </Alert>
      )}
      
      {renderProgressIndicator()}
      
      <div className="mb-6">
        {renderStepContent()}
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
        {currentStepIndex > 0 && (
          <SecondaryButton
            onClick={goToPreviousStep}
            disabled={isLoading}
            className="order-2 sm:order-1"
          >
            Back
          </SecondaryButton>
        )}
        
        {currentStepIndex < steps.length - 1 ? (
          <PrimaryButton
            onClick={goToNextStep}
            disabled={isLoading}
            className="order-1 sm:order-2"
          >
            Continue
          </PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            className="order-1 sm:order-2"
          >
            Create Bet
          </PrimaryButton>
        )}
      </div>
    </Card>
  );
}

export default BetCreation; 