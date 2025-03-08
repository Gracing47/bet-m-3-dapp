import { useEffect, useState } from 'react';
import { useWeb3 } from '@/hooks';
import { Card, Alert, Badge, LoadingSpinner } from '@/components/common';
import { WalletConnection } from '@/components/betting';
import { useRouter } from 'next/router';

// Mock bet type for the dashboard
type UserBet = {
  id: string;
  title: string;
  amount: string;
  prediction: boolean;
  createdAt: string;
  status: 'active' | 'won' | 'lost' | 'pending';
  outcome?: boolean;
};

export default function DashboardPage() {
  const { address, getUserAddress } = useWeb3();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  
  // Mock data for demonstration
  const mockBets: UserBet[] = [
    {
      id: '1',
      title: 'Will ETH price exceed $3000 by March 31st?',
      amount: '50.00 cUSD',
      prediction: true,
      createdAt: '2023-03-01',
      status: 'active',
    },
    {
      id: '2',
      title: 'Will the new governance proposal pass?',
      amount: '25.00 cUSD',
      prediction: false,
      createdAt: '2023-02-15',
      status: 'won',
      outcome: false,
    },
    {
      id: '3',
      title: 'Will BTC reach $50K before April?',
      amount: '100.00 cUSD',
      prediction: true,
      createdAt: '2023-02-10',
      status: 'lost',
      outcome: false,
    },
    {
      id: '4',
      title: 'Will the new DeFi protocol launch by end of March?',
      amount: '35.00 cUSD',
      prediction: true,
      createdAt: '2023-02-28',
      status: 'pending',
    },
  ];

  useEffect(() => {
    // Connect wallet when page loads
    getUserAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you'd fetch user bets from blockchain here
      setUserBets(mockBets);
      setIsLoading(false);
    };

    if (address) {
      fetchData();
    }
  }, [address]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!address) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold mb-4">My Dashboard</h1>
          <Alert type="info">
            Please connect your wallet to view your dashboard.
          </Alert>
          <div className="mt-8">
            <WalletConnection 
              isConnected={!!address}
              address={address || undefined}
              onConnect={getUserAddress}
              onDisconnect={() => {
                // Disconnect logic
                console.log('Disconnect wallet');
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your betting activity
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => router.push('/betting')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Place New Bet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Total Bets</h2>
          <p className="text-3xl font-bold">{userBets.length}</p>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Active Bets</h2>
          <p className="text-3xl font-bold">{userBets.filter(bet => bet.status === 'active').length}</p>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Win Rate</h2>
          <p className="text-3xl font-bold">
            {userBets.length ? 
              `${Math.round((userBets.filter(bet => bet.status === 'won').length / userBets.filter(bet => ['won', 'lost'].includes(bet.status)).length) * 100)}%` 
              : '0%'}
          </p>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Bets</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : userBets.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-lg text-gray-600">You haven't placed any bets yet.</p>
            <button
              onClick={() => router.push('/betting')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Place Your First Bet
            </button>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bet
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prediction
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userBets.map((bet) => (
                  <tr key={bet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{bet.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{bet.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        className={bet.prediction ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {bet.prediction ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{bet.createdAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(bet.status)}>
                        {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 