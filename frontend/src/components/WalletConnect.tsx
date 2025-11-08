import React from 'react';
import { useWallet } from '../hooks/useWallet';

const WalletConnect: React.FC = () => {
  const { address, isConnected, isConnecting, error, connectWallet, disconnectWallet } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="wallet-connect">
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {!isConnected ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="btn btn-primary"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="wallet-info">
          <div className="connected-address">
            <span className="status-indicator"></span>
            <span>{formatAddress(address!)}</span>
          </div>
          <button onClick={disconnectWallet} className="btn btn-secondary">
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
