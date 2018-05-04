pragma solidity ^0.4.18;

import './TokenProvider.sol';

contract MintTokensInterface is TokenProvider {

  function mintTokens(address to, uint tokens) internal;

}

