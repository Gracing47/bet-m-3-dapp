import React, { ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  helpText?: string;
  loading?: boolean;
  gradient?: string;
  className?: string;
}

/**
 * A reusable card component for displaying statistics in a Uniswap-style format
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  helpText,
  loading = false,
  gradient = 'from-indigo-600 to-blue-600',
  className = '',
}) => {
  return (
    <div className={`bg-gray-800/50 rounded-xl p-4 overflow-hidden relative ${className}`}>
      {/* Optional gradient highlight */}
      <div className={`absolute -top-24 -right-24 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-xl`}></div>
      
      <div className="relative">
        {/* Title with optional icon */}
        <div className="flex items-center mb-1">
          {icon && <div className="text-gray-400 mr-2">{icon}</div>}
          <h3 className="text-gray-400 text-sm">{title}</h3>
        </div>
        
        {/* Value with loading state */}
        <div className="text-white font-medium text-2xl mt-1">
          {loading ? <LoadingSpinner size="sm" /> : value}
        </div>
        
        {/* Optional help text */}
        {helpText && (
          <div className="text-gray-500 text-xs mt-2">{helpText}</div>
        )}
      </div>
    </div>
  );
};

export default StatsCard; 