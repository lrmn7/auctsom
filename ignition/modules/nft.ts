import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

if (!process.env.NEXT_PUBLIC_NFT_REGISTRY_ADDRESS) {
    throw new Error("NFT_REGISTRY_ADDRESS is not defined in environment variables");
}
if (!process.env.NEXT_PUBLIC_USER_RECORDS_ADDRESS) {
    throw new Error("USER_RECORDS_ADDRESS is not defined in environment variables");
}

const NFT_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_NFT_REGISTRY_ADDRESS;
const USER_RECORDS_ADDRESS = process.env.NEXT_PUBLIC_USER_RECORDS_ADDRESS;

export default buildModule("NFTModule", (m) => {
    const nft = m.contract("NFT", [
        "AuctSom",            // Name           
        "AuctSom",            // Symbol 
        NFT_REGISTRY_ADDRESS,
        USER_RECORDS_ADDRESS
    ]);

    return { nft };
});
