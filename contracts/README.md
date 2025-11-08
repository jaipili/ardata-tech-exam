# Smart Contracts - SampleNFT

This directory contains the smart contracts for the blockchain application, including the SampleNFT ERC-721 token contract.

## Overview

**SampleNFT** is an ERC-721 NFT contract with the following features:

- Minting with payment (0.01 ETH per NFT)
- Batch minting (up to 20 NFTs in one transaction)
- Maximum supply of 10,000 NFTs
- Token URI management
- Owner-controlled mint price
- Ownable (allows owner to withdraw funds and update settings)

## Resources

- Node.js v18+ and npm
- Sepolia testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
- Etherscan API key from [Etherscan](https://etherscan.io/)
- Sepolia RPC URL from [Nodies](https://nodies.app/)

## Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Environment Variables**

   Create a `.env` file in the contracts directory:

   ```env
   # Sepolia Testnet Configuration
   SEPOLIA_RPC_URL=<RPC_URL>

   # Wallet private key (WITHOUT 0x prefix)
   PRIVATE_KEY=<WALLET_PRIVATE_KEY>

   # Etherscan API Key
   ETHERSCAN_API_KEY=<ETHERSCAN_API_KEY>
   ```


## Deployment

### Deploy to Sepolia Testnet

```bash
npm run deploy
```

This command will:

1. Compile the smart contracts
2. Deploy SampleNFT to Sepolia testnet
3. Wait for 5 block confirmations
4. Automatically verify the contract on Etherscan
5. Save deployment info to `deployments/sepolia-deployment.json`
6. Copy ABI to backend directory
7. **Automatically update root environment file** with the new contract address

### Deployment Output

After successful deployment, you'll see:

```text
[SUCCESS] SampleNFT deployed successfully!
=====================================
Contract Address: 0x...
Transaction Hash: 0x...
Network: sepolia
Deployer: 0x...
Etherscan: https://sepolia.etherscan.io/address/0x...
=====================================

[INFO] Updating environment files...
  ✓ Updated Root: CONTRACT_ADDRESS=0x...
  ✓ Updated Backend: CONTRACT_ADDRESS=0x...
  ✓ Updated Frontend: CONTRACT_ADDRESS=0x...

[SUCCESS] Updated 3/3 environment files
```

## Manual Verification

If automatic verification fails, you can verify manually:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "<DEPLOYER_ADDRESS>"
```

Or use the verification script:

```bash
node scripts/verify-contract.js
```

## Minting NFTs

After deploying your contract, you can mint NFTs using the following methods:

### CLI Method: Using the Mint Script

Run the minting script:

```bash
npm run mint
```

Or directly:

```bash
node scripts/mint-nft.js
```

This script will:

1. Load the deployed contract from `deployments/sepolia-deployment.json`
2. Connect to the contract using your wallet
3. Check the current mint price
4. Mint an NFT to your wallet address with a timestamp-based token URI
5. Display the transaction details and Etherscan link

**Example Output:**

```text
[INFO] Minting NFT...
[INFO] Contract: 0x...
[INFO] Mint price: 0.01 ETH

[INFO] Minting NFT to: 0x...
[INFO] Token URI: https://example.com/nft/1699999999999.json
[INFO] Sending transaction...

[SUCCESS] NFT minted successfully!
[INFO] Token ID: 1
[INFO] Transaction Hash: 0x...
[INFO] View on Etherscan: https://sepolia.etherscan.io/tx/0x...
```

### Token URI Format

Token URIs should point to NFT metadata in JSON format:

**Example Token URI:**

```text
ipfs://QmXxxx.../metadata.json
https://example.com/metadata/1.json
```

**Example Metadata JSON:**

```json
{
  "name": "My NFT #1",
  "description": "This is my first NFT",
  "image": "ipfs://QmYxxx.../image.png",
  "attributes": [
    {
      "trait_type": "Color",
      "value": "Blue"
    }
  ]
}
```

## Testing

Run contract tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run coverage
```

## Available Scripts

- `npm run compile` - Compile smart contracts
- `npm run deploy` - Deploy to Sepolia testnet
- `npm run flatten` - Flatten contract for manual verification
- `npm test` - Run contract tests
- `npm run coverage` - Generate test coverage report
- `node scripts/verify-contract.js` - Manually verify on Etherscan
- `node scripts/mint-nft.js` - Test minting an NFT

## Environment File Updates

The deployment process automatically updates the contract address in the root `.env` file:

- **Root** `.env` → `CONTRACT_ADDRESS`

Docker Compose reads this file and injects the environment variables into all services (backend and frontend).

To manually update the environment file:

```bash
bash ../scripts/update-contract-address.sh
```

## Contract Details

### SampleNFT.sol

**Constructor Parameters:**

- `initialOwner` (address) - The address that will own the contract

**Key Functions:**

- `mint(address to, string memory uri)` - Mint a single NFT (payable, 0.01 ETH)
- `batchMint(address to, uint256 quantity, string memory baseURI)` - Mint multiple NFTs
- `transferToken(address from, address to, uint256 tokenId)` - Transfer an NFT
- `setMintPrice(uint256 newPrice)` - Update mint price (owner only)
- `withdraw()` - Withdraw contract balance (owner only)
- `tokensOfOwner(address owner)` - Get all token IDs owned by an address
- `totalSupply()` - Get total number of minted tokens

**Events:**

- `NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI)`
- `MintPriceUpdated(uint256 newPrice)`

## Deployment Info

After deployment, information is saved to `deployments/sepolia-deployment.json`:

```json
{
  "network": "sepolia",
  "contractAddress": "0x...",
  "deployer": "0x...",
  "deploymentTime": "2025-11-08T...",
  "transactionHash": "0x...",
  "contractName": "SampleNFT",
  "etherscanUrl": "https://sepolia.etherscan.io/address/0x..."
}
```

## Network Configuration

The project is configured for **Sepolia Testnet** (Chain ID: 11155111).

To add other networks, update `hardhat.config.js`:

```javascript
networks: {
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 11155111
  }
  // Add more networks here
}
```

## Troubleshooting

### "Insufficient funds" Error

- Ensure your wallet has enough Sepolia testnet ETH for gas fees
- Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
  - **Note:** The faucet requires a minimum of 0.01 ETH in your wallet on Ethereum mainnet to verify you're not a bot

### Verification Fails

- Check your Etherscan API key is valid
- Use the flattened contract for manual verification: `npm run flatten`
- Paste contents of `SampleNFT-flattened-clean.sol` on [Etherscan](https://sepolia.etherscan.io/verifyContract)

## Security Considerations

- Never commit private keys to version control
- Use environment variables for sensitive data
- Only use testnet wallets for development