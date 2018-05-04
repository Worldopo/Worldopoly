import ether from './helpers/ether';
import tokens from './helpers/tokens';
import unixTime from './helpers/unixTime';
import {duration} from './helpers/increaseTime';

import callback from './testcallback/callback';

const token = artifacts.require('Token.sol');
const crowdsale = artifacts.require('ITO.sol');
const callbacktest = artifacts.require('CallbackTest.sol');

contract('Callback test', function (accounts) {
  before(config);
  callback(token, crowdsale, callbacktest, accounts);
});

function config() {
  // variables list based on info from README
  this.start = unixTime('25 May 2018 00:00:00 GMT');
  this.period = 44;
  this.price = tokens(3184);
  this.hardcap = ether(37697);
  this.minInvestedLimit = ether(0.1);
  this.firstBonusPercent = 50;
  this.firstBonusLimitPercent = 200;
  this.wallet = '0x98882D176234AEb736bbBDB173a8D24794A3b085';
  this.TeamTokensWallet = '0x98882D176234AEb736bbBDB173a8D24794A3b085';
  this.MarketingTokensWallet = '0xa86780383E35De330918D8e4195D671140A60A74';
  this.ReservedTokensWallet = '0x675eDE27cafc8Bd07bFCDa6fEF6ac25031c74766';
  this.TeamTokensPercent = 150;
  this.MarketingTokensPercent = 50;
  this.ReservedTokensPercent = 50;
  this.PercentRate = 1000;

  // variables for additional testing convinience
  this.end = this.start + duration.days(this.period);
  this.beforeStart = this.start - duration.seconds(10);
  this.afterEnd = this.end + duration.seconds(1);
}
