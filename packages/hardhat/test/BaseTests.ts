import { expect } from "chai";
import { ethers } from "hardhat";
import { BettingManagerFactory, MockToken, NoLossBetMulti } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BETM3 Base Function Tests", function () {
  // Contracts
  let bettingManagerFactory: BettingManagerFactory;
  let mockToken: MockToken;
  let bettingContract: NoLossBetMulti;
  
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
  
  describe("BettingManagerFactory Tests", function() {
    it("createBettingContract: Should deploy a new NoLossBetMulti contract", async function() {
      // Create another betting contract
      const tx = await bettingManagerFactory.connect(creator).createBettingContract(await mockToken.getAddress());
      const receipt = await tx.wait();
      
      // Check the event was emitted
      const event = receipt?.logs[0];
      expect(event).to.not.be.undefined;
      
      // Get contracts count
      const count = await bettingManagerFactory.getBettingContractsCount();
      expect(count).to.equal(2);
    });
    
    it("getBettingContractsCount: Should return the correct number of contracts", async function() {
      // Initial count should be 1 from beforeEach
      let count = await bettingManagerFactory.getBettingContractsCount();
      expect(count).to.equal(1);
      
      // Create another and check count increases
      await bettingManagerFactory.connect(creator).createBettingContract(await mockToken.getAddress());
      count = await bettingManagerFactory.getBettingContractsCount();
      expect(count).to.equal(2);
    });
    
    it("getBettingContract: Should return the correct contract address at a given index", async function() {
      const bettingContractAddress = await bettingManagerFactory.getBettingContract(0);
      expect(bettingContractAddress).to.equal(await bettingContract.getAddress());
      
      // Check invalid index
      await expect(bettingManagerFactory.getBettingContract(99)).to.be.revertedWith("Index out of bounds");
    });
    
    it("Ownership: Should allow only the owner to perform restricted actions", async function() {
      // This is just a placeholder - BettingManagerFactory doesn't have owner-only functions
      // except those inherited from Ownable (like transferOwnership)
      expect(await bettingManagerFactory.owner()).to.equal(owner.address);
    });
  });
  
  describe("NoLossBetMulti Base Tests", function() {
    it("createBet: Should create a new bet with correct parameters", async function() {
      const betCondition = "Will ETH reach $5000 by the end of the month?";
      const durationDays = 7;
      const creatorPrediction = true;
      
      // Create a new bet
      await bettingContract.connect(creator).createBet(
        MIN_STAKE, 
        betCondition, 
        durationDays,
        creatorPrediction
      );
      
      // Get bet details
      const betDetails = await bettingContract.getBetDetails(0);
      
      // Verify details
      expect(betDetails.creator).to.equal(creator.address);
      expect(betDetails.condition).to.equal(betCondition);
      expect(betDetails.totalStakeTrue).to.equal(MIN_STAKE);
      expect(betDetails.totalStakeFalse).to.equal(0);
      expect(betDetails.resolved).to.be.false;
    });
    
    it("joinBet: Should allow a user to join an existing bet", async function() {
      // First create a bet
      await bettingContract.connect(creator).createBet(
        MIN_STAKE, 
        "Test condition", 
        7,
        true
      );
      
      // Join the bet
      await bettingContract.connect(participant1).joinBet(0, MIN_STAKE, false);
      
      // Verify bet details
      const betDetails = await bettingContract.getBetDetails(0);
      expect(betDetails.totalStakeTrue).to.equal(MIN_STAKE);
      expect(betDetails.totalStakeFalse).to.equal(MIN_STAKE);
      
      // Verify participant stake
      const participant1Stake = await bettingContract.getParticipantStake(0, participant1.address);
      expect(participant1Stake).to.equal(MIN_STAKE);
    });
    
    it("getParticipantStake: Should return the correct stake amount for a participant", async function() {
      // Create a bet and join it
      await bettingContract.connect(creator).createBet(MIN_STAKE, "Test", 7, true);
      await bettingContract.connect(participant1).joinBet(0, MIN_STAKE * 2n, false);
      
      // Check stakes
      expect(await bettingContract.getParticipantStake(0, creator.address)).to.equal(MIN_STAKE);
      expect(await bettingContract.getParticipantStake(0, participant1.address)).to.equal(MIN_STAKE * 2n);
      expect(await bettingContract.getParticipantStake(0, participant2.address)).to.equal(0);
    });
    
    // Additional test cases for NoLossBetMulti base functions will follow in 
    // a separate implementation to avoid making this file too long
    
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
  });
}); 