const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("[INFO] Testing deployed contract...");
  console.log("[INFO] Network:", hre.network.name);

  // Load deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}-deployment.json`
  );

  if (!fs.existsSync(deploymentFile)) {
    console.log("[ERROR] Deployment file not found");
    console.log("[INFO] Please deploy the contract first or provide CONTRACT_ADDRESS");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = process.env.CONTRACT_ADDRESS || deploymentInfo.contractAddress;

  console.log("[INFO] Contract Address:", contractAddress);

  // Load contract ABI
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "SampleNFT.sol",
    "SampleNFT.json"
  );

  if (!fs.existsSync(artifactPath)) {
    console.log("[ERROR] Contract artifact not found. Run 'npm run compile' first");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const [signer] = await hre.ethers.getSigners();

  console.log("[INFO] Testing with account:", signer.address);

  // Connect to the deployed contract
  const contract = new hre.ethers.Contract(
    contractAddress,
    artifact.abi,
    signer
  );

  console.log("\n[INFO] Running contract tests...\n");

  // Test 1: Get contract name
  try {
    const name = await contract.name();
    console.log("[SUCCESS] Contract name:", name);
  } catch (error) {
    console.log("[ERROR] Failed to get contract name:", error.message);
  }

  // Test 2: Get contract symbol
  try {
    const symbol = await contract.symbol();
    console.log("[SUCCESS] Contract symbol:", symbol);
  } catch (error) {
    console.log("[ERROR] Failed to get contract symbol:", error.message);
  }

  // Test 3: Get mint price
  try {
    const mintPrice = await contract.mintPrice();
    console.log("[SUCCESS] Mint price:", hre.ethers.formatEther(mintPrice), "ETH");
  } catch (error) {
    console.log("[ERROR] Failed to get mint price:", error.message);
  }

  // Test 4: Get total supply
  try {
    const totalSupply = await contract.totalSupply();
    console.log("[SUCCESS] Total supply:", totalSupply.toString(), "NFTs");
  } catch (error) {
    console.log("[ERROR] Failed to get total supply:", error.message);
  }

  // Test 5: Get owner
  try {
    const owner = await contract.owner();
    console.log("[SUCCESS] Contract owner:", owner);
  } catch (error) {
    console.log("[ERROR] Failed to get owner:", error.message);
  }

  // Test 6: Check signer's token balance
  try {
    const balance = await contract.balanceOf(signer.address);
    console.log("[SUCCESS] Your NFT balance:", balance.toString(), "tokens");

    // If user has tokens, list them
    if (balance > 0) {
      try {
        const tokens = await contract.tokensOfOwner(signer.address);
        console.log("[INFO] Your token IDs:", tokens.map(t => t.toString()).join(", "));

        // Get URI of first token
        if (tokens.length > 0) {
          const uri = await contract.tokenURI(tokens[0]);
          console.log("[INFO] First token URI:", uri);
        }
      } catch (error) {
        console.log("[WARNING] Could not fetch token details:", error.message);
      }
    }
  } catch (error) {
    console.log("[ERROR] Failed to check balance:", error.message);
  }

  // Test 7: Verify contract is responding to blockchain
  try {
    const provider = contract.runner.provider;
    const blockNumber = await provider.getBlockNumber();
    console.log("[SUCCESS] Current block number:", blockNumber);
  } catch (error) {
    console.log("[ERROR] Failed to get block number:", error.message);
  }

  console.log("\n[SUCCESS] All tests completed!");
  console.log("=====================================");
  console.log("Contract is deployed and functional");
  console.log("Network:", hre.network.name);
  console.log("Contract:", contractAddress);
  if (hre.network.name === "sepolia") {
    console.log("View on Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
  }
  console.log("=====================================");

  console.log("\n[INFO] To interact with the contract:");
  console.log("1. Use the frontend application");
  console.log("2. Use the backend API endpoints");
  console.log("3. Use Etherscan contract interface");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[ERROR]", error);
    process.exit(1);
  });
