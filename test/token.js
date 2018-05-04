import additional from './token/additional';
import basic from './token/basic';
import mintable from './token/mintable';
import ownable from './token/ownable';
import standard from './token/standard';

const token = artifacts.require('Token.sol');

contract('WorldopolysToken - BasicToken test', function (accounts) {
  basic(token, accounts);
});
contract('WorldopolysToken - StandardToken test', function (accounts) {
  standard(token, accounts);
});
contract('WorldopolysToken - Mintable test', function (accounts) {
  mintable(token, accounts);
});
contract('WorldopolysToken - Ownable test', function (accounts) {
  ownable(token, accounts);
});

contract('WorldopolysToken - Additional conditions test', function (accounts) {
  additional(token, accounts);
});
