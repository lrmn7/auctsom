import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "ethers";

if (!process.env.NEXT_PUBLIC_USER_RECORDS_ADDRESS) {
  throw new Error("USER_RECORDS_ADDRESS is not defined in environment variables");
}

const NFTAuctionCombinedModule = buildModule("NFTAuctionCombinedModule", (m) => {
  const nftAddress = m.getParameter(
    "nftAddress", 
    process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || ""
  );
  const userRecordsAddress = m.getParameter(
    "userRecordsAddress", 
    process.env.NEXT_PUBLIC_USER_RECORDS_ADDRESS || ""
  );
  const nftAuctionRegistry = m.contract("NFTAuctionRegistry", []);
  const creationFee = ethers.parseEther("0.1").toString();

  const bidFee = ethers.parseEther("0.05").toString();
  const finalizePercentage = "250";
  const minDuration = "30";
  const maxDuration = "604800";

  const nftAuction = m.contract("NFTAuction", [
    nftAddress,
    creationFee,
    bidFee,
    finalizePercentage,
    minDuration,
    maxDuration,
    userRecordsAddress,
    nftAuctionRegistry 
  ]);

  m.call(nftAuctionRegistry, "transferOwnership", [nftAuction]);

  return { nftAuctionRegistry, nftAuction };
});

export default NFTAuctionCombinedModule;
