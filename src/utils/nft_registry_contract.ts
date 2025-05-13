import { ethers } from "ethers";
import NFTRegistryABI from "../../artifacts/contracts/NFTRegistry.sol/NFTRegistry.json";

export interface NFTRegistryContract {
  registerNFT(
    collection: string,
    owner: string,
    tokenId: ethers.BigNumberish
  ): Promise<ethers.ContractTransactionResponse>;

  transferNFT(
    collection: string,
    from: string,
    to: string,
    tokenId: ethers.BigNumberish
  ): Promise<ethers.ContractTransactionResponse>;

  getUserNFTs(user: string): Promise<ethers.BigNumberish[]>;

  getAllNFTs(): Promise<Array<ethers.BigNumberish>>;
}

export function createNFTRegistryContract(
  address: string,
  provider: ethers.Provider | ethers.Signer
): NFTRegistryContract {
  const contract = new ethers.Contract(address, NFTRegistryABI.abi, provider);

  return {
    registerNFT: async (
      collection: string,
      owner: string,
      tokenId: ethers.BigNumberish
    ) => {
      try {
        console.log("Registering NFT:", { collection, owner, tokenId });
        const tx = await contract.registerNFT(collection, owner, tokenId);
        const receipt = await tx.wait();
        console.log("NFT registration confirmed:", receipt);
        return tx;
      } catch (error: any) {
        console.error("NFT registration error:", error);
        throw error;
      }
    },

    transferNFT: (collection, from, to, tokenId) =>
      contract.transferNFT(collection, from, to, tokenId),

    getUserNFTs: async (user) => {
      const result = await contract.getUserNFTs(user);
      return result;
    },

    getAllNFTs: async () => {
      try {
        const result = await contract.getAllNFTs();
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.warn("Error fetching NFTs, returning empty array:", error);
        return [];
      }
    },
  };
}
