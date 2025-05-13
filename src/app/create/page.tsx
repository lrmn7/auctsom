"use client";

import React, { useState, ChangeEvent } from "react";
import { AuthProvider, useAuth } from "../../context/authcontext";
import Header from "../../components/common/header/header";
import { ethers } from "ethers";
import { createNFTContract } from "../../utils/nft_contract";
import { uploadToIPFS, uploadMetadataToIPFS } from "../../utils/ipfs";
import toast from "react-hot-toast";

const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "";
if (!NFT_CONTRACT_ADDRESS) {
  throw new Error("NFT contract address is not configured");
}

export default function CreateNFT() {
  return (
    <AuthProvider>
      <CreateNFTContent />
    </AuthProvider>
  );
}

function CreateNFTContent() {
  const { isAuthenticated, isConnecting, provider } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleMintNFT = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !name || !description) {
      toast.error("Please fill out all fields and upload a file.");
      return;
    }

    try {
      setIsMinting(true);
      if (!provider) throw new Error("No provider available");

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Upload image to IPFS
      const imageUrl = await uploadToIPFS(file);
      if (!imageUrl) throw new Error("Failed to upload image to IPFS");

      // Create and upload metadata
      const metadata = {
        name,
        description,
        image: imageUrl,
        attributes: [],
      };

      const metadataUrl = await uploadMetadataToIPFS(metadata);
      if (!metadataUrl) throw new Error("Failed to upload metadata to IPFS");

      const nftContract = createNFTContract(NFT_CONTRACT_ADDRESS, signer);

      // Generate unique tokenId based on timestamp and address
      const timestamp = Date.now();
      const tokenId = ethers.getBigInt(
        ethers.keccak256(
          ethers.solidityPacked(["uint256", "address"], [timestamp, address])
        )
      );

      console.log("Minting with params:", {
        address,
        tokenId: tokenId.toString(),
        metadataUrl,
      });

      // Simple mint without gas estimation
      const tx = await nftContract.mintWithMetadata(
        address,
        tokenId,
        metadataUrl
      );

      await tx.wait();
      toast.success("NFT successfully minted!");
      setName("");
      setDescription("");
      setFile(null);
    } catch (error: any) {
      console.error("Minting error:", error);
      if (
        (error as any)?.code === 4001 ||
        (error as any)?.reason === "rejected" ||
        (error as any)?.message?.includes("user denied") ||
        (error as any)?.message?.includes("User denied")
      ) {
        toast.error("Transaction cancelled by user");
      } else {
        toast.error("Transaction failed. Please try again.");
      }
    } finally {
      setIsMinting(false);
    }
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#212121]/80 backdrop-blur-md">
        <p className="text-white text-lg">Connecting...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#212121]/80 backdrop-blur-md">
        <Header onMenuClick={() => setIsDrawerOpen(true)} />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-white text-lg">
            Please connect your wallet to create an NFT.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121]/80 backdrop-blur-md">
      <Header onMenuClick={() => setIsDrawerOpen(true)} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Create a New NFT</h1>

        <form
          onSubmit={handleMintNFT}
          className="bg-gray-800/30 rounded-2xl p-6 space-y-6"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              NFT Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter the name of your NFT"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter a description for your NFT"
              rows={4}
              required
            />
          </div>

          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Upload File
            </label>
            <input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isMinting}
            className="w-full px-4 py-2 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition duration-300 disabled:opacity-50"
          >
            {isMinting ? "Creating NFT..." : "Create NFT"}
          </button>
        </form>
      </main>
    </div>
  );
}
