import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import logo from '../assets/logo.png';
import ConductTransaction from "./ConductTransaction";

class App extends Component{
    state={walletInfo:{}};

    componentDidMount() {
        fetch(`${document.location.origin}/api/wallet-info`).then((response)=>{
            response.json().then((json)=>{
                console.log('json',json);
                this.setState({walletInfo:json});
            });
        });
    }


    render(){
        const {address, balance}= this.state.walletInfo;
        return (
            <div className='App'>
                <img className='logo' src={logo}></img>
                <br/>
                <div><h2>Welcome to the CryptoChain!</h2></div>
                <hr/><br/>
                <div><Link to='/blocks'>Blocks</Link></div>
                <br/>
                <div><Link to='/conduct-transaction'>Conduct Transaction</Link></div>
                <br/>
                <div><Link to='transaction-pool'>Transaction Pool</Link></div>
                <br/><br/>
                <div className='WalletInfo'>
                    <div>Address: {address}</div>
                    <div>Balance: {balance}</div>
                </div>
            </div>
        );
    }
}

export default App;