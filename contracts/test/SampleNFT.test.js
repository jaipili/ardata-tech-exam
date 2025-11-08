const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SampleNFT", function () {
  let sampleNFT;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const SampleNFT = await ethers.getContractFactory("SampleNFT");
    sampleNFT = await SampleNFT.deploy(owner.address);
    await sampleNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await sampleNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await sampleNFT.name()).to.equal("SampleNFT");
      expect(await sampleNFT.symbol()).to.equal("SNFT");
    });

    it("Should have correct initial supply", async function () {
      expect(await sampleNFT.totalSupply()).to.equal(0);
    });

    it("Should have correct mint price", async function () {
      expect(await sampleNFT.mintPrice()).to.equal(ethers.parseEther("0.01"));
    });
  });

  describe("Minting", function () {
    it("Should mint a token successfully", async function () {
      const mintPrice = await sampleNFT.mintPrice();
      await sampleNFT.mint(addr1.address, "ipfs://test-uri", {
        value: mintPrice,
      });

      expect(await sampleNFT.balanceOf(addr1.address)).to.equal(1);
      expect(await sampleNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await sampleNFT.tokenURI(0)).to.equal("ipfs://test-uri");
    });

    it("Should fail if insufficient payment", async function () {
      await expect(
        sampleNFT.mint(addr1.address, "ipfs://test-uri", {
          value: ethers.parseEther("0.001"),
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail if minting to zero address", async function () {
      const mintPrice = await sampleNFT.mintPrice();
      await expect(
        sampleNFT.mint(ethers.ZeroAddress, "ipfs://test-uri", {
          value: mintPrice,
        })
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("Should emit TokenMinted event", async function () {
      const mintPrice = await sampleNFT.mintPrice();
      await expect(
        sampleNFT.mint(addr1.address, "ipfs://test-uri", { value: mintPrice })
      )
        .to.emit(sampleNFT, "TokenMinted")
        .withArgs(addr1.address, 0, "ipfs://test-uri");
    });
  });

  describe("Batch Minting", function () {
    it("Should batch mint multiple tokens", async function () {
      const mintPrice = await sampleNFT.mintPrice();
      const quantity = 3;

      await sampleNFT.batchMint(addr1.address, quantity, "ipfs://base-uri/", {
        value: mintPrice * BigInt(quantity),
      });

      expect(await sampleNFT.balanceOf(addr1.address)).to.equal(quantity);
      expect(await sampleNFT.totalSupply()).to.equal(quantity);
    });

    it("Should fail batch mint with insufficient payment", async function () {
      const mintPrice = await sampleNFT.mintPrice();
      await expect(
        sampleNFT.batchMint(addr1.address, 3, "ipfs://base-uri/", {
          value: mintPrice * BigInt(2),
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail batch mint with invalid quantity", async function () {
      const mintPrice = await sampleNFT.mintPrice();
      await expect(
        sampleNFT.batchMint(addr1.address, 0, "ipfs://base-uri/", {
          value: mintPrice,
        })
      ).to.be.revertedWith("Invalid quantity");

      await expect(
        sampleNFT.batchMint(addr1.address, 21, "ipfs://base-uri/", {
          value: mintPrice * BigInt(21),
        })
      ).to.be.revertedWith("Invalid quantity");
    });
  });

  describe("Token Transfer", function () {
    beforeEach(async function () {
      const mintPrice = await sampleNFT.mintPrice();
      await sampleNFT.mint(addr1.address, "ipfs://test-uri", {
        value: mintPrice,
      });
    });

    it("Should transfer token successfully", async function () {
      await sampleNFT
        .connect(addr1)
        .transferToken(addr1.address, addr2.address, 0);

      expect(await sampleNFT.ownerOf(0)).to.equal(addr2.address);
      expect(await sampleNFT.balanceOf(addr1.address)).to.equal(0);
      expect(await sampleNFT.balanceOf(addr2.address)).to.equal(1);
    });

    it("Should fail transfer to zero address", async function () {
      await expect(
        sampleNFT
          .connect(addr1)
          .transferToken(addr1.address, ethers.ZeroAddress, 0)
      ).to.be.revertedWith("Cannot transfer to zero address");
    });
  });

  describe("Tokens of Owner", function () {
    it("Should return correct tokens for owner", async function () {
      const mintPrice = await sampleNFT.mintPrice();

      await sampleNFT.mint(addr1.address, "ipfs://uri1", { value: mintPrice });
      await sampleNFT.mint(addr1.address, "ipfs://uri2", { value: mintPrice });
      await sampleNFT.mint(addr2.address, "ipfs://uri3", { value: mintPrice });

      const addr1Tokens = await sampleNFT.tokensOfOwner(addr1.address);
      expect(addr1Tokens.length).to.equal(2);
      expect(addr1Tokens[0]).to.equal(0);
      expect(addr1Tokens[1]).to.equal(1);

      const addr2Tokens = await sampleNFT.tokensOfOwner(addr2.address);
      expect(addr2Tokens.length).to.equal(1);
      expect(addr2Tokens[0]).to.equal(2);
    });
  });

  describe("Owner Functions", function () {
    it("Should update mint price by owner", async function () {
      const newPrice = ethers.parseEther("0.02");
      await sampleNFT.setMintPrice(newPrice);
      expect(await sampleNFT.mintPrice()).to.equal(newPrice);
    });

    it("Should fail to update mint price by non-owner", async function () {
      const newPrice = ethers.parseEther("0.02");
      await expect(
        sampleNFT.connect(addr1).setMintPrice(newPrice)
      ).to.be.revertedWithCustomError(sampleNFT, "OwnableUnauthorizedAccount");
    });

    it("Should withdraw funds by owner", async function () {
      const mintPrice = await sampleNFT.mintPrice();
      await sampleNFT.mint(addr1.address, "ipfs://test-uri", {
        value: mintPrice,
      });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      await sampleNFT.withdraw();
      const finalBalance = await ethers.provider.getBalance(owner.address);

      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should fail withdraw by non-owner", async function () {
      const mintPrice = await sampleNFT.mintPrice();
      await sampleNFT.mint(addr1.address, "ipfs://test-uri", {
        value: mintPrice,
      });

      await expect(
        sampleNFT.connect(addr1).withdraw()
      ).to.be.revertedWithCustomError(sampleNFT, "OwnableUnauthorizedAccount");
    });
  });
});
