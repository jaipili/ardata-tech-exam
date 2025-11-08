import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import type { Transaction } from '../types';

interface TransactionHistoryProps {
  address: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ address }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!address) return;

      setLoading(true);
      setError(null);

      try {
        const txs = await apiService.getTransactionHistory(address, 10);
        setTransactions(txs);
      } catch (err: any) {
        console.error('Error fetching transactions:', err);
        setError(err.response?.data?.error || 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [address]);

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="transaction-history">
      <h3>Recent Transactions (Last 10)</h3>
      {transactions.length === 0 ? (
        <p className="no-data">No transactions found</p>
      ) : (
        <div className="transactions-list">
          {transactions.map((tx) => (
            <div key={tx.hash} className="transaction-item">
              <div className="tx-header">
                <span className={`tx-type ${tx.type}`}>{tx.type.toUpperCase()}</span>
                <span className="tx-value">{parseFloat(tx.value).toFixed(6)} ETH</span>
              </div>
              <div className="tx-details">
                <div className="tx-detail">
                  <span className="label">From:</span>
                  <span className="value">{formatAddress(tx.from)}</span>
                </div>
                <div className="tx-detail">
                  <span className="label">To:</span>
                  <span className="value">{formatAddress(tx.to)}</span>
                </div>
                <div className="tx-detail">
                  <span className="label">Block:</span>
                  <span className="value">{tx.blockNumber}</span>
                </div>
                <div className="tx-detail">
                  <span className="label">Time:</span>
                  <span className="value">{formatTimestamp(tx.timestamp)}</span>
                </div>
                <div className="tx-detail">
                  <span className="label">Hash:</span>
                  <span className="value hash">{formatAddress(tx.hash)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
