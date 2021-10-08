const Blockchain=require('../index');
const Block=require('../block');
const {cryptoHash}=require('../../util');
const Wallet=require('../../wallet');
const Transaction=require('../../wallet/transaction');

describe('Blockchain',()=>{
    let blockchain,newChain,originalChain, errorMock, logMock;

    beforeEach(()=>{
        blockchain = new Blockchain();
        newChain= new Blockchain();
        originalChain=blockchain.chain;
        errorMock=jest.fn();
        logMock=jest.fn();
        global.console.error=errorMock;
        global.console.log=logMock;
    });

    it('contains a `chain` Array',()=>{
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with the genesis block',()=>{
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain',()=>{
        const newData='fooBar';
        blockchain.addBlock({data:newData})
        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('isChainValid()',()=>{
        describe('when the chain doesn`t start with the genesis block',()=>{
            it('returns false',()=>{
                blockchain.chain[0]={ data:'fake-genesis'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with the genesis block & has multiple blocks',()=>{
            beforeEach(()=>{
                blockchain.addBlock({data: 'Hello! I am first.'});
                blockchain.addBlock({data: 'Hey! I am second.'});
                blockchain.addBlock({data: 'Hurrah! I am third.'});
            });

            describe('and a lastHash reference has changed',()=>{
                it('returns false',()=>{
                    blockchain.chain[2].lastHash='broken-chain';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with jumped difficulty',()=>{
                it('returns false',()=>{
                    const lastBlock=blockchain.chain[blockchain.chain.length-1];
                    const lastHash=lastBlock.hash;
                    const timestamp=Date.now();
                    const nonce=0;
                    const data=[];
                    const difficulty=lastBlock.difficulty-3;

                    const hash=cryptoHash(timestamp,lastHash,nonce,data,difficulty);
                    const badBlock=new Block({
                        data,timestamp,lastHash,hash,nonce,difficulty
                    });

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with invalid field',()=>{
                it('returns false',()=>{
                    blockchain.chain[2].data='some bad & evil data.';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
        
            describe('and the chain doesn`t contain any invalid block',()=>{
                it('returns true',()=>{
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);    
                });
            });
        });
    });

    describe('replaceChain',()=>{
        beforeEach(()=>{
        });
        describe('when the new chain is not longer',()=>{
            beforeEach(()=>{
                newChain.chain[0]={new: 'chain'};
                blockchain.replaceChain(newChain.chain);
            });
            it('does not replace the chain',()=>{
                expect(blockchain.chain).toEqual(originalChain);
            });
            it('logs an error',()=>{
                expect(errorMock).toHaveBeenCalled();
            });
        });
        describe('when the new chain is longer',()=>{
            beforeEach(()=>{
                newChain.addBlock({data: 'Hello! I am first.'});
                newChain.addBlock({data: 'Hey! I am second.'});
                newChain.addBlock({data: 'Hurrah! I am third.'});
            });
            describe('and the chain is invalid',()=>{
                beforeEach(()=>{
                    newChain.chain[2].hash='some-fake-hash';
                    blockchain.replaceChain(newChain.chain);
                });
                it('does not replace the original chain',()=>{
                    expect(blockchain.chain).toEqual(originalChain);
                });
                it('logs an error',()=>{
                    expect(errorMock).toHaveBeenCalled();
                });
            });
            describe('and the chain is valid',()=>{
                beforeEach(()=>{
                    blockchain.replaceChain(newChain.chain);
                });
                it('replaces the chain',()=>{  
                    expect(blockchain.chain).not.toEqual(originalChain);
                    
                });
                it('logs about the chain replacement',()=>{
                    expect(logMock).toHaveBeenCalled();     
                });
            });
        });

        describe('when the `validateTransaction` flag is true',()=>{
            it('calls validTransactionData()',()=>{
                const validateTransactionMock=jest.fn();
                blockchain.validTransactionData=validateTransactionMock;
                newChain.addBlock({data:'newData'});
                blockchain.replaceChain(newChain.chain,true);
                expect(validateTransactionMock).toHaveBeenCalled();
            });
        });
    });

    describe('validTransactionData()',()=>{
        let transaction, rewardTransaction, wallet;
        beforeEach(()=>{
            wallet=new Wallet();
            transaction=wallet.createTransaction({
                recipient:'foo-address',
                amount:50,
            });
            rewardTransaction=Transaction.rewardTransaction({minerWallet:wallet});
        });
        describe('and transaction data is valid',()=>{
            it('returns true',()=>{
                newChain.addBlock({data:[transaction,rewardTransaction]});
                expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();
            });
        });


        describe('and the transaction data has multiple rewards',()=>{
            it('returns false & logs an error',()=>{
                newChain.addBlock({data:[transaction,rewardTransaction,rewardTransaction]});
                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and the transaction data has at least one malformed outputMap',()=>{
            describe('and the transaction is not a reward transaction',()=>{
                it('returns false & logs an error',()=>{
                    transaction.outputMap[wallet.publicKey]=99999;
                    newChain.addBlock({data:[transaction,rewardTransaction]});
                    expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the transaction is a reward transaction',()=>{
                it('returns false & logs an error',()=>{
                    rewardTransaction.outputMap[wallet.publicKey]='fake-publicKey';
                    newChain.addBlock({data:[transaction,rewardTransaction]});
                    expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });
        describe('and the transaction data has at least one malformed input',()=>{
            it('returns false & logs an error',()=>{
                wallet.balance=9000;
                const evilOutputMap={
                    [wallet.publicKey]:8900,
                    fooRecipient:900,
                };
                const evilTransaction={
                    input: {
                        amount: wallet.balance,
                        timestamp: Date.now(),
                        address: wallet.publicKey,
                        signature: wallet.sign(evilOutputMap)
                    },
                    outputMap:evilOutputMap,
                }
                newChain.addBlock({data:[evilTransaction,rewardTransaction]});
                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and the block has multiple transactions',()=>{
            it('returns false & logs an error',()=>{
                newChain.addBlock({data:[transaction,transaction,transaction,rewardTransaction]});
                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });
    });
});