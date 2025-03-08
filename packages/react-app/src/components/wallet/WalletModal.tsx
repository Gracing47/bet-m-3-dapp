import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Image from 'next/image'

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: string | null;
  balance?: string | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

const networks = [
  {
    name: 'Celo Mainnet',
    chainId: '0xa4ec',
    rpcUrl: 'https://forno.celo.org',
    description: 'Main Celo network',
    icon: '/celo.svg',
    nativeCurrency: {
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18,
    },
  },
  {
    name: 'Alfajores Testnet',
    chainId: '0xaef3',
    rpcUrl: 'https://alfajores-forno.celo-testnet.org',
    description: 'Celo test network',
    icon: '/celo.svg',
    nativeCurrency: {
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18,
    },
  },
];

export default function WalletModal({
  isOpen,
  onClose,
  address,
  balance,
  onConnect,
  onDisconnect
}: WalletModalProps) {
  const [selectedNetwork, setSelectedNetwork] = useState(networks[1]); // Default to Alfajores Testnet
  const [isConnecting, setIsConnecting] = useState(false);

  const switchNetwork = async (network: typeof networks[0]) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
      setSelectedNetwork(network);
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: network.chainId,
                chainName: network.name,
                rpcUrls: [network.rpcUrl],
                nativeCurrency: network.nativeCurrency,
              },
            ],
          });
          setSelectedNetwork(network);
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      }
      console.error('Error switching network:', switchError);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await switchNetwork(selectedNetwork);
      await onConnect();
      onClose();
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-800/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-2"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all w-full max-w-sm">
                {/* Close button */}
                <button 
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1"
                  onClick={onClose}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {/* Modal content */}
                <div className="p-6">
                  {address ? (
                    // Connected state
                    <div className="space-y-5">
                      <div className="text-center">
                        <div className="h-16 w-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="mt-4 text-xl font-semibold text-gray-900">Wallet Connected</h3>
                        <p className="mt-1 text-sm text-gray-500">{selectedNetwork.name}</p>
                      </div>

                      <div className="mt-4 bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Address</span>
                          <span className="text-sm font-medium font-mono">{formatAddress(address)}</span>
                        </div>
                        {balance && (
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                            <span className="text-sm text-gray-600">Balance</span>
                            <span className="text-sm font-medium">{balance} CELO</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="mt-4 w-full py-2.5 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          onDisconnect();
                          onClose();
                        }}
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    // Not connected state
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="h-16 w-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="mt-4 text-xl font-semibold text-gray-900">Connect Wallet</h3>
                        <p className="mt-1 text-sm text-gray-500">Connect to continue using the app</p>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 text-sm font-medium text-gray-700">Select Network</div>
                        <div className="grid grid-cols-2 gap-2">
                          {networks.map((network) => (
                            <button
                              key={network.chainId}
                              className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                                selectedNetwork.chainId === network.chainId
                                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                              onClick={() => setSelectedNetwork(network)}
                            >
                              <div className="flex items-center justify-center w-8 h-8">
                                <Image
                                  src={network.icon}
                                  alt={network.name}
                                  width={24}
                                  height={24}
                                />
                              </div>
                              <div className="mt-2 text-sm font-medium text-gray-900">{network.name.split(' ')[0]}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`w-full py-3 px-4 rounded-lg text-sm font-medium text-white shadow-sm ${
                          isConnecting
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                        }`}
                        onClick={handleConnect}
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Connecting...
                          </div>
                        ) : 'Connect Wallet'}
                      </button>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 