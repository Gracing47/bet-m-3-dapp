import { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Card, CardContent } from '@/components/ui';
import { ALFAJORES_CONTRACTS } from '@/constants/contracts';

// Einfache ABI nur für die mint-Funktion
const MINT_ABI = [
  "function mint() external",
  "function balanceOf(address account) external view returns (uint256)"
];

interface MockTokenMinterProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const MockTokenMinter = ({ onSuccess, onError }: MockTokenMinterProps) => {
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const MOCK_TOKEN_ADDRESS = ALFAJORES_CONTRACTS.MOCK_TOKEN_ADDRESS || "";

  const mintTokens = async () => {
    if (!window.ethereum) {
      onError?.("MetaMask nicht gefunden. Bitte installieren Sie MetaMask.");
      return;
    }
    
    try {
      setIsMinting(true);
      setTxHash(null);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      
      // Verwende ein minimales ABI
      const mockToken = new ethers.Contract(MOCK_TOKEN_ADDRESS, MINT_ABI, signer);
      
      // Mint-Funktion direkt aufrufen
      const tx = await mockToken.mint();
      setTxHash(tx.hash);
      
      // Auf Bestätigung warten
      await tx.wait();
      
      // Kontostand abfragen
      const userAddress = await signer.getAddress();
      const userBalance = await mockToken.balanceOf(userAddress);
      setBalance(ethers.formatEther(userBalance));
      
      // Erfolg melden
      onSuccess?.();
    } catch (error) {
      console.error("Fehler beim Minting:", error);
      onError?.(error instanceof Error ? error.message : "Unbekannter Fehler beim Minting");
    } finally {
      setIsMinting(false);
    }
  };

  const checkBalance = async () => {
    if (!window.ethereum) {
      onError?.("MetaMask nicht gefunden. Bitte installieren Sie MetaMask.");
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      // Verwende ein minimales ABI
      const mockToken = new ethers.Contract(MOCK_TOKEN_ADDRESS, MINT_ABI, signer);
      const userBalance = await mockToken.balanceOf(userAddress);
      
      setBalance(ethers.formatEther(userBalance));
    } catch (error) {
      console.error("Fehler beim Abfragen des Kontostands:", error);
      onError?.(error instanceof Error ? error.message : "Unbekannter Fehler beim Abfragen des Kontostands");
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <h3 className="text-lg font-medium text-center mb-4">Mock Token Minter</h3>
      <p className="text-sm text-gray-600 text-center mb-6">
        Erhalte kostenlose MOCK Tokens für Tests auf Alfajores Testnet
      </p>
      
      {balance !== null && (
        <div className="bg-blue-50 rounded p-3 text-center mb-6">
          <p className="text-sm text-gray-600">Dein Kontostand:</p>
          <p className="font-medium text-blue-700">{balance} MOCK</p>
        </div>
      )}
      
      <div>
        <button 
          onClick={mintTokens} 
          disabled={isMinting}
          style={{
            width: '100%', 
            padding: '10px', 
            background: '#3b82f6', 
            color: 'white',
            borderRadius: '4px',
            fontWeight: 'bold',
            marginBottom: '10px',
            cursor: isMinting ? 'not-allowed' : 'pointer',
            opacity: isMinting ? 0.7 : 1
          }}
        >
          {isMinting ? 'Minting...' : 'Tokens Minten'}
        </button>
        
        <div style={{height: '10px'}}></div>
        
        <button 
          onClick={checkBalance} 
          style={{
            width: '100%', 
            padding: '10px', 
            background: 'white', 
            color: '#4b5563',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Kontostand prüfen
        </button>
      </div>
      
      {txHash && (
        <div className="mt-4">
          <p className="text-xs text-gray-500">Transaktion:</p>
          <a 
            href={`https://explorer.celo.org/alfajores/tx/${txHash}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline break-all"
          >
            {txHash}
          </a>
        </div>
      )}
    </div>
  );
};

export default MockTokenMinter; 