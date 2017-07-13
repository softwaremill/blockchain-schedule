import * as React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom';

import CreateDidle from './components/CreateDidle';
import Vote from './components/Vote';

class App extends React.Component<{}, {}> {
    render() {
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
