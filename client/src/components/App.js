import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import logo from '../assets/logo.png';
import ConductTransaction from "./ConductTransaction";
import './App.css'
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
        <div className='WalletInfo'>
          <div><img src= {logo} alt = "Wallet" height="250px"/></div>
          <div style={{marginBottom: "15px"}}><span>Address:</span> {address}</div>
          <div><span>Balance:</span> {balance} coins</div>
        </div>
      </div>
    );    }
}

export default App;
