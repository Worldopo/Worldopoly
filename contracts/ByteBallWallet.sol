pragma solidity ^0.4.18;

import './ownership/Ownable.sol';
import './token/ERC20Basic.sol';

contract ByteBallWallet is Ownable {
    
    address public target = 0x7E5f0D4070a55EbCf0a8A7D6F7abCEf96312C129;
    
    uint public locked;
    
    address public token;
    
    function setToken(address _token) public onlyOwner {
        token = _token;
    }
    
    function setLocked(uint _locked) public onlyOwner {
        locked = _locked;
    }
    
    function setTarget(address _target) public onlyOwner {
        target = _target;
    }
    
    function retreiveTokens() public {
        require(now > locked);
        ERC20Basic(token).transfer(target, ERC20Basic(token).balanceOf(this));
    }
    
}