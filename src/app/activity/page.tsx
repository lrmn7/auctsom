'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { AuthProvider, useAuth } from '../../context/authcontext';
import Header from '../../components/common/header/header';
import { createUserRecordsContract, TransactionType, Transaction } from '../../utils/user_records_contract';

const USER_RECORDS_ADDRESS = process.env.NEXT_PUBLIC_USER_RECORDS_ADDRESS || '';

export default function Activity() {
  return (
    <AuthProvider>
      <ActivityContent />
    </AuthProvider>
  );
}

function ActivityContent() {
  const { isAuthenticated, isConnecting, provider } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && provider) {
      loadUserTransactions();
    }
  }, [isAuthenticated, provider]);

  const loadUserTransactions = async () => {
    try {
      setIsLoading(true);
      const signer = await provider!.getSigner();
      const address = await signer.getAddress();
      const userRecordsContract = createUserRecordsContract(USER_RECORDS_ADDRESS, signer);

      const txs = await userRecordsContract.getUserTransactions(address);
      const sortedTxs = [...txs].sort((a, b) => Number(b.timestamp - a.timestamp));
      setTransactions(sortedTxs);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const getTransactionTypeLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.MINT: return 'Minted';
      case TransactionType.BID: return 'Placed Bid';
      case TransactionType.CREATE_AUCTION: return 'Created Auction';
      case TransactionType.END_AUCTION: return 'Ended Auction';
      case TransactionType.CANCEL_AUCTION: return 'Cancelled Auction';
      case TransactionType.TRANSFER: return 'Transferred';
      default: return 'Unknown';
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
          <p className="text-white text-center">Please connect your wallet to view your activity.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121]/80 backdrop-blur-md">
      <Header onMenuClick={() => {}} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Activity Log</h1>

        {isLoading ? (
          <p className="text-white text-center">Loading activity...</p>
        ) : transactions.length === 0 ? (
          <p className="text-white text-center">No activity found.</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <div key={`${tx.timestamp}-${index}`} className="bg-gray-600/30 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-purple-400 font-bold">
                      {getTransactionTypeLabel(tx.transactionType)}
                    </span>
                    <p className="text-gray-400 text-sm mt-1">
                      Token ID: #{tx.tokenId.toString()}
                    </p>
                    {tx.value > 0n && (
                      <p className="text-gray-400 text-sm">
                        Value: {ethers.formatEther(tx.value)} ETH
                      </p>
                    )}
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-400 text-sm">
                        From: {formatAddress(tx.from)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        To: {formatAddress(tx.to)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-sm">
                      {formatTimestamp(tx.timestamp)}
                    </span>
                    <div className="mt-1">
                      <span className={`text-sm ${tx.success ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.success ? '✓ Success' : '✗ Failed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
