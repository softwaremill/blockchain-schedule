import * as React from 'react';
import { injectGlobal } from 'styled-components';
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom';

import CreateDidle from './components/CreateDidle';
import Vote from './components/Vote';

class App extends React.Component<{}, {}> {

    render() {
        injectGlobal`
  body {
    font-family: 'Open Sans', sans-serif;
    margin-top: 10%;
    margin-left: 25%;
    margin-right: 25%;
  }
`;
        return (
            < Router >
                <div className="container">
                    <Route exact path="/" component={CreateDidle} />
                    <Route exact path="/vote" component={Vote} />
                </div>
            </Router >
        );
    }
}

export default App;
