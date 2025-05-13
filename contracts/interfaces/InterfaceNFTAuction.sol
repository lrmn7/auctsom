// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface InterfaceNFTAuction {
    struct Auction {
        address seller;
        uint256 tokenId;
        uint256 startingPrice;
        uint256 duration;
        uint256 startTime;
        bool active;
        address highestBidder;
        uint256 highestBid;
    }

    event AuctionCreated(uint256 indexed tokenId, address indexed seller, uint256 startingPrice, uint256 duration);
    event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed tokenId, address indexed winner, uint256 amount);
    event AuctionCancelled(uint256 indexed tokenId);
    event CollectionWhitelistUpdated(address indexed collection, bool status);

    function createAuction(
        uint256 tokenId,
        uint256 startingPrice,
        uint256 duration
    ) external payable;

    function placeBid(uint256 tokenId) external payable;
    function cancelAuction(uint256 tokenId) external;
    function getAuction(uint256 tokenId) external view returns (Auction memory);
}