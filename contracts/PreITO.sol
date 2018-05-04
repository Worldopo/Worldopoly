pragma solidity ^0.4.18;

import './AssembledCommonSale.sol';
import './NextSaleAgentFeature.sol';
import './DevFeeFeature.sol';
import './StagedCrowdsale.sol';

contract PreITO is DevFeeFeature, NextSaleAgentFeature, StagedCrowdsale, AssembledCommonSale {

  function calculateTokens(uint _invested) internal returns(uint) {
    uint milestoneIndex = currentMilestone(start);
    Milestone storage milestone = milestones[milestoneIndex];
    uint tokens = _invested.mul(price).div(1 ether);
    uint valueBonusTokens = getValueBonusTokens(tokens, _invested);
    if(milestone.bonus > 0) {
      tokens = tokens.add(tokens.mul(milestone.bonus).div(percentRate));
    }
    return tokens.add(valueBonusTokens);
  }

  function endSaleDate() public view returns(uint) {
    return lastSaleDate(start);
  }

  function finish() public onlyOwner {
    token.setSaleAgent(nextSaleAgent);
  }

}
