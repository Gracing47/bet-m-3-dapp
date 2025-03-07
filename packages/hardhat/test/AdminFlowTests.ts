import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BETM3 Admin Flow Tests", function () {
  // Contracts
  let bettingManagerFactory: any;
  let mockToken: any;
  let bettingContract: any;
  
  // Signers
  let owner: SignerWithAddress;
  let newOwner: SignerWithAddress;
  let creator: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  
  // Constants
  const MIN_STAKE = ethers.parseUnits("10", 18);
  const INITIAL_MINT = ethers.parseUnits("1000", 18);
  
  beforeEach(async function () {
    // Get signers
    [owner, newOwner, creator, user1, user2] = await ethers.getSigners();
    
    // Deploy MockToken
    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    mockToken = await MockTokenFactory.deploy();
    
    // Mint tokens to test accounts
    await mockToken.mint(creator.address, INITIAL_MINT);
    await mockToken.mint(user1.address, INITIAL_MINT);
    await mockToken.mint(user2.address, INITIAL_MINT);
    
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
    
    // Create a bet
    await bettingContract.connect(creator).createBet(
      MIN_STAKE,
      "Admin test bet",
      7,
      true
    );
    
    // Add participants
    await bettingContract.connect(user1).joinBet(0, MIN_STAKE, true);
    await bettingContract.connect(user2).joinBet(0, MIN_STAKE, false);
  });
  
  describe("Factory Admin", function() {
    it("Owner should be able to transfer factory ownership", async function() {
      // Check initial owner
      expect(await bettingManagerFactory.owner()).to.equal(owner.address);
      
      // Transfer ownership
      await bettingManagerFactory.connect(owner).transferOwnership(newOwner.address);
      
      // Check new owner
      expect(await bettingManagerFactory.owner()).to.equal(newOwner.address);
      
      // Old owner can't perform admin actions
      await expect(
        bettingManagerFactory.connect(owner).transferOwnership(creator.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      // New owner can perform admin actions
      await bettingManagerFactory.connect(newOwner).transferOwnership(creator.address);
      expect(await bettingManagerFactory.owner()).to.equal(creator.address);
    });
    
    it("New betting contracts should transfer ownership to the creator", async function() {
      // Check that bettingContract is owned by the creator
      expect(await bettingContract.owner()).to.equal(creator.address);
      
      // Create another contract and verify ownership
      await bettingManagerFactory.connect(user1).createBettingContract(await mockToken.getAddress());
      const newContractAddress = await bettingManagerFactory.getBettingContract(1);
      const newContract = await ethers.getContractAt("NoLossBetMulti", newContractAddress);
      
      expect(await newContract.owner()).to.equal(user1.address);
    });
  });
  
  describe("Bet Resolution Admin", function() {
    beforeEach(async function() {
      // Calculate total stake for yield
      const totalStake = MIN_STAKE * 3n; // creator + user1 + user2
      const yieldAmount = (totalStake * 5n) / 100n; // 5% yield
      
      // Add yield to the contract
      await mockToken.mint(await bettingContract.getAddress(), yieldAmount);
      
      // Fast-forward to after bet expiration
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // Submit votes but not sufficient for supermajority
      await bettingContract.connect(creator).submitResolutionOutcome(0, true);
      await bettingContract.connect(user1).submitResolutionOutcome(0, true);
      await bettingContract.connect(user2).submitResolutionOutcome(0, false);
      
      // Fast-forward past resolution period
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);
    });
    
    it("Owner should be able to finalize a bet when no supermajority is reached", async function() {
      // Try to finalize without admin - should fail
      await expect(
        bettingContract.finalizeResolution(0)
      ).to.be.revertedWith("No supermajority reached; admin resolution required");
      
      // Owner finalizes
      await bettingContract.connect(creator).adminFinalizeResolution(0, true, false);
      
      // Check bet is resolved
      const betDetails = await bettingContract.getBetDetails(0);
      expect(betDetails.resolved).to.be.true;
      expect(betDetails.resolutionFinalized).to.be.true;
    });
    
    it("Owner should be able to determine the winning outcome manually", async function() {
      // Resolve as true
      await bettingContract.connect(creator).adminFinalizeResolution(0, true, false);
      
      // Check outcome
      let betDetails = await bettingContract.getBetDetails(0);
      expect(betDetails.winningOutcome).to.be.true;
      
      // Create a new bet
      await bettingContract.connect(creator).createBet(
        MIN_STAKE,
        "Second admin test bet",
        7,
        true
      );
      
      // Add participants
      await bettingContract.connect(user1).joinBet(1, MIN_STAKE, true);
      await bettingContract.connect(user2).joinBet(1, MIN_STAKE, false);
      
      // Calculate total stake for yield for second bet
      const totalStake2 = MIN_STAKE * 3n; // creator + user1 + user2
      const yieldAmount2 = (totalStake2 * 5n) / 100n; // 5% yield
      
      // Add yield to the contract for the second bet
      await mockToken.mint(await bettingContract.getAddress(), yieldAmount2);
      
      // Fast-forward
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      
      // Resolve as false
      await bettingContract.connect(creator).adminFinalizeResolution(1, false, false);
      
      // Check outcome
      betDetails = await bettingContract.getBetDetails(1);
      expect(betDetails.winningOutcome).to.be.false;
    });
    
    it("Owner should be able to cancel a bet and return all stakes", async function() {
      // Record balances before cancellation
      const creatorBalanceBefore = await mockToken.balanceOf(creator.address);
      const user1BalanceBefore = await mockToken.balanceOf(user1.address);
      const user2BalanceBefore = await mockToken.balanceOf(user2.address);
      
      // Cancel the bet
      await bettingContract.connect(creator).adminFinalizeResolution(0, false, true);
      
      // Check balances after cancellation - everyone should get exactly their stake back
      const creatorBalanceAfter = await mockToken.balanceOf(creator.address);
      const user1BalanceAfter = await mockToken.balanceOf(user1.address);
      const user2BalanceAfter = await mockToken.balanceOf(user2.address);
      
      expect(creatorBalanceAfter).to.equal(creatorBalanceBefore + MIN_STAKE);
      expect(user1BalanceAfter).to.equal(user1BalanceBefore + MIN_STAKE);
      expect(user2BalanceAfter).to.equal(user2BalanceBefore + MIN_STAKE);
    });
    
    it("Owner should be able to adjust the yield rate", async function() {
      // Check initial yield rate
      expect(await bettingContract.yieldRate()).to.equal(5);
      
      // Update yield rate
      await bettingContract.connect(creator).setYieldRate(10);
      
      // Check updated yield rate
      expect(await bettingContract.yieldRate()).to.equal(10);
      
      // Non-owner can't update yield rate
      await expect(
        bettingContract.connect(user1).setYieldRate(15)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
  
  describe("Emergency Scenarios", function() {
    it("Owner should be able to handle exceptional circumstances", async function() {
      // Create a new bet with no participants
      await bettingContract.connect(creator).createBet(
        MIN_STAKE,
        "Emergency test bet",
        1, // 1 day
        true
      );
      
      // Fast-forward past expiration
      await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      
      // Cancel the bet even without participants
      await bettingContract.connect(creator).adminFinalizeResolution(1, false, true);
      
      // Check bet is resolved
      const betDetails = await bettingContract.getBetDetails(1);
      expect(betDetails.resolved).to.be.true;
      expect(betDetails.resolutionFinalized).to.be.true;
    });
    
    it("System should handle admin intervention correctly", async function() {
      // Create a bet with all participants on one side
      await bettingContract.connect(creator).createBet(
        MIN_STAKE,
        "One-sided bet",
        7,
        true
      );
      
      await bettingContract.connect(user1).joinBet(1, MIN_STAKE, true);
      await bettingContract.connect(user2).joinBet(1, MIN_STAKE, true);
      
      // Calculate total stake for yield
      const totalStake = MIN_STAKE * 3n; // creator + user1 + user2
      const yieldAmount = (totalStake * 5n) / 100n; // 5% yield
      
      // Add yield to the contract for the second bet
      await mockToken.mint(await bettingContract.getAddress(), yieldAmount);
      
      // Fast-forward past expiration and resolution
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      
      // Admin can resolve in favor of the side with no participants
      await bettingContract.connect(creator).adminFinalizeResolution(1, false, false);
      
      // Check outcome
      const betDetails = await bettingContract.getBetDetails(1);
      expect(betDetails.winningOutcome).to.be.false;
      
      // All participants should still get something back
      const user1Balance = await mockToken.balanceOf(user1.address);
      expect(user1Balance).to.be.gte(INITIAL_MINT - MIN_STAKE); // At least get stake back
    });
  });
}); 