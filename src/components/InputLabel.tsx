import * as React from 'react'
import styled from 'styled-components'

const InputLabel = styled.label`
      font-size: 13px;
`

export default InputLabel

// imho spokojnie mozna to wsadzic do `Input.tsx` jako trzeci eksportowany element, no i moze zmienic nazwe pliku na cos w stylu `inputElements`
// dopoki nie ma w uzyciu skladni jsx, nie ma potrzeby dla rozszerzenia .tsx (wystarczy .ts)
