import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  className?: string;
}

export function Input({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  disabled,
  ...rest
}: InputProps) {
  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`
          ${className}
          px-4
          py-2
          border
          rounded-lg
          w-full
          focus:outline-none
          focus:ring-2
          focus:ring-primary
          transition duration-200
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-white cursor-text'}
        `}
        disabled={disabled}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}

export default Input; 