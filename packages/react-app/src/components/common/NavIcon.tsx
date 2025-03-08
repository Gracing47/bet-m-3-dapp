import React, { ReactNode } from 'react';

interface NavIconProps {
  icon: ReactNode;
  color?: string;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * A reusable navigation icon component with Uniswap-style coloring and sizing
 */
export const NavIcon: React.FC<NavIconProps> = ({
  icon,
  color = '#6366f1', // Default indigo color
  active = false,
  size = 'md',
  className = '',
}) => {
  // Size mapping
  const sizeClasses = {
    sm: 'p-1 rounded-lg',
    md: 'p-1.5 rounded-lg',
    lg: 'p-2 rounded-lg',
  };
  
  // When active, use a higher opacity background
  const bgOpacity = active ? '30' : '20';
  
  return (
    <span 
      className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}
      style={{ 
        backgroundColor: `${color}${bgOpacity}`,
        color: color,
      }}
    >
      {icon}
    </span>
  );
};

export default NavIcon; 