import React, { ReactNode } from 'react';
import Link from 'next/link';
import NavIcon from './NavIcon';

interface NavItemProps {
  href: string;
  label: string;
  icon: ReactNode;
  isActive?: boolean;
  color?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * A reusable navigation item component with Uniswap-style
 */
export const NavItem: React.FC<NavItemProps> = ({
  href,
  label,
  icon,
  isActive = false,
  color = '#6366f1', // Default indigo color
  onClick,
  className = '',
}) => {
  return (
    <Link
      href={href}
      className={`
        flex items-center py-2 px-4 rounded-lg text-sm font-medium
        ${isActive 
          ? 'bg-indigo-600/10 text-indigo-400' 
          : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'}
        transition-colors ${className}
      `}
      onClick={onClick}
    >
      <NavIcon 
        icon={icon} 
        color={color}
        active={isActive}
        className="mr-3"
      />
      {label}
    </Link>
  );
};

export default NavItem; 