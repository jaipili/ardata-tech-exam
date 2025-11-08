const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("[INFO] Starting NFT minting...");

  // Check if deployed
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.log("[ERROR] No deployment found for network:", hre.network.name);
    console.log("[INFO] Please deploy the contract first: npm run deploy");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("[INFO] Network:", hre.network.name);
  console.log("[INFO] Contract:", contractAddress);

  // Get the signer (your wallet)
  const [signer] = await hre.ethers.getSigners();
  console.log("[INFO] Minting with account:", signer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log("[INFO] Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (parseFloat(hre.ethers.formatEther(balance)) < 0.01) {
    console.log("[WARNING] Low balance! You need at least 0.01 ETH for minting + gas");
    console.log("[INFO] Get Sepolia ETH from: https://sepoliafaucet.com/");
  }

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

  // Connect to contract
  const contract = new hre.ethers.Contract(
    contractAddress,
    artifact.abi,
    signer
  );

  // Get mint price
  const mintPrice = await contract.mintPrice();
  console.log("[INFO] Mint price:", hre.ethers.formatEther(mintPrice), "ETH");

  // Mint NFT
  const recipient = signer.address;
  const tokenURI = `https://example.com/nft/${Date.now()}.json`;

  console.log("\n[INFO] Minting NFT...");
  console.log("[INFO] Recipient:", recipient);
  console.log("[INFO] Token URI:", tokenURI);

  try {
    const tx = await contract.mint(recipient, tokenURI, {
      value: mintPrice
    });

    console.log("[INFO] Transaction sent:", tx.hash);
    console.log("[INFO] Waiting for confirmation...");

    const receipt = await tx.wait();

    console.log("\n[SUCCESS] NFT minted successfully!");
    console.log("=====================================");
    console.log("Transaction Hash:", receipt.hash);
    console.log("Block Number:", receipt.blockNumber);
    console.log("Gas Used:", receipt.gasUsed.toString());

    // Get the token ID from the event
    const mintEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === "NFTMinted";
      } catch {
        return false;
      }
    });

    if (mintEvent) {
      const parsed = contract.interface.parseLog(mintEvent);
      const tokenId = parsed.args.tokenId;
      console.log("Token ID:", tokenId.toString());
      console.log("Owner:", recipient);
      console.log("URI:", tokenURI);
    }

    // Get total supply
    const totalSupply = await contract.totalSupply();
    console.log("\nTotal NFTs minted:", totalSupply.toString());

    if (hre.network.name === "sepolia") {
      console.log("\nView on Etherscan:");
      console.log(`https://sepolia.etherscan.io/tx/${receipt.hash}`);
      console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
    }

    console.log("=====================================");
  } catch (error) {
    console.error("\n[ERROR] Minting failed:", error.message);

    if (error.message.includes("insufficient funds")) {
      console.log("[INFO] You need more Sepolia ETH");
      console.log("[INFO] Get some from: https://sepoliafaucet.com/");
    }

    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[ERROR]", error);
    process.exit(1);
  });
