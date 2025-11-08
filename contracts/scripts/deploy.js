const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("[INFO] Starting deployment...");
  console.log("[INFO] Network:", hre.network.name);

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("[INFO] Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("[INFO] Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy SampleNFT contract
  console.log("\n[INFO] Deploying SampleNFT contract...");
  const SampleNFT = await hre.ethers.getContractFactory("SampleNFT");
  const sampleNFT = await SampleNFT.deploy(deployer.address);

  await sampleNFT.waitForDeployment();
  const contractAddress = await sampleNFT.getAddress();

  console.log("[SUCCESS] SampleNFT deployed to:", contractAddress);
  console.log("[INFO] Transaction hash:", sampleNFT.deploymentTransaction().hash);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: sampleNFT.deploymentTransaction().hash,
    contractName: "SampleNFT",
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}-deployment.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n[SUCCESS] Deployment info saved to:", deploymentFile);

  // Copy ABI to backend for easier integration
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "SampleNFT.sol",
    "SampleNFT.json"
  );

  if (fs.existsSync(artifactPath)) {
    const backendDir = path.join(__dirname, "..", "..", "backend", "contracts");
    if (!fs.existsSync(backendDir)) {
      fs.mkdirSync(backendDir, { recursive: true });
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiFile = path.join(backendDir, "SampleNFT.json");

    fs.writeFileSync(
      abiFile,
      JSON.stringify(
        {
          contractName: "SampleNFT",
          abi: artifact.abi,
          address: contractAddress,
          network: hre.network.name,
        },
        null,
        2
      )
    );

    console.log("[SUCCESS] ABI copied to backend:", abiFile);
  }

  console.log("\n[SUCCESS] Deployment completed successfully!");
  console.log("=====================================");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("=====================================");

  if (hre.network.name !== "hardhat") {
    console.log("\n[INFO] To verify the contract, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${deployer.address}"`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
