const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const OwnableModule = buildModule("OwnableModule", (m: { contract: (arg0: string, arg1: never[]) => any; }) => {
    const ownable = m.contract("Ownable", []);
    return { ownable };
});

module.exports = OwnableModule;
