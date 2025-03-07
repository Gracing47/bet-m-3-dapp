import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BETM3 Creator Flow Tests", function () {
  // Contracts
  let bettingManagerFactory: any;
  let mockToken: any;
  let bettingContract: any;
  
  // Signers
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;
  let participant1: SignerWithAddress;
  let participant2: SignerWithAddress;
  
  // Constants
  const MIN_STAKE = ethers.parseUnits("10", 18); // 10 tokens
  const INITIAL_MINT = ethers.parseUnits("1000", 18); // 1000 tokens
  
  beforeEach(async function () {
    // Get signers
    [owner, creator, participant1, participant2] = await ethers.getSigners();
    
    // Deploy MockToken
    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    mockToken = await MockTokenFactory.deploy();
    
    // Mint tokens to test accounts
    await mockToken.mint(creator.address, INITIAL_MINT);
    await mockToken.mint(participant1.address, INITIAL_MINT);
    await mockToken.mint(participant2.address, INITIAL_MINT);
    
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
    await mockToken.connect(participant1).approve(bettingContractAddress, INITIAL_MINT);
    await mockToken.connect(participant2).approve(bettingContractAddress, INITIAL_MINT);
  });
  
  describe("Bet Creation", function() {
    it("Creator should be able to set up a new bet with custom parameters", async function() {
      const betCondition = "Custom condition for test";
      const durationDays = 14; // custom duration
      const creatorStake = MIN_STAKE * 3n; // custom stake amount
      
      await bettingContract.connect(creator).createBet(
        creatorStake,
        betCondition,
        durationDays,
        true
      );
      
      const betDetails = await bettingContract.getBetDetails(0);
      expect(betDetails.creator).to.equal(creator.address);
      expect(betDetails.condition).to.equal(betCondition);
      
      // Check creator's token balance was reduced
      const creatorBalance = await mockToken.balanceOf(creator.address);
      expect(creatorBalance).to.equal(INITIAL_MINT - creatorStake);
    });
    
    it("Creator should be able to specify the condition description", async function() {
      const testConditions = [
        "Will ETH reach $5000 by the end of the month?",
        "Will the temperature exceed 30°C tomorrow?",
        "Will Team A win the championship?"
      ];
      
      for (let i = 0; i < testConditions.length; i++) {
        await bettingContract.connect(creator).createBet(
          MIN_STAKE,
          testConditions[i],
          7,
          true
        );
        
        const betDetails = await bettingContract.getBetDetails(i);
        expect(betDetails.condition).to.equal(testConditions[i]);
      }
    });
    
    it("Creator should be able to determine the duration of the bet", async function() {
      const testDurations = [1, 7, 30, 90]; // in days
      
      for (let i = 0; i < testDurations.length; i++) {
        await bettingContract.connect(creator).createBet(
          MIN_STAKE,
          `Test duration ${testDurations[i]} days`,
          testDurations[i],
          true
        );
        
        // We can't directly verify the expiration time as it's not returned by getBetDetails
        // but we can test if we can join just before expiration
        
        // Fast-forward almost to expiration
        await ethers.provider.send("evm_increaseTime", [testDurations[i] * 24 * 60 * 60 - 60]); // duration - 1 minute
        await ethers.provider.send("evm_mine", []);
        
        // Should be able to join
        await bettingContract.connect(participant1).joinBet(i, MIN_STAKE, false);
        
        // Fast-forward past expiration
        await ethers.provider.send("evm_increaseTime", [120]); // +2 minutes
        await ethers.provider.send("evm_mine", []);
        
        // Should not be able to join
        await expect(
          bettingContract.connect(participant2).joinBet(i, MIN_STAKE, false)
        ).to.be.revertedWith("Bet has already expired");
      }
    });
    
    it("Creator should be required to place an initial stake", async function() {
      // Try to create a bet with stake below minimum
      await expect(
        bettingContract.connect(creator).createBet(
          MIN_STAKE - 1n,
          "Test minimum stake",
          7,
          true
        )
      ).to.be.revertedWith("Stake is below minimum requirement");
      
      // Should work with minimum stake
      await bettingContract.connect(creator).createBet(
        MIN_STAKE,
        "Test minimum stake",
        7,
        true
      );
    });
  });
  
  describe("Creator Participation", function() {
    beforeEach(async function() {
      // Create a bet for this test group
      await bettingContract.connect(creator).createBet(
        MIN_STAKE,
        "Creator participation test",
        7,
        true // creator predicts true
      );
      
      // Have other participants join
      await bettingContract.connect(participant1).joinBet(0, MIN_STAKE, true);
      await bettingContract.connect(participant2).joinBet(0, MIN_STAKE, false);
      
      // Add yield tokens to the contract
      const totalStake = MIN_STAKE * 3n; // creator + participant1 + participant2
      const yieldAmount = (totalStake * 5n) / 100n; // 5% yield
      await mockToken.mint(await bettingContract.getAddress(), yieldAmount);
    });
    
    it("Creator should be treated as a regular participant for their bet", async function() {
      // Check creator's stake is recorded
      const creatorStake = await bettingContract.getParticipantStake(0, creator.address);
      expect(creatorStake).to.equal(MIN_STAKE);
      
      // Fast-forward to expiration
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // Creator should be able to vote like other participants
      await bettingContract.connect(creator).submitResolutionOutcome(0, true);
      
      // Creator can't vote again
      await expect(
        bettingContract.connect(creator).submitResolutionOutcome(0, true)
      ).to.be.revertedWith("Participant already voted");
    });
    
    it("Creator should receive payouts according to the same rules as other participants", async function() {
      // Fast-forward to expiration
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // Record balances before resolution
      const creatorBalanceBefore = await mockToken.balanceOf(creator.address);
      const participant1BalanceBefore = await mockToken.balanceOf(participant1.address);
      
      // Admin resolves with true outcome (creator and participant1 win)
      // Use creator instead of owner since creator is the owner of the betting contract
      await bettingContract.connect(creator).adminFinalizeResolution(0, true, false);
      
      // Check balances after resolution
      const creatorBalanceAfter = await mockToken.balanceOf(creator.address);
      const participant1BalanceAfter = await mockToken.balanceOf(participant1.address);
      
      // Both should get more than their stake back as winners
      expect(creatorBalanceAfter).to.be.gt(creatorBalanceBefore);
      expect(participant1BalanceAfter).to.be.gt(participant1BalanceBefore);
      
      // Since they had equal stakes, their profits should be approximately equal
      const creatorProfit = creatorBalanceAfter - creatorBalanceBefore;
      const participant1Profit = participant1BalanceAfter - participant1BalanceBefore;
      
      // Allow for small rounding differences
      const difference = creatorProfit > participant1Profit 
        ? creatorProfit - participant1Profit 
        : participant1Profit - creatorProfit;
      
      expect(difference).to.be.lt(ethers.parseUnits("0.1", 18)); // difference less than 0.1 tokens
    });
    
    it("Creator should be able to vote during resolution like other participants", async function() {
      // Set up a bet with supermajority of stake on true side (creator + participant1)
      await bettingContract.connect(creator).createBet(
        MIN_STAKE * 4n, // 80% of total stake
        "Supermajority test",
        1,
        true
      );
      
      await bettingContract.connect(participant1).joinBet(1, MIN_STAKE, false);
      
      // Add yield tokens to the contract
      const totalStake = (MIN_STAKE * 4n) + MIN_STAKE; // creator + participant1
      const yieldAmount = (totalStake * 5n) / 100n; // 5% yield
      await mockToken.mint(await bettingContract.getAddress(), yieldAmount);
      
      // Fast-forward to expiration
      await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // Creator votes
      await bettingContract.connect(creator).submitResolutionOutcome(1, true);
      
      // Fast-forward past resolution period
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // Should be able to finalize with a supermajority
      await bettingContract.finalizeResolution(1);
      
      // Check outcome
      const betDetails = await bettingContract.getBetDetails(1);
      expect(betDetails.resolved).to.be.true;
      expect(betDetails.winningOutcome).to.be.true;
    });
  });
}); 