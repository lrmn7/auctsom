// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./interfaces/Ownable.sol";
import "./interfaces/InterfaceERC721.sol";

contract NFTRegistry is Ownable {
    mapping(address => uint256[]) private _userNFTs;
    mapping(address => mapping(uint256 => bool)) private _nftCollections;
    uint256[] private _allTokenIds;
    mapping(uint256 => address) private _tokenCollections;
    event NFTRegistered(address indexed collection, address indexed owner, uint256 tokenId);
    event NFTTransferred(address indexed collection, address indexed from, address indexed to, uint256 tokenId);
    
    function registerNFT(address collection, address owner, uint256 tokenId) external {
        require(msg.sender == collection, "Only NFT contract can register");
        require(owner != address(0), "Invalid owner address");
        require(!_nftCollections[collection][tokenId], "Token ID already registered");
        require(collection != address(0), "Invalid collection address");
        
        try InterfaceERC721(collection).ownerOf(tokenId) returns (address tokenOwner) {
            require(tokenOwner == owner, "Token owner mismatch");
            
            _userNFTs[owner].push(tokenId);
            _nftCollections[collection][tokenId] = true;
            _allTokenIds.push(tokenId);
            _tokenCollections[tokenId] = collection;
            
            emit NFTRegistered(collection, owner, tokenId);
        } catch {
            revert("Token does not exist");
        }
    }
    
    function transferNFT(address collection, address from, address to, uint256 tokenId) external {
        require(msg.sender == collection, "Only NFT contract can transfer");
        _removeNFTFromOwner(from, tokenId);
        _userNFTs[to].push(tokenId);
        emit NFTTransferred(collection, from, to, tokenId);
    }
    
    function getUserNFTs(address user) external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](_userNFTs[user].length);
        for(uint256 i = 0; i < _userNFTs[user].length; i++) {
            result[i] = _userNFTs[user][i];
        }
        return result;
    }
    
    function getAllNFTs() external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](_allTokenIds.length);
        for(uint256 i = 0; i < _allTokenIds.length; i++) {
            result[i] = _allTokenIds[i];
        }
        return result;
    }
   
    function _removeNFTFromOwner(address owner, uint256 tokenId) private {
        uint256[] storage userTokens = _userNFTs[owner];
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (userTokens[i] == tokenId) {
                userTokens[i] = userTokens[userTokens.length - 1];
                userTokens.pop();
                break;
            }
        }
    }
}
