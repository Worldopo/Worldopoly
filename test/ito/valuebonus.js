import ether from '../helpers/ether';
import tokens from '../helpers/tokens';
import {advanceBlock} from '../helpers/advanceToBlock';
import {increaseTimeTo, duration} from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

export default function (Token, Crowdsale, wallets) {
  let token;
  let crowdsale;
  const valuebonuses = [
    {value: 3000000000000000000, bonus: 10},
    {value: 6000000000000000000, bonus: 15},
    {value: 9000000000000000000, bonus: 20},
    {value: 12000000000000000000, bonus: 25},
    {value: 15000000000000000000, bonus: 30},
    {value: 21000000000000000000, bonus: 40},
    {value: 30000000000000000000, bonus: 50},
    {value: 48000000000000000000, bonus: 60},
    {value: 75000000000000000000, bonus: 70},
    {value: 120000000000000000000, bonus: 80},
    {value: 150000000000000000000, bonus: 90},
    {value: 225000000000000000000, bonus: 100},
    {value: 300000000000000000000, bonus: 110},
    {value: 450000000000000000000, bonus: 120},
    {value: 600000000000000000000, bonus: 130},
    {value: 900000000000000000000, bonus: 150} 
  ];

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  before(async function () {
    token = await Token.new();
    crowdsale = await Crowdsale.new();
    await token.setSaleAgent(crowdsale.address);
    await crowdsale.setToken(token.address);
    await crowdsale.setStart(latestTime());
    await crowdsale.setPeriod(this.period);
    await crowdsale.setPrice(this.price);
    await crowdsale.setHardcap(this.hardcap);
    await crowdsale.setMinInvestedLimit(this.minInvestedLimit);
    await crowdsale.setFirstBonusPercent(0); // set 0% first bonuses for clear value bonuses test
    await crowdsale.setFirstBonusLimitPercent(0);
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

  valuebonuses.forEach((valuebonus, i) => {
    it(`should add ${valuebonus.bonus / 10}% bonus for investment over ${valuebonus.value / 1000000000000000000} eth`, async function () {
      await crowdsale.sendTransaction({value: valuebonus.value, from: wallets[i]});
      const balance = await token.balanceOf(wallets[i]);
      const tokenamount = this.price.mul(valuebonus.value).div(ether(1)).times(1 + valuebonus.bonus / this.PercentRate);
      balance.should.be.bignumber.equal(tokenamount);
    });
  });

}
