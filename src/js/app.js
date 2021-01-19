App = {
  web3Provider: null,
  contracts: {},
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

    return App.initContract();

  },

  initContract: function() {
    // TODO Replace me
    $.getJSON("ERC20PresetMinterPauser.json", function(erc20) {
      console.log("Hi!");
      //console.log("Hi! ", erc20)
      // Instantiate a new truffle contract from the artifact
      App.contracts.ERC20PresetMinterPauser = TruffleContract(erc20);
      // Connect provider to interact with contract
      App.contracts.ERC20PresetMinterPauser.setProvider(App.web3Provider);

      return App.render();
    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      console.log("getCoinbase", account, err);
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    web3.eth.getCoinbase(function(err, account) {
      console.log("getCoinbase", account, err);
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

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
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
