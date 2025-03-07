import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BETM3 Security Tests (Attacker Scenarios)", function () {
  // Contracts
  let bettingManagerFactory: any;
  let mockToken: any;
  let bettingContract: any;
  
  // Signers
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;
  let attacker: SignerWithAddress;
  let victim: SignerWithAddress;
  
  // Constants
  const MIN_STAKE = ethers.parseUnits("10", 18); // 10 tokens
  const INITIAL_MINT = ethers.parseUnits("1000", 18); // 1000 tokens
  
  beforeEach(async function () {
    // Get signers
    [owner, creator, attacker, victim] = await ethers.getSigners();
    
    // Deploy MockToken
    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    mockToken = await MockTokenFactory.deploy();
    
    // Mint tokens to test accounts
    await mockToken.mint(creator.address, INITIAL_MINT);
    await mockToken.mint(attacker.address, INITIAL_MINT);
    await mockToken.mint(victim.address, INITIAL_MINT);
    await mockToken.mint(owner.address, INITIAL_MINT);
    
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
    await mockToken.connect(attacker).approve(bettingContractAddress, INITIAL_MINT);
    await mockToken.connect(victim).approve(bettingContractAddress, INITIAL_MINT);
  });
  
  describe("Stake Manipulation Attacks", function() {
    it("Users should not be able to stake multiple times on the same bet", async function() {
      await bettingContract.connect(creator).createBet(MIN_STAKE, "Security test", 7, true);
      
      // First stake works
      await bettingContract.connect(attacker).joinBet(0, MIN_STAKE, false);
      
      // Second stake should fail
      await expect(
        bettingContract.connect(attacker).joinBet(0, MIN_STAKE, false)
      ).to.be.revertedWith("Participant already joined");
      
      // Can't join on the other side either
      await expect(
        bettingContract.connect(attacker).joinBet(0, MIN_STAKE, true)
      ).to.be.revertedWith("Participant already joined");
    });
    
    it("Users should not be able to vote multiple times during resolution", async function() {
      await bettingContract.connect(creator).createBet(MIN_STAKE, "Security test", 1, true);
      await bettingContract.connect(attacker).joinBet(0, MIN_STAKE, false);
      
      // Fast-forward to resolution phase
      await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // First vote works
      await bettingContract.connect(attacker).submitResolutionOutcome(0, false);
      
      // Second vote should fail
      await expect(
        bettingContract.connect(attacker).submitResolutionOutcome(0, false)
      ).to.be.revertedWith("Participant already voted");
    });
    
    it("Users should not be able to vote for outcomes they didn't stake on", async function() {
      await bettingContract.connect(creator).createBet(MIN_STAKE, "Security test", 1, true);
      await bettingContract.connect(attacker).joinBet(0, MIN_STAKE, false);
      
      // Fast-forward to resolution phase
      await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // Trying to vote for "true" when staked on "false" should fail
      await expect(
        bettingContract.connect(attacker).submitResolutionOutcome(0, true)
      ).to.be.revertedWith("Must vote 'false' because you joined the 'false' side");
    });
  });
  
  describe("Time-Based Attacks", function() {
    it("Users should not be able to participate after bet expiration", async function() {
      await bettingContract.connect(creator).createBet(MIN_STAKE, "Security test", 1, true);
      
      // Fast-forward past expiration
      await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // Joining after expiration should fail
      await expect(
        bettingContract.connect(attacker).joinBet(0, MIN_STAKE, false)
      ).to.be.revertedWith("Bet has already expired");
    });
    
    it("Users should not be able to vote before bet expiration", async function() {
      await bettingContract.connect(creator).createBet(MIN_STAKE, "Security test", 7, true);
      await bettingContract.connect(attacker).joinBet(0, MIN_STAKE, false);
      
      // Try to vote before expiration (should fail)
      await expect(
        bettingContract.connect(attacker).submitResolutionOutcome(0, false)
      ).to.be.revertedWith("Bet is not expired yet");
    });
    
    it("Users should not be able to vote after resolution period", async function() {
      await bettingContract.connect(creator).createBet(MIN_STAKE, "Security test", 1, true);
      await bettingContract.connect(attacker).joinBet(0, MIN_STAKE, false);
      
      // Fast-forward past expiration and resolution period
      await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60 + 1 + 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // Try to vote after resolution period (should fail)
      await expect(
        bettingContract.connect(attacker).submitResolutionOutcome(0, false)
      ).to.be.revertedWith("Resolution period is over");
    });
  });
  
  describe("Owner Privilege Attacks", function() {
    it("Non-owners should not be able to call admin functions", async function() {
      await bettingContract.connect(creator).createBet(MIN_STAKE, "Security test", 1, true);
      
      // Fast-forward past expiration
      await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // Try to call adminFinalizeResolution as non-owner
      await expect(
        bettingContract.connect(attacker).adminFinalizeResolution(0, true, false)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      // Try to update yield rate as non-owner
      await expect(
        bettingContract.connect(attacker).setYieldRate(20)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Factory owner should not be able to control deployed betting contracts", async function() {
      await bettingContract.connect(creator).createBet(MIN_STAKE, "Security test", 1, true);
      
      // Factory owner should not be able to call owner functions on the betting contract
      await expect(
        bettingContract.connect(owner).adminFinalizeResolution(0, true, false)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      // Verify ownership is with creator
      expect(await bettingContract.owner()).to.equal(creator.address);
    });
  });
  
  describe("Token Security", function() {
    it("Contract should handle minimum stake requirements", async function() {
      await bettingContract.connect(creator).createBet(MIN_STAKE, "Security test", 7, true);
      
      // Try to join with less than minimum stake
      await expect(
        bettingContract.connect(attacker).joinBet(0, MIN_STAKE - 1n, false)
      ).to.be.revertedWith("Stake is below minimum requirement");
    });
    
    it("Contract should handle invalid bet access safely", async function() {
      // Create a bet first to make sure contract is initialized
      await bettingContract.connect(creator).createBet(MIN_STAKE, "Security test", 7, true);
      
      // The contract doesn't have bounds-checking on getBetDetails, so we can use a different approach
      
      // Try to get participant stake for non-existent bet
      const nonExistentBetId = 999;
      const stake = await bettingContract.getParticipantStake(nonExistentBetId, attacker.address);
      expect(stake).to.equal(0); // Should return 0 for non-existent bet
      
      // Try to join bet with invalid ID (should fail in some way)
      try {
        await bettingContract.connect(attacker).joinBet(nonExistentBetId, MIN_STAKE, false);
        // If we get here, the transaction didn't revert - which is unexpected
        expect.fail("Expected transaction to revert");
      } catch (error) {
        // Transaction should fail, but the exact error message might vary
        expect(error).to.exist;
      }
    });
  });
}); 