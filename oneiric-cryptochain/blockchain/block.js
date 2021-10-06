const hexToBinary = require('hex-to-binary');
const {GENESIS_DATA, MINE_RATE} = require('../config');
const {cryptoHash} = require('../util');

class Block{
    constructor({timestamp, lastHash, hash, data, nonce, difficulty}){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis(){

        return new Block(
            GENESIS_DATA
        );

    }

    static mineBlock({lastBlock, data}){
        const lastHash = lastBlock.hash;
        let hash, timestamp;
        let { difficulty } = lastBlock; 
        let nonce = 0;

        do{
            nonce += 1;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ogBlock: lastBlock, timestamp});
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

        }while(hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

        return new Block({
            timestamp,
            lastHash,
            data,
            difficulty,
            nonce,
            hash
        });
         
    }

    static adjustDifficulty({ogBlock, timestamp}){

        const { difficulty } = ogBlock;

        const difference = timestamp - ogBlock.timestamp ;

        if (difficulty < 1){
            return 1;
        }

        if (difference > MINE_RATE){
            return difficulty - 1;
        }
        return difficulty + 1;
    }
}


module.exports = Block ;

