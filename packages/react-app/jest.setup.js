import '@testing-library/jest-dom'

// Mock global ethereum object for tests
Object.defineProperty(window, 'ethereum', {
  value: {
    request: jest.fn().mockResolvedValue([]),
    on: jest.fn(),
    removeListener: jest.fn(),
    isMetaMask: true,
  },
  writable: true,
}); 