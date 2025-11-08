import { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import WalletConnect from './components/WalletConnect';
import AccountBalance from './components/AccountBalance';
import TransactionHistory from './components/TransactionHistory';
import MintNFT from './components/MintNFT';
import NFTList from './components/NFTList';
import './App.css';

function App() {
  const { address, isConnected, provider } = useWallet();
  const [nftRefresh, setNftRefresh] = useState(0);

  const handleMintSuccess = () => {
    setNftRefresh((prev) => prev + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Blockchain Sample Application</h1>
        <p className="subtitle">Full-Stack Ethereum DApp with NFT Minting</p>
        <WalletConnect />
      </header>

      <main className="app-main">
        {!isConnected ? (
          <div className="welcome-message">
            <h2>Welcome!</h2>
            <p>Please connect your Ethereum wallet to get started.</p>
            <p className="info">Make sure you have MetaMask installed in your browser.</p>
          </div>
        ) : (
          <div className="dashboard">
            <section className="section">
              <h2>Account Overview</h2>
              <AccountBalance address={address!} />
            </section>

            <section className="section">
              <h2>Transaction History</h2>
              <TransactionHistory address={address!} />
            </section>

            <section className="section">
              <h2>NFT Management</h2>
              <div className="nft-section">
                <MintNFT provider={provider} address={address!} onMintSuccess={handleMintSuccess} />
                <NFTList address={address!} refresh={nftRefresh} />
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Blockchain Sample App | Built with React + TypeScript + Ethers.js</p>
      </footer>
    </div>
  );
}

export default App;
