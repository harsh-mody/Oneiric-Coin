const Blockchain = require('./index')
const Block = require('./block')
const {cryptoHash} = require('../util');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');
// const {REWARD_INPUT, MINING_REWARD}=require('../config');



describe('Blockchain description',()=>{

    let blockchain,newChain,ogChain, errorMock ;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        ogChain = blockchain.chain;
        errorMock = jest.fn();
        global.console.error = errorMock;
    });

    it('should contain a `chain` array instance',()=>{

        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('should start with genesis block', ()=>{

        expect(blockchain.chain[0]).toEqual(Block.genesis())
    });

    it('adds a new block  to the chain', ()=>{
        const newData = 'new data';
        blockchain.addBlock({ data: newData });

        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
    });

    describe('isValidChain()', ()=>{

        describe('chain does not start with the genesis block', ()=>{

            it('return false',() => {
                blockchain.chain[0] = { data: 'fake genesis'};
                  
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with the genesis block and has multiple blocks', ()=>{ 

            beforeEach(() => {

                blockchain.addBlock({ data: 'Harsh Mody'});
                blockchain.addBlock({ data: 'Harsh Parikh'});
                blockchain.addBlock({ data: 'Neeraj Patil'});
                
            });
            describe('and a lastHash reference has changed', ()=>{

                it('returns false', () =>{
                    blockchain.chain[2].lastHash = 'broken lastHash';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('a chain with an invalid field', ()=>{

                it('returns false', () =>{
                    blockchain.chain[2].data = 'invalid data';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with a jumped difficulty', ()=>{

                it('returns false', () =>{

                    const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0 ;
                    const difficulty = lastBlock.difficulty - 3;

                    const data = [];

                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);

                    const badBlock = new Block({timestamp, lastHash, hash,nonce, difficulty, data});

                    blockchain.chain.push(badBlock);
                     
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('the chain is fine', ()=>{

                it('returns true', () =>{
                    
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });

    describe('replacedChain()', ()=>{
        let logMock ;

        beforeEach(() => {
            logMock = jest.fn();
            global.console.log = logMock;
        });

        describe('when the new chain is NOT longer', ()=>{

            beforeEach(() => {
                newChain.chain[0] = {new:'chain'};
                
                blockchain.replaceChain(newChain.chain);
            }); 

            it('does not replace the chain', () =>{
                expect(blockchain.chain).toEqual(ogChain);
            });

            it('shows an error', () =>{
                expect(errorMock).toHaveBeenCalled();
            });
        });    
        
        describe('when the new chain is longer',() =>{
               
            beforeEach(() => {
                newChain.addBlock({ data: 'parikh'});
                newChain.addBlock({ data: 'mody'});
                newChain.addBlock({ data: 'patil'});
            });

            describe('the chain is INVALID', () =>{

                beforeEach(() => {

                    newChain.chain[1].hash = 'random' ;
                        
                    blockchain.replaceChain(newChain.chain);
                });

                it('does not replace the chain',() =>{

                    expect(blockchain.chain).toEqual(ogChain);
                });
            
                it('shows an error', () =>{
                    expect(errorMock).toHaveBeenCalled();
                });
    
            });

            describe('the chain is VALID', () =>{

                beforeEach(() =>{
                    
                    blockchain.replaceChain(newChain.chain);
                }); 

                it('replaces the chain',() =>{

                    expect(blockchain.chain).toEqual(newChain.chain);

                });
                
                it('logs the chain replacement', () =>{

                    expect(logMock).toHaveBeenCalled();
                });
            });
        });    
       
        describe('when the `validateTransaction` flag is true',()=>{
            it('calls validTransactionData()',()=>{
                const validateTransactionMock = jest.fn();

                blockchain.validTransactionData = validateTransactionMock;
                
                newChain.addBlock({data : 'Harsh'});
                
                blockchain.replaceChain(newChain.chain,true);
                
                expect(validateTransactionMock).toHaveBeenCalled();
            });
        });
    });

    
    describe('validTransactionData()',() => {
        let transaction, rewardTransaction, wallet;
        beforeEach(() => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({
                recipient : 'address',
                amount : 69,
            });
            rewardTransaction = Transaction.rewardTransaction({minerWallet : wallet});
        });

        describe('and transaction data is valid',()=>{
            it('returns true',()=>{
                newChain.addBlock({data : [transaction,rewardTransaction]});
                expect(blockchain.validTransactionData({chain : newChain.chain})).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();
            });
        });

        describe('and the transaction data has multiple rewards',()=>{
            it('returns false abd logs the error',() => {
                newChain.addBlock({data : [transaction, rewardTransaction, rewardTransaction]});
                expect(blockchain.validTransactionData({chain : newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and the transaction data has at least one malformed outputMap',() => {
            describe('and the transaction is not a reward transaction',() => {
                it('returns false and logs the error',()=>{
                    transaction.outputMap[wallet.publicKey] = 9999999999;
                    newChain.addBlock({data : [transaction,rewardTransaction]});
                    expect( blockchain.validTransactionData({chain : newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
            describe('and the transaction is worth a reward transaction',() => {
                it('returns false and logs an error',()=>{
                    rewardTransaction.outputMap[wallet.publicKey]='phony-publicKey';
                    newChain.addBlock({data : [transaction,rewardTransaction]});
                    expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });

        describe('and the transaction data has at least one malformed input',() => {
            it('returns false and logs the error',()=>{
                wallet.balance = 9000;
                const evilOutputMap = {
                    [wallet.publicKey] : 8100,
                    Recipient : 900,
                };
                const evilTransaction = {
                    input: {
                        amount: wallet.balance,
                        timestamp : Date.now(),
                        address : wallet.publicKey,
                        signature : wallet.sign(evilOutputMap)
                    },
                    outputMap:evilOutputMap,
                }
                newChain.addBlock({ data : [evilTransaction,rewardTransaction ]});
                expect(blockchain.validTransactionData({chain : newChain.chain})).toBe(false);
                
                expect( errorMock ).toHaveBeenCalled();
            });
        });

        describe('and the block has multiple identical transactions',() => {
            it('returns false and logs the error',() => {
                newChain.addBlock({data:[transaction, transaction, transaction, rewardTransaction]});

                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);

                expect(errorMock).toHaveBeenCalled();
            });
        });
    });
});