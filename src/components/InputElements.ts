import styled from 'styled-components'
import { DefaultFontSize } from './StyleConstants'

const Input = styled.input`
    border: 1px solid rgb(183, 183, 183);
    box-sizing: border-box;
    color: rgb(85, 85, 85);
    font-size: ${DefaultFontSize};
    height: 30px;
    line-height: 15px;
    margin-right: 10px;
    padding: 4px 12px 4px 12px;
    text-align: start;
    width: 310px;
`

export const ShortInput = Input.extend`
    width: 155px;
`

export const InputLabel = styled.label`
      font-size: ${DefaultFontSize};
`

export default Input
