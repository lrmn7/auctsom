'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { AuthProvider, useAuth } from '../../context/authcontext';
import Header from '../../components/common/header/header';
import { createNFTContract } from '../../utils/nft_contract';
import { createNFTAuctionContract } from '../../utils/nft_auction_contract';
import { createNFTRegistryContract } from '../../utils/nft_registry_contract';
import toast from 'react-hot-toast';

const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '';
const AUCTION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS || '';
const NFT_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_NFT_REGISTRY_ADDRESS || '';

type NFT = {
  id: string;
  name?: string;
  description?: string;
  image?: string;
};

export default function MyNFTs() {
  return (
    <AuthProvider>
      <MyNFTsContent />
    </AuthProvider>
  );
}

function MyNFTsContent() {
  const { isAuthenticated, isConnecting, provider } = useAuth();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [auctionForm, setAuctionForm] = useState({
    startingPrice: '',
    duration: '3600'
  });

  useEffect(() => {
    if (isAuthenticated && provider) {
      loadUserNFTs();
    }
  }, [isAuthenticated, provider]);

  const loadUserNFTs = async () => {
    try {
      setIsLoading(true);
      const signer = await provider!.getSigner();
      const address = await signer.getAddress();
      const registryContract = createNFTRegistryContract(NFT_REGISTRY_ADDRESS, signer);
      const nftContract = createNFTContract(NFT_CONTRACT_ADDRESS, signer);
      
      console.log("Loading NFTs for address:", address);
      const tokenIds = await registryContract.getUserNFTs(address);
      console.log("NFT token IDs:", tokenIds);
      
      if (!tokenIds || tokenIds.length === 0) {
        console.log("No NFTs found for user");
        setNfts([]);
        return;
      }

      const nftPromises = tokenIds.map(async (tokenId) => {
        try {
          const uri = await nftContract.tokenURI(tokenId);
          console.log("Token URI for", tokenId.toString(), ":", uri);
          return fetch(uri)
            .then(res => res.json())
            .then(metadata => ({
              id: tokenId.toString(),
              name: metadata.name || `NFT #${tokenId}`,
              description: metadata.description || 'No description available',
              image: metadata.image
            }))
            .catch(error => {
              console.error('Error fetching metadata:', error);
              return {
                id: tokenId.toString(),
                name: `NFT #${tokenId}`,
                description: 'Metadata unavailable',
                image: undefined
              };
            });
        } catch (error) {
          console.error(`Error loading NFT ${tokenId}:`, error);
          return null;
        }
      });

      const loadedNfts = (await Promise.all(nftPromises)).filter(nft => nft !== null);
      console.log("Loaded NFTs:", loadedNfts);
      setNfts(loadedNfts as NFT[]);
    } catch (error) {
      console.error('Error loading NFTs:', error);
      toast.error('Failed to load NFTs.');
    } finally {
      setIsLoading(false);
    }
  };

  const createAuction = async (nft: NFT) => {
    try {
      const signer = await provider!.getSigner();
      const nftContract = createNFTContract(NFT_CONTRACT_ADDRESS, signer);
      const auctionContract = createNFTAuctionContract(AUCTION_CONTRACT_ADDRESS, signer);
      await nftContract.approve(AUCTION_CONTRACT_ADDRESS, nft.id);
      const tx = await auctionContract.createAuction(
        nft.id,
        ethers.parseEther(auctionForm.startingPrice),
        auctionForm.duration,
        { 
          value: ethers.parseEther("0.1") 
        }
      );

      await tx.wait();
      toast.success('Auction created successfully!');
      setSelectedNFT(null);
      
    } catch (error: any) {
  console.error('Error creating auction:', error);
  if (error.message.includes('reverted')) {
    toast.error('Auction creation failed. Please contact support or try again.');
  } else {
    toast.error('An unexpected error occurred.');
  }
}
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#212121]/80 backdrop-blur-md">
        <Header onMenuClick={() => {}} />
        <main className="container mx-auto px-4 py-8">
          <p className="text-white text-center">Please connect your wallet to view your NFTs.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121]/80 backdrop-blur-md">
      <Header onMenuClick={() => {}} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">My NFTs</h1>

        {isLoading ? (
          <p className="text-white text-center">Loading your NFTs...</p>
        ) : nfts.length === 0 ? (
          <p className="text-white text-center">You don't have any NFTs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <div key={nft.id} className="bg-gray-800/30 rounded-xl p-4">
                {nft.image && (
                  <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                )}
                <h3 className="text-white text-xl font-bold">{nft.name}</h3>
                <p className="text-gray-400 mt-2">{nft.description}</p>
                <button
                  onClick={() => setSelectedNFT(nft)}
                  className="mt-4 w-full px-4 py-2 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600"
                >
                  Create Auction
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedNFT && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Create Auction for {selectedNFT.name}</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                createAuction(selectedNFT);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Starting Price (0.1 STT)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={auctionForm.startingPrice}
                    onChange={(e) => setAuctionForm({ ...auctionForm, startingPrice: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Duration
                  </label>
                  <select
                    value={auctionForm.duration}
                    onChange={(e) => setAuctionForm({ ...auctionForm, duration: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
                  >
                    <option value="60">1 minute</option>
                    <option value="600">10 minutes</option>
                    <option value="900">15 minutes</option>
                    <option value="3600">1 hour</option>
                    <option value="86400">1 day</option>
                    <option value="604800">1 week</option>
                  </select>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600"
                  >
                    Create Auction
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedNFT(null)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
