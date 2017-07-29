import * as React from 'react'
import styled from 'styled-components'

interface ButtonProps {
    className?: string
    primary?: boolean
    text: string
    onClick: (any) => void
}

class Button extends React.Component<ButtonProps, {}> {
    render() {
        return (
            <button type="button" className={this.props.className} onClick={this.props.onClick}>{this.props.text}</button>
        )
    }
}

// Jezeli komponent nie posiada wlasnego stanu (state), nie korzysta z metod cyklu zycia komponentu (componentDidMount, componentWillUnmount etc.), to najprawdopodobniej
// jest on tzw. "presentational component". Tym samym, nie musi byc zdefiniowany jako klasa rozszerzająca React.Component - moze byc za to zwykłą funkcją. Przykład nizej (nazwalem Button2 aby uniknac name collision):
const Button2 = (props: ButtonProps) => <button type="button" className={props.className} onClick={props.onClick}>{props.text}</button>;

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
// troszke bałagan w stylach:
// 1. postaraj sie pogrupowac powiazane propertiesy - np. padding-left i padding-right jedno po drugim (a nawet short-hand syntax w tym przypadku: `padding: 0 10px;`)
// 2. dobrą praktyką jest rowniez definiowanie styli alfabetycznie, z góry do dołu
// 3. formatowanie
// 4. masz dwa razy `line-height: 10px;`
// 5. border-width: 0.992647px - :wat:
// 6. border-color, border-width, border-style - jako shorthand da sie np tak: `border: 1px solid rgb(0,78,170);`
// 7. byc moze pewne wartosci da sie ujac jako stałe?

export default StyledButton
