const {GENESIS_DATA, MINE_RATE}=require('../config')
const {cryptoHash}=require('../util')
const hexToBinary=require('hex-to-binary')

class Block{
    constructor({timestamp, lastHash, hash, data,nonce,difficulty}){
        this.timestamp=timestamp;
        this.lastHash=lastHash;
        this.hash=hash;
        this.data=data;
        this.nonce=nonce;
        this.difficulty=difficulty;
    }
    static genesis(){
        return new Block(GENESIS_DATA);                 //Factory Pattern Method
    }
    
    static mineBlock({lastBlock, data}){
        //const timestamp=Date.now();
        let {difficulty}=lastBlock;
        let nonce=0,hash,timestamp;
        do{
            nonce++;
            timestamp=Date.now();
            difficulty=Block.adjustDifficulty({originalBlock:lastBlock,timestamp});
            hash=cryptoHash(timestamp,lastBlock.hash,data,nonce,difficulty);
        }
        while(hexToBinary(hash).substring(0,difficulty)!=='0'.repeat(difficulty));
        return new this({
            timestamp:timestamp,
            lastHash:lastBlock.hash,
            data:data,
            difficulty:difficulty,
            nonce:nonce,
            hash:hash
        });
    }

    static adjustDifficulty({originalBlock, timestamp}){
        const {difficulty}=originalBlock;
        if(difficulty<1){
            return 1;
        }
        const difference=timestamp-originalBlock.timestamp;
        if(difference>MINE_RATE){
            return difficulty-1;
        }
        else if(difficulty<MINE_RATE){
            return difficulty+1;
        }
    }
}
/*
var block=new Block(
    {timestamp:new Date().getTime(),
      lastHash:'foo-lastHash',
      hash:'fooHash',
      data:'myData'});

console.log(block);
*/

module.exports=Block;