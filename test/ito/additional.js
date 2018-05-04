import ether from '../helpers/ether';
import tokens from '../helpers/tokens';
import {advanceBlock} from '../helpers/advanceToBlock';
import {increaseTimeTo, duration} from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import EVMRevert from '../helpers/EVMRevert';

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

export default function (Token, Crowdsale, wallets) {
  let token;
  let crowdsale;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    token = await Token.new();
    crowdsale = await Crowdsale.new();
    await token.setSaleAgent(crowdsale.address);
    await crowdsale.setToken(token.address);
    await crowdsale.setStart(latestTime());
    await crowdsale.setPeriod(this.period);
    await crowdsale.setPrice(this.price);
    await crowdsale.setHardcap(this.hardcap);
    await crowdsale.setMinInvestedLimit(this.minInvestedLimit);
    await crowdsale.setFirstBonusPercent(this.firstBonusPercent);
    await crowdsale.setFirstBonusLimitPercent(this.firstBonusLimitPercent);
    await crowdsale.setWallet(this.wallet);
    await crowdsale.addWallet(this.TeamTokensWallet, this.TeamTokensPercent);
    await crowdsale.addWallet(this.MarketingTokensWallet, this.MarketingTokensPercent);
    await crowdsale.addWallet(this.ReservedTokensWallet, this.ReservedTokensPercent);
    await crowdsale.addValueBonus(3000000000000000000, 10);
    await crowdsale.addValueBonus(6000000000000000000, 15);
    await crowdsale.addValueBonus(9000000000000000000, 20);
    await crowdsale.addValueBonus(12000000000000000000, 25);
    await crowdsale.addValueBonus(15000000000000000000, 30);
    await crowdsale.addValueBonus(21000000000000000000, 40);
    await crowdsale.addValueBonus(30000000000000000000, 50);
    await crowdsale.addValueBonus(48000000000000000000, 60);
    await crowdsale.addValueBonus(75000000000000000000, 70);
    await crowdsale.addValueBonus(120000000000000000000, 80);
    await crowdsale.addValueBonus(150000000000000000000, 90);
    await crowdsale.addValueBonus(225000000000000000000, 100);
    await crowdsale.addValueBonus(300000000000000000000, 110);
    await crowdsale.addValueBonus(450000000000000000000, 120);
    await crowdsale.addValueBonus(600000000000000000000, 130);
    await crowdsale.addValueBonus(900000000000000000000, 150);
    await crowdsale.setPercentRate(this.PercentRate);
  });

  it('should mintTokensByETHExternal by owner', async function () {
    const owner = await crowdsale.owner();
    await crowdsale.mintTokensByETHExternal(wallets[4], ether(1), {from: owner}).should.be.fulfilled;
    const balance = await token.balanceOf(wallets[4]);
    balance.should.bignumber.equal(this.price.times(1.05));
  });

  it('should mintTokensByETHExternal by Direct Mint Agend', async function () {
    const owner = await crowdsale.owner();
    await crowdsale.setDirectMintAgent(wallets[2], {from: owner});
    await crowdsale.mintTokensByETHExternal(wallets[5], ether(1), {from: wallets[2]}).should.be.fulfilled;
    const balance = await token.balanceOf(wallets[5]);
    balance.should.bignumber.equal(this.price.times(1.05));
  });

  it('should mintTokensExternal by owner', async function () {
    const owner = await crowdsale.owner();
    await crowdsale.mintTokensExternal(wallets[4], tokens(100), {from: owner}).should.be.fulfilled;
    const balance = await token.balanceOf(wallets[4]);
    balance.should.bignumber.equal(tokens(100));
  });

   it('should mintTokensExternal by Direct Mint Agent', async function () {
    const owner = await crowdsale.owner();
    await crowdsale.setDirectMintAgent(wallets[3], {from: owner});
    await crowdsale.mintTokensExternal(wallets[6], tokens(100), {from: wallets[3]}).should.be.fulfilled;
    const balance = await token.balanceOf(wallets[6]);
    balance.should.bignumber.equal(tokens(100));
  });

  it('should use wallet for investments', async function () {
    const investment = ether(1);
    const pre = web3.eth.getBalance(this.wallet);
    const owner = await crowdsale.owner();
    await crowdsale.sendTransaction({value: investment, from: wallets[1]});
    const post = web3.eth.getBalance(this.wallet);
    post.minus(pre).should.bignumber.equal(investment);
  });

  it('should add 5% bonus for first 20% investments', async function () {
    const lowHardcap = ether(10);
    await crowdsale.setHardcap(lowHardcap);
    const limit = this.firstBonusLimitPercent;
    const baseInvestment = lowHardcap.mul(limit).div(this.PercentRate);
    const investment = baseInvestment - ether(0.1);
    const baseTokens = this.price.mul(investment).div(ether(1)); 
    await crowdsale.sendTransaction({value: investment, from: wallets[1]});
    const balance = await token.balanceOf(wallets[1]);
    balance.should.bignumber.equal(baseTokens.times(1 + this.firstBonusPercent / this.PercentRate));
  });

  it('should not add bonus when investments is more then 20% hardcap', async function () {
    const lowHardcap = ether(10);
    await crowdsale.setHardcap(lowHardcap);
    const limit = this.firstBonusLimitPercent;
    const baseInvestment = lowHardcap.mul(limit).div(this.PercentRate);  
    await crowdsale.sendTransaction({value: baseInvestment, from: wallets[1]});  

    const investment = ether(1);
    const baseTokens = this.price.mul(investment).div(ether(1));
    await crowdsale.sendTransaction({value: investment, from: wallets[2]});
    const balance = await token.balanceOf(wallets[2]);
    balance.should.bignumber.equal(baseTokens);
  });

  it('should transfer from not allowed address after call to finishMinting if it saves vesting percent of funds', async function () {
    const owner = await crowdsale.owner();
    await token.removeAllowedAddress(wallets[2]);
    await token.setVestingPercent(10);
    await crowdsale.sendTransaction({value: ether(1), from: wallets[2]});
    await token.approve(wallets[2], tokens(300));
    await crowdsale.finish({from: owner});
    await token.transfer(wallets[3], tokens(300), {from: wallets[2]}).should.be.fulfilled;
    const balance = await token.balanceOf(wallets[3]);
  
    balance.should.bignumber.equal(tokens(300));
  }); 

  it('should reject transfer from not allowed address after call to finishMinting if it cuts vesting percent of funds', async function () {
    const owner = await crowdsale.owner();
    await token.removeAllowedAddress(wallets[2]);
    await token.setVestingPercent(100);
    await crowdsale.sendTransaction({value: ether(1), from: wallets[2]});
    await token.approve(wallets[2], tokens(3000));
    await crowdsale.finish({from: owner});
    await token.transfer(wallets[3], tokens(3000), {from: wallets[2]}).should.be.rejectedWith(EVMRevert);
    const balance = await token.balanceOf(wallets[3]);
  
    assert.equal(balance, 0);
  }); 
}
