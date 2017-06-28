// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as ethjs } from 'ethjs-account';
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import didle_artifacts from '../../build/contracts/Didle.json'

// Didle is our usable abstraction, which we'll use through the code below.
var Didle = contract(didle_artifacts);
var accounts;
var account;
var didleKey;
var didleId;
var newVoting = {
  name: "Meeting",
  proposals: []
};

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.

window.App = {
   
   start: function() {
    var self = this;

    // Bootstrap the Didle abstraction for Use.
    Didle.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.setStatus(account);
      didleKey = self.getParameterByName("key");
      didleId = self.getParameterByName("id");
      if (didleId != null) {
          self.loadVoting();
      }
        else {
            // no id provided
            self.initCreateNew();
            document.getElementById("addOptionButton").onclick = self.addOption(self);
            document.getElementById("createButton").onclick = self.doCreate(self);
        }
    });
  },

  refreshForm: function() {
     console.log("rf");
     var optionsNode = document.getElementById("createOptions");
     while (optionsNode.firstChild) {
       optionsNode.removeChild(optionsNode.firstChild);
     };

     for (var i = 0; i < newVoting.proposals.length; i++) {
       var input = document.createElement("input");
       input.type = "text";
       input.id = "votingOption" + i;
       input.value = newVoting.proposals[i];
       var label = document.createElement("label");
       label.for = input.name;
       label.innerHTML = "Option " + (i + 1);
        
       optionsNode.appendChild(label);
       optionsNode.appendChild(input);
       optionsNode.appendChild(document.createElement("br"));
     };
  },

  initCreateNew: function() {
      console.log("init");
      document.getElementById("createForm").style.visibility = "visible";
      document.getElementById("showDidle").style.visibility = "hidden";
      this.addOption(this)();
  },
    
  loadVoting: function() {
      var self = this;
      var meta;
      document.getElementById("createForm").style.display = "none";
      document.getElementById("showDidle").style.visibility = "visible";      
      Didle.deployed().then(function(instance) {
          var meta = instance;
          console.log("Reading name for didle " + didleId);
          meta.votingName.call(didleId, {from: account}).then(function (name) {
          console.log("Name: " + name);
          document.getElementById("didleName").innerHTML = name;
      });         
      });
  },

  addOption: function(self) {
      return function() {
      var utc = new Date().toJSON().slice(0,10);
      newVoting.proposals.push(utc);
      self.refreshForm();
    }
  },

  refreshOptions: function() {
      for (var i = 0; i < newVoting.proposals.length; i++) {
          var element = document.getElementById("votingOption" + i);
          newVoting.proposals[i] = element.value;
      }
  },

  doCreate: function(self) {
      return function() {
      Didle.deployed().then(function(instance) {
          self.refreshOptions();
          var meta = instance;
          // create new signer account
          var signer = ethjs.generate('892h@fsdf11ks8sk^2h8s8shfs.jk39hsoi@hohskd');
          didleId = signer.address;
          didleKey = signer.privateKey;
          console.log("Survey created, id = [" + didleId, "], key = [" + didleKey + "]");
          // TODO do I really have to provide gas amount manually here?
          return meta.create(didleId, newVoting.name, false, newVoting.proposals, {from: account, gas: 1334400}).then(r => { self.loadVoting(); });
      });
          }
  },
    
  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  getParameterByName: function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
