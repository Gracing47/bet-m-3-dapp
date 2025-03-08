import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  padding?: boolean;
  centered?: boolean;
  as?: React.ElementType;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  maxWidth = 'lg',
  padding = true,
  centered = true,
  as: Component = 'div',
  ...props
}) => {
  let containerClass = '';
  
  // Max width classes
  switch (maxWidth) {
    case 'xs':
      containerClass += ' max-w-xs';
      break;
    case 'sm':
      containerClass += ' max-w-sm';
      break;
    case 'md':
      containerClass += ' max-w-md';
      break;
    case 'lg':
      containerClass += ' max-w-lg';
      break;
    case 'xl':
      containerClass += ' max-w-xl';
      break;
    case '2xl':
      containerClass += ' max-w-2xl';
      break;
    case 'full':
      containerClass += ' max-w-full';
      break;
    case 'none':
      break;
    default:
      containerClass += ' max-w-lg';
  }
  
  // Padding
  if (padding) {
    containerClass += ' px-4 sm:px-6 md:px-8';
  }
  
  // Centering
  if (centered) {
    containerClass += ' mx-auto';
  }
  
  return (
    <Component
      className={`w-full ${containerClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Container; 