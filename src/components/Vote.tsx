import * as React from 'react'
import * as Web3 from '../web3'
import * as ethjs from 'ethjs-account'
import VotingForm from './VotingForm'
import { VoteData, VoteOption, VoterName, OptionIndex, EventName, VotingMap } from './../model/VotingModel'
import { EthAccount, BlockNumber } from './../model/EthModel'
import EthHeader from './EthHeader'
import styled from 'styled-components'
import * as loadContract from 'truffle-contract'
import * as cryptoutils from '../cryptoutils';
const ethArtifacts = require('../../build/contracts/DecentralizedSchedule.json')

export interface VotingState {
    eventName: EventName
    account: EthAccount
    availableOptions: Array<VoteOption>
    votes: VotingMap
    userName: VoterName
    userVote: OptionIndex
}

const UrlHint = styled.span`
    font-size: 12px;
`

export default class Vote extends React.Component<{}, VotingState> {

    contract: any
    web3: any
    id: EthAccount
    privKey: string
    creationBlock: BlockNumber


    constructor(props: any) {
        super(props)
        this.contract = loadContract(ethArtifacts)
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

    loadSummary(loadedContract) {
        loadedContract.voteSummary.call(this.id).then((response: any) => {
            const options: Array<VoteOption> = response[1].map((optHex: string, index: number) => {
                return {
                    name: this.web3.toUtf8(optHex),
                    voteCount: +response[2][index]
                }
            })
            this.setState({
                eventName: response[0],
                availableOptions: options
            })
        })

    }

    startListening(loadedContract: any) {
        const voteEvents = loadedContract.VoteSingle({ signer: this.id }, { fromBlock: this.creationBlock, toBlock: 'latest' })
        voteEvents.watch((err: any, event: any) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log("Event!")
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
        Web3.initWeb3((accs: string[], initializedWeb3: any) => {
            this.web3 = initializedWeb3
            this.contract.setProvider(this.web3.currentProvider)

            this.setState({
                account: accs[0]
            })

            this.contract.deployed().then((instance: any) => {
                this.loadSummary(instance)
                this.startListening(instance)
            })

        });
    }

    castVote(event) {
        this.contract.deployed().then((instance: any) => {
            const sig = cryptoutils.signAddress(this.privKey, this.state.account)
            instance.vote(this.state.userName, this.state.userVote, sig.h, sig.r, sig.s, sig.v, { from: this.state.account, gas: 160000 })
                .then(() => this.loadSummary(instance))
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
            <div>
                <EthHeader>Current ETH account: {this.state.account}</EthHeader>
                <UrlHint>To share this event, use following url: {window.location.href}</UrlHint>
                <VotingForm eventName={this.state.eventName} userName={this.state.userName} availableOptions={this.state.availableOptions} votes={this.state.votes} userVote={this.state.userVote} onUserVoteUpdated={this.onUserVoteUpdated} onUserNameUpdated={this.onUserNameUpdated} castVote={this.castVote} />
            </div>
        )
    }
}
