import React, { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

export function Container({
  children,
  className = '',
  maxWidth = 'lg',
  padding = true,
}: ContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={`
        ${className}
        ${maxWidthClasses[maxWidth]}
        ${padding ? 'px-4 sm:px-6 md:px-8' : ''}
        mx-auto
        w-full
      `}
    >
      {children}
    </div>
  );
}

export default Container; 