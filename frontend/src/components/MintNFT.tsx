import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { BrowserProvider } from 'ethers';

interface MintNFTProps {
  provider: BrowserProvider | null;
  address: string;
  onMintSuccess?: () => void;
}

const MintNFT: React.FC<MintNFTProps> = ({ provider, address, onMintSuccess }) => {
  const [tokenURI, setTokenURI] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { mintNFT } = useContract(provider);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tokenURI) {
      setError('Please enter a token URI');
      return;
    }

    setIsMinting(true);
    setError(null);
    setSuccess(null);

    try {
      const tx = await mintNFT(address, tokenURI);
      setSuccess(`NFT minted successfully! Transaction hash: ${tx.hash}`);
      setTokenURI('');

      if (onMintSuccess) {
        onMintSuccess();
      }
    } catch (err: any) {
      console.error('Mint error:', err);
      setError(err.message || 'Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="mint-nft">
      <h3>Mint NFT</h3>

      <form onSubmit={handleMint}>
        <div className="form-group">
          <label htmlFor="tokenURI">Token URI:</label>
          <input
            type="text"
            id="tokenURI"
            value={tokenURI}
            onChange={(e) => setTokenURI(e.target.value)}
            placeholder="ipfs://QmXxxx... or https://example.com/metadata.json"
            disabled={isMinting}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" className="btn btn-primary" disabled={isMinting || !tokenURI}>
          {isMinting ? 'Minting...' : 'Mint NFT'}
        </button>
      </form>
    </div>
  );
};

export default MintNFT;
