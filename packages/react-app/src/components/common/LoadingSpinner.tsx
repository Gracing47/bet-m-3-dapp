import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const colorClasses = {
    primary: 'border-gray-300 border-t-primary',
    secondary: 'border-gray-300 border-t-secondary',
    white: 'border-gray-500 border-t-white',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colorClasses[color]}
        ${className}
        animate-spin
        rounded-full
      `}
    ></div>
  );
}

export default LoadingSpinner; 