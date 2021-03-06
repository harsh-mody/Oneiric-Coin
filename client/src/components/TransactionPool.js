import React,{Component} from "react";
import {Link} from "react-router-dom";
import Transaction from "./Transaction";
import {Button} from "react-bootstrap";
import history from "../history";

const POLL_INTERVAL_MS=10000;

class TransactionPool extends Component{
    state={
        transactionPoolMap:{}
    };

    fetchTransactionPoolMap=()=> {
        fetch(`${document.location.origin}/api/transaction-pool-map`)
            .then(response => response.json())
            .then(json => {
                this.setState({transactionPoolMap: json});
            });
    };

    componentDidMount() {
        this.fetchTransactionPoolMap();
        this.fetchPoolMapInterval=setInterval(
            ()=>this.fetchTransactionPoolMap(),POLL_INTERVAL_MS
        );
    }

    componentWillUnmount() {
        clearInterval(this.fetchPoolMapInterval);
    }

    fetchMineTransactions=()=>{
      fetch(`${document.location.origin}/api/mine-transactions`)
          .then(response=>{
              if(response.status===200){
                  alert('Success');
                  history.push('/blocks');
              }
              else{
                  alert('The mine-transactions block request did not complete.');
              }
          })
    };


    render(){
        return(
            <div className='TransactionPool' style={{color: 'white', textAlign: 'center', padding: '0px 300px'}}>
                <br/><br/>
                <div><h3 style={{fontSize: '3rem'}}>Transaction Pool</h3></div>
                {
                    Object.values(this.state.transactionPoolMap).map(transaction=>{
                        return(
                            <div key={transaction.id}>
                                <hr/>
                                <Transaction transaction={transaction}/>
                            </div>
                        )
                    })
                }
                <Button
                    variant="danger"
                    onClick={this.fetchMineTransactions}
                >Mine the Transactions</Button>
            </div>
        )
    }
}

export default TransactionPool;
