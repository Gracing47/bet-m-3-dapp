import React, { ReactNode, useState, useRef, useEffect } from 'react';

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

interface TooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  position?: TooltipPosition;
  className?: string;
  delay?: number;
  maxWidth?: string;
}

export function Tooltip({
  children,
  content,
  position = 'top',
  className = '',
  delay = 300,
  maxWidth = '200px',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Position classes based on the position prop
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-2',
  };

  // Arrow classes based on the position prop
  const arrowClasses = {
    top: 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent',
    right: 'left-0 top-1/2 transform -translate-y-1/2 -translate-x-full border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent',
    bottom: 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-0 top-1/2 transform -translate-y-1/2 translate-x-full border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent',
  };

  // Handle touch devices
  useEffect(() => {
    setIsMounted(true);
    
    // Check if we're on a touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
      const handleTouchStart = () => {
        setIsVisible(true);
        
        // Auto-hide after 3 seconds on touch devices
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      };
      
      const triggerEl = triggerRef.current;
      if (triggerEl) {
        triggerEl.addEventListener('touchstart', handleTouchStart);
        return () => {
          triggerEl.removeEventListener('touchstart', handleTouchStart);
          if (timerRef.current) clearTimeout(timerRef.current);
        };
      }
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Handle mouse events for non-touch devices
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  // Handle click outside to close tooltip
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current && 
        triggerRef.current && 
        !tooltipRef.current.contains(event.target as Node) && 
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <div 
      className="relative inline-block"
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-describedby={isVisible ? 'tooltip' : undefined}
    >
      {children}
      
      {isMounted && isVisible && (
        <div
          id="tooltip"
          role="tooltip"
          ref={tooltipRef}
          className={`
            absolute
            z-50
            px-3
            py-2
            text-sm
            text-white
            bg-gray-800
            rounded-md
            shadow-lg
            whitespace-normal
            transition-opacity
            duration-200
            ${positionClasses[position]}
            ${className}
          `}
          style={{ maxWidth }}
        >
          {content}
          <div 
            className={`
              absolute
              w-0
              h-0
              border-4
              ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
}

export default Tooltip; 