import React from "react";

const Transaction = ({transaction})=>{
    const {input, outputMap}=transaction;
    const recipients=Object.keys(outputMap);

    return(
        <div className='Transaction' style={{color: 'white', margin: '50px 0px',fontSize: '1.5rem'}}>
            <div> From: {`${input.address.substring(0,20)}...`} | Balance: {input.amount}</div>
            {
                recipients.map(recipient => (
                        <div key={recipient}>
                            To: {`${recipient.substring(0,20)}...`} | Sent: {outputMap[recipient]}
                        </div>
                    )
                )
            }
        </div>
    )
};

export default Transaction;
