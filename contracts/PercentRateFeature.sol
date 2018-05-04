pragma solidity ^0.4.18;

import './ownership/Ownable.sol';
import './PercentRateProvider.sol';

contract PercentRateFeature is Ownable, PercentRateProvider {

  function setPercentRate(uint newPercentRate) public onlyOwner {
    percentRate = newPercentRate;
  }

}

