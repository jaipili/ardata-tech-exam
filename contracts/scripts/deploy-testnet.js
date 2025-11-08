const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("[INFO] Starting Sepolia testnet deployment...");
  console.log("[INFO] Network:", hre.network.name);

  // Verify we're on Sepolia
  if (hre.network.name !== "sepolia") {
    console.log("[ERROR] This script is for Sepolia testnet only!");
    console.log("[INFO] Run with: npx hardhat run scripts/deploy-testnet.js --network sepolia");
    process.exit(1);
  }

  // Check environment variables
  if (!process.env.PRIVATE_KEY) {
    console.log("[ERROR] PRIVATE_KEY not found in environment variables");
    console.log("[INFO] Please add your private key to .env file");
    process.exit(1);
  }

  if (!process.env.SEPOLIA_RPC_URL) {
    console.log("[ERROR] SEPOLIA_RPC_URL not found in environment variables");
    console.log("[INFO] Please add your Sepolia RPC URL to .env file");
    process.exit(1);
  }

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("[INFO] Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceInEth = hre.ethers.formatEther(balance);
  console.log("[INFO] Account balance:", balanceInEth, "ETH");

  if (parseFloat(balanceInEth) < 0.01) {
    console.log("[WARNING] Balance is low! You may need more Sepolia ETH");
    console.log("[INFO] Get testnet ETH from: https://sepoliafaucet.com/");
  }

  // Deploy SampleNFT contract
  console.log("\n[INFO] Deploying SampleNFT contract...");
  const SampleNFT = await hre.ethers.getContractFactory("SampleNFT");

  console.log("[INFO] Sending deployment transaction...");
  const sampleNFT = await SampleNFT.deploy(deployer.address);

  console.log("[INFO] Waiting for deployment confirmation...");
  await sampleNFT.waitForDeployment();

  const contractAddress = await sampleNFT.getAddress();
  const txHash = sampleNFT.deploymentTransaction().hash;

  console.log("\n[SUCCESS] SampleNFT deployed successfully!");
  console.log("=====================================");
  console.log("Contract Address:", contractAddress);
  console.log("Transaction Hash:", txHash);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("Transaction:", `https://sepolia.etherscan.io/tx/${txHash}`);
  console.log("=====================================");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: txHash,
    contractName: "SampleNFT",
    etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`,
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, "sepolia-deployment.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n[SUCCESS] Deployment info saved to:", deploymentFile);

  // Copy ABI
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "SampleNFT.sol",
    "SampleNFT.json"
  );

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiData = {
      contractName: "SampleNFT",
      abi: artifact.abi,
      address: contractAddress,
      network: hre.network.name,
    };

    // Save to deployments folder
    const abiFile = path.join(deploymentsDir, "SampleNFT.json");
    fs.writeFileSync(abiFile, JSON.stringify(abiData, null, 2));
    console.log("[SUCCESS] ABI saved to:", abiFile);

    // Copy to backend if it exists
    const backendDir = path.join(__dirname, "..", "..", "backend", "contracts");
    if (fs.existsSync(path.join(__dirname, "..", "..", "backend"))) {
      if (!fs.existsSync(backendDir)) {
        fs.mkdirSync(backendDir, { recursive: true });
      }
      const backendAbiFile = path.join(backendDir, "SampleNFT.json");
      fs.writeFileSync(backendAbiFile, JSON.stringify(abiData, null, 2));
      console.log("[SUCCESS] ABI copied to backend:", backendAbiFile);
    }
  }

  // Wait for a few block confirmations before verification
  console.log("\n[INFO] Waiting for 5 block confirmations before verification...");
  await sampleNFT.deploymentTransaction().wait(5);
  console.log("[SUCCESS] Transaction confirmed!");

  // Auto-verify if Etherscan API key is set
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\n[INFO] Starting contract verification on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [deployer.address],
      });
      console.log("[SUCCESS] Contract verified on Etherscan!");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("[INFO] Contract is already verified on Etherscan");
      } else {
        console.log("[WARNING] Verification failed:", error.message);
        console.log("\n[INFO] You can manually verify with:");
        console.log(`npx hardhat verify --network sepolia ${contractAddress} "${deployer.address}"`);
      }
    }
  } else {
    console.log("\n[WARNING] ETHERSCAN_API_KEY not set. Skipping verification.");
    console.log("[INFO] To verify manually, run:");
    console.log(`npx hardhat verify --network sepolia ${contractAddress} "${deployer.address}"`);
  }

  // Auto-update environment files
  console.log("\n[INFO] Updating environment files...");
  try {
    const { execSync } = require("child_process");
    const updateScriptPath = path.join(__dirname, "..", "..", "scripts", "update-contract-address.sh");

    if (fs.existsSync(updateScriptPath)) {
      execSync(`bash "${updateScriptPath}"`, { stdio: "inherit" });
    } else {
      console.log("[WARNING] Update script not found. Please update .env files manually:");
      console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
    }
  } catch (error) {
    console.log("[WARNING] Failed to auto-update environment files:", error.message);
    console.log("[INFO] Please update manually:");
    console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  }

  console.log("\n[INFO] Next steps:");
  console.log("1. Restart your services: docker-compose restart");
  console.log("2. View your contract on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[ERROR]", error);
    process.exit(1);
  });
