# BETM3 Smart Contract Development Guidelines

## Development Environment

### Setup
- Use Node.js version 20 or higher
- Use Hardhat for development and testing
- Use TypeScript for all development
- Use Solidity version 0.8.20

### Directory Structure
```
packages/hardhat/
├── contracts/          # Smart contracts
│   ├── interfaces/    # Contract interfaces
│   ├── libraries/     # Shared libraries
│   └── test/         # Mock contracts for testing
├── scripts/           # Deployment and maintenance scripts
├── test/             # Test files
└── docs/             # Documentation
```

## Smart Contract Guidelines

### Code Style
1. Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
2. Use explicit visibility modifiers
3. Order functions: constructor, receive/fallback, external, public, internal, private
4. Use custom errors instead of revert strings
5. Use NatSpec comments for all public interfaces

### Security Best Practices
1. Use OpenZeppelin contracts whenever possible
2. Follow Checks-Effects-Interactions pattern
3. Use reentrancy guards for external calls
4. Validate all inputs
5. Use SafeMath for math operations (when not using Solidity 0.8+)
6. Avoid using tx.origin
7. Mark untrusted contracts as such in comments

### Testing Requirements
1. Maintain 100% test coverage for critical functions
2. Test edge cases and failure modes
3. Use both unit tests and integration tests
4. Test gas optimization
5. Include fuzzing tests for complex functions

## Development Workflow

### Branch Strategy
- main: Production-ready code
- develop: Integration branch
- feature/*: New features
- fix/*: Bug fixes
- test/*: Test additions/modifications

### Commit Messages
Format: `type(scope): description`

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- test: Test addition/modification
- refactor: Code refactoring
- chore: Maintenance

### Pull Request Process
1. Create feature branch
2. Write/modify code and tests
3. Run full test suite
4. Update documentation
5. Create PR with description
6. Get code review
7. Address feedback
8. Merge to develop

## Deployment Process

### Pre-deployment Checklist
1. All tests passing
2. Gas optimization completed
3. Documentation updated
4. Security review completed
5. Contract verified on Etherscan

### Deployment Steps
1. Run deployment script on testnet
2. Verify contract on testnet
3. Run integration tests
4. Deploy to mainnet
5. Verify contract on mainnet
6. Update documentation with addresses

## Gas Optimization

### Guidelines
1. Use calldata instead of memory where possible
2. Batch operations to save gas
3. Use uint256 instead of smaller sizes
4. Pack variables efficiently
5. Cache frequently accessed storage variables
6. Use events instead of storage where appropriate

### Monitoring
1. Track gas usage in tests
2. Set gas limits for functions
3. Monitor gas usage trends
4. Optimize high-gas functions

## Security Considerations

### Access Control
1. Use OpenZeppelin Access Control
2. Implement role-based permissions
3. Use timelock for critical functions
4. Implement emergency stops

### Upgradability
1. Use OpenZeppelin upgradeable contracts
2. Implement proper storage patterns
3. Document upgrade procedures
4. Test upgrade scenarios

### External Interactions
1. Use pull over push payments
2. Implement rate limiting
3. Validate external calls
4. Handle failed calls gracefully

## Documentation Requirements

### Code Documentation
1. NatSpec comments for all public functions
2. Inline comments for complex logic
3. Architecture diagrams for complex systems
4. Gas usage documentation

### External Documentation
1. Technical specifications
2. User guides
3. API documentation
4. Deployment procedures
5. Upgrade procedures

## Maintenance

### Monitoring
1. Track contract events
2. Monitor gas usage
3. Watch for unusual patterns
4. Track user feedback

### Updates
1. Plan regular security updates
2. Document all changes
3. Maintain upgrade history
4. Keep dependencies updated

## Emergency Procedures

### Response Plan
1. Identify incident
2. Activate emergency stop if needed
3. Notify stakeholders
4. Implement fix
5. Post-mortem analysis

### Recovery
1. Document incident
2. Update security measures
3. Test fixes thoroughly
4. Resume operations
5. Update procedures
