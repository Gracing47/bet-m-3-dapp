import { BrowserProvider, Contract, parseUnits } from "ethers";
import { useState, useEffect } from "react";
// These ABIs will be moved to assets/abis directory later
import StableTokenABI from "@/assets/abis/cusd-abi.json";

export const useWeb3 = () => {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<string | undefined>(undefined);
  const cUSDTokenAddress = "0x765de816845861e75a25fca122bb6898b8b1282a";

  const getUserAddress = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addressFromWallet = await signer.getAddress();
      setAddress(addressFromWallet);
      
      // Get balance
      const balanceWei = await provider.getBalance(addressFromWallet);
      const balanceEth = parseFloat(balanceWei.toString()) / 1e18;
      setBalance(balanceEth.toFixed(4));
    }
  };

  const disconnect = () => {
    setAddress(undefined);
    setBalance(undefined);
  };

  const sendCUSD = async (to: string, amount: string) => {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const cUSDTokenContract = new Contract(
      cUSDTokenAddress,
      StableTokenABI.abi,
      signer
    );
    const amountInWei = parseUnits(amount, 18);
    const tx = await cUSDTokenContract.transfer(to, amountInWei);
    await tx.wait();
    return tx;
  };

  const signTransaction = async () => {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const res = await signer.signMessage(
      `Hello from BETM3!`
    );
    console.log("res", res);
    return res;
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          // Update balance for new account
          const provider = new BrowserProvider(window.ethereum);
          const balanceWei = await provider.getBalance(accounts[0]);
          const balanceEth = parseFloat(balanceWei.toString()) / 1e18;
          setBalance(balanceEth.toFixed(4));
        } else {
          setAddress(undefined);
          setBalance(undefined);
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
}; 