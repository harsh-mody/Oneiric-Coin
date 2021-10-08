const Block=require('./block');
const {cryptoHash}=require('../util');
const {REWARD_INPUT, MINING_REWARD}=require('../config');
const Transaction=require('../wallet/transaction');
const Wallet=require('../wallet');

class Index{
    constructor(){
        this.chain=[Block.genesis()];
    }


    addBlock({data}){
        const newBlock=Block.mineBlock({
            lastBlock: this.chain[this.chain.length-1],
            data
        });
        this.chain.push(newBlock);
    }

    static isValidChain(chain){
        if(JSON.stringify(chain[0])!==JSON.stringify(Block.genesis())){
            return false;
        }
        else{
            for(var i=1;i<chain.length;i++){
                const block=chain[i];
                const actualLastHash=chain[i-1].hash;
                const {timestamp, lastHash, hash,data,nonce,difficulty}=block;
                const lastDifficulty=chain[i-1].difficulty;
                if(Math.abs(lastDifficulty-difficulty)>1){
                    return false;
                }
                if(lastHash!==actualLastHash){
                    return false;
                }
                const validatedHash=cryptoHash(timestamp,lastHash,data,nonce,difficulty);
                if(hash!==validatedHash){
                    return false;
                }
            }
            return true;
        }
    }

    replaceChain(chain,validateTransaction, onSuccess){
        if(chain.length<=this.chain.length){
            console.error('incoming chain must be longer.');
            return;
        }
        if(!Index.isValidChain(chain)){
            console.error('incoming chain must be valid.');
            return;
        }
        if(validateTransaction) {
            if (!this.validTransactionData({chain})) {
                console.error('Incoming chain has invalid transaction data');
                return;
            }
        }
        console.log('replacing chain with: ',chain);
        this.chain=chain;
        if(onSuccess){
            onSuccess();
        }
    }

    validTransactionData({chain}){
        for(let i=1;i<chain.length;i++){
            const block=chain[i];
            const transactionSet=new Set();
            let rewardTransactionCount=0;
            for(let transaction of block.data){
                if(transaction.input.address===REWARD_INPUT.address){
                    rewardTransactionCount += 1;
                    if (rewardTransactionCount > 1) {
                        console.error('Minor rewards exceed limit');
                        return false;
                    }
                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Miner reward is invalid');
                        return false;
                    }
                }
                else {
                    if (!Transaction.validateTransaction(transaction)) {
                        console.error('Invalid Transaction');
                        return false;
                    }
                    const trueBalance=Wallet.calculateBalance({
                        chain:this.chain,
                        address:transaction.input.address,
                    });

                    if(transaction.input.amount!==trueBalance){
                        console.error('Invalid input amount');
                        return false;
                    }

                    if(transactionSet.has(transaction)){
                        console.error('An identical transactions appears more than once in the block');
                        return false;
                    }
                    else{
                        transactionSet.add(transaction);
                    }
                }
            }

        }
        return true;

    }

}


module.exports=Index;