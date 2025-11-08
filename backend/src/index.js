const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const ethereumService = require('./services/ethereumService');
const ethereumController = require('./controllers/ethereumController');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('[INFO] Starting Blockchain API Server...\n');

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', ethereumController.healthCheck);

// API Routes
app.get('/api/network', ethereumController.getNetworkInfo);
app.get('/api/accounts', ethereumController.getAllAccounts);
app.get('/api/account/:address', ethereumController.getAccountDetails);
app.get('/api/balance/:address', ethereumController.getBalance);
app.get('/api/transactions/:address', ethereumController.getTransactionHistory);
app.get('/api/nfts/:address', ethereumController.getNFTs);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Initialize services and start server
const startServer = async () => {
  try {
    // Connect to PostgreSQL
    console.log('[INFO] Connecting to PostgreSQL database...');
    await connectDB();

    // Connect to Redis
    console.log('[INFO] Connecting to Redis cache...');
    await connectRedis();

    // Initialize smart contract if ABI is available
    try {
      const abiPath = path.join(__dirname, '../deployments/SampleNFT.json');
      if (fs.existsSync(abiPath)) {
        const contractData = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        ethereumService.initializeContract(contractData.abi);
        console.log('[SUCCESS] Smart contract ABI loaded successfully\n');
      } else {
        console.log('[WARNING] Smart contract ABI not found. NFT features will be limited.\n');
      }
    } catch (contractError) {
      console.log('[WARNING] Could not load smart contract:', contractError.message, '\n');
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log('[SUCCESS] Server running on port', PORT);
      console.log('[INFO] Environment:', process.env.NODE_ENV || 'development');
      console.log('[INFO] Ethereum RPC:', process.env.ETHEREUM_RPC_URL || 'http://localhost:8545');
      console.log('[INFO] Ready to accept requests\n');
    });
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[INFO] SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[INFO] SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();
