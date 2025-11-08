const { ethers } = require('ethers');
const { getCache, setCache } = require('../config/redis');
require('dotenv').config();

class EthereumService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL || 'http://localhost:8545'
    );
    this.contractAddress = process.env.CONTRACT_ADDRESS || null;
    this.contract = null;

    // Cache TTL values (in seconds)
    this.cacheTTL = {
      gasPrice: parseInt(process.env.CACHE_TTL_GAS_PRICE) || 60,
      blockNumber: parseInt(process.env.CACHE_TTL_BLOCK_NUMBER) || 10,
      balance: parseInt(process.env.CACHE_TTL_BALANCE) || 30,
    };
  }

  /**
   * Initialize contract instance
   */
  initializeContract(abi) {
    if (this.contractAddress && abi) {
      this.contract = new ethers.Contract(
        this.contractAddress,
        abi,
        this.provider
      );
      console.log('[SUCCESS] Smart contract initialized at:', this.contractAddress);
    }
  }

  /**
   * Get current gas price with caching
   */
  async getGasPrice() {
    const cacheKey = 'eth:gasPrice';
    const cached = await getCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const feeData = await this.provider.getFeeData();
      const gasPrice = ethers.formatUnits(feeData.gasPrice, 'gwei');

      const result = {
        gasPrice: gasPrice,
        unit: 'gwei',
        maxFeePerGas: feeData.maxFeePerGas
          ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei')
          : null,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
          ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')
          : null,
      };

      await setCache(cacheKey, result, this.cacheTTL.gasPrice);
      return result;
    } catch (error) {
      console.error('Error fetching gas price:', error.message);
      throw new Error('Failed to fetch gas price');
    }
  }

  /**
   * Get current block number with caching
   */
  async getBlockNumber() {
    const cacheKey = 'eth:blockNumber';
    const cached = await getCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const blockNumber = await this.provider.getBlockNumber();

      const result = {
        blockNumber: blockNumber,
        timestamp: new Date().toISOString(),
      };

      await setCache(cacheKey, result, this.cacheTTL.blockNumber);
      return result;
    } catch (error) {
      console.error('Error fetching block number:', error.message);
      throw new Error('Failed to fetch block number');
    }
  }

  /**
   * Get balance for an Ethereum address with caching
   */
  async getBalance(address) {
    const cacheKey = `eth:balance:${address}`;
    const cached = await getCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      // Validate address
      if (!ethers.isAddress(address)) {
        throw new Error('Invalid Ethereum address');
      }

      const balance = await this.provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);

      const result = {
        address: address,
        balance: balanceInEth,
        unit: 'ETH',
        balanceWei: balance.toString(),
      };

      await setCache(cacheKey, result, this.cacheTTL.balance);
      return result;
    } catch (error) {
      console.error('Error fetching balance:', error.message);
      throw new Error(error.message || 'Failed to fetch balance');
    }
  }

  /**
   * Get account details (balance + transaction count)
   */
  async getAccountDetails(address) {
    try {
      if (!ethers.isAddress(address)) {
        throw new Error('Invalid Ethereum address');
      }

      const [balance, transactionCount] = await Promise.all([
        this.getBalance(address),
        this.provider.getTransactionCount(address),
      ]);

      return {
        address: address,
        balance: balance.balance,
        balanceWei: balance.balanceWei,
        transactionCount: transactionCount,
      };
    } catch (error) {
      console.error('Error fetching account details:', error.message);
      throw new Error(error.message || 'Failed to fetch account details');
    }
  }

  /**
   * Get transaction history for an address
   * Note: Uses Etherscan API for testnet/mainnet, or limited block scanning for local networks
   */
  async getTransactionHistory(address, limit = 10) {
    try {
      if (!ethers.isAddress(address)) {
        throw new Error('Invalid Ethereum address');
      }

      // Check if we're on a testnet/mainnet (not local)
      const network = await this.provider.getNetwork();
      const isLocalNetwork = network.chainId === 1337n || network.chainId === 31337n;

      // For Sepolia/testnet, use Etherscan API if available
      if (!isLocalNetwork && process.env.ETHERSCAN_API_KEY) {
        return await this.getTransactionHistoryFromEtherscan(address, limit);
      }

      // Fallback: Search recent blocks (only for local networks or no Etherscan key)
      return await this.getTransactionHistoryFromBlocks(address, limit);
    } catch (error) {
      console.error('Error fetching transaction history:', error.message);
      throw new Error('Failed to fetch transaction history');
    }
  }

  /**
   * Get transaction history from Etherscan API
   * Uses Etherscan API v2 for Sepolia testnet
   */
  async getTransactionHistoryFromEtherscan(address, limit = 10) {
    try {
      const network = await this.provider.getNetwork();
      const chainId = network.chainId;

      // Etherscan V2 API uses unified endpoint with chainid parameter
      const apiUrl = 'https://api.etherscan.io/v2/api';

      // Verify supported network
      if (chainId !== 11155111n && chainId !== 1n) {
        console.log('[INFO] Etherscan not available for this network, using block scanning');
        return await this.getTransactionHistoryFromBlocks(address, limit);
      }

      // Build API request for V2 with chainid
      const params = new URLSearchParams({
        chainid: chainId.toString(),
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: '0',
        endblock: '99999999',
        page: '1',
        offset: limit.toString(),
        sort: 'desc',
        apikey: process.env.ETHERSCAN_API_KEY
      });

      const response = await fetch(`${apiUrl}?${params}`);

      // Log response details
      console.log('[DEBUG] Etherscan API URL:', `${apiUrl}?${params}`);
      console.log('[DEBUG] Response status:', response.status);

      const responseText = await response.text();
      console.log('[DEBUG] Response text (first 500 chars):', responseText.substring(0, 500));

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[ERROR] Failed to parse response as JSON');
        throw new Error('Invalid JSON response from Etherscan');
      }

      console.log('[DEBUG] Etherscan API response:', JSON.stringify(data, null, 2));

      if (data.status === '0') {
        // No transactions found or error
        if (data.message === 'No transactions found') {
          console.log('[INFO] No transactions found for address:', address);
          return [];
        }
        const errorMsg = data.result || data.message || 'Etherscan API error';
        console.error('[ERROR] Etherscan API error details:', errorMsg);
        throw new Error(errorMsg);
      }

      // Transform Etherscan response to our format
      return data.result.map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        blockNumber: parseInt(tx.blockNumber),
        timestamp: parseInt(tx.timeStamp),
        type: tx.from.toLowerCase() === address.toLowerCase() ? 'sent' : 'received',
      }));

    } catch (error) {
      console.error('[ERROR] Etherscan API failed:', error.message);
      console.log('[INFO] Falling back to block scanning');
      return await this.getTransactionHistoryFromBlocks(address, limit);
    }
  }

  /**
   * Get transaction history by scanning blocks (optimized for testnet)
   * Note: Only scans recent blocks due to performance constraints on public RPCs
   */
  async getTransactionHistoryFromBlocks(address, limit = 10) {
    const currentBlock = await this.provider.getBlockNumber();
    const transactions = [];

    // For testnet, scan last 1000 blocks to capture recent transactions
    // For production, use a proper indexing service
    const searchBlocks = 1000;
    const maxTime = 30000; // 30 second timeout
    const startTime = Date.now();

    for (
      let i = currentBlock;
      i > currentBlock - searchBlocks && transactions.length < limit;
      i--
    ) {
      // Check timeout
      if (Date.now() - startTime > maxTime) {
        console.log('[INFO] Block scanning timeout reached, returning partial results');
        break;
      }

      try {
        const block = await this.provider.getBlock(i, true);
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (
              tx.from?.toLowerCase() === address.toLowerCase() ||
              tx.to?.toLowerCase() === address.toLowerCase()
            ) {
              transactions.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: ethers.formatEther(tx.value),
                blockNumber: tx.blockNumber,
                timestamp: block.timestamp,
                type: tx.from?.toLowerCase() === address.toLowerCase() ? 'sent' : 'received',
              });

              if (transactions.length >= limit) break;
            }
          }
        }
      } catch (blockError) {
        continue;
      }
    }

    return transactions;
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();

      return {
        chainId: network.chainId.toString(),
        name: network.name,
        ensAddress: network.ensAddress || null,
      };
    } catch (error) {
      console.error('Error fetching network info:', error.message);
      throw new Error('Failed to fetch network info');
    }
  }

  /**
   * Get comprehensive Ethereum data
   */
  async getEthereumData(address) {
    try {
      const [gasPrice, blockNumber, accountDetails] = await Promise.all([
        this.getGasPrice(),
        this.getBlockNumber(),
        this.getAccountDetails(address),
      ]);

      return {
        gasPrice,
        blockNumber: blockNumber.blockNumber,
        account: accountDetails,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching Ethereum data:', error.message);
      throw error;
    }
  }

  /**
   * Get NFT tokens owned by address
   */
  async getNFTsOwnedBy(address) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tokens = await this.contract.tokensOfOwner(address);
      const tokenDetails = [];

      for (const tokenId of tokens) {
        const uri = await this.contract.tokenURI(tokenId);
        tokenDetails.push({
          tokenId: tokenId.toString(),
          tokenURI: uri,
          owner: address,
        });
      }

      return tokenDetails;
    } catch (error) {
      console.error('Error fetching NFTs:', error.message);
      throw new Error('Failed to fetch NFT data');
    }
  }
}

module.exports = new EthereumService();
