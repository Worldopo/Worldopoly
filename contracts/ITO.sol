pragma solidity ^0.4.18;

import './AssembledCommonSale.sol';
import './ExtendedWalletsMintTokensFeature.sol';
import './ByteBallWallet.sol';

contract ITO is ExtendedWalletsMintTokensFeature, AssembledCommonSale {

  uint public period;

  uint public firstBonusPercent;

  uint public firstBonusLimitPercent;
  
  ByteBallWallet public bbwallet = new ByteBallWallet();

  function setFirstBonusPercent(uint newFirstBonusPercent) public onlyOwner {
    firstBonusPercent = newFirstBonusPercent;
  }

  function setFirstBonusLimitPercent(uint newFirstBonusLimitPercent) public onlyOwner {
    firstBonusLimitPercent = newFirstBonusLimitPercent;
  }

  function calculateTokens(uint _invested) internal returns(uint) {
    uint tokens = _invested.mul(price).div(1 ether);
    uint valueBonusTokens = getValueBonusTokens(tokens, _invested);
    if(invested < hardcap.mul(firstBonusLimitPercent).div(percentRate)) {
      tokens = tokens.add(tokens.mul(firstBonusPercent).div(percentRate));
    }
    return tokens.add(valueBonusTokens);
  }

  function setPeriod(uint newPeriod) public onlyOwner {
    period = newPeriod;
  }

  function endSaleDate() public view returns(uint) {
    return start.add(period * 1 days);
  }

  function finish() public onlyOwner {
     mintExtendedTokens();
     bbwallet.setToken(token);
     mintTokens(address(bbwallet),5000000000000000000000000);
     bbwallet.transferOwnership(owner);
     token.finishMinting();
  }

}
