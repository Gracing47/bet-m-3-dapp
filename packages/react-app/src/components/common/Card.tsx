import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string | ReactNode;
  footer?: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  bordered?: boolean;
}

export function Card({
  children,
  title,
  footer,
  className = '',
  onClick,
  hoverable = false,
  bordered = true,
}: CardProps) {
  return (
    <div
      className={`
        ${className}
        bg-white
        rounded-lg
        overflow-hidden
        ${bordered ? 'border border-gray-200' : ''}
        ${hoverable ? 'transition-shadow duration-200 hover:shadow-md' : ''}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      {title && (
        <div className="px-4 py-3 border-b border-gray-200">
          {typeof title === 'string' ? (
            <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card; 