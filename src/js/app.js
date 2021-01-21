App = {
  web3Provider: null,
  contracts: {},
  aliceAddress: '0x0',
  aliceSwapAddress: '0x0',
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

    // Load account data
    aliceAddress = await web3.eth.accounts[0];
    App.aliceAddress = aliceAddress;
    $("#accountAddress").html("Address: " + aliceAddress);
    console.log("aliceAddress", aliceAddress)

    web3.eth.getBalance(
      App.aliceAddress,
      function(err, res) {
        if (err == null) {
          aliceBalance = web3.fromWei(res.toNumber())
          $("#aliceETHBalance").html("ETH Balance: " + aliceBalance + " ETH");
        } else {
          console.log("Err", App.aliceAddress, err)
        }
      })


    // Show ERC20 balance
    // XXX: Not quite sure why it says App.contracts.ERC20PresetMinterPauser is undefiend? Sometimes...
    var erc20 = await App.contracts.ERC20PresetMinterPauser.deployed()
    var erc20balance = await erc20.balanceOf(aliceAddress)
    console.log("ERC20 Balance ", erc20balance.toNumber())
    $("#aliceERC20Balance").html("ERC20 Balance: " + erc20balance.toNumber() + " TEST");

    // Show Swap Balance
    // XXX Should we deploy swap contract here? Easier to get address...
    // Button for this?


    // Assuming received
    //    App.aliceSwapAddress = aliceSwapAddress
    //    console.log("aliceSwapAddress", aliceSwapAddress)
    //$("#aliceSwapAddress").html("Swap Address: " + App.aliceSwapAddress);

    // Load contract data
    // TODO Replace me
    App.contracts.ERC20PresetMinterPauser.deployed().then(function(erc20) {
      // electionInstance = instance;
      //return electionInstance.candidatesCount();
    //}).then(function(candidatesCount) {
    }).then(function(candidatesCount) {
      var swapResults = $("#swapResults");
      //candidatesResults.empty();

      // TODO Add balance here
      swapResults.append("foobar");
      // for (var i = 1; i <= candidatesCount; i++) {
      //   electionInstance.candidates(i).then(function(candidate) {
      //     var id = candidate[0];
      //     var name = candidate[1];
      //     var voteCount = candidate[2];

      //     // Render candidate Result
      //     var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
      //     candidatesResults.append(candidateTemplate);
      //   });
      // }

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
    // XXX this doesn't exist
    var swapContract = await App.contracts.ERC20SimpleSwap.at(App.aliceSwapAddress)
    var balance = await swapContract.balance()
    // XXX: Balance looks like a transaction object here, we want the actual balance
    // It is working though, because ERC20 has been withdrawn
    // Signins two transactions for some reason?
    console.log("swapBalance", balance)
    $("#aliceSwapBalance").html("Swap Balance: " + balance);
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
