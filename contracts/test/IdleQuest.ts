import { expect } from "chai";
import hre from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { IdleQuest } from "../typechain-types";

describe("IdleQuest", () => {
  let owner: HardhatEthersSigner;
  let otherAccount: HardhatEthersSigner;
  let idleQuest: IdleQuest;

  before(async () => {
    // Contracts are deployed using the first signer/account by default
    [owner, otherAccount] = await hre.ethers.getSigners();

    const IdleQuest = await hre.ethers.getContractFactory("IdleQuest");
    idleQuest = await IdleQuest.deploy();
  });

  it("Should set the rignt owner", async () => {
    expect(await idleQuest.owner()).to.equal(owner.address);
  });

  it("Should return zero if the address does not exist", async () => {
    expect(await idleQuest.get(otherAccount.address)).to.equal(0n);
  });

  it("Should allow the owner to increment quest points for address", async () => {
    await idleQuest.set(otherAccount.address, 10n);
    expect(await idleQuest.get(otherAccount.address)).to.equal(10n);

    await idleQuest.set(otherAccount.address, 10n);
    expect(await idleQuest.get(otherAccount.address)).to.equal(20n);
  });

  it("Should not allow other addresses to update quest points", async () => {
    await expect(
      idleQuest.connect(otherAccount).set(otherAccount.address, 10n)
    ).to.be.rejectedWith(/OwnableUnauthorizedAccount/);
  });

  it("Should emit an event when quest points are updated", async () => {
    const currentPoints = await idleQuest.get(otherAccount.address);

    await expect(idleQuest.set(otherAccount.address, 10n))
      .to.emit(idleQuest, "QuestPointsAdded")
      .withArgs(otherAccount.address, currentPoints + 10n);
  });
});
