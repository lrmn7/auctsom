import { ethers } from 'ethers';
import NFTAuctionContractABI from '../../artifacts/contracts/NFTAuction.sol/NFTAuction.json';

export interface Auction {
  seller: string;
  tokenId: bigint;
  startingPrice: bigint;
  duration: bigint;
  startTime: bigint;
  active: boolean;
  highestBidder: string;
  highestBid: bigint;
}

// Add utility function for filtering expired auctions
export function filterExpiredAuctions(auctions: Auction[], userAddress: string): Auction[] {
  const currentTime = Math.floor(Date.now() / 1000);
  return auctions.filter(auction => 
    auction.active && 
    auction.seller.toLowerCase() === userAddress.toLowerCase() &&
    Number(auction.startTime) + Number(auction.duration) <= currentTime
  );
}

export interface NFTAuctionContract {
  creationFee(): Promise<bigint>;
  bidFee(): Promise<bigint>;
  finalizePercentage(): Promise<bigint>;
  minBidIncrement(): Promise<bigint>;
  minAuctionDuration(): Promise<bigint>;
  maxAuctionDuration(): Promise<bigint>;
  
  createAuction(
    tokenId: ethers.BigNumberish,
    startingPrice: ethers.BigNumberish,
    duration: ethers.BigNumberish,
    overrides?: ethers.Overrides & { value?: ethers.BigNumberish }
  ): Promise<ethers.ContractTransactionResponse>;
  
  placeBid(
    tokenId: ethers.BigNumberish,
    overrides?: ethers.Overrides & { value?: ethers.BigNumberish }
  ): Promise<ethers.ContractTransactionResponse>;
  
  getAuction(
    tokenId: ethers.BigNumberish
  ): Promise<Auction>;
  
  getUserAuctions(
    user: string
  ): Promise<Auction[]>;
  
  getAllActiveAuctions(): Promise<Auction[]>;

  cancelAuction(
    tokenId: ethers.BigNumberish
  ): Promise<ethers.ContractTransactionResponse>;

  finalizeExpiredAuction(
    tokenId: ethers.BigNumberish
  ): Promise<ethers.ContractTransactionResponse>;

  whitelistCollection(
    collection: string,
    status: boolean
  ): Promise<ethers.ContractTransactionResponse>;


  getUserExpiredAuctions(
    user: string
  ): Promise<Auction[]>;
}

export function createNFTAuctionContract(
  address: string,
  provider: ethers.Provider | ethers.Signer
): NFTAuctionContract {
  const contract = new ethers.Contract(
    address,
    NFTAuctionContractABI.abi,
    provider
  );
  
  return {
    creationFee: () => contract.creationFee(),
    bidFee: () => contract.bidFee(),
    finalizePercentage: () => contract.finalizePercentage(),
    minBidIncrement: () => contract.minBidIncrement(),
    minAuctionDuration: () => contract.minAuctionDuration(),
    maxAuctionDuration: () => contract.maxAuctionDuration(),
    
    createAuction: (tokenId, startingPrice, duration, overrides) =>
      contract.createAuction(tokenId, startingPrice, duration, overrides),
    
    placeBid: (tokenId, overrides) => 
      contract.placeBid(tokenId, overrides),
    
    getAuction: (tokenId) => 
      contract.getAuction(tokenId),
    
    getUserAuctions: (user) => 
      contract.getUserAuctions(user),
    
    getAllActiveAuctions: () => 
      contract.getAllActiveAuctions(),

    cancelAuction: (tokenId) => 
      contract.cancelAuction(tokenId),
    
    finalizeExpiredAuction: (tokenId) => 
      contract.finalizeExpiredAuction(tokenId),
    
    whitelistCollection: (collection, status) => 
      contract.whitelistCollection(collection, status),
    
    getUserExpiredAuctions: async (user: string) => {
      try {
        const result = await contract.getUserAuctions(user);
        return filterExpiredAuctions(result, user);
      } catch (error) {
        console.error('Error getting expired auctions:', error);
        return [];
      }
    }
  };
}