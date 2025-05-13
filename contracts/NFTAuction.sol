// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./interfaces/InterfaceNFTAuction.sol";
import "./interfaces/InterfaceERC721.sol";
import "./NFT.sol";
import "./interfaces/Pausable.sol";
import "./interfaces/Ownable.sol";
import "./UserRecords.sol";
import "./NFTAuctionRegistry.sol";

contract NFTAuction is Ownable, Pausable, InterfaceNFTAuction {
    InterfaceERC721 private _nftContract;
    UserRecords private _userRecords;
    NFTAuctionRegistry private _registry;
    
    uint256 public creationFee;
    uint256 public bidFee;
    uint256 public finalizePercentage;
    uint256 public minAuctionDuration;
    uint256 public maxAuctionDuration;
    uint256 public minBidIncrement = 500; 
    
    event CreationFeeUpdated(uint256 newFee);
    event BidFeeUpdated(uint256 newFee);
    event FinalizePercentageUpdated(uint256 newPercentage);
    event MinBidIncrementUpdated(uint256 newIncrement);
    event AuctionParametersUpdated(uint256 tokenId, uint256 newDuration);

    constructor(
        address nftContractAddress, uint256 _creationFee, uint256 _bidFee, uint256 _finalizePercentage, uint256 _minDuration, uint256 _maxDuration, address userRecordsAddress, address registryAddress
    ) {
        require(nftContractAddress != address(0), "Invalid NFT contract address");
        require(_minDuration > 0 && _maxDuration > _minDuration, "Invalid duration parameters");
        require(_finalizePercentage <= 10000, "Invalid percentage");
        
        _nftContract = InterfaceERC721(nftContractAddress);
        _registry = NFTAuctionRegistry(registryAddress);
        creationFee = _creationFee;
        bidFee = _bidFee;
        finalizePercentage = _finalizePercentage;
        minAuctionDuration = _minDuration;
        maxAuctionDuration = _maxDuration;
        _userRecords = UserRecords(userRecordsAddress);
    }

    function createAuction(
        uint256 tokenId,
        uint256 startingPrice,
        uint256 duration
    ) external payable override whenNotPaused {
        require(msg.value >= creationFee, "Insufficient creation fee");
        require(duration >= minAuctionDuration && duration <= maxAuctionDuration, "Invalid auction duration");
        require(startingPrice > 0, "Starting price must be greater than 0");
        require(_nftContract.ownerOf(tokenId) == msg.sender, "Caller is not token owner");
        require(_nftContract.getApproved(tokenId) == address(this), "Contract not approved");

        _nftContract.transferFrom(msg.sender, address(this), tokenId);
        _registry.registerAuction(tokenId, msg.sender, startingPrice,duration);
        _userRecords.recordTransaction(msg.sender, UserRecords.TransactionType.CREATE_AUCTION, tokenId,startingPrice,msg.sender,address(this), true);

        emit AuctionCreated(tokenId, msg.sender, startingPrice, duration);
    }

    function placeBid(uint256 tokenId) external override payable whenNotPaused {
        Auction memory auction = _registry.getAuction(tokenId);
        require(auction.active, "Auction is not active");
        require(block.timestamp < auction.startTime + auction.duration, "Auction has ended");
        
        uint256 minBidAmount = auction.highestBid == 0 
            ? auction.startingPrice 
            : auction.highestBid + ((auction.highestBid * minBidIncrement) / 10000);
            
        require(msg.value >= minBidAmount + bidFee, "Bid amount too low");

        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        _registry.updateAuctionBid(tokenId, msg.sender, msg.value - bidFee);
        _userRecords.recordTransaction(msg.sender, UserRecords.TransactionType.BID, tokenId, msg.value, msg.sender, address(this),true);
        emit BidPlaced(tokenId, msg.sender, msg.value);
    }
    function finalizeExpiredAuction(uint256 tokenId) external whenNotPaused {
        Auction memory auction = _registry.getAuction(tokenId);
        require(auction.active, "Auction is not active");
        require(block.timestamp >= auction.startTime + auction.duration, "Auction still ongoing");
        
        _finalizeAuction(auction);
    }

    function _finalizeAuction(Auction memory auction) internal {
        if (auction.highestBidder != address(0)) {
            uint256 finalFee = (auction.highestBid * finalizePercentage) / 10000;
            uint256 sellerAmount = auction.highestBid - finalFee;
            _nftContract.transferFrom(address(this), auction.highestBidder, auction.tokenId);
            payable(auction.seller).transfer(sellerAmount);
            payable(owner()).transfer(finalFee);
            _userRecords.recordTransaction( auction.highestBidder, UserRecords.TransactionType.END_AUCTION, auction.tokenId, auction.highestBid, address(this), auction.highestBidder, true);

            emit AuctionEnded(auction.tokenId, auction.highestBidder, auction.highestBid);
        } else {
            _nftContract.transferFrom(address(this), auction.seller, auction.tokenId);
            emit AuctionCancelled(auction.tokenId);
        }

        _registry.deactivateAuction(auction.tokenId);
    }


    function getAllActiveAuctions() external view returns (Auction[] memory) {
        return _registry.getAllActiveAuctions();
    }

    function cancelAuction(uint256 tokenId) external override whenNotPaused {
        Auction memory auction = _registry.getAuction(tokenId);
        require(auction.active, "Auction not active");
        require(msg.sender == auction.seller || msg.sender == owner(), "Not authorized");
        require(auction.highestBid == 0, "Cannot cancel auction with bids");
        _nftContract.transferFrom(address(this), auction.seller, tokenId);
        _registry.deactivateAuction(tokenId);
        
        emit AuctionCancelled(tokenId);
    }

    function getAuction(uint256 tokenId) external view override returns (Auction memory) {
        return _registry.getAuction(tokenId);
    }

    
    function getUserAuctions(address user) external view returns (Auction[] memory) {
        return _registry.getUserAuctions(user);
    }
}