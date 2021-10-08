const express=require('express');
const bodyParser=require('body-parser');
const Blockchain=require('./blockchain');
const PubSub=require('./app/pubsub');
const request=require('request');
const TransactionPool=require('./wallet/transaction-pool');
const Wallet=require('./wallet');
const TransactionMiner=require('./app/transaction-miner');

const app=express();
const blockchain=new Blockchain();
const wallet=new Wallet();
const transactionPool=new TransactionPool();
const DEFAULT_PORT=3000;
let PEER_PORT;
const pubsub=new PubSub({ blockchain, transactionPool});
const ROOT_NODE_ADDRESS=`http://localhost:${DEFAULT_PORT}`;
const transactionMiner=new TransactionMiner({blockchain,transactionPool,wallet,pubsub});

const syncWithRootState = ()=>{
    request({url:`${ROOT_NODE_ADDRESS}/api/blocks`},(error,response,body)=>{
        if(!error&&response.statusCode===200){
            const rootChain=JSON.parse(body);
            console.log('replace chain on a sync with ',rootChain);
            blockchain.replaceChain(rootChain);
        }
    });
    request({url:`${ROOT_NODE_ADDRESS}/api/transaction-pool-map`},(error, response, body)=>{
        if(!error&&response.statusCode===200){
            const rootTransactionPoolMap=JSON.parse(body);
            console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
};

if(process.env.GENERATE_PEER_PORT==='true'){
    PEER_PORT=DEFAULT_PORT+ Math.ceil(Math.random()*1000);
}

//setTimeout(()=> pubsub.broadcastChain(),1000);

const PORT=PEER_PORT || DEFAULT_PORT;
app.listen(PORT,()=>{
    console.log(`listening at localhost port:${PORT}`);
    if(PORT!==DEFAULT_PORT){
        syncWithRootState();
    }
});

app.use(bodyParser.json());


app.get('/api/blocks',(req,res)=>{
    res.json(blockchain.chain);
});


app.post('/api/mine',(req,res)=>{
    const {data} = req.body;
    blockchain.addBlock({data});
    pubsub.broadcastChain();
    res.redirect('/api/blocks');
});


app.post('/api/transact',(req,res)=>{
    let transaction=transactionPool.existingTransaction({inputAddress:wallet.publicKey});
    const {amount, recipient} =req.body;
    try{
        if(transaction){
            transaction.update({senderWallet:wallet,recipient,amount});
        }
        else{
            transaction=wallet.createTransaction({amount,recipient,chain:blockchain.chain});
        }
    }
    catch (e) {
        return res.status(400).json({type:'error',
            message:e.message});
    }
    transactionPool.setTransaction(transaction);
    console.log('transactionPool: ',transactionPool);
    pubsub.broadcastTransaction(transaction);
    res.json({type:'success',transaction});
});


app.get('/api/transaction-pool-map',(req,res)=>{
   res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions',(req,res)=>{
    transactionMiner.mineTransactions();
    res.redirect('/api/blocks');
});

app.get('/api/wallet-info',(req,res)=>{
   res.json({
       address: wallet.publicKey,
       balance:Wallet.calculateBalance({chain:blockchain.chain, address:wallet.publicKey})
   });
});