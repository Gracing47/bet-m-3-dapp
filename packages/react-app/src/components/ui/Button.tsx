import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    className = '',
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    loading = false,
    icon,
    iconPosition = 'left',
    disabled,
    ...props 
  }, ref) => {
    // Base styles
    let styles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Variant styles
    if (variant === 'primary') {
      styles += ' bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
    } else if (variant === 'secondary') {
      styles += ' bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500';
    } else if (variant === 'ghost') {
      styles += ' bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-400';
    } else if (variant === 'danger') {
      styles += ' bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
    }
    
    // Size styles
    if (size === 'sm') {
      styles += ' text-sm px-3 py-1.5 h-8';
    } else if (size === 'md') {
      styles += ' text-sm px-4 py-2 h-10';
    } else if (size === 'lg') {
      styles += ' text-base px-5 py-2.5 h-12';
    }
    
    // Full width
    if (fullWidth) {
      styles += ' w-full';
    }
    
    // Custom class
    styles += ` ${className}`;
    
    return (
      <button
        className={styles}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className="mr-2 h-4 w-4 animate-spin" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        
        {icon && iconPosition === 'left' && !loading && (
          <span className="mr-2">{icon}</span>
        )}
        
        {children}
        
        {icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Export convenience components
export const PrimaryButton = (props: ButtonProps) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props: ButtonProps) => <Button variant="secondary" {...props} />;
export const GhostButton = (props: ButtonProps) => <Button variant="ghost" {...props} />;
export const DangerButton = (props: ButtonProps) => <Button variant="danger" {...props} />; 