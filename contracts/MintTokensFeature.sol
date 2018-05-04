pragma solidity ^0.4.18;

import './MintTokensInterface.sol';

contract MintTokensFeature is MintTokensInterface {

  function mintTokens(address to, uint tokens) internal {
    token.mint(to, tokens);
  }

}
