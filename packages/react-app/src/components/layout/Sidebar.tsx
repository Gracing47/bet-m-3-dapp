import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Transition } from '@headlessui/react';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
}

export interface SidebarProps {
  items: NavItem[];
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

const badgeVariants = {
  primary: 'bg-primary text-white',
  secondary: 'bg-gray-500 text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  error: 'bg-red-500 text-white',
};

export function Sidebar({
  items,
  className = '',
  collapsible = true,
  defaultCollapsed = false,
}: SidebarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = () => {
    if (collapsible) {
      setCollapsed(!collapsed);
    }
  };

  return (
    <div
      className={`
        ${className}
        fixed
        left-0
        top-14
        h-[calc(100vh-3.5rem)]
        bg-white
        border-r
        border-gray-100
        shadow-sm
        transition-all
        duration-300
        ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
        z-40
      `}
    >
      {collapsible && (
        <div className="absolute -right-3 top-4">
          <button
            onClick={toggleCollapse}
            className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Transition
              show={!collapsed}
              enter="transition-transform duration-200"
              enterFrom="rotate-180"
              enterTo="rotate-0"
              leave="transition-transform duration-200"
              leaveFrom="rotate-0"
              leaveTo="rotate-180"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </Transition>
          </button>
        </div>
      )}

      <nav className="py-4">
        <ul className="space-y-1">
          {items.map((item, index) => {
            const isActive = router.pathname === item.href;
            return (
              <li key={index} className="px-2">
                <Link
                  href={item.href}
                  className={`
                    flex
                    items-center
                    px-3
                    py-2
                    rounded-md
                    group
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                    transition-all
                    duration-200
                  `}
                >
                  {item.icon && (
                    <span 
                      className={`
                        ${collapsed ? 'mx-auto' : 'mr-3'}
                        ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}
                        transition-colors
                      `}
                    >
                      {item.icon}
                    </span>
                  )}
                  
                  <Transition
                    show={!collapsed}
                    enter="transition-opacity duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <span className="flex-1 whitespace-nowrap">{item.label}</span>
                    
                    {item.badge && (
                      <span 
                        className={`
                          ml-2
                          px-2
                          py-0.5
                          text-xs
                          font-medium
                          rounded-full
                          ${badgeVariants[item.badge.variant]}
                        `}
                      >
                        {item.badge.text}
                      </span>
                    )}
                  </Transition>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;