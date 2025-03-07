import React, { useState } from 'react';
import { PrimaryButton, Alert, Badge, Tooltip } from '../common';

interface WalletConnectionProps {
  isConnected: boolean;
  address?: string;
  balance?: string;
  chainId?: number;
  onConnect: () => void;
  onDisconnect: () => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export function WalletConnection({
  isConnected,
  address,
  balance,
  chainId,
  onConnect,
  onDisconnect,
  isLoading = false,
  error,
  className = '',
}: WalletConnectionProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Format address for display (truncate middle)
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Network name based on chainId
  const getNetworkName = (id?: number) => {
    if (!id) return 'Unknown Network';
    
    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      3: 'Ropsten Testnet',
      4: 'Rinkeby Testnet',
      5: 'Goerli Testnet',
      42: 'Kovan Testnet',
      56: 'Binance Smart Chain',
      137: 'Polygon Mainnet',
      42220: 'Celo Mainnet',
      44787: 'Celo Alfajores Testnet',
      // Add more networks as needed
    };
    
    return networks[id] || `Chain ID: ${id}`;
  };

  return (
    <div className={`${className}`}>
      {error && (
        <Alert 
          type="error" 
          className="mb-4"
          onClose={() => {/* Clear error */}}
        >
          {error}
        </Alert>
      )}

      {!isConnected ? (
        <PrimaryButton
          onClick={onConnect}
          loading={isLoading}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Connect Wallet
        </PrimaryButton>
      ) : (
        <div className="w-full sm:w-auto">
          <div 
            className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            onClick={() => setShowDetails(!showDetails)}
          >
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <Tooltip content={address}>
                <span className="font-mono text-sm">{formatAddress(address || '')}</span>
              </Tooltip>
            </div>
            
            <Badge 
              variant="primary" 
              size="sm" 
              rounded 
              className="ml-0 sm:ml-2"
            >
              {getNetworkName(chainId)}
            </Badge>
          </div>

          {showDetails && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
              <div className="mb-2">
                <span className="text-gray-600 mr-2">Balance:</span>
                <span className="font-medium">{balance || '0'}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-600 mr-2">Network:</span>
                <span className="font-medium">{getNetworkName(chainId)}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-600 mr-2">Address:</span>
                <span className="font-mono break-all">{address}</span>
              </div>
              <PrimaryButton
                onClick={() => {
                  onDisconnect();
                }}
                className="mt-2 w-full"
              >
                Disconnect
              </PrimaryButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WalletConnection; 