import axios from 'axios';
import type { AccountData, Transaction, NFTToken, NetworkInfo, GasPrice } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  /**
   * Get network information
   */
  getNetworkInfo: async (): Promise<{ gasPrice: GasPrice; blockNumber: number; network: NetworkInfo }> => {
    const response = await api.get('/api/network');
    return response.data.data;
  },

  /**
   * Get account details including gas price, block number, and balance
   */
  getAccountDetails: async (address: string): Promise<{ gasPrice: GasPrice; blockNumber: number; account: AccountData }> => {
    const response = await api.get(`/api/account/${address}`);
    return response.data.data;
  },

  /**
   * Get balance for an address
   */
  getBalance: async (address: string): Promise<{ address: string; balance: string; unit: string; balanceWei: string }> => {
    const response = await api.get(`/api/balance/${address}`);
    return response.data.data;
  },

  /**
   * Get transaction history for an address
   */
  getTransactionHistory: async (address: string, limit: number = 10): Promise<Transaction[]> => {
    const response = await api.get(`/api/transactions/${address}`, {
      params: { limit },
    });
    return response.data.data.transactions;
  },

  /**
   * Get NFTs owned by an address
   */
  getNFTs: async (address: string): Promise<NFTToken[]> => {
    const response = await api.get(`/api/nfts/${address}`);
    return response.data.data.nfts;
  },

  /**
   * Get all accounts from database
   */
  getAllAccounts: async (): Promise<any[]> => {
    const response = await api.get('/api/accounts');
    return response.data.data.accounts;
  },

  /**
   * Health check
   */
  healthCheck: async (): Promise<any> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default apiService;
