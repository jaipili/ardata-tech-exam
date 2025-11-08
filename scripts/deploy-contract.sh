#!/bin/bash

#################################################################################
# Deploy Smart Contract to Sepolia Testnet
# This script deploys the contract and updates the root .env file automatically
#################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${SCRIPT_DIR}/.."
CONTRACTS_DIR="${ROOT_DIR}/contracts"
UPDATE_SCRIPT="${SCRIPT_DIR}/update-contract-address.sh"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Smart Contract Deployment - Sepolia Testnet          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if contracts directory exists
if [ ! -d "$CONTRACTS_DIR" ]; then
    echo -e "${RED}[ERROR] Contracts directory not found at: ${CONTRACTS_DIR}${NC}"
    exit 1
fi

# Check if contracts/.env exists
if [ ! -f "$CONTRACTS_DIR/.env" ]; then
    echo -e "${RED}[ERROR] Contracts .env file not found${NC}"
    echo -e "${YELLOW}[INFO] Please run the initialization script first:${NC}"
    echo -e "   ${BLUE}./scripts/initialize.sh${NC}"
    exit 1
fi

# Navigate to contracts directory
cd "$CONTRACTS_DIR"

echo -e "${GREEN}[INFO] Starting contract deployment...${NC}"
echo ""

# Run deployment
if npm run deploy; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║       Contract Deployed Successfully!                      ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Update root .env file
    echo -e "${BLUE}[INFO] Environment file has been updated automatically${NC}"
    echo ""

    # Display deployment info
    if [ -f "$CONTRACTS_DIR/deployments/sepolia-deployment.json" ]; then
        CONTRACT_ADDRESS=$(grep -o '"contractAddress": *"[^"]*"' "$CONTRACTS_DIR/deployments/sepolia-deployment.json" | grep -o '0x[^"]*')
        ETHERSCAN_URL=$(grep -o '"etherscanUrl": *"[^"]*"' "$CONTRACTS_DIR/deployments/sepolia-deployment.json" | cut -d'"' -f4)

        echo -e "${YELLOW}Deployment Details:${NC}"
        echo -e "  Contract Address: ${BLUE}${CONTRACT_ADDRESS}${NC}"
        echo -e "  Etherscan: ${BLUE}${ETHERSCAN_URL}${NC}"
        echo ""
    fi

    echo -e "${YELLOW}Next Steps:${NC}"
    echo -e "  1. Restart Docker services to apply changes:"
    echo -e "     ${BLUE}docker-compose restart${NC}"
    echo ""
    echo -e "  2. Or rebuild and start services:"
    echo -e "     ${BLUE}docker-compose up -d --build${NC}"
    echo ""

else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║       Deployment Failed                                    ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}[INFO] Please check the error messages above${NC}"
    exit 1
fi
