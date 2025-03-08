import React from 'react';

interface ProgressBarProps {
  label: string;
  value: number;
  total: number;
  gradient?: string;
  className?: string;
  showPercentage?: boolean;
  showValue?: boolean;
  height?: string;
}

/**
 * A reusable progress bar component for displaying percentage metrics in a Uniswap-style format
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  total,
  gradient = 'from-indigo-500 to-blue-500',
  className = '',
  showPercentage = true,
  showValue = true,
  height = 'h-2.5',
}) => {
  // Calculate percentage
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between mb-1">
        <span className="text-gray-400 text-sm">{label}</span>
        {showValue && (
          <span className="text-gray-400 text-sm">
            {value} {showPercentage && `(${percentage}%)`}
          </span>
        )}
        {!showValue && showPercentage && (
          <span className="text-gray-400 text-sm">{percentage}%</span>
        )}
      </div>
      <div className={`w-full bg-gray-800 rounded-full ${height}`}>
        <div 
          className={`bg-gradient-to-r ${gradient} ${height} rounded-full transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar; 