import ether from './helpers/ether';
import tokens from './helpers/tokens';
import {advanceBlock} from './helpers/advanceToBlock';
import {increaseTimeTo, duration} from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert';

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

const Configurator = artifacts.require('Configurator.sol');
const Token = artifacts.require('Token.sol');
const PreITO = artifacts.require('PreITO.sol');
const ITO = artifacts.require('ITO.sol');

contract('Configurator integration test', function (accounts) {
  let configurator;
  let token;
  let preito;
  let ito;

  const manager = '0xB8A4799a4E2f10e4b30b6C6E9F762833C13eCDF4';

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
    configurator = await Configurator.new();
    await configurator.deploy();

    const tokenAddress = await configurator.token();
    const preitoAddress = await configurator.preITO();
    const itoAddress = await configurator.ito();

    token = await Token.at(tokenAddress);
    preito = await PreITO.at(preitoAddress);
    ito = await ITO.at(itoAddress);
  });

  it('contracts should have token address', async function () {
    const tokenOwner = await token.owner();
    tokenOwner.should.bignumber.equal(manager);
  });

  it('contracts should have preITO address', async function () {
    const preitoOwner = await preito.owner();
    preitoOwner.should.bignumber.equal(manager);
  });

  it('contracts should have ITO address', async function () {
    const itoOwner = await ito.owner();
    itoOwner.should.bignumber.equal(manager);
  });

  it('preITO and ITO should have start time as described in README', async function () {
    const preitoStart = await preito.start();
    preitoStart.should.bignumber.equal((new Date('23 Apr 2018 00:00:00 GMT')).getTime() / 1000);
    const itoStart = await ito.start();
    itoStart.should.bignumber.equal((new Date('25 May 2018 00:00:00 GMT')).getTime() / 1000);
  });

  it ('preTCO and ITO should have price as described in README', async function () {
    const preitoPrice = await preito.price();
    preitoPrice.should.bignumber.equal(tokens(3184));
    const itoPrice = await ito.price();
    itoPrice.should.bignumber.equal(tokens(3184));
  });

  it ('preITO and ITO should have hardcap as described in README', async function () {
    const preitoHardcap = await preito.hardcap();
    preitoHardcap.should.bignumber.equal(ether(6282));
    const itoHardcap = await ito.hardcap();
    itoHardcap.should.bignumber.equal(ether(37697));
  });

  it ('preITO and ITO should have minimal insvested limit as described in README', async function () {
    const preitoMinInvest = await ito.minInvestedLimit();
    preitoMinInvest.should.bignumber.equal(ether(0.02));
    const itoMinInvest = await ito.minInvestedLimit();
    itoMinInvest.should.bignumber.equal(ether(0.02));
  });

  it ('preITO and ITO should have wallets as described in README', async function () {
    const preitoWallet = await preito.wallet();
    preitoWallet.should.bignumber.equal('0x28D1e6eeBf60b5eb747E2Ee7a185472Ae073Ab7e');
    const itoWallet = await ito.wallet();
    itoWallet.should.bignumber.equal('0x029fa7ef4E852Bb53CcbafA2308eE728320A5B8d');
  });

  it ('bounty team wallet, marketing wallet and reserved wallet should be as described in README', async function () {
    const teamWallet = await ito.wallets(0);
    teamWallet.should.bignumber.equal('0xd4Dde5011e330f8bFB246ce60d163AA5900ba71E');
    const marketingWallet = await ito.wallets(1);
    marketingWallet.should.bignumber.equal('0x752A9D3d59b8DFbd0798C70c59CAf4A95b5D896e');
    const reservedWallet = await ito.wallets(2);
    reservedWallet.should.bignumber.equal('0xae3182c9B850843773714dC5384A38116F6ec135');
  });

});

