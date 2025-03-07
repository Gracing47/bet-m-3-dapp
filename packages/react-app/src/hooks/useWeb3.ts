import { BrowserProvider, Contract, parseUnits } from "ethers";
import { useState } from "react";
// These ABIs will be moved to assets/abis directory later
import StableTokenABI from "@/assets/abis/cusd-abi.json";

export const useWeb3 = () => {
  const [address, setAddress] = useState<string | null>(null);
  const cUSDTokenAddress = "0x765de816845861e75a25fca122bb6898b8b1282a";

  const getUserAddress = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addressFromWallet = await signer.getAddress();
      setAddress(addressFromWallet);
    }
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

  return {
    address,
    getUserAddress,
    sendCUSD,
    signTransaction,
  };
}; 