import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import type { NFTToken } from '../types';

interface NFTListProps {
  address: string;
  refresh?: number;
}

const NFTList: React.FC<NFTListProps> = ({ address, refresh = 0 }) => {
  const [nfts, setNfts] = useState<NFTToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return;

      setLoading(true);
      setError(null);

      try {
        const nftData = await apiService.getNFTs(address);
        setNfts(nftData);
      } catch (err: any) {
        console.error('Error fetching NFTs:', err);
        setError(err.response?.data?.error || 'Failed to fetch NFTs');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [address, refresh]);

  if (loading) {
    return <div className="loading">Loading NFTs...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="nft-list">
      <h3>Your NFTs ({nfts.length})</h3>
      {nfts.length === 0 ? (
        <p className="no-data">No NFTs found. Mint your first NFT!</p>
      ) : (
        <div className="nfts-grid">
          {nfts.map((nft) => (
            <div key={nft.tokenId} className="nft-card">
              <div className="nft-header">
                <span className="token-id">Token #{nft.tokenId}</span>
              </div>
              <div className="nft-content">
                <div className="nft-detail">
                  <span className="label">Token URI:</span>
                  <span className="value uri">{nft.tokenURI}</span>
                </div>
                <div className="nft-detail">
                  <span className="label">Owner:</span>
                  <span className="value">{nft.owner.substring(0, 10)}...</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NFTList;
