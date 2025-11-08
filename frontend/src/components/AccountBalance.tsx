import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import type { AccountData } from '../types';

interface AccountBalanceProps {
  address: string;
}

const AccountBalance: React.FC<AccountBalanceProps> = ({ address }) => {
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!address) return;

      setLoading(true);
      setError(null);

      try {
        const data = await apiService.getAccountDetails(address);
        setAccountData(data.account);
      } catch (err: any) {
        console.error('Error fetching account data:', err);
        setError(err.response?.data?.error || 'Failed to fetch account data');
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
    const interval = setInterval(fetchAccountData, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, [address]);

  if (loading) {
    return <div className="loading">Loading account data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!accountData) {
    return null;
  }

  return (
    <div className="account-balance">
      <div className="balance-card">
        <h3>Account Balance</h3>
        <div className="balance-amount">
          <span className="value">{parseFloat(accountData.balance).toFixed(4)}</span>
          <span className="unit">ETH</span>
        </div>
        <div className="balance-details">
          <div className="detail-item">
            <span className="label">Address:</span>
            <span className="value">{accountData.address}</span>
          </div>
          <div className="detail-item">
            <span className="label">Transaction Count:</span>
            <span className="value">{accountData.transactionCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountBalance;
