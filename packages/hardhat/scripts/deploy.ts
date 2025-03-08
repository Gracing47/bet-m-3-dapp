import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MockToken...");
  const mockToken = await ethers.deployContract("MockToken");
  await mockToken.waitForDeployment();
  const mockTokenAddress = await mockToken.getAddress();
  console.log("MockToken deployed to:", mockTokenAddress);

  console.log("Deploying BettingManagerFactory...");
  const factory = await ethers.deployContract("BettingManagerFactory");
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("BettingManagerFactory deployed to:", factoryAddress);

  console.log("Creating NoLossBetMulti instance through the factory...");
  const tx = await factory.createBettingContract(mockTokenAddress);
  await tx.wait();
  
  // Get the NoLossBetMulti contract address (index 0 since we just created the first one)
  const noLossBetMultiAddress = await factory.getBettingContract(0);
  console.log("NoLossBetMulti deployed to:", noLossBetMultiAddress);

  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("MockToken:", mockTokenAddress);
  console.log("BettingManagerFactory:", factoryAddress);
  console.log("NoLossBetMulti:", noLossBetMultiAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
