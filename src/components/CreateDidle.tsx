import * as React from 'react';
import * as Web3 from '../web3'
import DidleTable from './DidleTable'
import styled from 'styled-components'
const contract = require('truffle-contract')
const didleArtifacts = require('../../build/contracts/Didle.json')

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
        const EthHeader = styled.h2`
          color: #AAA
        `

        return (
            <div>
                <div>
                    <EthHeader>Current eth account: {this.state.account}</EthHeader>
                </div>
                <h1>New Didle</h1>
                <DidleTable didle={this.Didle} account={this.state.account} />
            </div>
        )
    }
}
