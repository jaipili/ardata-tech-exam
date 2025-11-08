const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("[INFO] Contract Verification Script");
  console.log("[INFO] Network:", hre.network.name);

  // Check if Etherscan API key is set
  if (!process.env.ETHERSCAN_API_KEY) {
    console.log("[ERROR] ETHERSCAN_API_KEY not found in environment variables");
    console.log("[INFO] Get your API key from: https://etherscan.io/myapikey");
    console.log("[INFO] Add it to your .env file: ETHERSCAN_API_KEY=your_key_here");
    process.exit(1);
  }

  // Load deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}-deployment.json`
  );

  if (!fs.existsSync(deploymentFile)) {
    console.log("[ERROR] Deployment file not found:", deploymentFile);
    console.log("[INFO] Please deploy the contract first");
    console.log("[INFO] Or provide the contract address manually:");
    console.log("[INFO] Usage: CONTRACT_ADDRESS=0x... npx hardhat run scripts/verify-contract.js --network sepolia");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = process.env.CONTRACT_ADDRESS || deploymentInfo.contractAddress;
  const deployerAddress = deploymentInfo.deployer;

  if (!contractAddress) {
    console.log("[ERROR] Contract address not found");
    console.log("[INFO] Set CONTRACT_ADDRESS environment variable");
    process.exit(1);
  }

  console.log("[INFO] Contract Address:", contractAddress);
  console.log("[INFO] Deployer Address:", deployerAddress);
  console.log("\n[INFO] Starting verification on Etherscan...");

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [deployerAddress],
    });

    console.log("\n[SUCCESS] Contract verified successfully!");
    console.log("=====================================");
    console.log("Contract Address:", contractAddress);
    console.log("Network:", hre.network.name);
    if (hre.network.name === "sepolia") {
      console.log("Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
    } else {
      console.log("Etherscan:", `https://etherscan.io/address/${contractAddress}`);
    }
    console.log("=====================================");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n[INFO] Contract is already verified!");
      if (hre.network.name === "sepolia") {
        console.log("[INFO] View at: https://sepolia.etherscan.io/address/" + contractAddress);
      } else {
        console.log("[INFO] View at: https://etherscan.io/address/" + contractAddress);
      }
    } else {
      console.log("[ERROR] Verification failed:", error.message);
      console.log("\n[INFO] Troubleshooting:");
      console.log("1. Make sure the contract is deployed and confirmed");
      console.log("2. Verify your ETHERSCAN_API_KEY is correct");
      console.log("3. Wait a few minutes after deployment before verifying");
      console.log("4. Check constructor arguments match deployment");
      throw error;
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n[ERROR] Script failed");
    process.exit(1);
  });
