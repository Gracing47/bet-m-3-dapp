import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useWeb3 } from "@/hooks";
import { Transition } from '@headlessui/react';
import WalletModal from "../wallet/WalletModal";
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const router = useRouter();
  const { address, getUserAddress, disconnect, balance } = useWeb3();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/80' 
          : 'bg-white/0'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">
                BETM3
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link 
              href="/betting"
              className={`text-sm font-medium transition-colors hover:text-teal-500 ${
                router.pathname === '/betting' 
                  ? 'text-teal-500' 
                  : 'text-gray-700'
              }`}
            >
              Betting
            </Link>
            <Link 
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-teal-500 ${
                router.pathname === '/dashboard' 
                  ? 'text-teal-500' 
                  : 'text-gray-700'
              }`}
            >
              Dashboard
            </Link>

            {/* Wallet Button */}
            <button
              onClick={() => setWalletModalOpen(true)}
              className={`
                inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm 
                transition-all duration-200 
                ${address 
                  ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' 
                  : 'bg-teal-500 text-white hover:bg-teal-600'
                }
              `}
            >
              {address ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                  <span>{formatAddress(address)}</span>
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </>
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <Transition
          show={mobileMenuOpen}
          enter="duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="absolute inset-x-0 top-full bg-white shadow-lg rounded-b-lg md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              <Link
                href="/betting"
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  router.pathname === '/betting'
                    ? 'bg-teal-50 text-teal-500'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Betting
              </Link>
              <Link
                href="/dashboard"
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  router.pathname === '/dashboard'
                    ? 'bg-teal-50 text-teal-500'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <div className="px-3 py-3 border-t border-gray-200 mt-2">
                <button
                  onClick={() => {
                    setWalletModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full rounded-full px-4 py-2 text-sm font-medium
                    ${address 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-teal-500 text-white'
                    }
                  `}
                >
                  {address ? (
                    <div className="flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                      {formatAddress(address)}
                    </div>
                  ) : (
                    'Connect Wallet'
                  )}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </nav>

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        address={address}
        balance={balance}
        onConnect={getUserAddress}
        onDisconnect={disconnect}
      />
    </header>
  );
}

declare global {
  interface Window {
    ethereum: any;
  }
} 