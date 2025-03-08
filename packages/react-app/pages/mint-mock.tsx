import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Container } from '@/components/layout';
import { 
  Card, 
  PrimaryButton, 
  Alert, 
  Input, 
  LoadingSpinner 
} from '@/components/common';
import { useWeb3, useWallet } from '@/hooks';
import MockTokenABI from '@/assets/abis/MockToken.json';

export default function MintMockPage() {
  const { isConnected, address } = useWallet();
  const { provider } = useWeb3();
  const [amount, setAmount] = useState<string>('100');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Mock token contract address - this should be replaced with your actual contract address
  const mockTokenAddress = process.env.NEXT_PUBLIC_MOCK_TOKEN_ADDRESS || '0xYourMockTokenAddress';

  const handleMint = async () => {
    if (!isConnected || !address || !provider) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setSuccess(false);
    setError(null);
    setTxHash(null);

    try {
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(mockTokenAddress, MockTokenABI, signer);
      
      // Convert the amount to wei (consider the token decimals)
      const decimals = await tokenContract.decimals();
      const amountInWei = ethers.utils.parseUnits(amount, decimals);
      
      // Call the mint function on the contract
      const tx = await tokenContract.mint(address, amountInWei);
      
      setTxHash(tx.hash);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Error minting tokens:', err);
      setError(err.message || 'Failed to mint tokens');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="full" className="py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Mint MOCK Tokens</h1>
        
        <Card className="bg-gray-900 border border-gray-800 shadow-xl rounded-2xl overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">Get test tokens</h2>
              <p className="text-gray-400 mt-1">
                Mint MOCK tokens to use for testing on the BETM3 platform
              </p>
            </div>
            
            {/* Success message */}
            {success && (
              <Alert 
                type="success" 
                className="mb-6"
                onClose={() => setSuccess(false)}
              >
                <div className="flex flex-col">
                  <span>Successfully minted {amount} MOCK tokens!</span>
                  {txHash && (
                    <a 
                      href={`https://alfajores.celoscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline mt-1"
                    >
                      View transaction
                    </a>
                  )}
                </div>
              </Alert>
            )}
            
            {/* Error message */}
            {error && (
              <Alert 
                type="error" 
                className="mb-6"
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            
            {/* Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                  Amount
                </label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount to mint"
                  min="1"
                  max="10000"
                  className="w-full bg-gray-800 border-gray-700 text-white"
                />
                <p className="mt-1 text-sm text-gray-400">
                  You can mint up to 10,000 MOCK tokens at once
                </p>
              </div>
              
              <PrimaryButton
                onClick={handleMint}
                className="w-full py-3 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isLoading || !isConnected}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    <span>Minting...</span>
                  </div>
                ) : (
                  'Mint Tokens'
                )}
              </PrimaryButton>
            </div>
            
            {/* Info section */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-2">About MOCK Tokens</h3>
              <p className="text-xs text-gray-400">
                MOCK tokens are used exclusively for testing purposes on the BETM3 platform. 
                They have no real value and can be obtained for free.
                You'll need these tokens to create and join bets on the platform.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
} 