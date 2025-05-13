// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./interfaces/Ownable.sol";

contract UserRecords is Ownable {
    struct Transaction {
        uint256 timestamp;
        TransactionType transactionType;
        uint256 tokenId;
        uint256 value;
        address from;
        address to;
        bool success;
    }

    enum TransactionType { MINT, BID, CREATE_AUCTION, END_AUCTION, CANCEL_AUCTION, TRANSFER }

    mapping(address => Transaction[]) private _userTransactions;
    Transaction[] private _allTransactions;

    event TransactionRecorded(address indexed user, TransactionType indexed transactionType, uint256 tokenId, uint256 value, uint256 timestamp);

    function recordTransaction(address user, TransactionType transactionType, uint256 tokenId, uint256 value, address from, address to, bool success) external {
        Transaction memory newTx = Transaction({ timestamp: block.timestamp, transactionType: transactionType, tokenId: tokenId,
            value: value, from: from, to: to,success: success
        });

        _userTransactions[user].push(newTx);
        _allTransactions.push(newTx);

        emit TransactionRecorded(user, transactionType, tokenId, value, block.timestamp);
    }

    function getUserTransactions(address user) external view returns (Transaction[] memory) {
        return _userTransactions[user];
    }

    function getAllTransactions() external view returns (Transaction[] memory) {
        return _allTransactions;
    }

    function getUserTransactionCount(address user) external view returns (uint256) {
        return _userTransactions[user].length;
    }

    function getTransactionCountByType(address user, TransactionType txType) external view returns (uint256) {
        uint256 count = 0;
        for(uint i = 0; i < _userTransactions[user].length; i++) {
            if(_userTransactions[user][i].transactionType == txType) {
                count++;
            }
        }
        return count;
    }
}
