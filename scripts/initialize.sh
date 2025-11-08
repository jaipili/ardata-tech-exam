#!/bin/bash

#################################################################################
# Initialize Environment Files
# This script prompts for user inputs and creates .env files from templates
#################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTRACTS_DIR="${ROOT_DIR}/contracts"

# Template and output files
ROOT_TEMPLATE="${ROOT_DIR}/.env.template"
ROOT_ENV="${ROOT_DIR}/.env"
CONTRACTS_TEMPLATE="${CONTRACTS_DIR}/.env.template"
CONTRACTS_ENV="${CONTRACTS_DIR}/.env"

echo -e "${BLUE}TPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPW${NC}"
echo -e "${BLUE}Q         Blockchain Application Initialization              Q${NC}"
echo -e "${BLUE}ZPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP]${NC}"
echo ""

# Check if template files exist
if [ ! -f "$ROOT_TEMPLATE" ]; then
    echo -e "${RED}[ERROR] Root .env.template not found at: ${ROOT_TEMPLATE}${NC}"
    exit 1
fi

if [ ! -f "$CONTRACTS_TEMPLATE" ]; then
    echo -e "${RED}[ERROR] Contracts .env.template not found at: ${CONTRACTS_TEMPLATE}${NC}"
    exit 1
fi

echo -e "${GREEN}[INFO] Found template files${NC}"
echo ""

# Prompt for inputs
echo -e "${YELLOW}Please provide the following configuration values:${NC}"
echo ""

# RPC URL
echo -e "${BLUE}${NC}"
echo -e "${YELLOW}1. Sepolia RPC URL${NC}"
read -p "   Enter RPC URL: " RPC_URL
echo ""

# Wallet Private Key
echo -e "${BLUE}${NC}"
echo -e "${YELLOW}2. Wallet Private Key${NC}"
echo "   Use a testnet wallet only! Never use mainnet keys."
read -sp "   Enter Private Key (without 0x prefix): " PRIVATE_KEY
echo ""
echo ""

# Etherscan API Key
echo -e "${BLUE}${NC}"
echo -e "${YELLOW}3. Etherscan API Key${NC}"
echo "   Get one from: https://etherscan.io/"
read -p "   Enter Etherscan API Key: " ETHERSCAN_API_KEY
echo ""

# Database configuration (optional)
echo -e "${BLUE}${NC}"
echo -e "${YELLOW}4. Database Configuration (Optional)${NC}"
echo "   Used by Docker Compose for PostgreSQL. Press Enter to use defaults."
echo ""

# DB Name
read -p "   Database Name [blockchain_app]: " DB_NAME_INPUT
DB_NAME="${DB_NAME_INPUT:-blockchain_app}"

# DB User
read -p "   Database User [postgres]: " DB_USER_INPUT
DB_USER="${DB_USER_INPUT:-postgres}"

# DB Password
read -p "   Database Password [postgres_password]: " DB_PASSWORD_INPUT
DB_PASSWORD="${DB_PASSWORD_INPUT:-postgres_password}"
echo ""

# Validate required inputs
echo -e "${GREEN}[INFO] Validating inputs...${NC}"

if [ -z "$RPC_URL" ]; then
    echo -e "${RED}[ERROR] RPC URL cannot be empty${NC}"
    exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}[ERROR] Private Key cannot be empty${NC}"
    exit 1
fi

if [ -z "$ETHERSCAN_API_KEY" ]; then
    echo -e "${RED}[ERROR] Etherscan API Key cannot be empty${NC}"
    exit 1
fi

echo -e "${GREEN}[SUCCESS] All inputs validated${NC}"
echo -e "${BLUE}[INFO] Database config: ${DB_NAME} / ${DB_USER}${NC}"
echo ""

# Function to substitute placeholders
substitute_placeholders() {
    local template_file=$1
    local output_file=$2
    local include_db=$3

    echo -e "${BLUE}[INFO] Creating ${output_file}...${NC}"

    # Read template and substitute placeholders
    cat "$template_file" | \
        sed "s|<RPC_URL>|${RPC_URL}|g" | \
        sed "s|<WALLET_PRIVATE_KEY>|${PRIVATE_KEY}|g" | \
        sed "s|<ETHERSCAN_API_KEY>|${ETHERSCAN_API_KEY}|g" > "$output_file"

    # If root .env, also substitute database placeholders
    if [ "$include_db" = "true" ]; then
        sed -i.bak \
            -e "s|<DB_NAME>|${DB_NAME}|g" \
            -e "s|<DB_USER>|${DB_USER}|g" \
            -e "s|<DB_PASSWORD>|${DB_PASSWORD}|g" \
            "$output_file"
        rm "${output_file}.bak"
    fi

    echo -e "${GREEN}[SUCCESS] Created ${output_file}${NC}"
}

# Create root .env
substitute_placeholders "$ROOT_TEMPLATE" "$ROOT_ENV" "true"

# Create contracts .env
substitute_placeholders "$CONTRACTS_TEMPLATE" "$CONTRACTS_ENV" "false"

echo ""
echo -e "${GREEN}TPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPW${NC}"
echo -e "${GREEN}Q         Initialization Complete!                           Q${NC}"
echo -e "${GREEN}ZPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP]${NC}"
echo ""
echo -e "${YELLOW}Created environment files:${NC}"
echo -e "   ${ROOT_ENV}"
echo -e "   ${CONTRACTS_ENV}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Deploy the smart contract:"
echo -e "     ${BLUE}cd contracts && npm run deploy${NC}"
echo -e ""
echo -e "  2. Start the services:"
echo -e "     ${BLUE}docker-compose up -d${NC}"
echo ""
echo -e "${RED}�  IMPORTANT: Keep your .env files secure and never commit them to git!${NC}"
echo ""
