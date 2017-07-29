import * as React from 'react'
import styled from 'styled-components'
import Button from './Button'
import ErrorBox from './ErrorBox'
import Input from './Input'
import { ShortInput } from './Input' // albo zrob dwa zwykle (nie default) exporty z './Input', albo złącz to w jedno: `import Input, { ShortInput } from './Input'`
import InputLabel from './InputLabel'
const ethjs = require('ethjs-account') // require zamiast import?
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
        } // else zaczynamy w tej samej linii, w ktorej konczy sie klamra zamykajaca blok if
        else {
            const signer = ethjs.generate('892h@fsdf11ks8sk^2h8s8shfs.jk39hsoi@hohskd') // imho warto wyciagnac ten fingerprint do jakiejs stalej, moze trzymac w configu?
            const ballotId: string = signer.address
            const key: string = signer.privateKey


            this.props.contract.deployed().then((instance) => {
                return instance.create(ballotId, this.state.name, this.state.options, { from: this.props.account, gas: 1334400 })
                    .then(r => {
                        console.log("Contract executed")
                        history.push('/vote?key=' + key + '&b=' + r.receipt.blockNumber)
                    })
            })
            
            // `.then()` w js działa zarówno jak map, jak i flatMap, zatem mozna to zrobic nieco ładniej (specjalnie zakomentowane, zeby latwiej bylo Ci sie polapac, co dodałem):
            // this.props.contract
            //     .deployed()
            //     .then(instance => instance.create(ballotId, this.state.name, this.state.options, { from: this.props.account, gas: 1334400 }))
            //     .then(r => {
            //         console.log("Contract executed")
            //         history.push('/vote?key=' + key + '&b=' + r.receipt.blockNumber)
            //     });
        }
    }

    addNewDate() {
        if (this.validInput()) {
            // ŹLE! w linii 76 modyfikujesz stan bezposrednio, a tak nie wolno!
            // przeciez newOptions wskazuje na this.state.options :)
            let newOptions: Array<string> = this.state.options
            newOptions.push(this.state.newOption)
            this.setState({ options: newOptions, newOption: this.now() })

            // zrób to tak (odkomentuj):
            // this.setState({
            //     options: [...this.state.options, this.state.newOption], // spread operator (...this.state.options) robi shallow copy
            //     newOption: this.now()
            // });
        }
    }

    validInput(): boolean {
        if (this.state.options.some(x => x === this.state.newOption)) {
            this.setState({ formError: true, formErrorMsg: "Duplicates not allowed" })
            return false
        } // else od tej samej linii
        else {
            this.setState({ formError: false })
            return true
        }
    }

    handleInputChange(event: any) { // ten typ 'any' troche wadzi, sprobowalbym z `React.SyntheticEvent<HTMLInputElement>` oraz wtedy `event.currentTarget.value` (zobacz https://stackoverflow.com/questions/42081549/typescript-react-event-types#answer-42085792)
        this.setState({ newOption: event.target.value })
    }

    handleNameChange(event: any) { // jw
        this.setState({ name: event.target.value })
    }

    render() {
        let rows: Array<JSX.Element> = []

        // forEach, brzydal! zrób tak (zakomentowane):
        // const rows = this.state.options.map(opt => <li key={opt}>{opt}</li>);
        this.state.options.forEach((opt: string) => {
            rows.push(<li key={opt}>{opt}</li>)
        })


        const CreateButton = withRouter(({ history }) => (
            <Button primary text="Create Schedule" onClick={() => { this.createSchedule(history) }} />))

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
` // vendor-prefixing, z tego co wiem, styled-components ogarnia sam - nie musisz bawic sie w to sam :)

export default StyledForm
