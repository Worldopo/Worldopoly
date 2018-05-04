pragma solidity ^0.4.18;

import './ownership/Ownable.sol';
import './AssembledCommonSale.sol';
import './Token.sol';
import './PreITO.sol';
import './ITO.sol';

contract Configurator is Ownable {

  Token public token;

  PreITO public preITO;

  ITO public ito;

  function deploy() public onlyOwner {

    address manager = 0xB8A4799a4E2f10e4b30b6C6E9F762833C13eCDF4;

    token = new Token();

    preITO = new PreITO();
    ito = new ITO();

    commonConfigure(preITO);
    commonConfigure(ito);

    preITO.setWallet(0x28D1e6eeBf60b5eb747E2Ee7a185472Ae073Ab7e);
    preITO.setStart(1524441600);
    preITO.addMilestone(10, 200);
    preITO.addMilestone(10, 150);
    preITO.addMilestone(10, 100);
    preITO.setUSDHardcap(2400000000);
    preITO.setETHtoUSD(644811);

    token.setSaleAgent(preITO);
    token.setVestingPercent(100);

    ito.setWallet(0x029fa7ef4E852Bb53CcbafA2308eE728320A5B8d);
    ito.setStart(1527206400);
    ito.setPeriod(44);
    ito.setFirstBonusPercent(50);
    ito.setFirstBonusLimitPercent(200);
    ito.setUSDHardcap(14400000000);
    ito.setETHtoUSD(644811);

    ito.addWallet(0xd4Dde5011e330f8bFB246ce60d163AA5900ba71E, 150);
    ito.addWallet(0x752A9D3d59b8DFbd0798C70c59CAf4A95b5D896e, 50);
    ito.addWallet(0xae3182c9B850843773714dC5384A38116F6ec135, 50);

    preITO.setNextSaleAgent(ito);

    token.transferOwnership(manager);
    preITO.transferOwnership(manager);
    ito.transferOwnership(manager);
  }

  function commonConfigure(AssembledCommonSale sale) internal {
    sale.setPercentRate(1000);
    sale.setMinInvestedLimit(20000000000000000);
    sale.setUSDPrice(120);
    sale.addValueBonus(3000000000000000000, 10);
    sale.addValueBonus(6000000000000000000, 15);
    sale.addValueBonus(9000000000000000000, 20);
    sale.addValueBonus(12000000000000000000, 25);
    sale.addValueBonus(15000000000000000000, 30);
    sale.addValueBonus(21000000000000000000, 40);
    sale.addValueBonus(30000000000000000000, 50);
    sale.addValueBonus(48000000000000000000, 60);
    sale.addValueBonus(75000000000000000000, 70);
    sale.addValueBonus(120000000000000000000, 80);
    sale.addValueBonus(150000000000000000000, 90);
    sale.addValueBonus(225000000000000000000, 100);
    sale.addValueBonus(300000000000000000000, 110);
    sale.addValueBonus(450000000000000000000, 120);
    sale.addValueBonus(600000000000000000000, 130);
    sale.addValueBonus(900000000000000000000, 150);
    sale.setToken(token);
  }

}

