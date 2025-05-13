// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./interfaces/InterfaceERC721.sol";
import "./interfaces/Ownable.sol";
import "./NFTRegistry.sol";
import "./UserRecords.sol";

contract NFT is InterfaceERC721, Ownable {
    string private _name;
    string private _symbol;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => string) private _tokenURIs;

    NFTRegistry private _registry;
    UserRecords private _userRecords;

    event TokenURISet(uint256 indexed tokenId, string uri);

    constructor(
        string memory name_, string memory symbol_, address registryAddress, address userRecordsAddress) {
        _name = name_;
        _symbol = symbol_;
        _registry = NFTRegistry(registryAddress);
        _userRecords = UserRecords(userRecordsAddress);
    }

    function name() external view override returns (string memory) {
        return _name;
    }

    function symbol() external view override returns (string memory) {
        return _symbol;
    }

    function tokenURI(uint256 tokenId) external view override returns (string memory) {
        require(isValidTokenId(tokenId), "Invalid token ID");
        require(_owners[tokenId] != address(0), "Token does not exist");
        string memory uri = _tokenURIs[tokenId];
        require(isValidMetadataURI(uri), "URI not set");
        return uri;
    }

    function ownerOf(uint256 tokenId) external view override returns (address) {
        return _owners[tokenId];
    }

    function approve(address to, uint256 tokenId) external override {
        address owner = _owners[tokenId];
        require(msg.sender == owner || _operatorApprovals[owner][msg.sender], "Not authorized");
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function getApproved(uint256 tokenId) external view override returns (address) {
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) external override {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(isValidTransfer(from, to, tokenId), "Invalid transfer parameters");
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized");
        _transfer(from, to, tokenId);
    }

    function mintWithMetadata(address to, uint256 tokenId, string memory tokenURI_) external {
        require(validateMintParams(to, tokenId, tokenURI_), "Invalid mint parameters");
        require(_owners[tokenId] == address(0), "Token already exists");
        require(msg.sender == to || msg.sender == owner(), "Not authorized to mint");

        _balances[to] += 1;
        _owners[tokenId] = to;
        _tokenURIs[tokenId] = tokenURI_;

        bool registered = false;
        try _registry.registerNFT(address(this), to, tokenId) {
            registered = true;
        } catch {
            _balances[to] -= 1;
            delete _owners[tokenId];
            delete _tokenURIs[tokenId];
            revert("Failed to register NFT");
        }

        if (registered) {
            emit TokenURISet(tokenId, tokenURI_);
            emit Transfer(address(0), to, tokenId);
            
            _userRecords.recordTransaction(to,UserRecords.TransactionType.MINT,tokenId, 0,
                address(0), to, true);
        }
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        require(_owners[tokenId] == from, "Not token owner");
        require(to != address(0), "Invalid address");

        _approve(address(0), tokenId);
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        _userRecords.recordTransaction(from, UserRecords.TransactionType.TRANSFER, tokenId, 0, from, to, true);

        emit Transfer(from, to, tokenId);
        _registry.transferNFT(address(this), from, to, tokenId);
    }

    function _approve(address to, uint256 tokenId) private {
        _tokenApprovals[tokenId] = to;
        emit Approval(_owners[tokenId], to, tokenId);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) private view returns (bool) {
        address owner = _owners[tokenId];
        return (spender == owner || _tokenApprovals[tokenId] == spender || _operatorApprovals[owner][spender]);
    }

    function getAllTokensOfOwner(address owner) external view returns (uint256[] memory) {
        return _registry.getUserNFTs(owner);
    }

    function isValidTokenId(uint256 tokenId) private pure returns (bool) {
        return tokenId > 0;
    }

    function isValidMetadataURI(string memory uri) private pure returns (bool) {
        return bytes(uri).length > 0;
    }

    function isValidTransfer(address from, address to, uint256 tokenId) private pure returns (bool) {
        return from != address(0) && to != address(0) && tokenId > 0;
    }

    function validateMintParams(address to, uint256 tokenId, string memory uri) private pure returns (bool) {
        return to != address(0) && 
               tokenId > 0 && 
               bytes(uri).length > 0;
    }
}
