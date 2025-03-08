import React, { ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean | 'x' | 'y';
  centered?: boolean;
}

export function Container({
  children,
  className = '',
  maxWidth = 'lg',
  padding = true,
  centered = true,
}: ContainerProps) {
  const maxWidthClasses = {
    xs: 'max-w-screen-xs',
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  const getPaddingClasses = () => {
    if (padding === true) return 'px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8';
    if (padding === 'x') return 'px-4 sm:px-6 lg:px-8';
    if (padding === 'y') return 'py-4 sm:py-6 lg:py-8';
    return '';
  };

  return (
    <div
      className={`
        ${className}
        ${maxWidthClasses[maxWidth]}
        ${getPaddingClasses()}
        ${centered ? 'mx-auto' : ''}
        w-full
      `}
    >
      {children}
    </div>
  );
}

export default Container; 