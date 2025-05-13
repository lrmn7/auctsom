import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PausableModule", (m) => {
    const pausable = m.contract("Pausable", []);

    return { pausable };
});
