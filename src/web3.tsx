import * as Web3 from 'web3'

export interface EthConnection {
    account: string,
    web3: any
}

export function initWeb3(cb: (accs: string[], initializedWeb3: any) => void): void {
    let newWeb3 = checkAndInstantiateWeb3() // const zamiast let

    newWeb3.eth.getAccounts((err: any, accs: any) => {
        if (err != null) { // w js zawsze lepiej uzywac !== oraz === (!= oraz == są mniej restrykcyjne, zakładają tzw. koercję typów)
            alert("There was an error fetching your accounts.")
            return
        }

        if (accs.length == 0) { // jw.
            alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
            return
        }

        cb(accs, newWeb3)
    }
    )
}

function checkAndInstantiateWeb3(): any {
    console.log("Instantiating web3")
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window['web3'] !== 'undefined') {
        console.warn("Using web3 detected from external source.")
        // Use Mist/MetaMask's provider
        return new Web3(window['web3'].currentProvider)
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545.")
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        return new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
    }
}

// 1. ten plik nie musi miec rozszerzenia .tsx - wystarczy .ts - bowiem nie korzystasz tutaj z reactowego syntaxu jsx ;)
// 2. mimo wszystko osobiscie jestem zwolennikiem stosowania srednikow na koncu linii - chocby ze wzgledu na tzw. 'automatic semicolon insertion', ktory w co najmniej jednym przypadku płata figle (https://stackoverflow.com/questions/12745743/automatic-semicolon-insertion-return-statements#answer-12746314)
