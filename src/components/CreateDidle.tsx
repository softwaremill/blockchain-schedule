import * as React from 'react';
import * as Web3 from '../web3'
import DidleTable from './DidleTable'
const contract = require('truffle-contract')
const didleArtifacts = require('../../build/contracts/Didle.json')


import './../app.css';

export interface DidleState {
    account: string
}


export default class CreateDidle extends React.Component<{}, DidleState> {

    Didle: any
    web3: any

    constructor(props: any) {
        super(props)
        this.Didle = contract(didleArtifacts)
        this.state = { account: "" }
    }

    componentDidMount() {
        Web3.initWeb3(this.web3, (accs: string[], initializedWeb3: any) => {
            this.web3 = initializedWeb3
            this.Didle.setProvider(this.web3.currentProvider)

            this.setState({
                account: accs[0]
            })
        });
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
