pragma solidity ^0.4.18;

import './ownership/Ownable.sol';
import './MintableToken.sol';

contract TokenProvider is Ownable {

  MintableToken public token;

  function setToken(address newToken) public onlyOwner {
    token = MintableToken(newToken);
  }

}

