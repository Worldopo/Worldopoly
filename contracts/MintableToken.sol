pragma solidity ^0.4.18;

import './token/StandardToken.sol';
import './AddressesFilterFeature.sol';

contract MintableToken is AddressesFilterFeature, StandardToken {

  event Mint(address indexed to, uint256 amount);

  event MintFinished();

  bool public mintingFinished = false;

  address public saleAgent;

  mapping (address => uint) public initialBalances;

  uint public vestingPercent;

  uint public constant percentRate = 100;

  modifier notLocked(address _from, uint _value) {
    if(!(_from == owner || _from == saleAgent || allowedAddresses[_from])) {
      require(mintingFinished);
      if((vestingPercent <= percentRate) && (vestingPercent != 0)) {
        uint minLockedBalance = initialBalances[_from].mul(vestingPercent).div(percentRate);
        require(minLockedBalance <= balances[_from].sub(_value));
      }
    }
    _;
  }

  function setVestingPercent(uint newVestingPercent) public {
    require(msg.sender == saleAgent || msg.sender == owner);
    vestingPercent = newVestingPercent;
  }

  function setSaleAgent(address newSaleAgnet) public {
    require(msg.sender == saleAgent || msg.sender == owner);
    saleAgent = newSaleAgnet;
  }

  function mint(address _to, uint256 _amount) public returns (bool) {
    require((msg.sender == saleAgent || msg.sender == owner) && !mintingFinished);
    
    totalSupply = totalSupply.add(_amount);
    balances[_to] = balances[_to].add(_amount);

    initialBalances[_to] = balances[_to];

    Mint(_to, _amount);
    Transfer(address(0), _to, _amount);
    return true;
  }

  /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
  function finishMinting() public returns (bool) {
    require((msg.sender == saleAgent || msg.sender == owner) && !mintingFinished);
    mintingFinished = true;
    MintFinished();
    return true;
  }

  function transfer(address _to, uint256 _value) public notLocked(msg.sender, _value)  returns (bool) {
    return super.transfer(_to, _value);
  }

  function transferFrom(address from, address to, uint256 value) public notLocked(from, value) returns (bool) {
    return super.transferFrom(from, to, value);
  }

}
