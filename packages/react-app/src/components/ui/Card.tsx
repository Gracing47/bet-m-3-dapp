import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  hoverEffect?: boolean;
  as?: React.ElementType;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children, 
    className = '', 
    onClick, 
    shadow = 'md',
    padding = 'md',
    border = true,
    borderRadius = 'md',
    hoverEffect = false,
    as: Component = 'div',
    ...props 
  }, ref) => {
    // Base styles
    let styles = 'bg-white transition-all duration-200';
    
    // Shadow styles
    if (shadow === 'none') {
      styles += '';
    } else if (shadow === 'sm') {
      styles += ' shadow-sm';
    } else if (shadow === 'md') {
      styles += ' shadow';
    } else if (shadow === 'lg') {
      styles += ' shadow-lg';
    }
    
    // Padding styles
    if (padding === 'none') {
      styles += '';
    } else if (padding === 'sm') {
      styles += ' p-3';
    } else if (padding === 'md') {
      styles += ' p-4';
    } else if (padding === 'lg') {
      styles += ' p-6';
    }
    
    // Border styles
    if (border) {
      styles += ' border border-gray-200';
    }
    
    // Border radius styles
    if (borderRadius === 'none') {
      styles += '';
    } else if (borderRadius === 'sm') {
      styles += ' rounded-sm';
    } else if (borderRadius === 'md') {
      styles += ' rounded-md';
    } else if (borderRadius === 'lg') {
      styles += ' rounded-lg';
    } else if (borderRadius === 'full') {
      styles += ' rounded-full';
    }
    
    // Hover effect
    if (hoverEffect) {
      styles += ' hover:shadow-lg hover:-translate-y-1';
    }
    
    // Clickable
    if (onClick) {
      styles += ' cursor-pointer';
    }
    
    // Custom class
    styles += ` ${className}`;
    
    return (
      <Component
        ref={ref}
        className={styles}
        onClick={onClick}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ 
  children, 
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <div className={`border-b border-gray-200 pb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ 
  children, 
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ 
  children, 
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <div className={`py-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ 
  children, 
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <div className={`border-t border-gray-200 pt-4 ${className}`} {...props}>
    {children}
  </div>
); 