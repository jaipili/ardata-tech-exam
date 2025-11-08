const ethereumService = require('../services/ethereumService');
const Account = require('../models/Account');

/**
 * Get gas price and block number
 */
exports.getNetworkInfo = async (req, res) => {
  try {
    const [gasPrice, blockNumber, networkInfo] = await Promise.all([
      ethereumService.getGasPrice(),
      ethereumService.getBlockNumber(),
      ethereumService.getNetworkInfo(),
    ]);

    res.json({
      success: true,
      data: {
        gasPrice,
        blockNumber: blockNumber.blockNumber,
        network: networkInfo,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Network info error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch network information',
    });
  }
};

/**
 * Get account details for a given address
 * Tier 2 requirement: Returns gas price, block number, and balance
 */
exports.getAccountDetails = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address parameter is required',
      });
    }

    // Get comprehensive Ethereum data
    const data = await ethereumService.getEthereumData(address);

    // Store/update account in database
    try {
      await Account.upsert({
        address: address.toLowerCase(),
        balance: data.account.balance,
        transactionCount: data.account.transactionCount,
        lastUpdated: new Date(),
      });
    } catch (dbError) {
      console.error('Database update error:', dbError.message);
      // Continue even if DB update fails
    }

    res.json({
      success: true,
      data: {
        gasPrice: data.gasPrice,
        blockNumber: data.blockNumber,
        account: data.account,
        timestamp: data.timestamp,
      },
    });
  } catch (error) {
    console.error('Account details error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch account details',
    });
  }
};

/**
 * Get balance for an address
 */
exports.getBalance = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address parameter is required',
      });
    }

    const balance = await ethereumService.getBalance(address);

    res.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to fetch balance',
    });
  }
};

/**
 * Get transaction history for an address
 */
exports.getTransactionHistory = async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 10 } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address parameter is required',
      });
    }

    const transactions = await ethereumService.getTransactionHistory(
      address,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: {
        address,
        transactions,
        count: transactions.length,
      },
    });
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch transaction history',
    });
  }
};

/**
 * Get all accounts from database
 */
exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.findAll({
      order: [['lastUpdated', 'DESC']],
      limit: 100,
    });

    res.json({
      success: true,
      data: {
        accounts,
        count: accounts.length,
      },
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch accounts from database',
    });
  }
};

/**
 * Get NFTs owned by an address
 */
exports.getNFTs = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address parameter is required',
      });
    }

    const nfts = await ethereumService.getNFTsOwnedBy(address);

    res.json({
      success: true,
      data: {
        address,
        nfts,
        count: nfts.length,
      },
    });
  } catch (error) {
    console.error('NFT fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch NFTs',
    });
  }
};

/**
 * Health check endpoint
 */
exports.healthCheck = async (req, res) => {
  try {
    const blockNumber = await ethereumService.getBlockNumber();

    res.json({
      success: true,
      status: 'healthy',
      service: 'blockchain-api',
      ethereum: {
        connected: true,
        blockNumber: blockNumber.blockNumber,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
    });
  }
};
