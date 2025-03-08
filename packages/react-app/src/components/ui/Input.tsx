import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    fullWidth = false,
    containerClassName = '',
    className = '',
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    let containerStyles = 'relative';
    if (fullWidth) {
      containerStyles += ' w-full';
    }
    
    let inputStyles = `
      flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
      placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
      focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50
    `;
    
    if (leftIcon) {
      inputStyles += ' pl-9';
    }
    
    if (rightIcon) {
      inputStyles += ' pr-9';
    }
    
    if (error) {
      inputStyles += ' border-red-500 focus:border-red-500 focus:ring-red-500 text-red-700';
    }
    
    return (
      <div className={`${containerStyles} ${containerClassName}`}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`${inputStyles} ${className}`}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500">{hint}</p>
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const TextArea = React.forwardRef<HTMLTextAreaElement, Omit<InputProps, 'leftIcon' | 'rightIcon'> & React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ 
    label,
    error,
    hint,
    fullWidth = false,
    containerClassName = '',
    className = '',
    id,
    rows = 3,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
    
    let containerStyles = 'relative';
    if (fullWidth) {
      containerStyles += ' w-full';
    }
    
    let textareaStyles = `
      flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
      placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
      focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]
    `;
    
    if (error) {
      textareaStyles += ' border-red-500 focus:border-red-500 focus:ring-red-500 text-red-700';
    }
    
    return (
      <div className={`${containerStyles} ${containerClassName}`}>
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          className={`${textareaStyles} ${className}`}
          rows={rows}
          {...props}
        />
        
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500">{hint}</p>
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea'; 