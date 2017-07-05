import * as React from 'react'
import * as Web3 from 'web3'
import * as ethjs from 'ethjs-account'
import * as contract from 'truffle-contract'
const didleArtifacts = require('../../build/contracts/Didle.json')
import './../app.css'


type VoterName = string
type OptionIndex = number
type OptionName = string
type DidleId = string
type DidleKey = string
type EthAccount = string
type EventName = string
type VotingMap = Map<VoterName, OptionIndex>

export interface DidleState {
    eventName: EventName
    id: EthAccount
    key: DidleKey
    creationBlock: number
    account: EthAccount
}

interface VotingFormProps {
    didle: any
    eventName: EventName
    id: EthAccount
    key: DidleKey
    account: EthAccount
}

interface VotingFormState {
    votes: VotingMap
    userName: VoterName
    userVote: OptionIndex
    availableOptions: Array<OptionName>
}

class VotingForm extends React.Component<VotingFormProps, VotingFormState> {

    constructor(props: VotingFormProps) {
        super(props)

        this.state = {
            votes: new Map,
            userName: "Anonymous",
            userVote: 0,
            availableOptions: []
        }
        this.updateVoterName = this.updateVoterName.bind(this)
        this.handleOptionChange = this.handleOptionChange.bind(this)
        this.castVote = this.castVote.bind(this)

    }

    componentDidMount() {
        // TODO listen on events
    }

    updateVoterName(event) {
        this.setState({ ...this.state, userName: event.target.value })
    }

    handleOptionChange(event) {
        this.setState({ ...this.state, userVote: +event.target.value })
    }

    castVote(event) {
        // TODO send transaction and go to thank you page
    }

    render() {

        let headers: Array<JSX.Element> = [<th key="nameHeader">Voter name</th>]
        headers = headers.concat(this.state.availableOptions.map(opt => {
            return <th key={opt}>{opt}</th>
        }))

        let voterRows: Array<JSX.Element> = []
        this.state.votes.forEach((selectedOpt: OptionIndex, name: VoterName) => {

            let voteColumns: Array<JSX.Element> = [<td key={name}>{name}</td>]
            for (var i = 0; i < this.state.availableOptions.length; i++) {
                if (i == selectedOpt)
                    voteColumns.push(<td key={String(i)}>X</td>)
                else
                    voteColumns.push(<td key={String(i)}></td>)
            }

            voterRows.push(
                <tr key={name}>
                    {voteColumns}
                </tr>
            )
        });

        let radioColumns: Array<JSX.Element> = []
        for (var i = 0; i < this.state.availableOptions.length; i++) {
            radioColumns.push(
                <td key={String(i)}>
                    <input type="radio" value={String(i)} checked={this.state.userVote === i} onChange={this.handleOptionChange} />
                </td>
            )
        }


        return (
            <div className="voting-form" >
                <span>{this.props.eventName}</span>
                <table>
                    <thead>
                        <tr>
                            {headers}
                        </tr>
                    </thead>
                    <tbody>
                        {voterRows}
                        <tr>
                            <td>
                                <input type="text" value={this.state.userName} onChange={this.updateVoterName} />
                            </td>
                            {radioColumns}
                        </tr>
                    </tbody>
                </table>
                <button type="button" onClick={this.castVote}>Vote!</button>
            </div >
        )
    }
}

export default class Vote extends React.Component<{}, DidleState> {

    Didle: any
    web3: any

    constructor(props: any) {
        super(props)
        this.Didle = contract(didleArtifacts)

        this.state = {
            account: "",
            id: "",
            key: "",
            creationBlock: 0,
            eventName: ""
        }
    }

    componentDidMount() {
        let self = this
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
                account: accs[0],
                id: self.getParameterByName("id"),
                key: this.getParameterByName("key"),
                creationBlock: +this.getParameterByName("b"),
            })

        })
    }

    getParameterByName(name) {
        let url = window.location.href
        name = name.replace(/[\[\]]/g, "\\$&")
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null
        if (!results[2]) return ''
        return decodeURIComponent(results[2].replace(/\+/g, " "))
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
                    <h2>Current ETH account: {this.state.account}</h2>
                </div>
                <p>To share this Didle, use following url: {window.location.href}</p>
                <p className="App-intro">
                    Vote here!<br />
                    id: {this.state.id}<br />
                    key: {this.state.key}<br />
                    block: {this.state.creationBlock}

                </p>
                <VotingForm didle={this.Didle} eventName={this.state.eventName} id={this.state.id} key={this.state.key} account={this.state.account} />
            </div>
        )
    }
}
