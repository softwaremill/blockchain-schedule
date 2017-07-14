import * as Web3 from 'web3'

export interface EthConnection {
    account: string,
    web3: any
}

export function initWeb3(currentWeb3: any, cb: (accs: string[], initializedWeb3: any) => void): void {
    let newWeb3 = checkAndInstantiateWeb3(currentWeb3)

    newWeb3.eth.getAccounts((err: any, accs: any) => {
        if (err != null) {
            alert("There was an error fetching your accounts.")
            return
        }

        if (accs.length == 0) {
            alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
            return
        }

        cb(accs, newWeb3)
    }
    )
}

function checkAndInstantiateWeb3(currentWeb3: any): any {
    console.log("Instantiating web3")
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof currentWeb3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        return new Web3(currentWeb3.currentProvider)
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask")
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        return new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
    }
}
