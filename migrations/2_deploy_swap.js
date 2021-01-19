var {BN, balance, constants, expectEvent} = require("@openzeppelin/test-helpers");
var ERC20PresetMinterPauser = artifacts.require("ERC20PresetMinterPauser");
var SimpleSwapFactory = artifacts.require('./SimpleSwapFactory.sol')
var ERC20SimpleSwap = artifacts.require('./ERC20SimpleSwap.sol')

module.exports = async function(deployer, network, accounts) {
    var DEFAULT_HARDDEPOSIT_DECREASE_TIMEOUT = new BN(86400)

    // Deploy ERC20 token
    await deployer.deploy(ERC20PresetMinterPauser, "TestToken", "TEST", {from: accounts[0]})
    var erc20 = await ERC20PresetMinterPauser.deployed()

    // Deploy SwapFactory
    await deployer.deploy(SimpleSwapFactory, ERC20PresetMinterPauser.address)
    var simpleSwapFactory = await SimpleSwapFactory.deployed()

    // Deploy Swap
    let { logs } = await simpleSwapFactory.deploySimpleSwap(accounts[0], DEFAULT_HARDDEPOSIT_DECREASE_TIMEOUT)
    var ERC20SimpleSwapAddress = logs[0].args.contractAddress

    console.log("ERC20SimpleSwapAddress ", ERC20SimpleSwapAddress)
}
