const Blockchain = require('./blockchain');

const blockchain = new Blockchain();

blockchain.addBlock({data:'first'});

console.log('FIRST BLOCK:', blockchain.chain[blockchain.chain.length - 1]);

let prevTimeStamp, nextTimeStamp, nextBlock, timeDiff, average;

const times = [];

for (let i = 0; i < 5000; i++) {
    prevTimeStamp = blockchain.chain[blockchain.chain.length - 1].timestamp ;

    blockchain.addBlock({data:`block ${i}`});

    nextBlock = blockchain.chain[blockchain.chain.length - 1] ;

    nextTimeStamp = nextBlock.timestamp ;

    timeDiff = nextTimeStamp - prevTimeStamp ;

    times.push(timeDiff) ;  

    average = times.reduce((total,num) => (total+num))/times.length;

    console.log(`Time required to mine the block is ${timeDiff}. Difficulty to mine the next block is ${nextBlock.difficulty}. Average time is ${average}.`);   
}