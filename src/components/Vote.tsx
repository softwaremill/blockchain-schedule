import * as React from 'react'
import * as Web3 from '../web3'
import * as ethjs from 'ethjs-account'
import * as contract from 'truffle-contract'
import * as cryptoutils from '../cryptoutils';
const didleArtifacts = require('../../build/contracts/Didle.json')

interface VoteData {
    name: VoterName,
    index: OptionIndex
}

type VoterName = string
type OptionIndex = number
type OptionName = string
type DidleId = string
type DidleKey = string
type EthAccount = string
type EventName = string
type VotingMap = Map<EthAccount, VoteData>
type BlockNumber = number

export interface DidleState {
    eventName: EventName
    account: EthAccount
    availableOptions: Array<OptionName>
    votes: VotingMap
    userName: VoterName
    userVote: OptionIndex
}

interface VotingFormProps {
    eventName: EventName
    availableOptions: Array<OptionName>
    votes: VotingMap
    userName: VoterName
    userVote: OptionIndex
    onUserVoteUpdated: (any) => void
    onUserNameUpdated: (any) => void
    castVote: (any) => void
}


class VotingForm extends React.Component<VotingFormProps, {}> {

    constructor(props: VotingFormProps) {
        super(props)
    }

    render() {
        let headers: Array<JSX.Element> = [<th key="nameHeader">Voter name</th>]
        headers = headers.concat(this.props.availableOptions.map(opt => {
            return <th key={opt}>{opt}</th>
        }))

        let voterRows: Array<JSX.Element> = []
        this.props.votes.forEach((vote: VoteData, voter: EthAccount) => {

            let voteColumns: Array<JSX.Element> = [<td key={vote.name}>{vote.name}</td>]
            for (var i = 0; i < this.props.availableOptions.length; i++) {
                if (i == vote.index)
                    voteColumns.push(<td key={String(i)}>X</td>)
                else
                    voteColumns.push(<td key={String(i)}></td>)
            }

            voterRows.push(
                <tr key={vote.name}>
                    {voteColumns}
                </tr>
            )
        });

        let radioColumns: Array<JSX.Element> = []
        for (var i = 0; i < this.props.availableOptions.length; i++) {
            radioColumns.push(
                <td key={String(i)}>
                    <input type="radio" value={String(i)} checked={this.props.userVote === i} onChange={this.props.onUserVoteUpdated} />
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
                                <input type="text" value={this.props.userName} onChange={this.props.onUserNameUpdated} />
                            </td>
                            {radioColumns}
                        </tr>
                    </tbody>
                </table>
                <button type="button" onClick={this.props.castVote}>Vote!</button>
            </div >
        )
    }
}

export default class Vote extends React.Component<{}, DidleState> {

    Didle: any
    web3: any
    id: EthAccount
    privKey: string
    creationBlock: BlockNumber


    constructor(props: any) {
        super(props)
        this.Didle = contract(didleArtifacts)
        this.state = {
            account: "",
            eventName: "",
            availableOptions: [],
            votes: new Map,
            userName: "Anonymous",
            userVote: 0
        }
        this.castVote = this.castVote.bind(this)
        this.onUserNameUpdated = this.onUserNameUpdated.bind(this)
        this.loadSummary = this.loadSummary.bind(this)
        this.startListening = this.startListening.bind(this)
        this.onUserVoteUpdated = this.onUserVoteUpdated.bind(this)
        this.privKey = this.getParameterByName("key")
        this.creationBlock = +this.getParameterByName("b")
        this.id = ethjs.privateToAccount(this.privKey).address
    }

    loadSummary(didle: any) {
        didle.voteSummary.call(this.id).then((response: any) => {
            const options = response[1].map((optHex: string) => {
                return this.web3.toUtf8(optHex)
            })
            this.setState({
                eventName: response[0],
                availableOptions: options
            })
        })

    }

    startListening(didle: any) {
        const voteEvents = didle.VoteSingle({ signer: this.id }, { fromBlock: this.creationBlock, toBlock: 'latest' })
        voteEvents.watch((err: any, event: any) => {
            if (err) {
                console.log(err)
            }
            else {
                let currentVotes = this.state.votes
                const newVote: VoteData = {
                    name: event.args.voterName,
                    index: event.args.proposal
                }
                this.setState({
                    votes: currentVotes.set(event.args.voter, newVote)
                })
            }
        })
    }

    componentDidMount() {
        Web3.initWeb3(this.web3, (accs: string[], initializedWeb3: any) => {
            this.web3 = initializedWeb3
            this.Didle.setProvider(this.web3.currentProvider)

            this.setState({
                account: accs[0]
            })

            this.Didle.deployed().then((instance: any) => {
                this.loadSummary(instance)
                this.startListening(instance)
            })

        });
    }

    castVote(event) {
        this.Didle.deployed().then((instance: any) => {
            const sig = cryptoutils.signAddress(this.privKey, this.state.account)
            instance.vote(this.state.userName, this.state.userVote, sig.h, sig.r, sig.s, sig.v, { from: this.state.account })
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

    onUserVoteUpdated(event: any) {
        this.setState({
            userVote: +event.target.value
        })

    }

    onUserNameUpdated(event: any) {
        this.setState({
            userName: event.target.value
        })
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
                    key: {this.privKey}<br />
                    block: {this.creationBlock}

                </p>
                <VotingForm eventName={this.state.eventName} userName={this.state.userName} availableOptions={this.state.availableOptions} votes={this.state.votes} userVote={this.state.userVote} onUserVoteUpdated={this.onUserVoteUpdated} onUserNameUpdated={this.onUserNameUpdated} castVote={this.castVote} />
            </div>
        )
    }
}
