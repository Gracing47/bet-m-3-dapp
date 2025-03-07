import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: NavItem[];
  className?: string;
  collapsible?: boolean;
}

export function Sidebar({
  items,
  className = '',
  collapsible = true,
}: SidebarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    if (collapsible) {
      setCollapsed(!collapsed);
    }
  };

  return (
    <div
      className={`
        ${className}
        bg-white
        border-r
        border-gray-200
        h-full
        transition-all
        duration-300
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {collapsible && (
        <div className="p-4 border-b border-gray-200 flex justify-end">
          <button
            onClick={toggleCollapse}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>
      )}
      <nav className="py-4">
        <ul>
          {items.map((item, index) => {
            const isActive = router.pathname === item.href;
            return (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`
                    flex
                    items-center
                    px-4
                    py-3
                    ${isActive ? 'bg-primary-light bg-opacity-10 text-primary' : 'text-gray-700 hover:bg-gray-100'}
                    transition-colors
                    duration-200
                    cursor-pointer
                  `}
                >
                  {item.icon && (
                    <span className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>
                      {item.icon}
                    </span>
                  )}
                  {!collapsed && <span>{item.label}</span>}
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