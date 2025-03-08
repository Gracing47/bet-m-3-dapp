import type { AppProps } from "next/app";
import { Layout } from "@/components/layout";
import { useState, useEffect, createContext } from "react";
import { useWeb3 } from "@/hooks";
import { LoadingScreen } from "@/components/common";
import { useRouter } from "next/router";
import "../styles/globals.css";

// Create a context for wallet state that can be used throughout the application
export const WalletContext = createContext<{
  isConnecting: boolean;
  connectionError: string | null;
  tryConnect: () => Promise<void>;
}>({
  isConnecting: false,
  connectionError: null,
  tryConnect: async () => {},
});

function App({ Component, pageProps }: AppProps) {
  const { address, getUserAddress } = useWeb3();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const router = useRouter();

  // Handle page loading transitions
  useEffect(() => {
    const handleStart = () => setIsPageLoading(true);
    const handleComplete = () => setIsPageLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // Try to auto-connect wallet
  useEffect(() => {
    // Try to connect wallet at app startup if user has previously connected
    const checkConnection = async () => {
      try {
        // Check if there's a stored preference for auto-connecting
        const shouldAutoConnect = localStorage.getItem('betm3_auto_connect') === 'true';
        
        if (shouldAutoConnect) {
          await tryConnect();
        }
      } catch (error) {
        console.error("Failed to auto-connect wallet:", error);
      }
    };

    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryConnect = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      await getUserAddress();
      // Store user preference for auto-connecting
      localStorage.setItem('betm3_auto_connect', 'true');
    } catch (error) {
      console.error("Wallet connection error:", error);
      setConnectionError("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Context value that will be available throughout the app
  const walletContextValue = {
    isConnecting,
    connectionError,
    tryConnect
  };

  return (
    <WalletContext.Provider value={walletContextValue}>
      <Layout>
        {isPageLoading && <LoadingScreen message="Loading page..." />}
        <Component {...pageProps} />
      </Layout>
    </WalletContext.Provider>
  );
}

export default App;
