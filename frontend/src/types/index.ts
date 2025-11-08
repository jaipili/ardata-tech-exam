export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: number;
  type: 'sent' | 'received';
}

export interface AccountData {
  address: string;
  balance: string;
  balanceWei: string;
  transactionCount: number;
}

export interface NFTToken {
  tokenId: string;
  tokenURI: string;
  owner: string;
}

export interface NetworkInfo {
  chainId: string;
  name: string;
  ensAddress?: string | null;
}

export interface GasPrice {
  gasPrice: string;
  unit: string;
  maxFeePerGas?: string | null;
  maxPriorityFeePerGas?: string | null;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}
