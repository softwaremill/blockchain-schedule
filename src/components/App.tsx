import * as React from 'react';
import {DidleState} from './interfaces'
const Web3 = require('web3');
const ethjs = require('ethjs-account');
const contract = require('truffle-contract');
const didleArtifacts = require('../../build/contracts/Didle.json');


import './../app.css';

export class App extends React.Component<{}, DidleState> {

  Didle: any;
  web3: any;
  public state: DidleState;


  constructor(props: any) {
      super(props);
      this.Didle = contract(didleArtifacts);
      this.state = { account: "" };
  }

  componentDidMount() {
      this.checkAndInstantiateWeb3();
      this.Didle.setProvider(this.web3.currentProvider);
       
        
      this.web3.eth.getAccounts((err: any, accs: any) => {
          if (err != null) {
              alert("There was an error fetching your accounts.");
              return;
          }

          if (accs.length == 0) {
              alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
              return;
          }
                           
          this.setState({
              account: accs[0]
          });
      });
  }

  checkAndInstantiateWeb3() {
    console.log("Instantiating web3");
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof this.web3 !== 'undefined') {
      console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(this.web3.currentProvider);
    } else {
      console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
  }
  
  render() {
    return (
      <div className="App">
        <div className="App-header">
            <h2>Current eth account: {this.state.account}</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload2.
        </p>
      </div>
    );
  }
}
