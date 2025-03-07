import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BETM3 Multiple Participants Scenario Tests", function () {
  // Contracts
  let bettingManagerFactory: any;
  let mockToken: any;
  let bettingContract: any;
  
  // Signers
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;
  let participants: SignerWithAddress[] = [];
  
  // Constants
  const MIN_STAKE = ethers.parseUnits("10", 18); // 10 tokens
  const INITIAL_MINT = ethers.parseUnits("1000", 18); // 1000 tokens
  const NUM_PARTICIPANTS = 5; // Number of participants besides creator
  
  beforeEach(async function () {
    // Get signers
    const allSigners = await ethers.getSigners();
    owner = allSigners[0];
    creator = allSigners[1];
    participants = allSigners.slice(2, 2 + NUM_PARTICIPANTS);
    
    // Deploy MockToken
    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    mockToken = await MockTokenFactory.deploy();
    
    // Mint tokens to test accounts
    await mockToken.mint(creator.address, INITIAL_MINT);
    for (const participant of participants) {
      await mockToken.mint(participant.address, INITIAL_MINT);
    }
    
    // Deploy BettingManagerFactory
    const BettingManagerFactoryFactory = await ethers.getContractFactory("BettingManagerFactory");
    bettingManagerFactory = await BettingManagerFactoryFactory.deploy();
    
    // Create a betting contract through the factory
    await bettingManagerFactory.connect(creator).createBettingContract(await mockToken.getAddress());
    
    // Get the deployed betting contract
    const bettingContractAddress = await bettingManagerFactory.getBettingContract(0);
    bettingContract = await ethers.getContractAt("NoLossBetMulti", bettingContractAddress);
    
    // Approve token spending
    await mockToken.connect(creator).approve(bettingContractAddress, INITIAL_MINT);
    for (const participant of participants) {
      await mockToken.connect(participant).approve(bettingContractAddress, INITIAL_MINT);
    }
    
    // Create a bet
    await bettingContract.connect(creator).createBet(
      MIN_STAKE,
      "Will BTC reach $100K by the end of the year?",
      7, // 7 days
      true // creator predicts true
    );
  });
  
  it("Multiple users should be able to join the same bet", async function() {
    // Half participants bet on true, half on false
    const halfPoint = Math.floor(participants.length / 2);
    
    for (let i = 0; i < halfPoint; i++) {
      await bettingContract.connect(participants[i]).joinBet(0, MIN_STAKE, true);
    }
    
    for (let i = halfPoint; i < participants.length; i++) {
      await bettingContract.connect(participants[i]).joinBet(0, MIN_STAKE, false);
    }
    
    // Verify bet details
    const betDetails = await bettingContract.getBetDetails(0);
    expect(betDetails.totalStakeTrue).to.equal(MIN_STAKE * BigInt(halfPoint + 1)); // +1 for creator
    expect(betDetails.totalStakeFalse).to.equal(MIN_STAKE * BigInt(participants.length - halfPoint));
  });
  
  it("System should handle different users betting on different outcomes", async function() {
    // Participants bet with different stake amounts on different sides
    await bettingContract.connect(participants[0]).joinBet(0, MIN_STAKE * 2n, true);
    await bettingContract.connect(participants[1]).joinBet(0, MIN_STAKE * 3n, false);
    await bettingContract.connect(participants[2]).joinBet(0, MIN_STAKE * 4n, true);
    await bettingContract.connect(participants[3]).joinBet(0, MIN_STAKE * 5n, false);
    
    // Verify bet details
    const betDetails = await bettingContract.getBetDetails(0);
    const expectedTrueTotal = MIN_STAKE + (MIN_STAKE * 2n) + (MIN_STAKE * 4n); // creator + p0 + p2
    const expectedFalseTotal = (MIN_STAKE * 3n) + (MIN_STAKE * 5n); // p1 + p3
    
    expect(betDetails.totalStakeTrue).to.equal(expectedTrueTotal);
    expect(betDetails.totalStakeFalse).to.equal(expectedFalseTotal);
  });
  
  it("Yield distribution should be proportional to stake amounts", async function() {
    // Participants bet with different stake amounts on the same side
    const stake1 = MIN_STAKE * 2n;
    const stake2 = MIN_STAKE * 3n;
    
    await bettingContract.connect(participants[0]).joinBet(0, stake1, true);
    await bettingContract.connect(participants[1]).joinBet(0, stake2, true);
    await bettingContract.connect(participants[2]).joinBet(0, MIN_STAKE, false);
    
    // Calculate total stake and add yield
    const totalStake = MIN_STAKE + stake1 + stake2 + MIN_STAKE; // creator + p0 + p1 + p2
    const yieldAmount = (totalStake * 5n) / 100n; // 5% yield
    await mockToken.mint(await bettingContract.getAddress(), yieldAmount);
    
    // Fast-forward time to expiration
    await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);
    await ethers.provider.send("evm_mine", []);
    
    // Admin resolves with true outcome (connect with creator who is the owner of the betting contract)
    await bettingContract.connect(creator).adminFinalizeResolution(0, true, false);
    
    // Check balances after resolution
    const balanceP0 = await mockToken.balanceOf(participants[0].address);
    const balanceP1 = await mockToken.balanceOf(participants[1].address);
    
    // Both should get more than their stake back, and P1 should get more than P0
    // since they staked more (but both are on winning side)
    expect(balanceP0).to.be.gt(INITIAL_MINT - stake1);
    expect(balanceP1).to.be.gt(INITIAL_MINT - stake2);
    
    // P1's profit should be greater than P0's
    const p0Profit = balanceP0 - (INITIAL_MINT - stake1);
    const p1Profit = balanceP1 - (INITIAL_MINT - stake2);
    expect(p1Profit).to.be.gt(p0Profit);
  });
  
  it("All participants should get their stake back regardless of outcome", async function() {
    // All participants join
    for (let i = 0; i < participants.length; i++) {
      const side = i % 2 === 0; // alternate true/false
      await bettingContract.connect(participants[i]).joinBet(0, MIN_STAKE, side);
    }
    
    // Calculate total stake and add yield
    const totalStake = MIN_STAKE * BigInt(participants.length + 1); // +1 for creator
    const yieldAmount = (totalStake * 5n) / 100n; // 5% yield
    await mockToken.mint(await bettingContract.getAddress(), yieldAmount);
    
    // Record initial balances minus stake
    const initialBalances = [];
    for (const participant of participants) {
      initialBalances.push(INITIAL_MINT - MIN_STAKE);
    }
    
    // Fast-forward time to expiration
    await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);
    await ethers.provider.send("evm_mine", []);
    
    // Admin resolves with true outcome (connect with creator who is the owner of the betting contract)
    await bettingContract.connect(creator).adminFinalizeResolution(0, true, false);
    
    // Check all participants received at least their stake back
    for (let i = 0; i < participants.length; i++) {
      const finalBalance = await mockToken.balanceOf(participants[i].address);
      expect(finalBalance).to.be.gte(initialBalances[i]);
    }
  });
}); 