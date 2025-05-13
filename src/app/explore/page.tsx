'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { AuthProvider, useAuth } from '../../context/authcontext';
import Header from '../../components/common/header/header';
import { createNFTContract } from '../../utils/nft_contract';
import { createNFTRegistryContract } from '../../utils/nft_registry_contract';

const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '';
const NFT_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_NFT_REGISTRY_ADDRESS || '';

type NFT = {
  id: string;
  name?: string;
  description?: string;
  image?: string;
  owner: string;
};

export default function Explore() {
  return (
    <AuthProvider>
      <ExploreContent />
    </AuthProvider>
  );
}

function ExploreContent() {
  const { isAuthenticated, isConnecting, provider } = useAuth();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (provider) {
      loadAllNFTs();
    }
  }, [provider]);

  const loadAllNFTs = async () => {
    try {
      setIsLoading(true);
      const signer = await provider!.getSigner();
      const registryContract = createNFTRegistryContract(NFT_REGISTRY_ADDRESS, signer);
      const nftContract = createNFTContract(NFT_CONTRACT_ADDRESS, signer);

      console.log("Fetching all NFTs...");
      const tokenIds = await registryContract.getAllNFTs();
      console.log("Raw token IDs:", tokenIds);
      
      if (!tokenIds || tokenIds.length === 0) {
        console.log("No NFTs found");
        setNfts([]);
        return;
      }

      const nftPromises = tokenIds.map(async (tokenId) => {
        try {
          const uri = await nftContract.tokenURI(tokenId);
          const owner = await nftContract.ownerOf(tokenId);
          
          console.log(`Fetching metadata for token ${tokenId} from ${uri}`);
          
          return fetch(uri)
            .then(res => res.json())
            .then(metadata => ({
              id: tokenId.toString(),
              name: metadata.name || `NFT #${tokenId}`,
              description: metadata.description || 'No description available',
              image: metadata.image,
              owner: owner
            }))
            .catch(error => {
              console.error('Error fetching metadata:', error);
              return {
                id: tokenId.toString(),
                name: `NFT #${tokenId}`,
                description: 'Metadata unavailable',
                image: undefined,
                owner: owner
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
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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
        <Header onMenuClick={() => {}} />
        <main className="container mx-auto px-4 py-8">
          <p className="text-white text-center">Please connect your wallet to explore NFTs.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121]/80 backdrop-blur-md">
      <Header onMenuClick={() => {}} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Explore NFTs</h1>

        {isLoading ? (
          <p className="text-white text-center">Loading NFTs...</p>
        ) : nfts.length === 0 ? (
          <p className="text-white text-center">No NFTs found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <div key={nft.id} className="bg-gray-600/30 rounded-xl p-4">
                {nft.image && (
                  <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                )}
                <h3 className="text-white text-xl font-bold">{nft.name}</h3>
                <p className="text-gray-400 mt-2">{nft.description}</p>
                <p className="text-purple-400 mt-2">
                  Owned by: {formatAddress(nft.owner)}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
