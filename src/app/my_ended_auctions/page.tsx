"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { AuthProvider, useAuth } from "../../context/authcontext";
import Header from "../../components/common/header/header";
import { createNFTContract } from "../../utils/nft_contract";
import {
  createNFTAuctionContract,
  filterExpiredAuctions,
} from "../../utils/nft_auction_contract";
import { generateCustomPlaceholderURL } from "react-placeholder-image";

const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "";
const AUCTION_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS || "";

type EndedAuctionNFT = {
  tokenId: string;
  name?: string;
  description?: string;
  image?: string;
  seller: string;
  startingPrice: bigint;
  highestBid: bigint;
  highestBidder: string;
  endTime: bigint;
  active: boolean;
};

const formatTokenId = (tokenId: string): string => {
  if (tokenId.length > 12) {
    return `#${tokenId.slice(0, 6)}...${tokenId.slice(-4)}`;
  }
  return `#${tokenId}`;
};

export default function MyEndedAuctions() {
  return (
    <AuthProvider>
      <MyEndedAuctionsContent />
    </AuthProvider>
  );
}

function MyEndedAuctionsContent() {
  const { provider, isAuthenticated } = useAuth();
  const [auctions, setAuctions] = useState<EndedAuctionNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && provider) {
      loadExpiredAuctions();
    }
  }, [isAuthenticated, provider]);

  const loadExpiredAuctions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const signer = await provider!.getSigner();
      const userAddress = await signer.getAddress();
      const auctionContract = createNFTAuctionContract(
        AUCTION_CONTRACT_ADDRESS,
        signer
      );
      const allAuctions = await auctionContract.getUserAuctions(userAddress);
      const expiredAuctions = filterExpiredAuctions(allAuctions, userAddress);

      console.log("All auctions:", allAuctions);
      console.log("Filtered expired auctions:", expiredAuctions);

      if (!expiredAuctions || expiredAuctions.length === 0) {
        setAuctions([]);
        return;
      }

      const nftContract = createNFTContract(NFT_CONTRACT_ADDRESS, signer);

      // Use the new contract method to get expired auctions
      const auctionPromises = expiredAuctions.map(async (auction) => {
        try {
          let metadata = {
            name: `NFT #${auction.tokenId}`,
            description: "No description available",
            image: generateCustomPlaceholderURL(200, 200, {
              backgroundColor: "#123456",
              textColor: "#ffffff",
              text: auction.tokenId.toString(),
            }),
          };

          try {
            const uri = await nftContract.tokenURI(auction.tokenId);
            const response = await fetch(uri);
            if (response.ok) {
              const fetchedMetadata = await response.json();
              metadata = {
                name: fetchedMetadata.name || metadata.name,
                description:
                  fetchedMetadata.description || metadata.description,
                image: fetchedMetadata.image || metadata.image,
              };
            }
          } catch (error) {
            console.warn(
              `Failed to fetch metadata for token ${auction.tokenId}:`,
              error
            );
          }

          return {
            tokenId: auction.tokenId.toString(),
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            seller: auction.seller,
            startingPrice: auction.startingPrice,
            highestBid: auction.highestBid,
            highestBidder: auction.highestBidder,
            endTime: auction.startTime + auction.duration,
            active: auction.active,
          };
        } catch (error) {
          console.error(`Error processing auction ${auction.tokenId}:`, error);
          return null;
        }
      });

      const loadedAuctions = (await Promise.all(auctionPromises)).filter(
        Boolean
      ) as EndedAuctionNFT[];

      setAuctions(loadedAuctions);
    } catch (error) {
      console.error("Error loading expired auctions:", error);
      setError("Failed to load expired auctions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeAuction = async (tokenId: string) => {
    try {
      setProcessingAction(tokenId);
      setError(null);
      const signer = await provider!.getSigner();
      const auctionContract = createNFTAuctionContract(
        AUCTION_CONTRACT_ADDRESS,
        signer
      );

      const tx = await auctionContract.finalizeExpiredAuction(tokenId);
      await tx.wait();
      await loadExpiredAuctions();
    } catch (error: any) {
      console.error("Error finalizing auction:", error);
      setError(
        error.message || "Failed to finalize auction. Please try again."
      );
    } finally {
      setProcessingAction(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#212121]/80 backdrop-blur-md">
        <Header onMenuClick={() => {}} />
        <main className="container mx-auto px-4 py-8">
          <p className="text-white text-center">
            Please connect your wallet to view your expired auctions.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121]/80 backdrop-blur-md">
      <Header onMenuClick={() => {}} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">
          My Expired Auctions
        </h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-white text-center">
            Loading your expired auctions...
          </p>
        ) : auctions.length === 0 ? (
          <p className="text-white text-center">
            You don't have any expired auctions to finalize.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <div
                key={auction.tokenId}
                className="bg-gray-800/30 rounded-xl p-4"
              >
                <div className="relative">
                  {auction.image && (
                    <img
                      src={auction.image}
                      alt={auction.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
                        target.src = "/placeholder-nft.jpg";
                      }}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-white text-xl font-bold flex justify-between items-center">
                    <span>{auction.name}</span>
                    <span className="text-sm text-gray-400">
                      {formatTokenId(auction.tokenId)}
                    </span>
                  </h3>

                  <div className="space-y-1">
                    <p className="text-purple-400">
                      Starting Price:{" "}
                      {ethers.formatEther(auction.startingPrice)} STT
                    </p>
                    <p className="text-purple-400">
                      Final Bid: {ethers.formatEther(auction.highestBid)} STT
                    </p>
                    {auction.highestBidder !== ethers.ZeroAddress && (
                      <p className="text-gray-400">
                        Highest Bidder: {auction.highestBidder.slice(0, 6)}...
                        {auction.highestBidder.slice(-4)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-yellow-400">Expired</span>
                  </div>

                  {auction.highestBid === 0n ? (
                    <button
                      onClick={() => handleFinalizeAuction(auction.tokenId)}
                      disabled={processingAction === auction.tokenId}
                      className="w-full px-4 py-2 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 disabled:bg-purple-400 transition-colors"
                    >
                      {processingAction === auction.tokenId
                        ? "Processing..."
                        : "Reclaim NFT"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFinalizeAuction(auction.tokenId)}
                      disabled={processingAction === auction.tokenId}
                      className="w-full px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-green-400 transition-colors"
                    >
                      {processingAction === auction.tokenId
                        ? "Processing..."
                        : "Finalize Auction"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
