pragma solidity ^0.4.18;

import './WalletProvider.sol';
import './InvestedProvider.sol';
import './CommonSale.sol';
import './math/SafeMath.sol';

contract DevFeeFeature is CommonSale {

  using SafeMath for uint;

  uint public constant devLimit = 19500000000000000000;

  uint public devBalance;

  address public constant devWallet = 0xEA15Adb66DC92a4BbCcC8Bf32fd25E2e86a2A770;

  function transferToWallet(uint value) internal {
    uint toDev = devLimit - devBalance;
    if(toDev > 0) {
      if(toDev > value) {
        toDev = value;
      } else { 
        wallet.transfer(value.sub(toDev));
      }
      devWallet.transfer(toDev);
      devBalance = devBalance.add(toDev);
    } else {
      wallet.transfer(value);
    }
  }

}

