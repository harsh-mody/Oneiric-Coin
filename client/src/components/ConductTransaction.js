import React, {Component} from "react";
import {FormGroup,FormControl, Button} from 'react-bootstrap';
import {Link} from "react-router-dom";
import history from "../history";

class ConductTransaction extends Component{
  state={
      recipient:'',
      amount:0,
      knownAddresses:[],
  };

  componentDidMount() {
      fetch(`${document.location.origin}/api/known-addresses`)
          .then(response=>response.json())
          .then(json=>this.setState({knownAddresses:json}));
  }

    updateRecipient= event=>{
      this.setState({recipient:event.target.value});
  };

  updateAmount= event=>{
        this.setState({amount:Number(event.target.value)});
  };

  conductTransaction=()=>{
    const{recipient , amount }=this.state;
    fetch(`${document.location.origin}/api/transact`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({recipient,amount })
    }).then(response=>response.json())
        .then(json=>{
            alert(json.message||json.type);
            history.push('/transaction-pool');
        })
  };

  render() {
      return(
          <div className='ConductTransaction' style={{textAlign: 'center', padding: '0 300px'}}>
              <div><h3 style={{color: 'white', fontSize: '3rem'}}>Conduct a Transaction!</h3></div>
              <br/>
              <br/>
              <h4 style={{color: "white"}}>Known Addresses</h4>
              {
                  this.state.knownAddresses.map(knownAddress=>{
                      return(
                        <div key={knownAddress}>
                            <div>{knownAddress}</div>
                            <br/>
                        </div>
                      );
                  })
              }
              <br/>
              <br/>
              <FormGroup>
                  <FormControl
                      input='text'
                      placeholder='recipient'
                      value={this.state.recipient}
                      onChange={this.updateRecipient}
                  />
              </FormGroup>
              <FormGroup>
                  <FormControl
                      input='text'
                      placeholder='amount'
                      value={this.state.amount}
                      onChange={this.updateAmount}
                  />
              </FormGroup>
              <div>
                  <Button
                      variant="danger"
                    onClick={this.conductTransaction}
                  >Submit</Button>
              </div>
          </div>
      )
  }
}

export default ConductTransaction;
