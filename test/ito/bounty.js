import ether from '../helpers/ether';
import tokens from '../helpers/tokens';
import {advanceBlock} from '../helpers/advanceToBlock';
import {increaseTimeTo, duration} from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import EVMRevert from '../helpers/EVMRevert';

require('chai')
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
    await crowdsale.addWallet(wallets[3], this.TeamTokensPercent);
    await crowdsale.addWallet(wallets[4], this.MarketingTokensPercent);
    await crowdsale.addWallet(wallets[5], this.ReservedTokensPercent);
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

  it('should correctly calculate bonuses for team, marketing, resserved wallets', async function () {
    await crowdsale.sendTransaction({value: ether(1), from: wallets[1]});
    await crowdsale.sendTransaction({value: ether(1), from: wallets[2]});
    const owner = await crowdsale.owner();
    await crowdsale.finish({from: owner});

    const firstInvestorTokens = await token.balanceOf(wallets[1]);
    const secondInvestorTokens = await token.balanceOf(wallets[2]);
    const teamTokens = await token.balanceOf(wallets[3]);
    const marketingTokens = await token.balanceOf(wallets[4]);
    const reservedTokens = await token.balanceOf(wallets[5]);
    const totalTokens = firstInvestorTokens
      .plus(secondInvestorTokens)
      .plus(teamTokens)
      .plus(marketingTokens)
      .plus(reservedTokens);
   
    assert.equal(Math.round(teamTokens.mul(this.PercentRate).div(totalTokens)), this.TeamTokensPercent);
    assert.equal(Math.round(marketingTokens.mul(this.PercentRate).div(totalTokens)), this.MarketingTokensPercent);
    assert.equal(Math.round(reservedTokens.mul(this.PercentRate).div(totalTokens)), this.ReservedTokensPercent);   
  });

}
