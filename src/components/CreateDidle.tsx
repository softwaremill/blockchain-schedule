import * as React from 'react';
import { withRouter } from 'react-router-dom'
const Web3 = require('web3');
const ethjs = require('ethjs-account');
const contract = require('truffle-contract');
const didleArtifacts = require('../../build/contracts/Didle.json');


import './../app.css';

export interface DidleState {
    account: string
}

export interface DidleOptionsState {
    name: string,
    options: Array<string>,
    newOption: string,
    formError: boolean,
    formErrorMsg: string
}

export interface DidleTableProps {
    didle: any,
    account: any
}

class DidleTable extends React.Component<DidleTableProps, DidleOptionsState> {

    now() {
        return new Date().toJSON().slice(0, 10)
    }

    constructor(props: DidleTableProps) {
        super(props)
        let utc: string = this.now()
        this.state = { name: "", options: [], newOption: utc, formError: false, formErrorMsg: "" }
        this.handleInputChange = this.handleInputChange.bind(this)
        this.addNewDate = this.addNewDate.bind(this)
        this.validateInput = this.validateInput.bind(this)
        this.createDidle = this.createDidle.bind(this)
        this.handleNameChange = this.handleNameChange.bind(this)
    }

    createDidle(history: any) {
        if (this.state.options.some(x => x === this.state.newOption)) {
            this.setState({ ...this.state, formError: true, formErrorMsg: "Option duplicates not allowed." })
        }
        if (this.state.options.length == 0) {
            this.setState({ ...this.state, formError: true, formErrorMsg: "Empty option list not allowed." })
        }
        else {
            let signer = ethjs.generate('892h@fsdf11ks8sk^2h8s8shfs.jk39hsoi@hohskd')
            let didleId: string = signer.address
            let didleKey: string = signer.privateKey

            console.log("Survey signer created, id = [" + didleId, "], key = [" + didleKey + "]")
            console.log("Calling contract to create the Didle")
            let meta
            this.props.didle.deployed().then((instance) => {
                meta = instance
                return meta.create(didleId, this.state.name, false, this.state.options, { from: this.props.account, gas: 1334400 })
                    .then(r => {
                        console.log("Contract executed")
                        history.push('/vote?id=' + didleId + '&key=' + didleKey + '&b=' + r.receipt.blockNumber)
                    })
            })
        }
    }

    addNewDate() {
        this.validateInput(this.state.newOption)
        if (!this.state.formError) {
            let newOptions: Array<string> = this.state.options
            newOptions.push(this.state.newOption)
            this.setState({ ...this.state, options: newOptions, newOption: this.now() })
        }
    }

    validateInput(newOptionVal) {
        let err: boolean = false
        let errMsg: string = ""
        let newOptVal: string = this.state.newOption

        if (this.state.options.some(x => x === newOptionVal)) {
            err = true
            errMsg = "Option duplicates not allowed."
        }
        else
            newOptVal = newOptionVal
        this.setState({ ...this.state, formError: err, formErrorMsg: errMsg, newOption: newOptVal })

    }

    handleInputChange(event: any) {
        this.validateInput(event.target.value)
    }

    handleNameChange(event: any) {
        this.setState({ ...this.state, name: event.target.value })
    }


    render() {
        let rows: Array<JSX.Element> = []

        this.state.options.forEach((opt: string) => {
            rows.push(<li key={opt}>{opt}</li>)
        })

        rows.push(<li key="new"><input type="text" value={this.state.newOption} onChange={this.handleInputChange} /></li>)

        const CreateButton = withRouter(({ history }) => (
            <button type="button" onClick={() => { this.createDidle(history) }}>Create didle</button>))


        return (
            <div>
                <input type="text" id="newdidle-name" value={this.state.name} onChange={this.handleNameChange} />
                <br />
                {
                    this.state.formError
                        ? <span>{this.state.formErrorMsg}</span>
                        : null
                }
                <ul>
                    {rows}
                </ul>
                <button type="button" onClick={this.addNewDate}>Add</button>
                <CreateButton />
            </div>
        )
    }
}

export default class CreateDidle extends React.Component<{}, DidleState> {

    Didle: any
    web3: any
    public state: DidleState


    constructor(props: any) {
        super(props)
        this.Didle = contract(didleArtifacts)
        this.state = { account: "" }
    }

    componentDidMount() {
        this.checkAndInstantiateWeb3()
        this.Didle.setProvider(this.web3.currentProvider)


        this.web3.eth.getAccounts((err: any, accs: any) => {
            if (err != null) {
                alert("There was an error fetching your accounts.")
                return
            }

            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
                return
            }

            this.setState({
                account: accs[0]
            })
        })
    }

    checkAndInstantiateWeb3() {
        console.log("Instantiating web3")
        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof this.web3 !== 'undefined') {
            console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
            // Use Mist/MetaMask's provider
            this.web3 = new Web3(this.web3.currentProvider)
        } else {
            console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask")
            // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
            this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
        }
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <h2>Current eth account: {this.state.account}</h2>
                </div>
                <h1>New Didle</h1>
                <DidleTable didle={this.Didle} account={this.state.account} />
            </div>
        )
    }
}
