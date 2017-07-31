import * as React from 'react'
import styled from 'styled-components'

interface ButtonProps {
    className?: string
    primary?: boolean
    text: string
    onClick: (any) => void
}

const Button = (props: ButtonProps) => <button type="button" className={props.className} onClick={props.onClick}>{props.text}</button>

const StyledButton = styled(Button) `
          color: ${props => props.primary ? 'rgb(238, 238, 238)' : 'rgb(50, 50, 50)'
    };
 background: ${props => props.primary ? '#005dc9' : 'rgb(244, 244, 244)'
    };
    padding-left: 10px;
    line-height: 18px;
    margin-right: 5px;
    padding-right: 10px;
    border-color: ${props => props.primary ? 'rgb(0,78,170)' : 'rgb(204, 204, 204)'};
    border-width: 0.992647px;
    border-style: solid;
    font-size: 13px;
    border-radius: 4px;
    line-height: 18px;
cursor: pointer;
`

export default StyledButton
