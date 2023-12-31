import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProtoCoin Tests", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Protocoin = await ethers.getContractFactory("ProtoCoin");
    const protocoin = await Protocoin.deploy();

    return { protocoin, owner, otherAccount };
  }

  it("Should have correct name", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const name = await protocoin.name();
    expect(name).to.equal("PauliNCoin");
  });

  it("Should have correct decimals", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const symbol = await protocoin.symbol();
    expect(symbol).to.equal("PNC");
  });

  it("Should have correct decimals", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const decimals = await protocoin.decimals();
    expect(decimals).to.equal(18);
  });

  it("Should have correct decimals", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const totalSupply = await protocoin.totalSupply();
    expect(totalSupply).to.equal(1000n * 10n ** 18n);
  });

  it("Should get balance", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const balance = await protocoin.balanceOf(owner.address);
    expect(balance).to.equal(1000n * 10n ** 18n);
  });

  it("Should transfer", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const balanceOwnerBefore = await protocoin.balanceOf(owner.address);
    const balanceOtherBefore = await protocoin.balanceOf(otherAccount.address);

    await protocoin.transfer(otherAccount.address, 1n);

    const balanceOwnerAfter = await protocoin.balanceOf(owner.address);
    const balanceOtherAfter = await protocoin.balanceOf(otherAccount.address);

    expect(balanceOwnerBefore).to.equal(1000n * 10n ** 18n);

    expect(balanceOtherBefore).to.equal(0);
    expect(balanceOtherAfter).to.equal(1);
  });

  it("Should NOT transfer", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);

    const instance = protocoin.connect(otherAccount);
    await expect(
      instance.transfer(owner.address, 1n)
    ).to.be.revertedWithCustomError(protocoin, "ERC20InsufficientBalance");
  });

  it("Should NOT transfer", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);

    await protocoin.approve(otherAccount.address, 1n);

    const value = await protocoin.allowance(
      owner.address,
      otherAccount.address
    );

    expect(value).to.equal(1n);
  });

  it("Should transfer from", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);
    const balanceOwnerBefore = await protocoin.balanceOf(owner.address);
    const balanceOtherBefore = await protocoin.balanceOf(otherAccount.address);

    await protocoin.approve(otherAccount.address, 10n);

    const instance = protocoin.connect(otherAccount);
    await instance.transferFrom(owner.address, otherAccount.address, 5n);

    const balanceOwnerAfter = await protocoin.balanceOf(owner.address);
    const balanceOtherAfter = await protocoin.balanceOf(otherAccount.address);
    const allowance = await protocoin.allowance(
      owner.address,
      otherAccount.address
    );

    expect(balanceOwnerBefore).to.equal(1000n * 10n ** 18n);

    expect(balanceOtherBefore).to.equal(0);
    expect(balanceOtherAfter).to.equal(5);
    expect(allowance).to.equal(5);
  });

  it("Should NOT transfer from (balance)", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);

    const instance = protocoin.connect(otherAccount);

    await expect(
      instance.transferFrom(otherAccount.address, otherAccount.address, 1n)
    ).to.be.rejectedWith("Insufficient balance");
  });

  it("Should NOT transfer from (allowance)", async function () {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);

    const instance = protocoin.connect(otherAccount);

    await expect(
      instance.transferFrom(owner.address, otherAccount.address, 1n)
    ).to.be.rejectedWith("insufficiente allowance");
  });

  it("Should mint once", async () => {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);

    const mintAmount = 1000n;
    await protocoin.setMintAmount(mintAmount);

    const balanceBefore = await protocoin.balanceOf(otherAccount.address);

    const instance = protocoin.connect(otherAccount);
    await instance.mint();

    const balanceAfter = await protocoin.balanceOf(otherAccount.address);
    expect(balanceAfter).to.equal(balanceBefore + mintAmount);
  });

  it("Should mint twice (different accounts)", async () => {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);

    const mintAmount = 1000n;
    await protocoin.setMintAmount(mintAmount);

    const balanceBefore = await protocoin.balanceOf(owner.address);
    await protocoin.mint();

    const instance = protocoin.connect(otherAccount);
    await instance.mint();

    const balanceAfter = await protocoin.balanceOf(otherAccount.address);
    expect(balanceAfter).to.equal(balanceBefore + mintAmount);
  });

  it("Should mint twice (different moments)", async () => {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);

    const mintAmount = 1000n;
    await protocoin.setMintAmount(mintAmount);

    const balanceBefore = await protocoin.balanceOf(owner.address);
    await protocoin.mint();

    const mintDelay = 60 * 60 * 24 * 2;
    await time.increase(mintDelay);

    await protocoin.mint();

    const balanceAfter = await protocoin.balanceOf(otherAccount.address);
    expect(balanceAfter).to.equal(balanceBefore + mintAmount);
  });

  it("Should NOT set mint amount", async () => {
    const { protocoin, owner, otherAccount } = await loadFixture(deployFixture);

    const mintAmount = 1000n;

    const instance = protocoin.connect(otherAccount);

    await expect(instance.setMintAmount(mintAmount)).to.be.revertedWith(
      "You do not have permission"
    );
  });
});
