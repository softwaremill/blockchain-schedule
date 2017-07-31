import { EthAccount } from './EthModel'

export type OptionName = string
export type VotingId = string
export type VotingKey = string

export interface VoteOption {
    name: OptionName
    voteCount: number
}

export interface VoteData {
    name: VoterName,
    index: OptionIndex
}

export type VoterName = string
export type OptionIndex = number
export type EventName = string
export type VotingMap = {
    [prop: string]: VoteData
}
