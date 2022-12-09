const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("staking", function () {
  // accounts
  let admin, user, user2, user3;
  // contracts
  let erc20Con, stakingCon, listCon, listCon2, rewarderCon;
  // constructor variables

  // utils
  let tx;
  const zeroAddr = "0x0000000000000000000000000000000000000000";
  const getNow = async function () {
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      return parseInt(blockBefore.timestamp.toString())
  }
  const init = async function (
    mintAmount = 1e6,
    period = 1e5,
    periodThreshold = 3,
    userNFT = 10,
    user2NFT = 20
  ) {
    // mint
    tx = await erc20Con.mint(rewarderCon.address, mintAmount);
    await tx.wait();
    tx = await erc20Con.mint(user.address, mintAmount);
    await tx.wait();
    tx = await erc20Con.mint(user2.address, mintAmount);
    await tx.wait();
    // approve
    tx = await rewarderCon.connect(admin).approve(erc20Con.address, stakingCon.address, mintAmount);
    await tx.wait();
    tx = await erc20Con.connect(user).approve(stakingCon.address, mintAmount);
    await tx.wait();
    tx = await erc20Con.connect(user2).approve(stakingCon.address, mintAmount);
    await tx.wait();
    // connect whitelist to checker
    tx = await stakingCon.addWhitelist(listCon.address);
    await tx.wait();
    tx = await stakingCon.addWhitelist(listCon2.address);
    await tx.wait();
    // connect checker to whitelist
    tx = await listCon.addChecker(stakingCon.address);
    await tx.wait();
    tx = await listCon2.addChecker(stakingCon.address);
    await tx.wait();
    // add NFTs
    for(var i = 1;i <= userNFT;i++) {
      tx = await listCon.addNFT(user.address, i);
      await tx.wait();
    }
    for(var i = userNFT;i <= user2NFT;i++) {
      tx = await listCon2.addNFT(user2.address, i);
      await tx.wait();
    }
    // set staking parameters
    tx = await stakingCon.updatePeriod(period);
    await tx.wait();
    tx = await stakingCon.setPeriodThreshold(periodThreshold);
    await tx.wait();
    tx = await stakingCon.setRewardingAddress(rewarderCon.address);
    await tx.wait();
    // Add level
    tx = await stakingCon.addLevel(1, 0, 100);
    await tx.wait();
    tx = await stakingCon.addLevel(10, 100, 1000);
    await tx.wait();
    tx = await stakingCon.addLevel(100, 1000, 10000)
    await tx.wait();
  }

  const deposit = async function (
    account,
    amount
  ) {
      tx = await stakingCon.connect(account).deposit(amount);
      await tx.wait();
  }

  const claim = async function (
    account,
    amount
  ) {
      tx = await stakingCon.connect(account).claim(amount);
      await tx.wait();
  }

  const exit = async function (
    account,
  ) {
      tx = await stakingCon.connect(account).exit();
      await tx.wait();
  }

  beforeEach(async function () {
    [admin, user, user2, user3] = await ethers.getSigners();
    const erc20Factory = await ethers.getContractFactory("ERC20Mock");
    const stakingFactory = await ethers.getContractFactory("StakingPools");
    const whitelistFactory = await ethers.getContractFactory("contracts/staking/Whitelist.sol:Whitelist");
    const tokenPoolFactory = await ethers.getContractFactory("contracts/staking/mocks/TokenPool.sol:TokenPool");

    // contract deployment
    // erc20
    erc20Con = await erc20Factory.deploy("name", "symbol");
    await erc20Con.deployed();
    // whitelists
    listCon = await whitelistFactory.deploy(admin.address);
    await listCon.deployed();
    listCon2 = await whitelistFactory.deploy(admin.address);
    await listCon2.deployed();
    // funding pool
    rewarderCon = await tokenPoolFactory.deploy(admin.address);
    await rewarderCon.deployed();
    // stakingPools
    stakingCon = await stakingFactory.deploy(admin.address, erc20Con.address);
    await stakingCon.deployed();
  });

  describe("setting up", function () {
    it("sets up ERC20 token", async function () {
      let mintAmount = 1e5;

      // mint for addresses
      expect(
        await erc20Con.balanceOf(rewarderCon.address)
      ).to.equal(0);
      expect(
        await erc20Con.balanceOf(user.address)
      ).to.equal(0);
      expect(
        await erc20Con.balanceOf(user2.address)
      ).to.equal(0);
      tx = await erc20Con.mint(rewarderCon.address, mintAmount);
      await tx.wait();
      tx = await erc20Con.mint(user.address, mintAmount);
      await tx.wait();
      tx = await erc20Con.mint(user2.address, mintAmount);
      await tx.wait();
      expect(
        await erc20Con.balanceOf(rewarderCon.address)
      ).to.equal(mintAmount);
      expect(
        await erc20Con.balanceOf(user.address)
      ).to.equal(mintAmount);
      expect(
        await erc20Con.balanceOf(user2.address)
      ).to.equal(mintAmount);

      // approve
      expect(
        await erc20Con.allowance(rewarderCon.address, stakingCon.address)
      ).to.equal(0);
      expect(
        await erc20Con.allowance(user.address, stakingCon.address)
      ).to.equal(0);
      expect(
        await erc20Con.allowance(user2.address, stakingCon.address)
      ).to.equal(0);
      tx = await rewarderCon.connect(admin).approve(erc20Con.address, stakingCon.address, mintAmount);
      await tx.wait();
      tx = await erc20Con.connect(user).approve(stakingCon.address, mintAmount);
      await tx.wait();
      tx = await erc20Con.connect(user2).approve(stakingCon.address, mintAmount);
      await tx.wait();
      expect(
        await erc20Con.allowance(rewarderCon.address, stakingCon.address)
      ).to.equal(mintAmount);
      expect(
        await erc20Con.allowance(user.address, stakingCon.address)
      ).to.equal(mintAmount);
      expect(
        await erc20Con.allowance(user2.address, stakingCon.address)
      ).to.equal(mintAmount);
    });

    it("connects whitelists and whitelist checkers", async function () {
      // connect whitelist and whitelistchecker
      expect(
        await stakingCon.governance()
      ).to.equal(admin.address);
      tx = await stakingCon.addWhitelist(listCon.address);
      await tx.wait();
      tx = await stakingCon.addWhitelist(listCon2.address);
      await tx.wait();
      expect(
        await stakingCon.whitelist(0)
      ).to.equal(listCon.address);
      expect(
        await stakingCon.whitelist(1)
      ).to.equal(listCon2.address);

      // connect checker to whitelist
      tx = await listCon.addChecker(stakingCon.address);
      await tx.wait();
      expect(
        await listCon.checkers(0)
      ).to.equal(stakingCon.address);
      tx = await listCon2.addChecker(stakingCon.address);
      await tx.wait();
      expect(
        await listCon2.checkers(0)
      ).to.equal(stakingCon.address);

      // add NFT
      let userToken = 1, user2Token = 2;
      tx = await listCon.addNFT(user.address, userToken);
      await tx.wait();
      tx = await listCon2.addNFT(user2.address, user2Token);
      await tx.wait();
      expect(
        await listCon.tokenListOf(user.address, 0)
      ).to.equal(userToken);
      expect(
        await listCon2.tokenListOf(user2.address, 0)
      ).to.equal(user2Token);
    });

    it("sets up staking contract", async function () {
      let period = 1e5, periodThreshold = 3;
      // Period
      expect(
        await stakingCon.getPeriodCount()
      ).to.equal(0);
      tx = await stakingCon.updatePeriod(period);
      await tx.wait();
      expect(
        parseInt(await stakingCon.getPeriod(0))
      ).to.equal(period);
      // Period threshold
      expect(
        await stakingCon.getPeriodThreshold()
      ).to.equal(0);
      tx = await stakingCon.setPeriodThreshold(periodThreshold);
      await tx.wait();
      expect(
        await stakingCon.getPeriodThreshold()
      ).to.equal(periodThreshold);
      // Rewarding address
      expect(
        await stakingCon.getRewardingAddress()
      ).to.equal(zeroAddr);
      tx = await stakingCon.setRewardingAddress(rewarderCon.address);
      await tx.wait();
      expect(
        await stakingCon.getRewardingAddress()
      ).to.equal(rewarderCon.address);
      // Add level
      tx = await stakingCon.addLevel(1, 0, 100);
      await tx.wait();
      tx = await stakingCon.addLevel(10, 100, 1000);
      await tx.wait();
      tx = await stakingCon.addLevel(100, 1000, 10000)
      await tx.wait();
      expect(
        await stakingCon.getLevelCount()
      ).to.equal(3);
    });

    context("when the caller is not the admin", async function () {
      it("calls to whitelist contracts", async function () {
        let reverted = "Whitelist: only governance";
        // add checker to whitelist
        await expect(
          listCon.connect(user).addChecker(stakingCon.address)
        ).revertedWith(reverted);
        await expect(
          listCon2.connect(user).addChecker(stakingCon.address)
        ).revertedWith(reverted);
        // add NFT to whitelist
        await expect(
          listCon.connect(user).addNFT(user.address, 10)
        ).revertedWith(reverted);
        await expect(
          listCon2.connect(user).addNFT(user.address, 10)
        ).revertedWith(reverted);
      });
      it("calls to staking contract", async function () {
        let reverted = "StakingPools: only governance";
        expect(
          await stakingCon.governance()
        ).to.equal(admin.address);
        // await stakingCon.connect(user).addWhitelist(listCon.address);
        // add whitelist to checker
        await expect(
          stakingCon.connect(user).addWhitelist(listCon.address)
        ).revertedWith(reverted);
        // update period
        await expect(
          stakingCon.connect(user).updatePeriod(1e5)
        ).revertedWith(reverted);
        // set period threshold
        await expect(
          stakingCon.connect(user).setPeriodThreshold(3)
        ).revertedWith(reverted);
        // set rewarding address
        await expect(
          stakingCon.connect(user).setRewardingAddress(rewarderCon.address)
        ).revertedWith(reverted);
        // add level
        await expect(
          stakingCon.connect(user).addLevel(1, 0, 100)
        ).revertedWith(reverted);
      });
    });

    context("when the input is invalid", async function () {
      it("add invalid whitelist input", async function () {
        let reverted = "StakingPools: whitelist cannot be 0x0";
        await expect(
          stakingCon.connect(admin).addWhitelist(zeroAddr)
        ).revertedWith(reverted);
        reverted = "StakingPools: the whitelist already added";
        tx = await stakingCon.connect(admin).addWhitelist(listCon.address);
        await tx.wait();
        await expect(
          stakingCon.connect(admin).addWhitelist(listCon.address)
        ).revertedWith(reverted);
      })
      it("update invalid period input", async function () {
        let reverted = "StakingPools: period cannot be 0";
        await expect(
          stakingCon.connect(admin).updatePeriod(0)
        ).revertedWith(reverted);
      })
      it("set invalid period threshold input", async function () {
        let reverted = "StakingPools: period threshold cannot be 0";
        await expect(
          stakingCon.connect(admin).setPeriodThreshold(0)
        ).revertedWith(reverted);
      })
      it("set invalid rewarding address", async function () {
        let reverted = "StakingPools: reward token pool cannot be 0x0";
        await expect(
          stakingCon.connect(admin).setRewardingAddress(zeroAddr)
        ).revertedWith(reverted);
      });
      it("add invalid level", async function () {
        let reverted = "StakingPools: level lower bound cannot be smaller than its upper bound";
        await expect(
          stakingCon.connect(admin).addLevel(10, 100, 1)
        ).revertedWith(reverted);
      });
      it("add level before setting period", async function () {
        let reverted = "StakingPools: adding level before adding a peroid is invalid";
        await expect(
          stakingCon.connect(admin).addLevel(10, 1, 100)
        ).revertedWith(reverted);
      });
    });
  });

  describe("deposit", function () {
    let mintAmount = 1e6,
      period = 1e5,
      periodThreshold = 3,
      userNFT = 10,
      user2NFT = 20;
    beforeEach(async function () {
      await init();
    });
    it("Positive", async function () {
      expect(
        await stakingCon.getPoolTotalDeposited()
      ).to.equal(0);
      await deposit(user, 9);
      expect(
        await stakingCon.getPoolTotalDeposited()
      ).to.equal(9);
      expect(
        await stakingCon.getStakeTotalDeposited(user.address)
      ).to.equal(9);

      await deposit(user2, 90);
      expect(
        await stakingCon.getPoolTotalDeposited()
      ).to.equal(99);
      expect(
        await stakingCon.getStakeTotalDeposited(user2.address)
      ).to.equal(90);

      await deposit(user, 900);
      expect(
        await stakingCon.getPoolTotalDeposited()
      ).to.equal(999);
      expect(
        await stakingCon.getStakeTotalDeposited(user.address)
      ).to.equal(909);
    });
    context("when the depositor is out of whitelists", async function() {
      it("reverts", async function () {
        let reverted = "StakingPools: owner not in any white lists";
        await expect(
          deposit(user3, 100)
        ).revertedWith(reverted);
      });
    });
    context("when depositing amount out of level", async function() {
      it("reverts", async function () {
        let reverted = "StakingPools: not in any level";
        await expect(
          deposit(user, 1e5)
        ).revertedWith(reverted);
      });
    });
    context("when depositing fund insufficient", async function() {
      it("reverts", async function () {
        let reverted = "ERC20: transfer amount exceeds balance";
        tx = await erc20Con.connect(user).transfer(user3.address, mintAmount);
        await tx.wait();
        await expect(
          deposit(user, 100)
        ).revertedWith(reverted);
      });
    });
  });
  describe("claim", function () {
    let mintAmount = 1e6,
      period = 1e5,
      periodThreshold = 3,
      userNFT = 10,
      user2NFT = 20;
    beforeEach(async function () {
      await init();
    });
    it("over claims", async function () {
      let _deposit = 50, _periods = 4;
      await deposit(user, _deposit);
      let tmpTime = await getNow() + _periods * period;
      await ethers.provider.send(
        "evm_setNextBlockTimestamp",
        [tmpTime]
      );
      await claim(user, 100);
      expect(
        await erc20Con.balanceOf(user.address)
      ).to.equal(mintAmount - _deposit + _periods);
    });
    it("under claims", async function () {
      let _deposit = 50, _periods = 4;
      await deposit(user, _deposit);
      let tmpTime = await getNow() + _periods * period;
      await ethers.provider.send(
        "evm_setNextBlockTimestamp",
        [tmpTime]
      );
      await claim(user, 2);
      expect(
        await erc20Con.balanceOf(user.address)
      ).to.equal(mintAmount - _deposit + 2);
      await claim(user, 1);
      expect(
        await erc20Con.balanceOf(user.address)
      ).to.equal(mintAmount - _deposit + 3);
      await claim(user, 100);
      expect(
        await erc20Con.balanceOf(user.address)
      ).to.equal(mintAmount - _deposit + 4);
    });
    it("claim multiple deposits", async function () {
      await deposit(user, 99); // deposit = 99
      await deposit(user2, 10); // user2 deposit = 10
      let tmpTime = await getNow() + period + 10;
      await ethers.provider.send(
        "evm_setNextBlockTimestamp",
        [tmpTime]
      ); // interest = 1
      await deposit(user, 900); // deposit = 999
      tmpTime += 2 * period;
      await ethers.provider.send(
        "evm_setNextBlockTimestamp",
        [tmpTime]
      ); // interest = 21
      await deposit(user, 1000); // deposit = 1999
      tmpTime += 2 * period;
      await ethers.provider.send(
        "evm_setNextBlockTimestamp",
        [tmpTime]
      ); // interest = 221
      await deposit(user, 1001); // deposit = 3000
      tmpTime += period;
      await ethers.provider.send(
        "evm_setNextBlockTimestamp",
        [tmpTime]
      ); // interest = 321
      await claim(user, 1000);
      await claim(user2, 1000);
      expect(
        await erc20Con.balanceOf(user.address)
      ).to.equal(mintAmount - 3000 + 321);
      expect(
        await erc20Con.balanceOf(user2.address)
      ).to.equal(mintAmount - 10 + 6);
    });
    context("when the caller is not in any whitelist", async function () {
      it("reverts", async function () {
        let reverted = "StakingPools: owner not in any white lists";
        await expect(
          claim(user3, 100)
        ).revertedWith(reverted);
      });
    });
    context("when the fund is still locked", async function () {
      it("reverts", async function () {
        let reverted = "StakingPools: staking too short to be claimed";
        await expect(
          claim(user, 100)
        ).revertedWith(reverted);
      });
    });
    context("when the rewarding address is used up", async function () {
      it("reverts", async function () {
        await tx.wait()
        await deposit(user, 1000);
        await deposit(user2, 1000);
        let tmpTime = await getNow() + period * 6000 + 10;
        await ethers.provider.send(
          "evm_setNextBlockTimestamp",
          [tmpTime]
        ); // interest = 1
        await exit(user);
        await expect(
          claim(user2, 500000)
        ).revertedWith("ERC20: insufficient allowance");

      });
    })
  });
  describe("exit", function () {
    let mintAmount = 1e6,
      period = 1e5,
      periodThreshold = 3,
      userNFT = 10,
      user2NFT = 20;
    beforeEach(async function () {
      await init();
    });
    it("exit right after all interest claimed", async function () {
      let _deposit = 50, _periods = 4;
      await deposit(user, _deposit);
      let tmpTime = await getNow() + _periods * period;
      await ethers.provider.send(
        "evm_setNextBlockTimestamp",
        [tmpTime]
      );
      await claim(user, 100);
      expect(
        await erc20Con.balanceOf(user.address)
      ).to.equal(mintAmount - _deposit + 4);
      await exit(user);
      expect(
        await erc20Con.balanceOf(user.address)
      ).to.equal(mintAmount + _periods);
    });
    it("exit deposits with interest", async function () {
      let _deposit = 50, _periods = 4;
      await deposit(user, _deposit);
      await deposit(user2, _deposit);
      let tmpTime = await getNow() + _periods * period;
      await ethers.provider.send(
        "evm_setNextBlockTimestamp",
        [tmpTime]
      );
      await claim(user2, 2);
      await exit(user);
      await exit(user2);
      expect(
        await erc20Con.balanceOf(user.address)
      ).to.equal(mintAmount + _periods);
      expect(
        await erc20Con.balanceOf(user2.address)
      ).to.equal(mintAmount + _periods);
    });
    it("exit before any interest kicks in", async function () {
      let _deposit = 50, _periods = 2;
      await deposit(user, _deposit);
      let tmpTime = await getNow() + _periods * period;
      await ethers.provider.send(
        "evm_setNextBlockTimestamp",
        [tmpTime]
      );
      await exit(user);
      await exit(user);
      expect(
        await erc20Con.balanceOf(user.address)
      ).to.equal(mintAmount);
    });
    context("when the caller is not in any whitelist", async function () {
      it("reverts", async function () {
        let reverted = "StakingPools: owner not in any white lists";
        await expect(
          exit(user3, 100)
        ).revertedWith(reverted);
      });
    });
  });
  describe("removing NFT", function () {
    let mintAmount = 1e6,
      period = 1e5,
      periodThreshold = 3,
      userNFT = 10,
      user2NFT = 20;
    beforeEach(async function () {
      await init(
        mintAmount,
        period,
        periodThreshold,
        userNFT,
        user2NFT
      );
    });
    it("Positive", async function () {
      let _tokenId = 1;
      expect(
        await listCon.ownerOf(_tokenId)
      ).to.equal(user.address);
      tx = await listCon.connect(user).removeNFT(_tokenId);
      await tx.wait();
      expect(
        await listCon.ownerOf(_tokenId)
      ).to.equal(zeroAddr);
    });
    it("when staking exists", async function () {
      let reverted = "Whitelist: cannot remove when checker is using";
      deposit(user, 10);
      for(var i = 1;i < 10;i++) {
        tx = await listCon.connect(user).removeNFT(i);
        await tx.wait();
      }
      expect(
        await listCon.balanceOf(user.address)
      ).to.equal(1);
      await expect(
        listCon.connect(user).removeNFT(10)
      ).revertedWith(reverted);
      exit(user);
      tx = await listCon.connect(user).removeNFT(10);
      await tx.wait();
      expect(
        await listCon.balanceOf(user.address)
      ).to.equal(0);
    });
    it("when the caller is not the owner", async function () {
      let reverted = "Whitelist: msg.sender is not the token owner";
      await expect(
        listCon.connect(user2).removeNFT(1)
      ).revertedWith(reverted);
    });
  })
  describe("setting changes", function() {
    let mintAmount = 1e6,
      period = 1e5,
      periodThreshold = 3,
      userNFT = 10,
      user2NFT = 20;
    beforeEach(async function () {
      await init(
        mintAmount,
        period,
        periodThreshold,
        userNFT,
        user2NFT
      );
    });
    context("when period changed in staking processes", async function () {
      it("Positive", async function () {
        let tmpTime = await getNow() + 4 * period + 10;
        let prePeriod;
        let _deposit = 10;
        await deposit(user, _deposit);
        await ethers.provider.send(
          "evm_setNextBlockTimestamp",
          [tmpTime]
        ); // interest = 4

        // shorten the period
        prePeriod = period; period = 1e4;
        await stakingCon.connect(admin).updatePeriod(period);
        tmpTime += prePeriod;
        await ethers.provider.send(
          "evm_setNextBlockTimestamp",
          [tmpTime]
        ); // interest = 5
        await claim(user, 10000);
        expect(
          await erc20Con.balanceOf(user.address)
        ).to.equal(mintAmount - _deposit + 5); // interest = 0
        tmpTime += 3 * period;
        await ethers.provider.send(
          "evm_setNextBlockTimestamp",
          [tmpTime]
        ); // interest = 3
        await claim(user, 10000);
        expect(
          await erc20Con.balanceOf(user.address)
        ).to.equal(mintAmount - _deposit + 8); // interest = 0

        // lengthen the period
        prePeriod = period; period = 1e4;
        await stakingCon.connect(admin).updatePeriod(period);
        tmpTime += period;
        await ethers.provider.send(
          "evm_setNextBlockTimestamp",
          [tmpTime]
        ); // interest = 5
        await claim(user, 10000);
        expect(
          await erc20Con.balanceOf(user.address)
        ).to.equal(mintAmount - _deposit + 9); // interest = 0
      });
    });
    context("when period threshold changed in staking processes", async function () {
      it("cut threshold for locked stakings", async function () {
        let _deposit = 10;
        await deposit(user, _deposit);
        let tmpTime = await getNow() + period + 10;
        await ethers.provider.send(
          "evm_setNextBlockTimestamp",
          [tmpTime]
        );
        await deposit(user2, _deposit);
        // user staking time = 1
        // user2 staking time = 0
        tmpTime += period;
        await ethers.provider.send(
          "evm_setNextBlockTimestamp",
          [tmpTime]
        );
        // user staking time = 2
        // user2 staking time = 1
        await stakingCon.connect(admin).setPeriodThreshold(2);

        await claim(user, 1000)
        expect(
          await erc20Con.balanceOf(user.address)
        ).to.equal(mintAmount - _deposit + 2);
        await expect(
          claim(user2, 1000)
        ).revertedWith("StakingPools: staking too short to be claimed");

        tmpTime += period;
        await ethers.provider.send(
          "evm_setNextBlockTimestamp",
          [tmpTime]
        );
        // user staking time = 3
        // user2 staking time = 2
        // await exit(user);
        // await exit(user2);
        // console.log(await erc20Con.balanceOf(user.address));
        // console.log(await erc20Con.balanceOf(user2.address));
        await exit(user);
        await exit(user2);
        expect(
          await erc20Con.balanceOf(user.address)
        ).to.equal(mintAmount + 3);
        expect(
          await erc20Con.balanceOf(user2.address)
        ).to.equal(mintAmount + 2);
      });
      it("should not effect unlocked stakings", async function () {
        let _deposit = 10;
        await deposit(user, _deposit);
        let tmpTime = await getNow() + 4 * period + 10;
        await ethers.provider.send(
          "evm_setNextBlockTimestamp",
          [tmpTime]
        );
        await stakingCon.connect(admin).setPeriodThreshold(2);
        await exit(user);
        expect(
          await erc20Con.balanceOf(user.address)
        ).to.equal(mintAmount + 4);
      });
    });
    context("when level changed in staking processes", async function () {
      it("Positive", async function () {
        let _userDeposit = 10;
        let _user2Deposit = 110;
        await deposit(user, _userDeposit);
        await deposit(user2, _user2Deposit);
        let tmpTime = await getNow() + 4 * period + 10;
        await ethers.provider.send(
          "evm_setNextBlockTimestamp",
          [tmpTime]
        );
        // user interest = 4
        // user2 interest = 40

        // newly setted interest becomes valid in the very period
        await stakingCon.connect(admin).addLevel(1000, 50, 150);
        tmpTime += 2 * period;
        await ethers.provider.send(
          "evm_setNextBlockTimestamp",
          [tmpTime]
        );
        await exit(user);
        await exit(user2);
        expect(
          await erc20Con.balanceOf(user.address)
        ).to.equal(mintAmount + 6);
        expect(
          await erc20Con.balanceOf(user2.address)
        ).to.equal(mintAmount + 2040);
      });
    });
  });
});
