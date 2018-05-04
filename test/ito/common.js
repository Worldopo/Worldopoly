import ether from '../helpers/ether';
import tokens from '../helpers/tokens';
import {advanceBlock} from '../helpers/advanceToBlock';
import {increaseTimeTo, duration} from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import EVMRevert from '../helpers/EVMRevert';
import unixTime from '../helpers/unixTime';

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

  it('crowdsale should be a saleAgent for token', async function () {
    const owner = await token.saleAgent();
    owner.should.equal(crowdsale.address);
  });

  it('end should be equal to start + duration', async function () {
    const start = await crowdsale.start();
    const end = await crowdsale.endSaleDate();
    end.should.bignumber.equal(start.plus(duration.days(this.period)));
  });

  it('should reject payments before start', async function () {
    await crowdsale.setStart(latestTime() + duration.seconds(10));
    await crowdsale.sendTransaction({value: ether(1), from: wallets[3]}).should.be.rejectedWith(EVMRevert);
  });

  it('should accept payments after start', async function () {
    const start = await crowdsale.start();
    await crowdsale.setStart(latestTime() - duration.seconds(10));
    await crowdsale.sendTransaction({value: ether(1), from: wallets[3]}).should.be.fulfilled;
  });

  it('should reject payments after finish', async function () {
    await crowdsale.sendTransaction({value: ether(1), from: wallets[3]}).should.be.fulfilled;
    const owner = await crowdsale.owner();
    await crowdsale.finish({from: owner}).should.be.fulfilled;
    await crowdsale.sendTransaction({value: ether(1), from: wallets[3]}).should.be.rejectedWith(EVMRevert);
  });

  it('should assign tokens to sender', async function () {
    await crowdsale.sendTransaction({value: ether(1), from: wallets[3]});
    const balance = await token.balanceOf(wallets[3]);
    balance.should.be.bignumber.equal(this.price.times(1.05));
  });

  it('should reject payments after end', async function () {
    const end = await crowdsale.endSaleDate();
    await increaseTimeTo(end + duration.seconds(10));
    await crowdsale.sendTransaction({value: ether(1), from: wallets[3]}).should.be.rejectedWith(EVMRevert);
  });
}
