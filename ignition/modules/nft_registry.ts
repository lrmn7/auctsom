import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NFTRegistryModule = buildModule("NFTRegistryModule", (m) => {
  const registry = m.contract("NFTRegistry", []);
  
  return { registry };
});

export default NFTRegistryModule;
