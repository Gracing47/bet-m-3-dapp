import { useState, useEffect } from 'react';
import Web3 from 'web3';

interface Web3State {
  address: string | null;
  balance: string | null;
  getUserAddress: () => Promise<void>;
  disconnect: () => void;
  sendCUSD: (to: string, amount: string) => Promise<any>;
  signTransaction: () => Promise<string>;
}

export function useWeb3(): Web3State {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const getUserAddress = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];
        setAddress(userAddress);
        
        // Get balance
        const web3 = new Web3(window.ethereum);
        const balanceWei = await web3.eth.getBalance(userAddress);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        setBalance(parseFloat(balanceEth).toFixed(4));
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setBalance(null);
  };

  const sendCUSD = async (to: string, amount: string) => {
    if (!window.ethereum) throw new Error('No crypto wallet found');
    
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    
    return web3.eth.sendTransaction({
      from: accounts[0],
      to,
      value: web3.utils.toWei(amount, 'ether')
    });
  };

  const signTransaction = async () => {
    if (!window.ethereum) throw new Error('No crypto wallet found');
    
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    
    const message = 'Sign this message to verify your identity';
    return web3.eth.personal.sign(message, accounts[0], '');
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          // Update balance for new account
          const web3 = new Web3(window.ethereum);
          web3.eth.getBalance(accounts[0]).then((balanceWei: bigint) => {
            const balanceEth = web3.utils.fromWei(balanceWei.toString(), 'ether');
            setBalance(parseFloat(balanceEth).toFixed(4));
          });
        } else {
          setAddress(null);
          setBalance(null);
        }
      });
    }
  }, []);

  return {
    address,
    balance,
    getUserAddress,
    disconnect,
    sendCUSD,
    signTransaction,
  };
}

export default useWeb3; 