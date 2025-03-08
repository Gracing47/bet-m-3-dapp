import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useWeb3 } from "@/hooks";
import { Transition, Menu } from '@headlessui/react';
import { ethers } from "ethers";
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const router = useRouter();
  const { address, getUserAddress, disconnect, balance } = useWeb3();
  const [scrolled, setScrolled] = useState(false);
  const [mockBalance, setMockBalance] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'disconnected' | 'connected' | 'wrong_network'>('disconnected');
  const [mounted, setMounted] = useState(false);

  // Ensure components have mounted before accessing window
  useEffect(() => {
    setMounted(true);
    checkNetwork();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Effect to update balances when address changes
  useEffect(() => {
    if (address) {
      getMockTokenBalance();
      getNativeBalance(address);
    } else {
      setMockBalance(null);
    }
  }, [address]);

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Check network status
  const checkNetwork = async () => {
    if (!window.ethereum) return;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetworkStatus(chainId === '0xaef3' ? 'connected' : 'wrong_network');
      
      // Get native token balance if we have an address
      if (address) {
        getNativeBalance(address);
      }
      
      // Set up network change listener
      window.ethereum.on('chainChanged', (newChainId: string) => {
        setNetworkStatus(newChainId === '0xaef3' ? 'connected' : 'wrong_network');
        // Update balances on network change
        if (address) {
          getMockTokenBalance();
          getNativeBalance(address);
        }
      });
    } catch (error) {
      console.error("Error checking network:", error);
    }
  };

  // Get native token balance
  const getNativeBalance = async (addr: string) => {
    if (!window.ethereum) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const nativeBalance = await provider.getBalance(addr);
      // We don't need to set this as it's already handled by useWeb3()
    } catch (error) {
      console.error("Error getting native balance:", error);
    }
  };

  // Function to get the MOCK token balance
  const getMockTokenBalance = async () => {
    if (!address || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const MOCK_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MOCK_TOKEN_ADDRESS || "";

      // Simple ABI for balance check
      const ABI = ["function balanceOf(address account) external view returns (uint256)"];
      const mockToken = new ethers.Contract(MOCK_TOKEN_ADDRESS, ABI, signer);
      const balance = await mockToken.balanceOf(address);
      
      // Format the balance
      setMockBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error getting MOCK token balance:", error);
    }
  };

  // Switch to Alfajores network
  const switchToAlfajores = async () => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaef3' }], // Alfajores chainId
      });
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaef3',
                chainName: 'Alfajores Testnet',
                nativeCurrency: {
                  name: 'Alfajores Celo',
                  symbol: 'A-CELO',
                  decimals: 18,
                },
                rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
                blockExplorerUrls: ['https://alfajores.celoscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding Alfajores network:', addError);
        }
      } else {
        console.error('Error switching to Alfajores network:', error);
      }
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-200 ${
      scrolled ? 'bg-[#0C1425]/90 backdrop-blur-md shadow-md' : 'bg-[#0C1425]/70 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
                BETM3
              </span>
            </Link>
          </div>

          {/* Wallet Button */}
          <div className="flex items-center">
            {mounted && (
              address ? (
                <Menu as="div" className="relative">
                  <Menu.Button className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all duration-200 bg-gray-800 text-white border border-gray-700 hover:bg-gray-700">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                    <span className="mr-1">{formatAddress(address)}</span>
                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden backdrop-blur-sm text-white">
                      <div className="p-4 space-y-3">
                        {/* Network status */}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Network:</span>
                          <div className="flex items-center">
                            <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                              networkStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
                            }`}></span>
                            <span className={networkStatus === 'connected' ? 'text-green-400' : 'text-red-400'}>
                              {networkStatus === 'connected' ? 'Alfajores Testnet' : 'Unsupported Network'}
                            </span>
                          </div>
                        </div>
                        
                        {/* MOCK Balance */}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">MOCK Balance:</span>
                          <span className="font-medium">
                            {mockBalance ? parseFloat(mockBalance).toFixed(2) : '0.00'} MOCK
                          </span>
                        </div>
                        
                        {/* Native Balance (CELO) */}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">CELO Balance:</span>
                          <span className="font-medium">
                            {balance || '0.00'} CELO
                          </span>
                        </div>
                        
                        {/* Address */}
                        <div className="pt-2 mt-2 border-t border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Address:</span>
                            <span className="font-mono text-sm">{formatAddress(address || '')}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 font-mono break-all">
                            {address}
                          </div>
                        </div>
                        
                        {/* Wrong network warning */}
                        {networkStatus !== 'connected' && (
                          <div className="mt-2 p-2 bg-red-900/30 border border-red-800 rounded-lg">
                            <p className="text-sm text-red-300 mb-2">Switch to Alfajores Testnet to use the app</p>
                            <button
                              onClick={switchToAlfajores}
                              className="w-full py-1.5 text-xs font-medium bg-red-700 hover:bg-red-600 text-white rounded-md transition-colors"
                            >
                              Switch Network
                            </button>
                          </div>
                        )}
                        
                        {/* Disconnect button */}
                        <div className="pt-2 mt-2 border-t border-gray-700">
                          <button
                            onClick={disconnect}
                            className="w-full py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <button
                  onClick={getUserAddress}
                  className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all duration-200 bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700"
                >
                  Connect Wallet
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// For TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
} 