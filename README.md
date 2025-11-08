# Blockchain Application

A full-stack NFT minting application built with React, Node.js, and Solidity smart contracts. This application allows users to mint, transfer, and track ERC-721 NFTs on the Sepolia testnet.

## Overview

**Key Features:**

- **SampleNFT Smart Contract** - ERC-721 NFT contract with minting, batch minting, and transfer capabilities
- **Web Interface** - React-based frontend for wallet connection and NFT interactions
- **Backend API** - Node.js service for blockchain data indexing using Etherscan API
- **Transaction History** - Real-time tracking of wallet transactions and NFT ownership

**Automated Workflows:**

- **One-Command Initialization** - Interactive script to set up all environment configurations
- **Automated Deployment** - Deploy smart contracts and update environment variables automatically
- **Contract Verification** - Automatic verification on Etherscan after deployment
- **Centralized Configuration** - Single `.env` file managed by Docker Compose for all services

---

## Getting Started

This guide will help you set up and deploy the blockchain application from scratch.

## Prerequisites

Before you begin, make sure you have the following:

1. **Docker** and Docker Compose installed
2. **Sepolia Testnet Wallet** with some test ETH
   - Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. **Sepolia RPC URL**
4. **Etherscan API Key**
   - Create one at [Etherscan](https://etherscan.io/myapikey)

### Step 1: Initialize the Project

Run the initialization script to set up your environment files:

```bash
./scripts/initialize.sh
```

This interactive script will prompt you for:

- **RPC URL** - Your Sepolia testnet RPC endpoint
- **Wallet Private Key** - Your testnet wallet private key (without 0x prefix)
- **Etherscan API Key** - For contract verification on Etherscan
- **Database Configuration** (Optional) - Press Enter to use defaults

The script will create `.env` files in both the root and contracts directories with your configuration.

### Step 2: Deploy Smart Contract

Deploy the SampleNFT smart contract to Sepolia testnet:

```bash
./scripts/deploy-contract.sh
```

This script will:

- Deploy the smart contract to Sepolia testnet
- Verify the contract on Etherscan
- Automatically update the `CONTRACT_ADDRESS` in the `<CLONE_DIR>/.env` file
- Display deployment details and the Etherscan URL

**Alternative:** You can also deploy manually from the contracts directory. For detailed instructions, see [contracts/README.md](contracts/README.md)

### Step 3: Build and Deploy Services

#### Deploy All Services

Start all services (Frontend, Backend, Database, Redis) using Docker Compose:

```bash
docker-compose up --build
```

Or run in detached mode:

```bash
docker-compose up -d --build
```

#### Deploy a Specific Service

If you need to rebuild and redeploy only one service:

```bash
# Frontend only
docker-compose up frontend --build --force-recreate

# Backend only
docker-compose up backend --build --force-recreate
```

### Step 4: Access the Application

Once all services are running:

- **Frontend:** <http://localhost:3000>
- **Backend API:** <http://localhost:3001>
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### Step 5: Mint NFTs

After deploying your smart contract and starting the services, you can mint NFTs using one of the following methods:

#### Mint via Web Interface

1. Open the frontend at <http://localhost:3000>
2. Connect your MetaMask wallet
3. Make sure you're connected to Sepolia testnet
4. Use the minting interface to mint your NFT
5. Confirm the transaction in MetaMask

**Alternative:** You can also mint manually from the contracts directory. For detailed instructions, see [contracts/README.md](contracts/README.md)

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes

```bash
docker-compose down -v
```

## Next Steps

After deployment:

1. View your deployed contract on [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. Mint your first NFT (see Step 5 above)
3. Explore transaction history and blockchain data in the frontend

## Troubleshooting

### "Insufficient funds" Error

- Ensure your wallet has enough Sepolia testnet ETH for gas fees
- Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
  - **Note:** The faucet requires a minimum of 0.01 ETH in your wallet on Ethereum mainnet to verify you're not a bot

### Contract Verification Fails

- Check your Etherscan API key is valid
- The contract will still be deployed and functional

### Services Not Starting

- Check if ports 3000, 3001, 5432, or 6379 are already in use
- Run `docker-compose down` and try again

### Environment Variables Not Loading

- Make sure you ran `./scripts/initialize.sh` first
- Check that `.env` files exist in root and contracts directories
- Restart Docker services after updating environment variables

## Security Reminders

- **Never commit** `.env` files to version control
- **Never use** mainnet wallets or private keys for development
- **Keep your** private keys and API keys secure
- **Use testnet only** for development and testing
