import * as React from 'react'
import * as Web3 from '../web3'
import * as ethjs from 'ethjs-account'
import EthHeader from './EthHeader'
import Button from './Button'
import { ShortInput } from './Input'
import styled from 'styled-components'
import * as contract from 'truffle-contract'
import * as cryptoutils from '../cryptoutils';
const ethArtifacts = require('../../build/contracts/DistributedSchedule.json') // require zamiast import ?

interface VoteData {
    name: VoterName,
    index: OptionIndex
}

type VoterName = string
type OptionIndex = number
type OptionName = string
type VotingId = string
type VotingKey = string
type EthAccount = string
type EventName = string
type VotingMap = Map<EthAccount, VoteData>
type BlockNumber = number

// klasa uzywana tylko do adnotacji typów - zamien na type/interface
class VoteOption {
    name: OptionName
    voteCount: number
}

// ten interfejs nigdzie indziej nie jest uzywany, zatem niepotrzebny export
export interface VotingState {
    eventName: EventName
    account: EthAccount
    availableOptions: Array<VoteOption>
    votes: VotingMap
    userName: VoterName
    userVote: OptionIndex
}

interface VotingProps {
    eventName: EventName
    availableOptions: Array<VoteOption>
    votes: VotingMap
    userName: VoterName
    userVote: OptionIndex
    onUserVoteUpdated: (any) => void
    onUserNameUpdated: (any) => void
    castVote: (any) => void
}

const VoteHeader = styled.thead`
    background-color: rgb(51, 133, 228);
`

const VoteHeaderCol = styled.th`
    font-size: 13px;
    color: white;
    font-style: normal;
    font-weight: normal;
    padding-bottom: 6px;
    padding-top: 5px;
    padding-left: 10px;
    padding-right: 10px;
`

const VoteCol = styled.td`
    background-color: rgb(178, 209, 249);
    vertical-align: middle;
    text-align: center;
    font-weight: normal;
    font-size: 23px;
`

const VoterNameCol = VoteCol.extend`
    font-size: 13px;
`

const VotesTable = styled.table`
    padding: 15px;
`

const VoterNameInput = ShortInput.extend`
    margin: 0px;
    width: inherit;
`

const EventHeader = styled.h2`
    color: rgb(85, 85, 85);
`

const UrlHint = styled.span`
    font-size: 12px;
`
// ^ troche tego duzo, moze warto wywalic cała tę gromadkę do osobnego pliku?

// wywalilbym VotingForm do osobnego pliku, troche za duzo sie tutaj dzieje (w tym pliku)
class VotingForm extends React.Component<VotingProps, {}> {

    constructor(props: VotingProps) {
        super(props)
    }

    render() {
        let headers: Array<JSX.Element> = [<VoteHeaderCol key="nameHeader">Voter name</VoteHeaderCol>]
        const maxVotes = Math.max(...this.props.availableOptions.map(opt => { return opt.voteCount }))

        headers = headers.concat(this.props.availableOptions.map(opt => {
            // uzylbym ternary
            let trophy = ""
            if (opt.voteCount == maxVotes) // ===
                trophy = " 🏆"
            return <VoteHeaderCol key={opt.name}>{opt.name} ({opt.voteCount}){trophy}</VoteHeaderCol>
        }))

        // a najlepiej to imho tak (odkomentuj):
        // const headers = [
        //     <VoteHeaderCol key="nameHeader">Voter name</VoteHeaderCol>, 
        //     ...this.props.availableOptions.map(opt => <VoteHeaderCol key={opt.name}>{opt.name} ({opt.voteCount}){opt.voteCount === maxVotes ? ' 🏆' : ''}</VoteHeaderCol>)
        // ];

        // forEach, brzydal! sprawdź komcio do CreateForm.tsx, linia 109 :) (hint: uzyj .map)
        let voterRows: Array<JSX.Element> = []
        this.props.votes.forEach((vote: VoteData, voter: EthAccount) => {

            let voteColumns: Array<JSX.Element> = [<VoterNameCol key={vote.name}>{vote.name}</VoterNameCol>]
            for (var i = 0; i < this.props.availableOptions.length; i++) {
                if (i == vote.index)
                    voteColumns.push(<VoteCol key={String(i)}>✓</VoteCol>)
                else
                    voteColumns.push(<VoteCol key={String(i)}></VoteCol>)
            }

            voterRows.push(
                <tr key={vote.name}>
                    {voteColumns}
                </tr>
            )
        });

        // to samo - prze(.map)uj po this.props.availableOptions
        // hint: lambda w .map jako drugi argument dostaje index kolejnego elementu
        // np. [a, b, c].map((element, idx) => {...})
        let radioColumns: Array<JSX.Element> = []
        for (var i = 0; i < this.props.availableOptions.length; i++) {
            radioColumns.push(
                <VoteCol key={String(i)}>
                    <input type="radio" value={String(i)} checked={this.props.userVote === i} onChange={this.props.onUserVoteUpdated} />
                </VoteCol>
            )
        }


        return (
            <div>
                <EventHeader>{this.props.eventName}</EventHeader>
                <VotesTable>
                    <VoteHeader>
                        <tr>
                            {headers}
                        </tr>
                    </VoteHeader>
                    <tbody>
                        {voterRows}
                        <tr>
                            <td>
                                <VoterNameInput value={this.props.userName} onChange={this.props.onUserNameUpdated} />
                            </td>
                            {radioColumns}
                        </tr>
                    </tbody>
                </VotesTable>
                <Button onClick={this.props.castVote} text="Vote!" primary />
            </div >
        )
    }
}

export default class Vote extends React.Component<{}, VotingState> {

    Contract: any
    web3: any
    id: EthAccount
    privKey: string
    creationBlock: BlockNumber


    constructor(props: any) {
        super(props)
        this.Contract = contract(ethArtifacts)
        this.state = {
            account: "",
            eventName: "",
            availableOptions: [],
            votes: new Map, // jak juz to `new Map()` (ja wiem, ze bez nawiasow tez dziala, ale to jest bardzo brzydkie). Ponadto, w JS 99.9999% przypadkow, ktore chcialbys opedzic Map'em, opedzisz zwyklym obiektem - imho warto to zmienic.
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

    loadSummary(contract: any) {
        contract.voteSummary.call(this.id).then((response: any) => {
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

    startListening(contract: any) {
        const voteEvents = contract.VoteSingle({ signer: this.id }, { fromBlock: this.creationBlock, toBlock: 'latest' })
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
            this.Contract.setProvider(this.web3.currentProvider)

            this.setState({
                account: accs[0]
            })

            this.Contract.deployed().then((instance: any) => {
                this.loadSummary(instance)
                this.startListening(instance)
            })

        });
    }

    castVote(event) {
        this.Contract.deployed().then((instance: any) => {
            const sig = cryptoutils.signAddress(this.privKey, this.state.account)
            instance.vote(this.state.userName, this.state.userVote, sig.h, sig.r, sig.s, sig.v, { from: this.state.account, gas: 160000 })
                .then(() => this.loadSummary(instance))
        })
    }

    getParameterByName(name) {
        let url = window.location.href
        name = name.replace(/[\[\]]/g, "\\$&")
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), // const (ew. let), nigdy var!
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

// sredniki!
