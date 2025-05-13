import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const UserRecordsModule = buildModule("UserRecordsModule", (m) => {
  const userRecords = m.contract("UserRecords");
  return { userRecords };
});

export default UserRecordsModule;
