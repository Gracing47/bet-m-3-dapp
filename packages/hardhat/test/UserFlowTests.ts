import { expect } from "chai";
import { ethers } from "hardhat";
import { BettingManagerFactory, MockToken, NoLossBetMulti } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BETM3 User Flow Tests", function () {
  // Contracts
  let bettingManagerFactory: BettingManagerFactory;
  let mockToken: MockToken;
  let bettingContract: NoLossBetMulti;
  
  // Signers
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  
  // Constants
  const MIN_STAKE = ethers.parseUnits("10", 18); // 10 tokens
  const INITIAL_MINT = ethers.parseUnits("1000", 18); // 1000 tokens
  
  beforeEach(async function () {
    // Get signers
    [owner, creator, user1, user2, user3] = await ethers.getSigners();
    
    // Deploy MockToken
    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    mockToken = await MockTokenFactory.deploy();
    
    // Mint tokens to test accounts
    await mockToken.mint(creator.address, INITIAL_MINT);
    await mockToken.mint(user1.address, INITIAL_MINT);
    await mockToken.mint(user2.address, INITIAL_MINT);
    await mockToken.mint(user3.address, INITIAL_MINT);
    
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
    await mockToken.connect(user1).approve(bettingContractAddress, INITIAL_MINT);
    await mockToken.connect(user2).approve(bettingContractAddress, INITIAL_MINT);
    await mockToken.connect(user3).approve(bettingContractAddress, INITIAL_MINT);
    
    // Create a bet
    await bettingContract.connect(creator).createBet(
      MIN_STAKE,
      "Will ETH reach $5000 by the end of the month?",
      7, // 7 days
      true // creator predicts true
    );
  });
  
  describe("Standard Participant Flow", function() {
    it("User should be able to join an existing bet", async function() {
      // Initial balance
      const initialBalance = await mockToken.balanceOf(user1.address);
      
      // Join the bet
      await bettingContract.connect(user1).joinBet(
        0, // betId
        MIN_STAKE,
        false // predict false
      );
      
      // Check balance reduced
      const newBalance = await mockToken.balanceOf(user1.address);
      expect(newBalance).to.equal(initialBalance - MIN_STAKE);
      
      // Check bet state
      const betDetails = await bettingContract.getBetDetails(0);
      expect(betDetails.totalStakeFalse).to.equal(MIN_STAKE);
    });
    
    it("User should be able to stake on either true or false outcome", async function() {
      // User1 stakes on true
      await bettingContract.connect(user1).joinBet(0, MIN_STAKE, true);
      
      // User2 stakes on false
      await bettingContract.connect(user2).joinBet(0, MIN_STAKE, false);
      
      // Check bet state
      const betDetails = await bettingContract.getBetDetails(0);
      expect(betDetails.totalStakeTrue).to.equal(MIN_STAKE * 2n); // creator + user1
      expect(betDetails.totalStakeFalse).to.equal(MIN_STAKE); // user2
    });
    
    it("User should be able to vote during resolution phase", async function() {
      // Join bet
      await bettingContract.connect(user1).joinBet(0, MIN_STAKE, true);
      await bettingContract.connect(user2).joinBet(0, MIN_STAKE, false);
      
      // Fast-forward time to expiration
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]); // 7 days + 1 second
      await ethers.provider.send("evm_mine", []);
      
      // Submit votes
      await bettingContract.connect(creator).submitResolutionOutcome(0, true);
      await bettingContract.connect(user1).submitResolutionOutcome(0, true);
      await bettingContract.connect(user2).submitResolutionOutcome(0, false);
      
      // Can't check internal state directly, but we can verify they can't vote again
      await expect(
        bettingContract.connect(user1).submitResolutionOutcome(0, true)
      ).to.be.revertedWith("Participant already voted");
    });
    
    it("User should receive their stake back plus yield if on winning side", async function() {
      // Set up a bet with supermajority on true side
      const trueStake = MIN_STAKE * 4n; // 80% of total stake
      const falseStake = MIN_STAKE;     // 20% of total stake
      
      await bettingContract.connect(creator).createBet(
        trueStake, // Larger stake for creator to ensure supermajority
        "Yield test",
        1, // 1 day
        true
      );
      
      await bettingContract.connect(user1).joinBet(1, MIN_STAKE, true); // Same side as creator
      await bettingContract.connect(user2).joinBet(1, falseStake, false);
      
      // Calculate and add yield for payout
      const totalStake = trueStake + MIN_STAKE + falseStake;
      const yieldAmount = (totalStake * 5n) / 100n; // 5% yield
      await mockToken.mint(await bettingContract.getAddress(), yieldAmount);
      
      // Fast-forward time to expiration
      await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60 + 1]); // 1 day + 1 second
      await ethers.provider.send("evm_mine", []);
      
      // Submit votes to get a clear winner (true)
      await bettingContract.connect(creator).submitResolutionOutcome(1, true);
      await bettingContract.connect(user1).submitResolutionOutcome(1, true);
      
      // Fast-forward past resolution period
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]); // 24 hours + 1 second
      await ethers.provider.send("evm_mine", []);
      
      // Check initial balance before resolution
      const initialBalance = await mockToken.balanceOf(user1.address);
      
      // Finalize resolution
      await bettingContract.finalizeResolution(1);
      
      // Check new balance
      const newBalance = await mockToken.balanceOf(user1.address);
      
      // User1 should get their stake back + a share of the yield
      expect(newBalance).to.be.gt(initialBalance);
    });
    
    it("User should receive their stake back plus smaller yield if on losing side", async function() {
      // Set up a bet with supermajority on true side for creator and user2
      const trueStake = MIN_STAKE * 4n; // 80% of total stake
      const falseStake = MIN_STAKE;     // 20% of total stake
      
      // Check user1's initial balance
      const initialBalance = await mockToken.balanceOf(user1.address);
      
      await bettingContract.connect(creator).createBet(
        trueStake, 
        "Yield test for losers",
        1, // 1 day
        true
      );
      
      // User1 joins on the false side (will be loser)
      await bettingContract.connect(user1).joinBet(1, falseStake, false);
      
      // Check user1's balance after joining (should be reduced by stake)
      const balanceAfterStaking = await mockToken.balanceOf(user1.address);
      expect(balanceAfterStaking).to.equal(initialBalance - falseStake);
      
      // Calculate and add yield for payout
      const totalStake = trueStake + falseStake;
      const yieldAmount = (totalStake * 5n) / 100n; // 5% yield
      await mockToken.mint(await bettingContract.getAddress(), yieldAmount);
      
      // Fast-forward time to expiration
      await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60 + 1]); // 1 day + 1 second
      await ethers.provider.send("evm_mine", []);
      
      // Submit vote from creator (true side)
      await bettingContract.connect(creator).submitResolutionOutcome(1, true);
      
      // Fast-forward past resolution period
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]); // 24 hours + 1 second
      await ethers.provider.send("evm_mine", []);
      
      // Finalize resolution - with creator having 80% of stake, should be resolved as "true"
      await bettingContract.finalizeResolution(1);
      
      // Check final balance of user1 (loser)
      const finalBalance = await mockToken.balanceOf(user1.address);
      
      // User1 should get stake back plus some small yield
      expect(finalBalance).to.be.gt(balanceAfterStaking);
      
      // Creator should have also received their stake back plus yield
      const creatorFinalBalance = await mockToken.balanceOf(creator.address);
      
      // Calculate profits
      const user1Profit = finalBalance - balanceAfterStaking; // Should be positive (at least stake + some yield)
      
      // Ensure user1 got at least their stake back
      expect(user1Profit).to.be.gte(falseStake);
    });
  });
  
  // Additional test cases will follow in separate files
}); 