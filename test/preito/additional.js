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
    await crowdsale.addMilestone(10, 200);
    await crowdsale.addMilestone(10, 150);
    await crowdsale.addMilestone(10, 100);
    await crowdsale.setPrice(this.price);
    await crowdsale.setHardcap(this.hardcap);
    await crowdsale.setMinInvestedLimit(this.minInvestedLimit);
    await crowdsale.setWallet(this.wallet);
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
    balance.should.bignumber.equal(this.price.times(1.2));
  });

  it('should mintTokensByETHExternal by  Direct Mint Agend', async function () {
    const owner = await crowdsale.owner();
    await crowdsale.setDirectMintAgent(wallets[2], {from: owner});
    await crowdsale.mintTokensByETHExternal(wallets[5], ether(1), {from: wallets[2]}).should.be.fulfilled;
    const balance = await token.balanceOf(wallets[5]);
    balance.should.bignumber.equal(this.price.times(1.2));
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

  it('should send investment to dev wallet till 19.5 eth', async function () {
    const devLimit = ether(19.5);
    const devWallet = await crowdsale.devWallet();
    const investment = ether(1);
    const pre = web3.eth.getBalance(this.wallet);
    const preDev = web3.eth.getBalance(devWallet);
    const owner = await crowdsale.owner();
    await crowdsale.sendTransaction({value: investment, from: wallets[1]});
    const postDev = web3.eth.getBalance(devWallet);
    const post = web3.eth.getBalance(this.wallet);
    post.minus(pre).should.bignumber.equal(0);
    postDev.minus(preDev).should.bignumber.equal(investment);
  });

  it('should send first 19.5 eth to dev wallet, other investment to contract wallet', async function () {
    const devLimit = ether(19.5);
    const devWallet = await crowdsale.devWallet();
    const investment = ether(25);
    const pre = web3.eth.getBalance(this.wallet);
    const preDev = web3.eth.getBalance(devWallet);
    const owner = await crowdsale.owner();
    await crowdsale.sendTransaction({value: investment, from: wallets[1]});
    const postDev = web3.eth.getBalance(devWallet);
    const post = web3.eth.getBalance(this.wallet);
    post.minus(pre).should.bignumber.equal(investment.sub(devLimit));
    postDev.minus(preDev).should.bignumber.equal(devLimit);
  });
    
}
