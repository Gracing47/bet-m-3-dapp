import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3, useBetStats, useBetHistory } from '@/hooks';
import { 
  Card, 
  Alert, 
  Badge, 
  LoadingSpinner, 
  PrimaryButton, 
  SecondaryButton,
  StatsCard,
  ProgressBar
} from '@/components/common';
import { WalletConnection, BetHistoryDashboard, BetCard } from '@/components/betting';
import { Container } from '@/components/layout';
import { useRouter } from 'next/router';
import { 
  ArrowRightIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  ScaleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

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
  const router = useRouter();
  const { address, getUserAddress, disconnect } = useWeb3();
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  
  // Get bet statistics
  const {
    totalBets,
    activeBets,
    resolvedBets,
    totalStaked,
    largestBet,
    participantCount,
    isLoading: statsLoading,
    yesVotes,
    noVotes,
    expiredBets,
  } = useBetStats();

  // Handler functions
  const handleViewBetDetails = (betId: number) => {
    router.push(`/betting?betId=${betId}`);
  };

  const handleCreateBet = () => {
    router.push('/create-bet');
  };

  // Format currency values
  const formatAmount = (amount: bigint): string => {
    return `${parseFloat(ethers.formatEther(amount)).toLocaleString(undefined, {
      maximumFractionDigits: 2
    })} MOCK`;
  };

  // Render the overview tab with Uniswap-inspired design
  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Hero section with stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full filter blur-3xl"></div>
        </div>
        
        {/* Content */}
        <div className="relative p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to BETM3</h1>
          <p className="text-indigo-200 mb-6 max-w-2xl">
            Create and join no-loss prediction markets on the Celo blockchain. Your principal is always protected.
          </p>
          
          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Bets"
              value={totalBets}
              icon={<ChartBarIcon className="h-4 w-4" />}
              loading={statsLoading}
              gradient="from-indigo-600 to-blue-600"
              className="bg-white/10 backdrop-blur-sm"
            />
            <StatsCard
              title="Participants"
              value={participantCount}
              icon={<UsersIcon className="h-4 w-4" />}
              loading={statsLoading}
              gradient="from-pink-600 to-purple-600"
              className="bg-white/10 backdrop-blur-sm"
            />
            <StatsCard
              title="Total Staked"
              value={formatAmount(totalStaked)}
              icon={<CurrencyDollarIcon className="h-4 w-4" />}
              loading={statsLoading}
              gradient="from-purple-600 to-indigo-600"
              className="bg-white/10 backdrop-blur-sm"
            />
            <StatsCard
              title="Active Bets"
              value={activeBets}
              icon={<ClockIcon className="h-4 w-4" />}
              loading={statsLoading}
              gradient="from-cyan-600 to-blue-600"
              className="bg-white/10 backdrop-blur-sm"
            />
          </div>
          
          {/* Action buttons */}
          {address ? (
            <div className="flex flex-wrap gap-4">
              <PrimaryButton 
                onClick={handleCreateBet}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg shadow-purple-900/30"
              >
                Create New Bet
              </PrimaryButton>
              <SecondaryButton 
                onClick={() => router.push('/join-bet')}
                className="bg-white/10 hover:bg-white/20 text-white border-0"
              >
                Join Existing Bet
              </SecondaryButton>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm p-5 rounded-xl border border-white/10">
              <p className="text-white mb-3">Connect your wallet to access the full functionality</p>
              <WalletConnection 
                isConnected={!!address}
                address={address || undefined}
                onConnect={() => getUserAddress()}
                onDisconnect={() => disconnect()}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Stats panel with Uniswap-style */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bet distribution */}
        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
          <div className="p-5">
            <h2 className="text-lg font-medium text-white mb-4">Bet Distribution</h2>
            
            {statsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-5">
                <ProgressBar
                  label="Active"
                  value={activeBets}
                  total={totalBets}
                  gradient="from-indigo-500 to-blue-500"
                  showValue={true}
                />
                
                <ProgressBar
                  label="Resolved"
                  value={resolvedBets}
                  total={totalBets}
                  gradient="from-green-500 to-emerald-500"
                  showValue={true}
                />
                
                <ProgressBar
                  label="Expired"
                  value={expiredBets}
                  total={totalBets}
                  gradient="from-yellow-500 to-amber-500"
                  showValue={true}
                />

                <div className="mt-4 pt-4 border-t border-gray-800">
                  <ProgressBar
                    label="Yes Predictions"
                    value={yesVotes}
                    total={yesVotes + noVotes}
                    gradient="from-blue-500 to-indigo-500"
                    showValue={true}
                  />
                  
                  <ProgressBar
                    label="No Predictions"
                    value={noVotes}
                    total={yesVotes + noVotes}
                    gradient="from-red-500 to-pink-500"
                    showValue={true}
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Platform metrics */}
        <div className="col-span-2 bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
          <div className="p-5">
            <h2 className="text-lg font-medium text-white mb-4">Platform Metrics</h2>
            
            {statsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatsCard
                  title="Largest Bet"
                  value={formatAmount(largestBet)}
                  icon={<BanknotesIcon className="h-4 w-4" />}
                  gradient="from-green-600 to-emerald-600"
                />
                
                <StatsCard
                  title="Avg. Stake"
                  value={totalBets > 0 ? formatAmount(totalStaked / BigInt(totalBets)) : '0.00 MOCK'}
                  icon={<ScaleIcon className="h-4 w-4" />}
                  gradient="from-blue-600 to-indigo-600"
                />
                
                <StatsCard
                  title="Total Value Locked"
                  value={formatAmount(totalStaked)}
                  icon={<CurrencyDollarIcon className="h-4 w-4" />}
                  gradient="from-purple-600 to-indigo-600"
                />
                
                <StatsCard
                  title="Resolution Ratio"
                  value={totalBets > 0 ? `${Math.round((resolvedBets / totalBets) * 100)}%` : '0%'}
                  helpText="Percentage of bets that have been resolved"
                  gradient="from-cyan-600 to-blue-600"
                />
                
                <StatsCard
                  title="Active Ratio" 
                  value={totalBets > 0 ? `${Math.round((activeBets / totalBets) * 100)}%` : '0%'}
                  helpText="Percentage of bets currently active"
                  gradient="from-yellow-600 to-amber-600"
                />
                
                <StatsCard
                  title="Unique Participants"
                  value={participantCount}
                  icon={<UsersIcon className="h-4 w-4" />}
                  gradient="from-pink-600 to-rose-600"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent bets section with Uniswap-style */}
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-white">Recent Bets</h2>
            <PrimaryButton 
              onClick={() => router.push('/betting')}
              className="text-sm bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
            >
              View All
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </PrimaryButton>
          </div>
          
          {statsLoading ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : totalBets === 0 ? (
            <div className="text-center py-8 bg-gray-800/30 rounded-xl border border-gray-800/50">
              <p className="text-gray-400 mb-4">No bets have been created yet.</p>
              <PrimaryButton 
                onClick={handleCreateBet}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                Create First Bet
              </PrimaryButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sample cards - these would be populated from real data */}
              <Card className="bg-gray-800 border-gray-700 hover:border-indigo-500 transition-colors">
                <h3 className="font-medium text-white mb-2 truncate">Will ETH price exceed $3000 by March 31st?</h3>
                <div className="flex justify-between items-center mt-4">
                  <Badge variant="success">Active</Badge>
                  <span className="text-white/70 text-sm">50.00 MOCK</span>
                </div>
              </Card>
              <Card className="bg-gray-800 border-gray-700 hover:border-indigo-500 transition-colors">
                <h3 className="font-medium text-white mb-2 truncate">Will the new governance proposal pass?</h3>
                <div className="flex justify-between items-center mt-4">
                  <Badge variant="primary">Resolved</Badge>
                  <span className="text-white/70 text-sm">25.00 MOCK</span>
                </div>
              </Card>
              <Card className="bg-gray-800 border-gray-700 hover:border-indigo-500 transition-colors">
                <h3 className="font-medium text-white mb-2 truncate">Will BTC reach $50K before April?</h3>
                <div className="flex justify-between items-center mt-4">
                  <Badge variant="error">Expired</Badge>
                  <span className="text-white/70 text-sm">100.00 MOCK</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render the history tab
  const renderHistoryTab = () => (
    <BetHistoryDashboard onViewBetDetails={handleViewBetDetails} />
  );

  return (
    <Container maxWidth="full" className="py-6 px-4 md:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Platform Overview
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('history')}
          >
            My Betting History
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' ? renderOverviewTab() : renderHistoryTab()}
      </div>
    </Container>
  );
} 