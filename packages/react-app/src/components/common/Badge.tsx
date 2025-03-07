import React, { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  className = '',
}: BadgeProps) {
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary bg-opacity-10 text-primary',
    secondary: 'bg-secondary bg-opacity-10 text-secondary',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5',
  };

  return (
    <span
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${rounded ? 'rounded-full' : 'rounded'}
        ${className}
        inline-flex
        items-center
        justify-center
        font-medium
        whitespace-nowrap
      `}
    >
      {children}
    </span>
  );
}

export default Badge; 