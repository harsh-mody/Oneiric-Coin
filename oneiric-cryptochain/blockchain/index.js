const Block = require('./block');
const {cryptoHash} = require('../util');
const {REWARD_INPUT, MINING_REWARD}=require('../config');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

class Blockchain{

    constructor(){

        this.chain = [Block.genesis()];
    }

    addBlock({data}){
        const newBlock = Block.mineBlock({

            lastBlock: this.chain[this.chain.length - 1],
            data
        });

        this.chain.push(newBlock);
    }


    replaceChain(chain, validateTransactions, onSuccess ){
        if(chain.length <= this.chain.length){
            console.error('Incoming chain must be longer');
            return;
        }
 
        if(validateTransactions && !this.validTransactionData({ chain })){
            console.error('Incoming chain has INVALID transaction data');
            return;
        }

        if(!Blockchain.isValidChain(chain)){
            console.error('Incoming chain must VALID');
            return;
        }

        if(onSuccess) {

            onSuccess();
        }
        console.log('chain is replaced with', chain);

       this.chain = chain;
    }

    static isValidChain(chain){

        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())){
            return false;
        }
        
        for(let i = 1; i < chain.length; i++){
            
            const block = chain[i];

            const actualLastHash = chain[i - 1].hash;

            const { timestamp, lastHash, hash, nonce, difficulty, data } = block;

            const lastDifficulty = chain[i - 1].difficulty;

            if(lastHash !== actualLastHash){
                return false;
            }
        
            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

            if (hash !== validatedHash){
                return false;
            }

            if(Math.abs(lastDifficulty - difficulty) > 1 ){

                return false;
            }
        }

        return true;
    }

    validTransactionData = ({chain}) => {
        
        for(let i = 1 ; i < chain.length ; i++){
            
            const block = chain[i];

            const transactionSet = new Set();

            let rewardTransactionCount = 0;

            for(let transaction of block.data){
               
                if(transaction.input.address === REWARD_INPUT.address){
                    rewardTransactionCount += 1;
            
                    if (rewardTransactionCount > 1) {
                        console.error('Rewards limit exceeded');                        
                        return false;
                    }
            
                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Reward is invalid');
                        return false;
                    }
                }
                else {
            
                    if (!Transaction.validateTransaction(transaction)) {
                        console.error('Invalid Transaction');
                        return false;
                    }
            
                    const trueBalance = Wallet.calculateBalance({
                        chain : this.chain,
                        address : transaction.input.address,
                    });

                    if(transaction.input.amount !== trueBalance){
                        console.error('Invalid input amount');
                        return false;
                    }

                    if(transactionSet.has(transaction)){
                        console.error('An identical transactions already present in the block');
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

module.exports = Blockchain;