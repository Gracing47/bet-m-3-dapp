import { PrimaryButton } from "@/components/common";
import { useWeb3 } from "@/hooks";
import { BettingInterface } from "@/components/betting";
import { useEffect, useState } from "react";

export default function Home() {
  const {
    address,
    getUserAddress,
    sendCUSD,
    signTransaction,
  } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [tx, setTx] = useState<any>(undefined);

  useEffect(() => {
    // Connect wallet when page loads
    getUserAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold mb-4">
        BETM3 - Decentralized Betting Platform
      </h1>
      
      {/* Display wallet info and demo buttons */}
      {address && (
        <div className="w-full max-w-2xl mb-8">
          <div className="text-sm mb-4">
            Connected wallet: <span className="font-mono">{address.substring(0, 6)}...{address.substring(address.length - 4)}</span>
          </div>
          
          {tx && (
            <p className="font-bold my-2 text-green-600">
              Tx Completed: {(tx.hash as string).substring(0, 6)}...
              {(tx.hash as string).substring(
                tx.hash.length - 6,
                tx.hash.length
              )}
            </p>
          )}
          
          <div className="flex gap-4 mb-6">
            <PrimaryButton
              loading={loading}
              onClick={async () => {
                setLoading(true);
                const tx = await sendCUSD(address, "0.1");
                setTx(tx);
                setLoading(false);
              }}
              title="Send 0.1 cUSD to yourself"
            />

            <PrimaryButton
              loading={loading}
              onClick={async () => {
                setLoading(true);
                await signTransaction();
                setLoading(false);
              }}
              title="Sign Message"
            />
          </div>
        </div>
      )}
      
      {/* Main betting interface */}
      <div className="w-full max-w-4xl">
        <BettingInterface />
      </div>
    </div>
  );
}
