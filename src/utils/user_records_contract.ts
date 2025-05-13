import { ethers } from "ethers";
import UserRecordsABI from "../../artifacts/contracts/UserRecords.sol/UserRecords.json";

export enum TransactionType {
  MINT,
  BID,
  CREATE_AUCTION,
  END_AUCTION,
  CANCEL_AUCTION,
  TRANSFER,
}

export interface Transaction {
  timestamp: bigint;
  transactionType: TransactionType;
  tokenId: bigint;
  value: bigint;
  from: string;
  to: string;
  success: boolean;
}

export interface UserRecordsContract {
  recordTransaction(
    user: string,
    transactionType: TransactionType,
    tokenId: ethers.BigNumberish,
    value: ethers.BigNumberish,
    from: string,
    to: string,
    success: boolean
  ): Promise<ethers.ContractTransactionResponse>;

  getUserTransactions(user: string): Promise<Transaction[]>;

  getAllTransactions(): Promise<Transaction[]>;

  getUserTransactionCount(user: string): Promise<bigint>;

  getTransactionCountByType(
    user: string,
    txType: TransactionType
  ): Promise<bigint>;
}

export function createUserRecordsContract(
  address: string,
  provider: ethers.Provider | ethers.Signer
): UserRecordsContract {
  const contract = new ethers.Contract(address, UserRecordsABI.abi, provider);

  return {
    recordTransaction: (
      user,
      transactionType,
      tokenId,
      value,
      from,
      to,
      success
    ) =>
      contract.recordTransaction(
        user,
        transactionType,
        tokenId,
        value,
        from,
        to,
        success
      ),

    getUserTransactions: async (user) => {
      const result = await contract.getUserTransactions(user);
      return Array.isArray(result) ? result : [];
    },

    getAllTransactions: async () => {
      const result = await contract.getAllTransactions();
      return Array.isArray(result) ? result : [];
    },

    getUserTransactionCount: (user) => contract.getUserTransactionCount(user),

    getTransactionCountByType: (user, txType) =>
      contract.getTransactionCountByType(user, txType),
  };
}
