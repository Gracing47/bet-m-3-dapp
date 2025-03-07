import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("NoLossBetMulti Advanced Base Tests", function () {
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
    await mockToken.mint(owner.address, INITIAL_MINT); // Make sure factory owner has tokens
    
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
  
  it("submitResolutionOutcome: Should register a user's vote correctly", async function() {
    // Create a bet with participants
    await bettingContract.connect(creator).createBet(MIN_STAKE, "Test resolution", 1, true);
    await bettingContract.connect(participant1).joinBet(0, MIN_STAKE, true);
    await bettingContract.connect(participant2).joinBet(0, MIN_STAKE, false);
    
    // Fast-forward time to expire the bet
    await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60 + 1]); // 1 day + 1 second
    await ethers.provider.send("evm_mine", []);
    
    // Submit votes
    await bettingContract.connect(creator).submitResolutionOutcome(0, true);
    await bettingContract.connect(participant1).submitResolutionOutcome(0, true);
    
    // Verify they can't vote again
    await expect(
      bettingContract.connect(creator).submitResolutionOutcome(0, true)
    ).to.be.revertedWith("Participant already voted");
    
    // Verify participant2 can't vote for the wrong side
    await expect(
      bettingContract.connect(participant2).submitResolutionOutcome(0, true)
    ).to.be.revertedWith("Must vote 'false' because you joined the 'false' side");
  });
  
  it("adminFinalizeResolution: Should allow the owner to cancel a bet", async function() {
    // Create a bet with participants
    await bettingContract.connect(creator).createBet(MIN_STAKE, "Admin resolution test", 1, true);
    await bettingContract.connect(participant1).joinBet(0, MIN_STAKE, false);
    
    // Fast-forward time to expire the bet
    await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60 + 1]);
    await ethers.provider.send("evm_mine", []);
    
    // Record balances before cancellation
    const creatorBalanceBefore = await mockToken.balanceOf(creator.address);
    const participant1BalanceBefore = await mockToken.balanceOf(participant1.address);
    
    // Cancel bet
    await bettingContract.connect(creator).adminFinalizeResolution(0, false, true); // cancel = true
    
    // Check bet is resolved
    const betDetails = await bettingContract.getBetDetails(0);
    expect(betDetails.resolved).to.be.true;
    expect(betDetails.resolutionFinalized).to.be.true;
    
    // Check balances after cancellation
    const creatorBalanceAfter = await mockToken.balanceOf(creator.address);
    const participant1BalanceAfter = await mockToken.balanceOf(participant1.address);
    
    // All participants should get exactly their stake back
    expect(creatorBalanceAfter).to.equal(creatorBalanceBefore + MIN_STAKE);
    expect(participant1BalanceAfter).to.equal(participant1BalanceBefore + MIN_STAKE);
  });
  
  it("adminFinalizeResolution: Should allow the owner to resolve a bet with yield", async function() {
    // Create a bet with participants
    const betId = 0;
    await bettingContract.connect(creator).createBet(MIN_STAKE, "Admin resolve test", 1, true);
    await bettingContract.connect(participant1).joinBet(betId, MIN_STAKE, false);
    
    // Calculate yield amount (5% of total stakes)
    const totalStake = MIN_STAKE * 2n; // creator + participant1
    const yieldAmount = (totalStake * 5n) / 100n; // 5% yield
    
    // Add extra tokens to contract for yield
    await mockToken.mint(await bettingContract.getAddress(), yieldAmount);
    
    // Fast-forward time
    await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]); // 2 days
    await ethers.provider.send("evm_mine", []);
    
    // Record balances before resolution
    const creatorBalanceBefore = await mockToken.balanceOf(creator.address);
    const participant1BalanceBefore = await mockToken.balanceOf(participant1.address);
    
    // Force resolve to "true" (creator wins)
    await bettingContract.connect(creator).adminFinalizeResolution(betId, true, false);
    
    // Check bet is resolved with correct outcome
    const betDetails = await bettingContract.getBetDetails(betId);
    expect(betDetails.resolved).to.be.true;
    expect(betDetails.resolutionFinalized).to.be.true;
    expect(betDetails.winningOutcome).to.be.true;
    
    // Check balances after resolution
    const creatorBalanceAfter = await mockToken.balanceOf(creator.address);
    const participant1BalanceAfter = await mockToken.balanceOf(participant1.address);
    
    // All participants should get at least their stake back
    expect(creatorBalanceAfter).to.be.gt(creatorBalanceBefore);
    expect(participant1BalanceAfter).to.be.gt(participant1BalanceBefore);
    
    // Creator should get more as winner
    const creatorProfit = creatorBalanceAfter - creatorBalanceBefore;
    const participant1Profit = participant1BalanceAfter - participant1BalanceBefore;
    expect(creatorProfit).to.be.gt(participant1Profit);
  });
  
  it("finalizeResolution: Should properly resolve a bet with sufficient consensus", async function() {
    // Create a bet with uneven stakes to ensure supermajority
    const betId = 0;
    
    // Set 80% of stake on true side
    const trueStake = MIN_STAKE * 4n; // 80% of total stake
    const falseStake = MIN_STAKE;     // 20% of total stake
    
    await bettingContract.connect(creator).createBet(trueStake, "Supermajority test", 1, true);
    await bettingContract.connect(participant1).joinBet(betId, falseStake, false);
    
    // Calculate yield amount (5% of total stakes)
    const totalStake = trueStake + falseStake;
    const yieldAmount = (totalStake * 5n) / 100n; // 5% yield
    
    // Add extra tokens to contract for yield
    await mockToken.mint(await bettingContract.getAddress(), yieldAmount);
    
    // Fast-forward time to expire the bet
    await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60 + 1]);
    await ethers.provider.send("evm_mine", []);
    
    // Have the true side vote
    await bettingContract.connect(creator).submitResolutionOutcome(betId, true);
    
    // Fast-forward time past resolution period
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
    await ethers.provider.send("evm_mine", []);
    
    // Store balances before resolution
    const creatorBalanceBefore = await mockToken.balanceOf(creator.address);
    const participant1BalanceBefore = await mockToken.balanceOf(participant1.address);
    
    // Finalize resolution - should succeed with true side having 80% of stake
    await bettingContract.finalizeResolution(betId);
    
    // Check bet is resolved with correct outcome
    const betDetails = await bettingContract.getBetDetails(betId);
    expect(betDetails.resolved).to.be.true;
    expect(betDetails.resolutionFinalized).to.be.true;
    expect(betDetails.winningOutcome).to.be.true;
    
    // Check balances after resolution
    const creatorBalanceAfter = await mockToken.balanceOf(creator.address);
    const participant1BalanceAfter = await mockToken.balanceOf(participant1.address);
    
    // All participants should get at least their stake back
    expect(creatorBalanceAfter).to.be.gt(creatorBalanceBefore);
    expect(participant1BalanceAfter).to.be.gt(participant1BalanceBefore);
    
    // Winners should get more than losers
    const creatorProfit = creatorBalanceAfter - creatorBalanceBefore;
    const participant1Profit = participant1BalanceAfter - participant1BalanceBefore;
    
    expect(creatorProfit).to.be.gt(participant1Profit);
  });
  
  it("setYieldRate: Should update the yield rate correctly", async function() {
    // Check initial yield rate
    expect(await bettingContract.yieldRate()).to.equal(5);
    
    // Update yield rate
    await bettingContract.connect(creator).setYieldRate(10);
    
    // Check updated yield rate
    expect(await bettingContract.yieldRate()).to.equal(10);
    
    // Non-owner should not be able to update yield rate
    await expect(
      bettingContract.connect(participant1).setYieldRate(20)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
  
  it("getBetDetails: Should return accurate bet information", async function() {
    // Create a bet
    const betCondition = "Test bet details";
    await bettingContract.connect(creator).createBet(MIN_STAKE, betCondition, 7, true);
    
    // Join the bet
    await bettingContract.connect(participant1).joinBet(0, MIN_STAKE, false);
    
    // Get and check bet details
    const betDetails = await bettingContract.getBetDetails(0);
    
    expect(betDetails.creator).to.equal(creator.address);
    expect(betDetails.condition).to.equal(betCondition);
    expect(betDetails.resolved).to.be.false;
    expect(betDetails.totalStakeTrue).to.equal(MIN_STAKE); // Creator's stake
    expect(betDetails.totalStakeFalse).to.equal(MIN_STAKE); // Participant1's stake
    expect(betDetails.resolutionFinalized).to.be.false;
  });
  
  it("No supermajority scenario: Should require admin intervention", async function() {
    // Create a bet with even stakes - nobody can win automatically
    const betId = 0;
    await bettingContract.connect(creator).createBet(MIN_STAKE, "Even stakes test", 1, true);
    await bettingContract.connect(participant1).joinBet(betId, MIN_STAKE, false);
    
    // Calculate yield amount (5% of total stakes)
    const totalStake = MIN_STAKE * 2n; // creator + participant1
    const yieldAmount = (totalStake * 5n) / 100n; // 5% yield
    
    // Add extra tokens to contract for yield
    await mockToken.mint(await bettingContract.getAddress(), yieldAmount);
    
    // Fast-forward time to expire the bet
    await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60 + 1]);
    await ethers.provider.send("evm_mine", []);
    
    // Have participants vote on different sides
    await bettingContract.connect(creator).submitResolutionOutcome(betId, true);
    await bettingContract.connect(participant1).submitResolutionOutcome(betId, false);
    
    // Fast-forward time past resolution period
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
    await ethers.provider.send("evm_mine", []);
    
    // This should fail because there's no supermajority by total stake
    // (each side has equal stake for this test)
    await expect(
      bettingContract.finalizeResolution(betId)
    ).to.be.revertedWith("No supermajority reached; admin resolution required");
    
    // Admin can still resolve
    await bettingContract.connect(creator).adminFinalizeResolution(betId, true, false);
    
    // Check bet is resolved
    const betDetails = await bettingContract.getBetDetails(betId);
    expect(betDetails.resolved).to.be.true;
    expect(betDetails.resolutionFinalized).to.be.true;
  });
}); 