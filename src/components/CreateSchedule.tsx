import * as React from 'react';
import * as Web3 from '../web3'
import CreateForm from './CreateForm'
import EthHeader from './EthHeader'
const contract = require('truffle-contract')
const ethArtifacts = require('../../build/contracts/DistributedSchedule.json')

export interface FormState {
    account: string
}

export default class CreateSchedule extends React.Component<{}, FormState> {

    Contract: any
    web3: any

    constructor(props: any) {
        super(props)
        this.Contract = contract(ethArtifacts)
        this.state = { account: "" }
    }

    componentDidMount() {
        Web3.initWeb3((accs: string[], initializedWeb3: any) => {
            this.web3 = initializedWeb3
            this.Contract.setProvider(this.web3.currentProvider)

            this.setState({
                account: accs[0]
            })
        });
    }

    render() {
        return (
            <div>
                <div>
                    <EthHeader>Current eth account: {this.state.account}</EthHeader>
                </div>
                <h1>New Event</h1>
                <CreateForm contract={this.Contract} account={this.state.account} />
            </div>
        )
    }
}
