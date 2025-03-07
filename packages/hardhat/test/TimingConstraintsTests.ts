import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BETM3 Timing Constraints Tests", function () {
  // Contracts
  let bettingManagerFactory: any;
  let mockToken: any;
  let bettingContract: any;
  
  // Signers
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  
  // Constants
  const MIN_STAKE = ethers.parseUnits("10", 18); // 10 tokens
  const INITIAL_MINT = ethers.parseUnits("1000", 18); // 1000 tokens
  
  beforeEach(async function () {
    // Get signers
    [owner, creator, user1, user2] = await ethers.getSigners();
    
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
      "Timing test bet",
      7, // 7 days
      true
    );
  });
  
  it("Users should not be able to join after bet expiration", async function() {
    // Fast-forward time to after expiration
    await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]); // 7 days + 1 second
    await ethers.provider.send("evm_mine", []);
    
    // Try to join bet after expiration
    await expect(
      bettingContract.connect(user1).joinBet(0, MIN_STAKE, true)
    ).to.be.revertedWith("Bet has already expired");
  });
  
  it("Users should only be able to vote during resolution period", async function() {
    await bettingContract.connect(user1).joinBet(0, MIN_STAKE, true);
    
    // Try to vote before expiration (should fail)
    await expect(
      bettingContract.connect(creator).submitResolutionOutcome(0, true)
    ).to.be.revertedWith("Bet is not expired yet");
    
    // Fast-forward time to expiration
    await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]); // 7 days + 1 second
    await ethers.provider.send("evm_mine", []);
    
    // Should be able to vote during resolution period
    await bettingContract.connect(creator).submitResolutionOutcome(0, true);
    
    // Fast-forward time past resolution period
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]); // 24 hours + 1 second
    await ethers.provider.send("evm_mine", []);
    
    // Try to vote after resolution period (should fail)
    await expect(
      bettingContract.connect(user1).submitResolutionOutcome(0, true)
    ).to.be.revertedWith("Resolution period is over");
  });
  
  it("System should enforce correct phase transitions", async function() {
    // Phase 1: Betting phase
    await bettingContract.connect(user1).joinBet(0, MIN_STAKE, false);
    
    // Cannot finalize during betting phase
    await expect(
      bettingContract.finalizeResolution(0)
    ).to.be.revertedWith("Resolution period is not finished yet");
    
    // Calculate and add yield for payout
    const totalStake = MIN_STAKE * 2n; // creator + user1
    const yieldAmount = (totalStake * 5n) / 100n; // 5% yield
    await mockToken.mint(await bettingContract.getAddress(), yieldAmount);
    
    // Fast-forward to resolution phase
    await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);
    await ethers.provider.send("evm_mine", []);
    
    // Phase 2: Resolution phase
    await bettingContract.connect(creator).submitResolutionOutcome(0, true);
    await bettingContract.connect(user1).submitResolutionOutcome(0, false);
    
    // Cannot finalize during voting period
    await expect(
      bettingContract.finalizeResolution(0)
    ).to.be.revertedWith("Resolution period is not finished yet");
    
    // Fast-forward past resolution period
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
    await ethers.provider.send("evm_mine", []);
    
    // Phase 3: Finalization phase
    // With evenly split votes, we expect the supermajority check to fail
    await expect(
      bettingContract.finalizeResolution(0)
    ).to.be.revertedWith("No supermajority reached; admin resolution required");
    
    // Admin can finalize
    await bettingContract.connect(creator).adminFinalizeResolution(0, true, false); // Use adminFinalizeResolution instead
    
    // Check that the bet is now resolved
    const betDetails = await bettingContract.getBetDetails(0);
    expect(betDetails.resolved).to.be.true;
    expect(betDetails.resolutionFinalized).to.be.true;
    
    // Cannot finalize again
    await expect(
      bettingContract.connect(creator).adminFinalizeResolution(0, true, false)
    ).to.be.revertedWith("Resolution has already been finalized");
  });
}); 