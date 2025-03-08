import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NavItem } from '@/components/common';
import { 
  CurrencyDollarIcon, 
  PlusCircleIcon, 
  ArrowPathIcon, 
  CheckCircleIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  GlobeAltIcon,
  Bars3Icon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  // Track window size
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar when navigating
  useEffect(() => {
    setIsMobileOpen(false);
  }, [router.pathname]);

  const isMobile = windowWidth < 768;  // md breakpoint

  // Navigation items
  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: <HomeIcon className="w-5 h-5" />
    },
    { 
      name: 'My Bets', 
      href: '/my-bets', 
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />
    },
    { 
      name: 'Explorer', 
      href: '/betting', 
      icon: <GlobeAltIcon className="w-5 h-5" />
    },
  ];

  // Action items
  const actionItems = [
    { 
      name: 'Mint Mock', 
      href: '/mint-mock', 
      icon: <CurrencyDollarIcon className="w-5 h-5" />,
      color: '#6366f1'
    },
    { 
      name: 'Create Bet', 
      href: '/create-bet', 
      icon: <PlusCircleIcon className="w-5 h-5" />,
      color: '#d946ef'
    },
    { 
      name: 'Join Bet', 
      href: '/join-bet', 
      icon: <ArrowPathIcon className="w-5 h-5" />,
      color: '#3b82f6'
    },
    { 
      name: 'Resolve Bets', 
      href: '/resolve-bets', 
      icon: <CheckCircleIcon className="w-5 h-5" />,
      color: '#10b981'
    },
  ];

  // Mobile toggle button that stays at the edge of the screen
  const MobileToggle = () => (
    <button
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      className="md:hidden fixed z-50 left-4 bottom-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg"
      aria-label={isMobileOpen ? "Close sidebar" : "Open sidebar"}
    >
      {isMobileOpen ? (
        <XMarkIcon className="h-6 w-6" />
      ) : (
        <Bars3Icon className="h-6 w-6" />
      )}
    </button>
  );

  return (
    <>
      <MobileToggle />

      {/* Sidebar - hidden on mobile unless toggled */}
      <div 
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] w-[200px] 
          bg-[#141E33] z-40 overflow-y-auto border-r border-gray-800/50
          transition-all duration-300 transform
          ${isMobile && !isMobileOpen ? '-translate-x-full' : 'translate-x-0'}
          md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* BETM3 Logo */}
          <div className="p-4">
            <Link href="/" className="flex items-center justify-center">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
                BETM3
              </span>
            </Link>
          </div>

          {/* Navigation section */}
          <div className="px-2 mt-2">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 px-4 py-2">NAVIGATION</h2>
            <nav>
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <NavItem
                      href={item.href}
                      label={item.name}
                      icon={item.icon}
                      isActive={router.pathname === item.href}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Actions Section */}
          <div className="px-2 mt-6">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 px-4 py-2">ACTIONS</h2>
            <div className="space-y-1">
              {actionItems.map((action) => (
                <NavItem
                  key={action.name}
                  href={action.href}
                  label={action.name}
                  icon={action.icon}
                  color={action.color}
                  isActive={router.pathname === action.href}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;