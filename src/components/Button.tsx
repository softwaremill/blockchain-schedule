import * as React from 'react'
import styled from 'styled-components'
import { DefaultFontSize } from './StyleConstants'

interface ButtonProps {
    className?: string
    primary?: boolean
    text: string
    onClick: (any) => void
}

const Button = (props: ButtonProps) => <button type="button" className={props.className} onClick={props.onClick}>{props.text}</button>

const StyledButton = styled(Button) `
    background: ${props => props.primary ? '#005dc9' : 'rgb(244, 244, 244)'};
    border: 1px solid;
    border-color: ${props => props.primary ? 'rgb(0,78,170)' : 'rgb(204, 204, 204)'};
    border-radius: 4px;
    color: ${props => props.primary ? 'rgb(238, 238, 238)' : 'rgb(50, 50, 50)'};
    cursor: pointer;
    font-size: ${DefaultFontSize};
    line-height: 18px;
    margin-right: 5px;
    padding: 0 10px;
`

export default StyledButton
