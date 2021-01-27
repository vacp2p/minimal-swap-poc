const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' }
]

const ChequeType = [
  { name: 'chequebook', type: 'address' },
  { name: 'beneficiary', type: 'address' },
  { name: 'cumulativePayout', type: 'uint256' }
]

App = {
  web3Provider: null,
  contracts: {},
  //aliceAddress: '0x0',
  //aliceSwapAddress: '0x0',
  // XXX Hardcoded, makes PoC simpler so you just switch in Metamask, can load dynamically too
  aliceAddress: '0xd2136b7e13d5653fe8be1765f871c3815bad98b2',
  aliceSwapAddress: '0x7f0267a894791ce2e14a1e56d88bcfc3cc561664',
  bobAddress: '0xf059f8f8d92f89f15cff3a2b85a9b2e32ac6295b',
  bobSwapAddress: '0x7175f498fd8f1ceef2fbf7100f17dbb00df5ce42',
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      // XXX Right way to do this?
      App.web3Provider = web3.currentProvider;
      try {
        // Request account access if needed
        await ethereum.enable();
        // Acccounts now exposed
        //web3.eth.sendTransaction({/* ... */});
        console.log("accounts 0", web3.eth.accounts[0]);
        // XXX Seems to be treated differently in Metamask, unclear how to get a
        // different derived key without changing account
        console.log("accounts 1", web3.eth.accounts[1]);
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        console.log("3")
      window.web3 = new Web3(web3.currentProvider);
      App.web3Provider = web3.currentProvider;
      // Acccounts always exposed
      //web3.eth.sendTransaction({/* ... */});
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    // NOTE Old code
    // if (typeof web3 !== 'undefined') {
    //   // If a web3 instance is already provided by Meta Mask.
    //   App.web3Provider = web3.currentProvider;
    //   web3 = new Web3(web3.currentProvider);
    // } else {
    //   // Specify default instance if no web3 instance provided
    //   App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    //   web3 = new Web3(App.web3Provider);
    // }

    web3.eth.defaultAccount = web3.eth.accounts[0]
    return App.initContract();

  },

  initContract: function() {
    // TODO Replace me
    $.getJSON("ERC20PresetMinterPauser.json", function(erc20) {
      console.log("Init ERC20PresetMinterPauser");
      //console.log("Hi! ", erc20)
      // Instantiate a new truffle contract from the artifact
      App.contracts.ERC20PresetMinterPauser = TruffleContract(erc20);
      // Connect provider to interact with contract
      App.contracts.ERC20PresetMinterPauser.setProvider(App.web3Provider);

      return App.render();
    });


    $.getJSON("SimpleSwapFactory.json", function(factory) {
      console.log("Init SimpleSwapFactory");
      App.contracts.SimpleSwapFactory = TruffleContract(factory);
      App.contracts.SimpleSwapFactory.setProvider(App.web3Provider);

      return App.render();
    });

    // NOTE: This is only one contract, but we are deploying it twice
    $.getJSON("ERC20SimpleSwap.json", function(swap) {
      console.log("Init ERC20SimpleSwap");
      App.contracts.ERC20SimpleSwap = TruffleContract(swap);
      App.contracts.ERC20SimpleSwap.setProvider(App.web3Provider);

      return App.render();
    });

  },

  // NOTE: async, might want to pull some stuff out here
  render: async function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Mark current address to not confuse Alice and Bob
    currentAddress = await web3.eth.accounts[0];
    $("#currentAddress").html("Address: " + currentAddress);
    console.log("currentAddress", currentAddress);

    // Load account data
    // XXX Assuming first account is Alice, not true when switching accounts
    //aliceAddress = await web3.eth.accounts[0];
    //App.aliceAddress = aliceAddress;
    //$("#aliceAddress").html("Address: " + aliceAddress);
    //console.log("aliceAddress", aliceAddress)

    // Assume we have manually populated this
    $("#aliceAddress").html("Address: " + App.aliceAddress);
    $("#bobAddress").html("Address: " + App.bobAddress);

    // Get Alice Balance
    web3.eth.getBalance(
      App.aliceAddress,
      function(err, res) {
        if (err == null) {
          balance = web3.utils.fromWei(res)
          $("#aliceETHBalance").html("ETH Balance: " + balance + " ETH");
        } else {
          console.log("Err", App.aliceAddress, err)
        }
      })

    // Get Bob Balance
    web3.eth.getBalance(
      App.bobAddress,
      function(err, res) {
        if (err == null) {
          balance = web3.utils.fromWei(res)
          $("#bobETHBalance").html("ETH Balance: " + balance + " ETH");
        } else {
          console.log("Err", App.bobAddress, err)
        }
      })

    // XXX: Not quite sure why it says App.contracts.ERC20PresetMinterPauser is undefined? Sometimes...
    var erc20 = await App.contracts.ERC20PresetMinterPauser.deployed()

    // Get Alice and Bob ERC20 balance
    var aliceERC20Balance = await erc20.balanceOf(App.aliceAddress)
    console.log("ERC20 Balance ", aliceERC20Balance.toNumber())
    $("#aliceERC20Balance").html("ERC20 Balance: " + aliceERC20Balance.toNumber() + " TEST");

    var bobERC20Balance = await erc20.balanceOf(App.bobAddress)
    console.log("ERC20 Balance ", bobERC20Balance.toNumber())
    $("#bobERC20Balance").html("ERC20 Balance: " + bobERC20Balance.toNumber() + " TEST");

    // NOTE: Hadcoding swapAddress, assuming deployed

    // Show Alice and Bob Swap address
    console.log("aliceSwapAddress", App.aliceSwapAddress)
    $("#aliceSwapAddress").html("Swap Address: " + App.aliceSwapAddress);

    console.log("bobSwapAddress", App.bobSwapAddress)
    $("#bobSwapAddress").html("Swap Address: " + App.bobSwapAddress);

    // Show Alice and Bob Swap balance
    var aliceSwapBalance = (await erc20.balanceOf(App.aliceSwapAddress)).toNumber()
    console.log("aliceSwapBalance", bobSwapBalance)
    $("#aliceSwapBalance").html("Swap Balance: " + aliceSwapBalance + " TEST");

    var bobSwapBalance = (await erc20.balanceOf(App.bobSwapAddress)).toNumber()
    console.log("bobSwapBalance", bobSwapBalance)
    $("#bobSwapBalance").html("Swap Balance: " + bobSwapBalance + " TEST");

    // Load contract data
    App.contracts.ERC20PresetMinterPauser.deployed().then(function(erc20) {
    }).then(function(x) {
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });

  },

  mint: async function () {
    //web3.eth.defaultAccount = web3.eth.accounts[0]
    var erc20 = await App.contracts.ERC20PresetMinterPauser.deployed()
    var foo = await erc20.mint(App.aliceAddress, 10000)
  },

  swapDeploy: async function() {
    console.log("swapDeploy")
    //web3.eth.defaultAccount = web3.eth.accounts[0]
    var DEFAULT_HARDDEPOSIT_DECREASE_TIMEOUT = 86400
    var simpleSwapFactory = await App.contracts.SimpleSwapFactory.deployed()
    let { logs } = await simpleSwapFactory.deploySimpleSwap(App.aliceAddress, DEFAULT_HARDDEPOSIT_DECREASE_TIMEOUT)

    // XXX: Ensure this is persisted
    var aliceSwapAddress = logs[0].args.contractAddress
    App.aliceSwapAddress = aliceSwapAddress
    console.log("aliceSwapAddress", aliceSwapAddress)
    $("#aliceSwapAddress").html("Swap Address: " + aliceSwapAddress);
  },

  swapDeposit: async function() {
    web3.eth.defaultAccount = web3.eth.accounts[0]
    var erc20 = await App.contracts.ERC20PresetMinterPauser.deployed()
    console.log("swapDeposit", erc20.address, App.aliceSwapAddress, App.aliceAddress)
    await erc20.transfer(App.aliceSwapAddress, 1000, {from: App.aliceAddress})
    var swapContract = await App.contracts.ERC20SimpleSwap.at(App.aliceSwapAddress)
    //var balance = await swapContract.balance()
    // TODO Get balance to show up
    // Current hypothesis is that while it is a public function, it is using address(this)
    // Which means it is using address of caller, not contract (?)
    // Instead, we can do this:
    // XXX this can happen earlier
    var balance = (await erc20.balanceOf(App.aliceSwapAddress)).toNumber()
    console.log("swapBalance", balance)
    $("#aliceSwapBalance").html("Swap Balance: " + balance);
  },

  // XXX - v3 or normal?
  // If we omit "_v3" we get:
  // MetaMask - RPC Error: Invalid parameters: must provide an Ethereum address.
  // Can problably solve by reading https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md more
  // See: https://docs.metamask.io/guide/signing-data.html#sign-typed-data-v1
  signTypedData: async function(eip712data, signee) {
    var json_data = JSON.stringify(eip712data)
    var from = signee

    return new Promise((resolve, reject) =>
      // XXX can also do sendAsync hree
      web3.currentProvider.send({
        method: 'eth_signTypedData_v3',
        params: [signee, json_data],
        from: from
      }, function (err, resp) {
        if (err) {
          console.log("Error", err)
          reject(err)
        } else {
          console.log("Response", resp)
          resolve(resp)
        }
      }))

  },

  // the chainId is set to 1 due to bug in ganache where the wrong id is reported via rpc
  signChequeInternal: async function signCheque(swap, beneficiary, cumulativePayout, signee, chainId = 1337) {
    console.log("signChequeInternal", beneficiary, signee)
      const cheque = {
        chequebook: swap.address,
        beneficiary,
        //cumulativePayout: cumulativePayout.toNumber()
        cumulativePayout: cumulativePayout
      }

    console.log("Cheque", cheque)

      const eip712data = {
        types: {
          EIP712Domain,
          Cheque: ChequeType
        },
        domain: {
          name: "Chequebook",
          version: "1.0",
          chainId
        },
        primaryType: 'Cheque',
        message: cheque
      }

    return App.signTypedData(eip712data, signee)
  },

  signCheque: async function() {
    console.log("signCheque")
    //var cumulativePayout = new BN(500)
    var cumulativePayout = 500
    // TODO: Here at the moment, let's include this, etc
    var alice = App.aliceAddress
    var bob = App.bobAddress
    var swapContract = await App.contracts.ERC20SimpleSwap.at(App.aliceSwapAddress)
    var response = await App.signChequeInternal(swapContract, bob, cumulativePayout, alice)
    var cheque = response.result
    console.log("Cheque", cheque)
    $("#aliceCheque").html("Cheque issued: " + cheque);
    // TODO add cheque here
    // TODO Then do something with this cheque... Bob should be able to redeem it from swapAddress
    // "0xaa2f167c993fd774bee484972a43e590d9240ef4cb798e2beb81a4a39f962e7c44ad175ceee80bae30726592ca74c9ab20275516a5d26b6c52aa8d16d4c0986c1c"

    // TODO Should be able to do something like this from Bob's POV
    // NOTE: This should be done from _Bob_ account, I believe
    //const { logs, receipt } = await this.ERC20SimpleSwap.cashChequeBeneficiary(recipient, cumulativePayout, issuerSig, {from: from})
    //this.logs = logs
    //this.receipt = receipt

  },

  redeemCheque: async function() {
    console.log("redeemCheque")
    // XXX Which contract to use here?
    var cumulativePayout = 500
    //var swapContract = await App.contracts.ERC20SimpleSwap.at(App.aliceSwapAddress)
    var swapContract = await App.contracts.ERC20SimpleSwap.at(App.bobSwapAddress)
    var issuerSig = "0xaa2f167c993fd774bee484972a43e590d9240ef4cb798e2beb81a4a39f962e7c44ad175ceee80bae30726592ca74c9ab20275516a5d26b6c52aa8d16d4c0986c1c"
    // XXX Why do we need from?
    var recipient = App.bobAddress
    // XXX?
    var from = App.aliceAddress
    console.log("Redeem cheque pre", recipient, cumulativePayout, issuerSig, from)

    // XXX: This goes through but I don't see anything in Bob address
    const { logs, receipt } = await swapContract.cashChequeBeneficiary(recipient, cumulativePayout, issuerSig, {from: from})
    console.log("Redeem cheque", logs, receipt)
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

// This is a cheque Bob can use
// 0xaa2f167c993fd774bee484972a43e590d9240ef4cb798e2beb81a4a39f962e7c44ad175ceee80bae30726592ca74c9ab20275516a5d26b6c52aa8d16d4c0986c1c
