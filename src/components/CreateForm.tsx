import * as React from 'react'
import styled from 'styled-components'
import Button from './Button'
import ErrorBox from './ErrorBox'
import Input from './Input'
import { ShortInput } from './Input'
import InputLabel from './InputLabel'
const ethjs = require('ethjs-account')
import { withRouter } from 'react-router-dom'

export interface CreateScheduleState {
    name: string,
    options: Array<string>,
    newOption: string,
    formError: boolean,
    formErrorMsg: string
}

export interface CreateScheduleProps {
    contract: any
    account: any
    className?: string
}

class CreateForm extends React.Component<CreateScheduleProps, CreateScheduleState> {

    now() {
        return new Date().toJSON().slice(0, 10)
    }

    public constructor(props: CreateScheduleProps) {
        super(props)
        let utc: string = this.now()
        this.state = { name: "", options: [], newOption: utc, formError: false, formErrorMsg: "" }
        this.handleInputChange = this.handleInputChange.bind(this)
        this.addNewDate = this.addNewDate.bind(this)
        this.validInput = this.validInput.bind(this)
        this.createSchedule = this.createSchedule.bind(this)
        this.handleNameChange = this.handleNameChange.bind(this)
    }

    createSchedule(history: any) {
        if (this.state.options.length == 0) {
            this.setState({ formError: true, formErrorMsg: "Empty option list not allowed." })
        }
        else {
            const signer = ethjs.generate('892h@fsdf11ks8sk^2h8s8shfs.jk39hsoi@hohskd')
            const ballotId: string = signer.address
            const key: string = signer.privateKey


            this.props.contract.deployed().then((instance) => {
                return instance.create(ballotId, this.state.name, this.state.options, { from: this.props.account, gas: 1334400 })
                    .then(r => {
                        console.log("Contract executed")
                        history.push('/vote?key=' + key + '&b=' + r.receipt.blockNumber)
                    })
            })
        }
    }

    addNewDate() {
        if (this.validInput()) {
            let newOptions: Array<string> = this.state.options
            newOptions.push(this.state.newOption)
            this.setState({ options: newOptions, newOption: this.now() })
        }
    }

    validInput(): boolean {
        if (this.state.options.some(x => x === this.state.newOption)) {
            this.setState({ formError: true, formErrorMsg: "Duplicates not allowed" })
            return false
        }
        else {
            this.setState({ formError: false })
            return true
        }
    }

    handleInputChange(event: any) {
        this.setState({ newOption: event.target.value })
    }

    handleNameChange(event: any) {
        this.setState({ name: event.target.value })
    }

    render() {
        let rows: Array<JSX.Element> = []

        this.state.options.forEach((opt: string) => {
            rows.push(<li key={opt}>{opt}</li>)
        })


        const CreateButton = withRouter(({ history }) => (
            <Button primary text="Create Event" onClick={() => { this.createSchedule(history) }} />))

        return (
            <div className={this.props.className}>
                <InputLabel>Event name</InputLabel>
                <Input value={this.state.name} onChange={this.handleNameChange} />
                <ul>
                    {rows}
                </ul>
                <div>
                    <ShortInput value={this.state.newOption} onChange={this.handleInputChange} />
                    <Button text="Add" onClick={this.addNewDate} />
                    <CreateButton />
                </div>
                {
                    this.state.formError
                        ? <ErrorBox><span>{this.state.formErrorMsg}</span></ErrorBox>
                        : null
                }

            </div>
        )
    }
}

const StyledForm = styled(CreateForm) `
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    width: 550px;
    border: 1px #d6d6d6 solid;
    background-color: #edf4fe;
    padding: 5px;
`

export default StyledForm
