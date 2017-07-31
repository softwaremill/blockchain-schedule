import * as React from 'react'
import { range } from "lodash";
import Button from './Button'
import { VoteData, VoteOption, VoterName, OptionIndex, EventName, VotingMap } from './../model/VotingModel'
import { EthAccount } from './../model/EthModel'
import { ShortInput } from './InputElements'
import styled from 'styled-components'
import * as cryptoutils from '../cryptoutils';

export interface VotingFormProps {
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

export default class VotingForm extends React.Component<VotingFormProps, {}> {

    constructor(props: VotingFormProps) {
        super(props)
    }

    render() {
        const maxVotes = Math.max(...this.props.availableOptions.map(opt => { return opt.voteCount }))
        const headers = [
            <VoteHeaderCol key="nameHeader">Voter name</VoteHeaderCol>,
            ...this.props.availableOptions.map(opt => <VoteHeaderCol key={opt.name}>{opt.name} ({opt.voteCount}){opt.voteCount === maxVotes ? ' 🏆' : ''}</VoteHeaderCol>)
        ];


        this.props.votes.entries().map((voter: EthAccount, vote: VoteData) => {
            // for each vote, we create a table row - TODO export
            const voteColumns = range(1, 5)
        })


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
