"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { AuthProvider, useAuth } from "../../context/authcontext";
import Header from "../../components/common/header/header";
import { createNFTContract } from "../../utils/nft_contract";
import { createNFTAuctionContract } from "../../utils/nft_auction_contract";
import { Snackbar, Alert } from "@mui/material";
import toast from "react-hot-toast";
const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "";
const AUCTION_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS || "";

type AuctionNFT = {
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

export default function Auctions() {
  return (
    <AuthProvider>
      <AuctionsContent />
    </AuthProvider>
  );
}

function AuctionsContent() {
  const { provider, isAuthenticated, isConnecting } = useAuth();
  const [auctions, setAuctions] = useState<AuctionNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<AuctionNFT | null>(
    null
  );
  const [bidAmount, setBidAmount] = useState("");
  const [cancellingAuction, setCancellingAuction] = useState<string | null>(
    null
  );
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "info" | "success" | "error",
  });

  useEffect(() => {
    if (isAuthenticated && provider) {
      loadUserAddress();
      loadAuctions();
      const interval = setInterval(loadAuctions, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, provider]);

  const formatTimeLeft = (diff: number): string => {
    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(" ");
  };

  const getTimeLeft = (auction: AuctionNFT): string => {
    if (!auction?.tokenId || !auction?.endTime) return "Invalid";

    const now = Math.floor(Date.now() / 1000);
    const endTime = Number(auction.endTime);
    const diff = endTime - now;

    if (diff <= 0) {
      if (auction.active && auction.highestBid > 0n) {
        return "Ended, waiting for approval";
      }
      return "Ended";
    }

    return formatTimeLeft(diff);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const newTimeLeft: { [key: string]: string } = {};

      auctions.forEach((auction) => {
        if (!auction?.endTime) return;

        const endTime = Number(auction.endTime);
        const diff = endTime - now;

        if (diff <= 0) {
          newTimeLeft[auction.tokenId] = auction.active
            ? "Ended, waiting for approval"
            : "Ended";
        } else {
          newTimeLeft[auction.tokenId] = formatTimeLeft(diff);
        }
      });

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [auctions]);

  const loadUserAddress = async () => {
    if (provider && isAuthenticated) {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);
    }
  };

  const loadAuctions = async () => {
    try {
      setIsLoading(true);
      const signer = await provider!.getSigner();
      const auctionContract = createNFTAuctionContract(
        AUCTION_CONTRACT_ADDRESS,
        signer
      );
      const nftContract = createNFTContract(NFT_CONTRACT_ADDRESS, signer);

      const activeAuctions = await auctionContract.getAllActiveAuctions();
      console.log("Active auctions:", activeAuctions);

      const auctionPromises = activeAuctions.map(async (auction) => {
        const uri = await nftContract.tokenURI(auction.tokenId);
        const metadata = await fetch(uri)
          .then((res) => res.json())
          .catch(() => ({}));

        return {
          tokenId: auction.tokenId.toString(),
          name: metadata.name || `NFT #${auction.tokenId}`,
          description: metadata.description || "No description available",
          image: metadata.image,
          seller: auction.seller,
          startingPrice: auction.startingPrice,
          highestBid: auction.highestBid,
          highestBidder: auction.highestBidder,
          endTime: auction.startTime + auction.duration,
          active: auction.active,
        };
      });

      const loadedAuctions = await Promise.all(auctionPromises);
      setAuctions(loadedAuctions);
    } catch (error) {
      console.error("Error loading auctions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const placeBid = async (auction: AuctionNFT) => {
    try {
      if (!bidAmount) {
        toast.error("Please enter a bid amount");
        return;
      }

      const signer = await provider!.getSigner();
      const auctionContract = createNFTAuctionContract(
        AUCTION_CONTRACT_ADDRESS,
        signer
      );

      const minBidAmount =
        auction.highestBid === 0n
          ? auction.startingPrice
          : auction.highestBid +
            (auction.highestBid * BigInt(500)) / BigInt(10000);

      if (ethers.parseEther(bidAmount) < minBidAmount) {
        toast.error("Bid amount too low");
        return;
      }
      const feeData = await provider!.getFeeData();
      const tx = await auctionContract.placeBid(auction.tokenId, {
        value: ethers.parseEther(bidAmount),
        gasPrice: feeData.gasPrice,
      });

      setSnackbar({
        open: true,
        message: "Placing bid... Please wait.",
        severity: "info",
      });
      const receipt = await tx.wait();

      if (receipt) {
        const gasUsed = receipt.gasUsed;
        const gasPrice = receipt.gasPrice;
        const gasCost = gasUsed * gasPrice;
        const gasCostInEth = ethers.formatEther(gasCost);

        setSnackbar({
          open: true,
          message: `Bid placed successfully! Gas used: ${gasUsed.toString()} units (${gasCostInEth} STT)`,
          severity: "success",
        });
      }

      setSelectedAuction(null);
      setBidAmount("");
      await loadAuctions();
    } catch (error) {
      console.error("Error placing bid:", error);
      if (
        (error as any)?.code === 4001 ||
        (error as any)?.reason === "rejected" ||
        (error as any)?.message?.includes("user denied") ||
        (error as any)?.message?.includes("User denied")
      ) {
        toast.error("Transaction cancelled by user");
      } else {
        toast.error("Unknown error. Please try again.");
      }
    }
  };

  const handleCancelAuction = async (tokenId: string) => {
    if (!provider || !isAuthenticated) return;

    try {
      setCancellingAuction(tokenId);
      const signer = await provider.getSigner();
      const contract = createNFTAuctionContract(
        AUCTION_CONTRACT_ADDRESS,
        signer
      );

      const tx = await contract.cancelAuction(tokenId);
      await tx.wait();
      loadAuctions();
    } catch (error) {
      console.error("Error cancelling auction:", error);
    } finally {
      setCancellingAuction(null);
    }
  };

  const isAuctionEnded = (auction: AuctionNFT): boolean => {
    const now = Math.floor(Date.now() / 1000);
    const endTime = Number(auction.endTime);
    return endTime <= now;
  };

  const canCancelAuction = (auction: AuctionNFT): boolean => {
    return (
      !isAuctionEnded(auction) &&
      auction.highestBid === 0n &&
      auction.seller.toLowerCase() === userAddress?.toLowerCase()
    );
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
          <p className="text-white text-center">
            Please connect your wallet to view auctions.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121]/80 backdrop-blur-md">
      <Header onMenuClick={() => {}} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Active Auctions</h1>

        {isLoading ? (
          <p className="text-white text-center">Loading auctions...</p>
        ) : auctions.length === 0 ? (
          <p className="text-white text-center">
            No active auctions available.
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
                    />
                  )}
                  <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded-lg">
                    <p className="text-purple-400 text-sm">
                      Min Bid: {ethers.formatEther(auction.startingPrice)} STT
                    </p>
                  </div>
                </div>
                <h3 className="text-white text-xl font-bold">{auction.name}</h3>
                <p className="text-gray-400 mt-2">{auction.description}</p>
                <div className="mt-4 space-y-2">
                  <p className="text-purple-400">
                    Current Bid: {ethers.formatEther(auction.highestBid)} STT
                  </p>
                  <p className="text-purple-400">
                    Time Left: {getTimeLeft(auction)}
                  </p>
                  <p className="text-gray-400">
                    Seller: {auction.seller.slice(0, 6)}...
                    {auction.seller.slice(-4)}
                  </p>
                  {auction.highestBidder !== ethers.ZeroAddress && (
                    <div className="flex justify-between items-center">
                      <p className="text-gray-400">
                        Highest Bidder: {auction.highestBidder.slice(0, 6)}...
                        {auction.highestBidder.slice(-4)}
                      </p>
                      <p className="text-purple-400 font-medium">
                        {ethers.formatEther(auction.highestBid)} STT
                      </p>
                    </div>
                  )}
                </div>
                {canCancelAuction(auction) && (
                  <button
                    onClick={() => handleCancelAuction(auction.tokenId)}
                    disabled={cancellingAuction === auction.tokenId}
                    className="mt-4 w-full px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:bg-red-400"
                  >
                    {cancellingAuction === auction.tokenId
                      ? "Cancelling..."
                      : "Cancel Auction"}
                  </button>
                )}
                {auction.seller.toLowerCase() !==
                  userAddress?.toLowerCase() && (
                  <button
                    onClick={() => setSelectedAuction(auction)}
                    className="mt-4 w-full px-4 py-2 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600"
                  >
                    Place Bid
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedAuction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4">
                Place Bid for {selectedAuction.name}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  placeBid(selectedAuction);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Bid Amount (STT)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
                    required
                    min={ethers.formatEther(selectedAuction.highestBid)}
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600"
                  >
                    Place Bid
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAuction(null)}
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
