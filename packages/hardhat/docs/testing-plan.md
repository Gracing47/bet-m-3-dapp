# BETM3 Testing Strategy

This document outlines the comprehensive testing approach for the BETM3 smart contract system. The tests are organized into five key categories to ensure full coverage of functionality, user flows, and security considerations.

## 1. Base Function Tests

These tests verify that individual contract functions work as expected in isolation.

### BettingManagerFactory
- `createBettingContract`: Should deploy a new NoLossBetMulti contract
- `getBettingContractsCount`: Should return the correct number of contracts
- `getBettingContract`: Should return the correct contract address at a given index
- Ownership: Should allow only the owner to perform restricted actions

### NoLossBetMulti
- `createBet`: Should create a new bet with correct parameters
- `joinBet`: Should allow a user to join an existing bet
- `getParticipantStake`: Should return the correct stake amount for a participant
- `submitResolutionOutcome`: Should register a user's vote correctly
- `finalizeResolution`: Should properly resolve a bet with sufficient consensus
- `adminFinalizeResolution`: Should allow the owner to resolve or cancel a bet
- `setYieldRate`: Should update the yield rate correctly
- `getBetDetails`: Should return accurate bet information

## 2. User Flow Tests

These tests simulate typical user interactions with the system.

### Standard Participant Flow
- User should be able to join an existing bet
- User should be able to stake on either true or false outcome
- User should be able to vote during resolution phase
- User should receive their stake back plus yield if on winning side
- User should receive their stake back plus smaller yield if on losing side

### Multiple Participants Scenario
- Multiple users should be able to join the same bet
- System should handle different users betting on different outcomes
- Yield distribution should be proportional to stake amounts
- All participants should get their stake back regardless of outcome

### Timing Constraints
- Users should not be able to join after bet expiration
- Users should only be able to vote during resolution period
- System should enforce correct phase transitions

## 3. Creator Flow Tests

These tests focus on the bet creator's perspective and special privileges.

### Bet Creation
- Creator should be able to set up a new bet with custom parameters
- Creator should be able to specify the condition description
- Creator should be able to determine the duration of the bet
- Creator should be required to place an initial stake

### Creator Participation
- Creator should be treated as a regular participant for their bet
- Creator should receive payouts according to the same rules as other participants
- Creator should be able to vote during resolution like other participants

## 4. Admin Flow Tests

These tests verify administrative functions and owner privileges.

### Factory Admin
- Owner should be able to transfer factory ownership
- New betting contracts should transfer ownership to the creator

### Bet Resolution Admin
- Owner should be able to finalize a bet when no supermajority is reached
- Owner should be able to determine the winning outcome manually
- Owner should be able to cancel a bet and return all stakes
- Owner should be able to adjust the yield rate

### Emergency Scenarios
- Owner should be able to handle exceptional circumstances
- System should handle admin intervention correctly

## 5. Attacker Scenarios

These tests verify the system's resistance to various attack vectors.

### Reentrancy Attacks
- Test contract should not be vulnerable to reentrancy during payouts
- Malicious contracts should not be able to exploit token transfers

### Front-Running
- System should be resistant to transaction ordering manipulation
- Bet outcomes should not be manipulable through front-running

### Stake Manipulation
- Users should not be able to stake multiple times on the same bet
- Users should not be able to vote multiple times during resolution
- Users should not be able to vote for outcomes they didn't stake on

### Time Manipulation
- System should be resistant to timestamp manipulation
- Phase transitions should be secure against time-based attacks

### Token Security
- Contract should handle token transfer failures gracefully
- Malicious tokens should not be able to compromise the system

## Test Implementation Approach

Each test category will be implemented in separate files:

```javascript
// Structure for test files
baseTests.js         // Base function tests
userFlowTests.js     // User flow tests
creatorFlowTests.js  // Creator flow tests
adminFlowTests.js    // Admin flow tests
securityTests.js     // Attacker scenario tests
```

### Test Environment Setup

Each test will follow this general structure:

1. Deploy mock tokens for testing
2. Deploy BettingManagerFactory
3. Create a NoLossBetMulti instance
4. Set up test accounts with specific roles
5. Execute the test scenario
6. Verify the expected outcomes

### Coverage Goals

- Aim for 100% code coverage of all contract functions
- Test all critical paths and edge cases
- Verify all require statements are triggered correctly
- Ensure accurate event emissions

## Gas Optimization Testing

In addition to functional testing, we will monitor gas usage:

- Track gas usage for all key functions
- Compare gas usage across different scenarios
- Identify opportunities for optimization
- Establish gas usage benchmarks for production

## Integration with CI/CD

Tests will be integrated into the CI/CD pipeline:

- Run all tests before merging PRs
- Ensure no regressions in functionality
- Maintain code quality standards
- Document gas usage trends 