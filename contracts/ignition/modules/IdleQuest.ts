// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const IdleQuestModule = buildModule("IdleQuestModule", (m) => {
  const idleQuest = m.contract("IdleQuest");

  return { idleQuest };
});

export default IdleQuestModule;
