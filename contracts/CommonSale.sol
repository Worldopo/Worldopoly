pragma solidity ^0.4.18;

import './math/SafeMath.sol';
import './PercentRateFeature.sol';
import './MintableToken.sol';
import './WalletProvider.sol';
import './InvestedProvider.sol';
import './RetrieveTokensFeature.sol';
import './MintTokensFeature.sol';

contract CommonSale is PercentRateFeature, InvestedProvider, WalletProvider, RetrieveTokensFeature, MintTokensFeature {

  using SafeMath for uint;

  address public directMintAgent;

  uint public price;

  uint public start;

  uint public minInvestedLimit;

  uint public hardcap;

  uint public USDHardcap;
  
  uint public USDPrice;

  uint public ETHtoUSD;

  modifier isUnderHardcap() {
    require(invested <= hardcap);
    _;
  }

  // three digits
  function setUSDHardcap(uint newUSDHardcap) public onlyOwner {
    USDHardcap = newUSDHardcap;
  }

  function updateHardcap() internal {
    hardcap = USDHardcap.mul(1 ether).div(ETHtoUSD);
  }

  function updatePrice() internal {
    price = ETHtoUSD.mul(1 ether).div(USDPrice);
  }

  function setETHtoUSD(uint newETHtoUSD) public onlyDirectMintAgentOrOwner {
    ETHtoUSD = newETHtoUSD;
    updateHardcap();
    updatePrice();
  }

  // Deprecated!!! Should use setUSDHardcap
  function setHardcap(uint newHardcap) public onlyOwner {
    hardcap = newHardcap;
  }

  modifier onlyDirectMintAgentOrOwner() {
    require(directMintAgent == msg.sender || owner == msg.sender);
    _;
  }

  modifier minInvestLimited(uint value) {
    require(value >= minInvestedLimit);
    _;
  }

  function setStart(uint newStart) public onlyOwner {
    start = newStart;
  }

  function setMinInvestedLimit(uint newMinInvestedLimit) public onlyOwner {
    minInvestedLimit = newMinInvestedLimit;
  }

  function setDirectMintAgent(address newDirectMintAgent) public onlyOwner {
    directMintAgent = newDirectMintAgent;
  }

  function setUSDPrice(uint newUSDPrice) public onlyDirectMintAgentOrOwner {
    USDPrice = newUSDPrice;
  }

  // deprecated
  function setPrice(uint newPrice) public onlyDirectMintAgentOrOwner {
    price = newPrice;
  }

  function calculateTokens(uint _invested) internal returns(uint);

  function mintTokensExternal(address to, uint tokens) public onlyDirectMintAgentOrOwner {
    mintTokens(to, tokens);
  }

  function endSaleDate() public view returns(uint);

  function mintTokensByETHExternal(address to, uint _invested) public onlyDirectMintAgentOrOwner returns(uint) {
    updateInvested(_invested);
    return mintTokensByETH(to, _invested);
  }

  function mintTokensByETH(address to, uint _invested) internal isUnderHardcap returns(uint) {
    uint tokens = calculateTokens(_invested);
    mintTokens(to, tokens);
    return tokens;
  }

  function transferToWallet(uint value) internal {
    wallet.transfer(value);
  }

  function updateInvested(uint value) internal {
    invested = invested.add(value);
  }

  function fallback() internal minInvestLimited(msg.value) returns(uint) {
    require(now >= start && now < endSaleDate());
    transferToWallet(msg.value);
    updateInvested(msg.value);
    return mintTokensByETH(msg.sender, msg.value);
  }

  function () public payable {
    fallback();
  }

}

