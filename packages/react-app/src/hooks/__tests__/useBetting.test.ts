/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react-hooks';
import { useBetting } from '../useBetting';
import { BrowserProvider, Contract } from 'ethers';

// Mock ethers
jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  return {
    ...originalModule,
    BrowserProvider: jest.fn(),
    Contract: jest.fn(),
  };
});

describe('useBetting Hook', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';
  const mockProvider = {
    send: jest.fn().mockResolvedValue([mockAddress]),
    getSigner: jest.fn().mockResolvedValue({
      getAddress: jest.fn().mockResolvedValue(mockAddress),
    }),
  };
  
  const mockSigner = {
    getAddress: jest.fn().mockResolvedValue(mockAddress),
  };
  
  const mockFactoryContract = {
    getBettingContractsCount: jest.fn().mockResolvedValue(1),
    getBettingContract: jest.fn().mockResolvedValue('0x2345678901234567890123456789012345678901'),
    createBettingContract: jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue({
        hash: '0xabcdef1234567890',
      }),
    }),
  };
  
  const mockBettingContract = {
    getBetsCount: jest.fn().mockResolvedValue(1),
    getBetDetails: jest.fn().mockResolvedValue({
      creator: mockAddress,
      condition: 'Will ETH reach $5000 by the end of month?',
      totalStakeTrue: BigInt(10000000000000000000), // 10 tokens
      totalStakeFalse: BigInt(5000000000000000000), // 5 tokens
      creationTime: BigInt(Math.floor(Date.now() / 1000) - 86400), // 1 day ago
      expirationTime: BigInt(Math.floor(Date.now() / 1000) + 86400), // 1 day from now
      resolved: false,
      winningOutcome: false,
      resolutionFinalized: false,
    }),
    getAddress: jest.fn().mockResolvedValue('0x2345678901234567890123456789012345678901'),
  };
  
  const mockTokenContract = {
    approve: jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue({}),
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.ethereum
    global.window.ethereum = {
      request: jest.fn().mockResolvedValue([mockAddress]),
      on: jest.fn(),
      removeListener: jest.fn(),
      isMetaMask: true,
    };
    
    // Mock BrowserProvider
    (BrowserProvider as jest.Mock).mockImplementation(() => mockProvider);
    
    // Mock Contract
    (Contract as jest.Mock).mockImplementation((address, abi, signer) => {
      if (address === process.env.NEXT_PUBLIC_BETTING_FACTORY_ADDRESS) {
        return mockFactoryContract;
      } else if (address === process.env.NEXT_PUBLIC_MOCK_TOKEN_ADDRESS) {
        return mockTokenContract;
      } else {
        return mockBettingContract;
      }
    });
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useBetting());
    
    expect(result.current.address).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.bettingContracts).toEqual([]);
    expect(result.current.bets).toEqual([]);
  });

  // Additional tests would require a more complex setup to handle async methods
  // and would typically be integration tests with a mock provider
}); 