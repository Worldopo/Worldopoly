import assertRevert from '../helpers/assertRevert';
import expectThrow from '../helpers/expectThrow';
import EVMRevert from '../helpers/EVMRevert';

export default function (Token, accounts) {
  let token;

  beforeEach(async function () {
    token = await Token.new();
  });

  it('should return the correct address after setting sale agent', async function () {
    await token.setSaleAgent(accounts[1]);
    const saleAgent = await token.saleAgent();
    assert.equal(saleAgent, accounts[1]);
  });

  it('should approve address after addAlowedAddress', async function () {
    await token.addAllowedAddress(accounts[3], {from: accounts[0]});
    const allowedAddress = await token.allowedAddresses(accounts[3]);
    assert.equal(allowedAddress, true);
  });

  it('should mint from owner or sale agent accounts only', async function () {
    await token.setSaleAgent(accounts[1]);
    await token.mint(accounts[2], 100, {from: accounts[0]});
    await token.mint(accounts[2], 100, {from: accounts[1]});
    const balance = await token.balanceOf(accounts[2]);
    assert.equal(balance, 200);
    await assertRevert(token.mint(accounts[2], 100, {from: accounts[2]}));
  });

  it('should fail to call finishMinting from non-owner accounts', async function () {
    await expectThrow(token.finishMinting({from: accounts[2]}));
  });

  it('should transfer from owner or sale agent or allowed addresses accounts after call to finishMinting', async function () {
    await token.setSaleAgent(accounts[1]);
    await token.addAllowedAddress(accounts[2], {from: accounts[0]});
    await token.mint(accounts[0], 100, {from: accounts[0]});
    await token.mint(accounts[1], 100, {from: accounts[0]});
    await token.mint(accounts[2], 100, {from: accounts[0]});
    await token.finishMinting({from: accounts[0]});
    await token.transfer(accounts[4], 100, {from: accounts[0]}).should.be.fulfilled;
    await token.transfer(accounts[4], 100, {from: accounts[1]}).should.be.fulfilled;
    await token.transfer(accounts[4], 100, {from: accounts[2]}).should.be.fulfilled;
    const balance = await token.balanceOf(accounts[4]);
    assert.equal(balance, 300);
  });

  it('should transferFrom from owner or sale agent or allowed addresses acounts only after call to finishMinting', async function () {
    await token.setSaleAgent(accounts[1]);
    await token.addAllowedAddress(accounts[2], {from: accounts[0]});
    await token.mint(accounts[0], 100, {from: accounts[0]});
    await token.mint(accounts[1], 100, {from: accounts[0]});
    await token.mint(accounts[2], 100, {from: accounts[0]});
    await token.approve(accounts[0], 100, {from: accounts[0]});
    await token.approve(accounts[1], 100, {from: accounts[1]});
    await token.approve(accounts[2], 100, {from: accounts[2]});
    await token.finishMinting({from: accounts[0]});
    await token.transferFrom(accounts[0], accounts[4], 100, {from: accounts[0]}).should.be.fulfilled;
    await token.transferFrom(accounts[1], accounts[4], 100, {from: accounts[1]}).should.be.fulfilled;
    await token.transferFrom(accounts[2], accounts[4], 100, {from: accounts[2]}).should.be.fulfilled;
    const balance = await token.balanceOf(accounts[4]);
    assert.equal(balance, 300);
  });

  it('should transfer from not allowed address after call to finishMinting but save vesting percent of funds', async function () {
    await token.removeAllowedAddress(accounts[2], {from: accounts[0]});
    await token.setVestingPercent(30, {from: accounts[0]});
    await token.mint(accounts[2], 100, {from: accounts[0]});
    await token.approve(accounts[2], 100, {from: accounts[2]});
    await token.finishMinting({from: accounts[0]});

    await token.transfer(accounts[3], 50, {from: accounts[2]});
    const balance = await token.balanceOf(accounts[3]);
    assert.equal(balance, 50);
  });

  it('should transfer from not allowed address after call to finishMinting if vesting percent is 0', async function () {
    await token.removeAllowedAddress(accounts[2], {from: accounts[0]});
    await token.setVestingPercent(0, {from: accounts[0]});
    await token.mint(accounts[2], 100, {from: accounts[0]});
    await token.approve(accounts[2], 100, {from: accounts[2]});
    await token.finishMinting({from: accounts[0]});

    await token.transfer(accounts[3], 50, {from: accounts[2]});
    const balance = await token.balanceOf(accounts[3]);
    assert.equal(balance, 50);
  });    

  it('should reject transfer from not allowed address after call to finishMinting if it cuts vesting percent of funds', async function () {
    await token.removeAllowedAddress(accounts[2], {from: accounts[0]});
    await token.setVestingPercent(60, {from: accounts[0]});
    await token.mint(accounts[2], 100, {from: accounts[0]});
    await token.approve(accounts[2], 100, {from: accounts[2]});
    await token.finishMinting({from: accounts[0]});

    await token.transfer(accounts[3], 50, {from: accounts[2]}).should.be.rejectedWith(EVMRevert);
    const balance = await token.balanceOf(accounts[3]);
    assert.equal(balance, 0);
  }); 

  it('should reject transfer from not allowed address after call to finishMinting if vesting percent is 100', async function () {
    await token.removeAllowedAddress(accounts[2], {from: accounts[0]});
    await token.setVestingPercent(100, {from: accounts[0]});
    await token.mint(accounts[2], 100, {from: accounts[0]});
    await token.approve(accounts[2], 100, {from: accounts[2]});
    await token.finishMinting({from: accounts[0]});

    await token.transfer(accounts[3], 50, {from: accounts[2]}).should.be.rejectedWith(EVMRevert);
    const balance = await token.balanceOf(accounts[3]);
    assert.equal(balance, 0);
  });   

  it('should transferFrom from not allowed address after call to finishMinting but save vesting percent of funds', async function () {
    await token.removeAllowedAddress(accounts[2], {from: accounts[0]});
    await token.setVestingPercent(30, {from: accounts[0]});
    await token.mint(accounts[2], 100, {from: accounts[0]});
    await token.approve(accounts[2], 100, {from: accounts[2]});
    await token.finishMinting({from: accounts[0]});

    await token.transferFrom(accounts[2], accounts[3], 50, {from: accounts[2]});
    const balance = await token.balanceOf(accounts[3]);
    assert.equal(balance, 50);
  });

  it('should transferFrom from not allowed address after call to finishMinting if vesting percent is 0', async function () {
    await token.removeAllowedAddress(accounts[2], {from: accounts[0]});
    await token.setVestingPercent(0, {from: accounts[0]});
    await token.mint(accounts[2], 100, {from: accounts[0]});
    await token.approve(accounts[2], 100, {from: accounts[2]});
    await token.finishMinting({from: accounts[0]});

    await token.transferFrom(accounts[2], accounts[3], 50, {from: accounts[2]});
    const balance = await token.balanceOf(accounts[3]);
    assert.equal(balance, 50);
  });

  it('should reject transferFrom from not allowed address after call to finishMinting if it cuts vesting percent of funds', async function () {
    await token.removeAllowedAddress(accounts[2], {from: accounts[0]});
    await token.setVestingPercent(60, {from: accounts[0]});
    await token.mint(accounts[2], 100, {from: accounts[0]});
    await token.approve(accounts[2], 100, {from: accounts[2]});
    await token.finishMinting({from: accounts[0]});

    await token.transferFrom(accounts[2], accounts[3], 50, {from: accounts[2]}).should.be.rejectedWith(EVMRevert);
    const balance = await token.balanceOf(accounts[3]);
    assert.equal(balance, 0);
  });

  it('should reject transferFrom from not allowed address after call to finishMinting if vesting percent is 100', async function () {
    await token.removeAllowedAddress(accounts[2], {from: accounts[0]});
    await token.setVestingPercent(100, {from: accounts[0]});
    await token.mint(accounts[2], 100, {from: accounts[0]});
    await token.approve(accounts[2], 100, {from: accounts[2]});
    await token.finishMinting({from: accounts[0]});

    await token.transferFrom(accounts[2], accounts[3], 50, {from: accounts[2]}).should.be.rejectedWith(EVMRevert);
    const balance = await token.balanceOf(accounts[3]);
    assert.equal(balance, 0);
  });

}
