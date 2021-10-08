import React from 'react'
import { render } from 'react-dom'
import App from './components/App'
import { Router, Switch, Route } from 'react-router-dom'
import history from './history'
import Blocks from './components/Blocks'
import ConductTransaction from './components/ConductTransaction'
import TransactionPool from './components/TransactionPool'

render(
    <Router history={history}>
        <Switch>
            <Route exact path="/" component={App} />
            <Route path="/blocks" component={Blocks} />
            <Route path="/conducttransaction" component={ConductTransaction} />
            <Route path="/transaction-pool" component={TransactionPool} />
        </Switch>
    </Router>,
    document.getElementById('root')
)


// npm i parcel-bundler@1.10.3 --save
// npm i babel-core@6.23.3 babel-plugin-transform-class-properties@6.24.1 babel-plugin-transform-object-rest-spread@6.26.0 babel-preset-env@1.7.0 babel-preset-react@6.24.1 --save
// npm i react-router-dom --save
// npm i history@4.7.2 --save