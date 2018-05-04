pragma solidity ^0.4.18;

import './MintTokensInterface.sol';
import './WalletsPercents.sol';
//import './PercentRateProvider.sol';

contract ExtendedWalletsMintTokensFeature is /*PercentRateProvider,*/ MintTokensInterface, WalletsPercents {

  using SafeMath for uint;

  uint public percentRate = 1000;

  function mintExtendedTokens() public onlyOwner {
    uint summaryTokensPercent = 0;
    for(uint i = 0; i < wallets.length; i++) {
      summaryTokensPercent = summaryTokensPercent.add(percents[wallets[i]]);
    }
    uint mintedTokens = token.totalSupply();
    uint allTokens = mintedTokens.mul(percentRate).div(percentRate.sub(summaryTokensPercent));
    for(uint k = 0; k < wallets.length; k++) {
      mintTokens(wallets[k], allTokens.mul(percents[wallets[k]]).div(percentRate));
    }

  }

}
