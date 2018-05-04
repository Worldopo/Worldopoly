import ether from './helpers/ether';
import tokens from './helpers/tokens';
import unixTime from './helpers/unixTime';
import {duration} from './helpers/increaseTime';

import capped from './preito/capped';
import common from './preito/common';
import milestonebonus from './preito/milestonebonus';
import valuebonus from './preito/valuebonus';
import additional from './preito/additional';

const token = artifacts.require('Token.sol');
const crowdsale = artifacts.require('PreITO.sol');

contract('PreITO - common test', function (accounts) {
  before(config);
  common(token, crowdsale, accounts);
});

contract('PreITO - capped crowdsale test', function (accounts) {
  before(config);
  capped(token, crowdsale, accounts);
});

contract('PreITO - milestone bonus test', function (accounts) {
  before(config);
  milestonebonus(token, crowdsale, accounts);
});

contract('PreITO - value bonus test', function (accounts) {
  before(config);
  valuebonus(token, crowdsale, accounts);
});

contract('PreITO - additional features test', function (accounts) {
  before(config);
  additional(token, crowdsale, accounts);
});

function config() {
  // variables list based on info from README
  this.start = unixTime('23 Apr 2018 24:00:00 GMT');
  this.period = 30;
  this.price = tokens(3184);
  this.hardcap = ether(6282);
  this.minInvestedLimit = ether(0.1);
  this.wallet = '0xa86780383E35De330918D8e4195D671140A60A74';
  this.PercentRate = 1000;

  // variables for additional testing convinience
  this.end = this.start + duration.days(this.period);
  this.beforeStart = this.start - duration.seconds(10);
  this.afterEnd = this.end + duration.seconds(1);
}
