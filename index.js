const express=require('express');
const bodyParser=require('body-parser');
const Blockchain=require('./blockchain');
const PubSub=require('./app/pubsub');
const path=require('path');
const request=require('request');
const TransactionPool=require('./wallet/transaction-pool');
const Wallet=require('./wallet');
const TransactionMiner=require('./app/transaction-miner');




const isDevelopment=process.env.ENV==='development';
/*
const REDIS_URL= isDevelopment ?
    'redis://127.0.0.1.6379' :
    'redis:WEB_URL_HERE';
*/
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

if(isDevelopment){
    const walletFoo=new Wallet();
    const walletBar=new Wallet();

    const generateWalletTransaction=({wallet, recipient, amount})=>{
        const transaction=wallet.createTransaction({
            recipient, amount, chain:blockchain.chain
        });
        transactionPool.setTransaction(transaction);
    };

    const walletAction=()=>generateWalletTransaction({
        wallet,recipient:walletFoo.publicKey,amount:50
    });
    const walletFooAction=()=>generateWalletTransaction({
        wallet:walletFoo,recipient:walletBar.publicKey,amount:10
    });

    const walletBarAction=()=>generateWalletTransaction({
        wallet:walletBar,recipient:wallet.publicKey,amount:15
    });

    for(let i=0;i<10;i++){
        if(i%3===0){
            walletAction();
            walletFooAction();
        }
        else if(i%3===1){
            walletBarAction();
            walletFooAction();
        }
        else{
            walletAction();
            walletBarAction();
        }

        transactionMiner.mineTransactions();
    }
}

//setTimeout(()=> pubsub.broadcastChain(),1000);


const PORT= process.env.PORT || PEER_PORT || DEFAULT_PORT;
app.listen(PORT,()=>{
    console.log(`listening at localhost port:${PORT}`);
    if(PORT!==DEFAULT_PORT){
        syncWithRootState();
    }
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'client/dist')));  //Adding static pages to the frontend


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

app.get('/api/known-addresses',(req,res)=>{
    const addressMap={};
    for(let block of blockchain.chain){
        for(let transaction of block.data){
            const Recipient=Object.keys(transaction.outputMap);
            Recipient.forEach(recipient=>addressMap[recipient]=recipient);
        }
    }
    res.json(Object.values(addressMap));
});

app.get('/api/blocks/length',(req,res)=>{
    res.json(blockchain.chain.length);
});

app.get('/api/blocks/:id',(req,res)=>{
   const{id}=req.params;
   const {length}=blockchain.chain;
   const blocksReversed=blockchain.chain.slice().reverse();
   let startIndex=(id-1)*5;
   let endIndex=id*5;
   startIndex=startIndex<length?startIndex:length;
   endIndex=endIndex<length?endIndex:length;

   res.json(blocksReversed.slice(startIndex,endIndex));
});
app.get('*',(req,res)=>{
   res.sendFile(path.join(__dirname,'./client/dist/index.html'));
});