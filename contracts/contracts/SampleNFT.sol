// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SampleNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public mintPrice = 0.01 ether;

    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event MintPriceUpdated(uint256 newPrice);

    constructor(address initialOwner)
        ERC721("SampleNFT", "SNFT")
        Ownable(initialOwner)
    {
        _tokenIdCounter = 0;
    }

    /**
     * @dev Mint a new NFT token
     * @param to Address to mint the token to
     * @param uri Metadata URI for the token
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to, string memory uri) public payable returns (uint256) {
        require(_tokenIdCounter < MAX_SUPPLY, "Maximum supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(to != address(0), "Cannot mint to zero address");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit NFTMinted(to, tokenId, uri);

        return tokenId;
    }

    /**
     * @dev Mint multiple NFTs in a single transaction
     * @param to Address to mint the tokens to
     * @param quantity Number of tokens to mint
     * @param baseURI Base URI for the token metadata
     */
    function batchMint(address to, uint256 quantity, string memory baseURI) public payable {
        require(_tokenIdCounter + quantity <= MAX_SUPPLY, "Exceeds maximum supply");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        require(to != address(0), "Cannot mint to zero address");
        require(quantity > 0 && quantity <= 20, "Invalid quantity");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;

            _safeMint(to, tokenId);
            string memory uri = string(abi.encodePacked(baseURI, tokenId.toString()));
            _setTokenURI(tokenId, uri);

            emit NFTMinted(to, tokenId, uri);
        }
    }

    /**
     * @dev Transfer token to another address
     * @param from Current owner address
     * @param to Recipient address
     * @param tokenId Token ID to transfer
     */
    function transferToken(address from, address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == from, "From address is not the owner");
        require(to != address(0), "Cannot transfer to zero address");

        safeTransferFrom(from, to, tokenId);
    }

    /**
     * @dev Get total number of tokens minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Get all tokens owned by an address
     * @param owner Address to query
     * @return Array of token IDs
     */
    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokens = new uint256[](tokenCount);
        uint256 index = 0;

        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) == owner) {
                tokens[index] = i;
                index++;
            }
        }

        return tokens;
    }

    /**
     * @dev Update mint price (only owner)
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }

    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
