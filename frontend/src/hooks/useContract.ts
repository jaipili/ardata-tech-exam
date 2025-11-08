import { useState, useEffect } from 'react';
import { Contract, BrowserProvider } from 'ethers';

// Sample NFT ABI (will be replaced with actual ABI)
const SAMPLE_NFT_ABI = [
  'function mint(address to, string memory uri) public payable returns (uint256)',
  'function batchMint(address to, uint256 quantity, string memory baseURI) public payable',
  'function transferToken(address from, address to, uint256 tokenId) public',
  'function tokensOfOwner(address owner) public view returns (uint256[] memory)',
  'function tokenURI(uint256 tokenId) public view returns (string memory)',
  'function totalSupply() public view returns (uint256)',
  'function mintPrice() public view returns (uint256)',
  'function balanceOf(address owner) public view returns (uint256)',
  'function ownerOf(uint256 tokenId) public view returns (address)',
];

export const useContract = (provider: BrowserProvider | null, contractAddress?: string) => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const address = contractAddress || import.meta.env.VITE_CONTRACT_ADDRESS;

  useEffect(() => {
    if (provider && address) {
      try {
        const contractInstance = new Contract(address, SAMPLE_NFT_ABI, provider);
        setContract(contractInstance);
      } catch (err: any) {
        console.error('Error initializing contract:', err);
        setError(err.message);
      }
    }
  }, [provider, address]);

  const mintNFT = async (toAddress: string, tokenURI: string) => {
    if (!contract || !provider) {
      throw new Error('Contract or provider not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const mintPrice = await (contract as any).mintPrice();

      const tx = await (contractWithSigner as any).mint(toAddress, tokenURI, {
        value: mintPrice,
      });

      await tx.wait();
      setIsLoading(false);
      return tx;
    } catch (err: any) {
      console.error('Error minting NFT:', err);
      setError(err.message || 'Failed to mint NFT');
      setIsLoading(false);
      throw err;
    }
  };

  const batchMint = async (toAddress: string, quantity: number, baseURI: string) => {
    if (!contract || !provider) {
      throw new Error('Contract or provider not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const mintPrice = await (contract as any).mintPrice();
      const totalPrice = mintPrice * BigInt(quantity);

      const tx = await (contractWithSigner as any).batchMint(toAddress, quantity, baseURI, {
        value: totalPrice,
      });

      await tx.wait();
      setIsLoading(false);
      return tx;
    } catch (err: any) {
      console.error('Error batch minting NFTs:', err);
      setError(err.message || 'Failed to batch mint NFTs');
      setIsLoading(false);
      throw err;
    }
  };

  const transferNFT = async (from: string, to: string, tokenId: number) => {
    if (!contract || !provider) {
      throw new Error('Contract or provider not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = await (contractWithSigner as any).transferToken(from, to, tokenId);
      await tx.wait();
      setIsLoading(false);
      return tx;
    } catch (err: any) {
      console.error('Error transferring NFT:', err);
      setError(err.message || 'Failed to transfer NFT');
      setIsLoading(false);
      throw err;
    }
  };

  const getTokensOfOwner = async (ownerAddress: string): Promise<string[]> => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tokens = await (contract as any).tokensOfOwner(ownerAddress);
      return tokens.map((t: bigint) => t.toString());
    } catch (err: any) {
      console.error('Error getting tokens:', err);
      throw err;
    }
  };

  const getTokenURI = async (tokenId: number): Promise<string> => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await (contract as any).tokenURI(tokenId);
    } catch (err: any) {
      console.error('Error getting token URI:', err);
      throw err;
    }
  };

  const getTotalSupply = async (): Promise<number> => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const supply = await (contract as any).totalSupply();
      return Number(supply);
    } catch (err: any) {
      console.error('Error getting total supply:', err);
      throw err;
    }
  };

  const getMintPrice = async (): Promise<string> => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const price = await (contract as any).mintPrice();
      return price.toString();
    } catch (err: any) {
      console.error('Error getting mint price:', err);
      throw err;
    }
  };

  return {
    contract,
    isLoading,
    error,
    mintNFT,
    batchMint,
    transferNFT,
    getTokensOfOwner,
    getTokenURI,
    getTotalSupply,
    getMintPrice,
  };
};
