import React from 'react';
import {render} from 'react-dom';
import App from './components/App';
import './index.css';
import Logo from './components/Logo.png';
import history from "./history";
import Blocks from "./components/Blocks";
import ConductTransaction from "./components/ConductTransaction";
import TransactionPool from "./components/TransactionPool";
import{Router, Switch, Route} from 'react-router-dom';

render(
    <div style={{backgroundImage: 'linear-gradient(to bottom right, #3AAFA9, #2B7A78)', minHeight: '100vh'}}>
	<style>
	@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap')
	@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro&display=swap')
	</style>
	<div className="Header">
	<div className='menu'>
	<div className='logo'><a href='/'><img src={Logo} alt='Logo' height="80px"/></a></div>
	<div className="brand-name pf"><a href='/'>Oneiric Coins</a></div>
	</div>
	<div className="Navbar inline pf">
	<div className='Menu'>
	<a href='/blocks'>Blocks</a>
	</div>
	<div className="Menu">
	<a href='/conduct-transaction'>Conduct Transaction</a>
	</div>
	<div className="Menu">
	<a href='/transaction-pool'>Transaction Pool</a>
	</div>
	</div>
	</div>
	<Router history={history}>
        <Switch>
            <Route exact path='/' component={App}/>
            <Route path='/blocks' component={Blocks}/>
            <Route path='/conduct-transaction' component={ConductTransaction}/>
            <Route path='/transaction-pool' component={TransactionPool}/>
        </Switch>
    	</Router>
    </div>

    ,document.getElementById('root')
);
