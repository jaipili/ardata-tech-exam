#!/bin/bash

#################################################################################
# Update Contract Address in Environment Files
# This script reads the deployment JSON and updates CONTRACT_ADDRESS in .env files
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

# Files
DEPLOYMENT_FILE="${CONTRACTS_DIR}/deployments/sepolia-deployment.json"
ROOT_ENV="${ROOT_DIR}/.env"

echo ""
echo -e "${BLUE}[INFO] Updating root environment file with contract address...${NC}"

# Check if deployment file exists
if [ ! -f "$DEPLOYMENT_FILE" ]; then
    echo -e "${RED}[ERROR] Deployment file not found at: ${DEPLOYMENT_FILE}${NC}"
    echo -e "${RED}[ERROR] Please run contract deployment first.${NC}"
    exit 1
fi

# Read contract address from deployment JSON
CONTRACT_ADDRESS=$(grep -o '"contractAddress": *"[^"]*"' "$DEPLOYMENT_FILE" | grep -o '0x[^"]*')

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${RED}[ERROR] Could not extract contract address from deployment file${NC}"
    exit 1
fi

echo -e "${GREEN}[INFO] Contract Address: ${CONTRACT_ADDRESS}${NC}"
echo ""

if [ ! -f "$ROOT_ENV" ]; then
    echo -e "${RED}[ERROR] Root .env file not found at ${ROOT_ENV}${NC}"
    exit 1
fi

# Check if CONTRACT_ADDRESS exists in the file
if grep -q "^CONTRACT_ADDRESS=" "$ROOT_ENV"; then
    # Update existing value
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|^CONTRACT_ADDRESS=.*|CONTRACT_ADDRESS=${CONTRACT_ADDRESS}|" "$ROOT_ENV"
    else
        # Linux
        sed -i "s|^CONTRACT_ADDRESS=.*|CONTRACT_ADDRESS=${CONTRACT_ADDRESS}|" "$ROOT_ENV"
    fi
fi

echo ""
echo -e "${GREEN}[SUCCESS] Root environment file updated${NC}"
echo -e "${BLUE}[INFO] Contract address: ${CONTRACT_ADDRESS}${NC}"

# Get Etherscan URL from deployment file
ETHERSCAN_URL=$(grep -o '"etherscanUrl": *"[^"]*"' "$DEPLOYMENT_FILE" | cut -d'"' -f4)
if [ -n "$ETHERSCAN_URL" ]; then
    echo -e "${BLUE}[INFO] Etherscan: ${ETHERSCAN_URL}${NC}"
fi

echo ""
