const Wallet = require('./index');
const Transaction = require('./transaction')
const {verifySignature} = require('../util');
const Blockchain = require('../blockchain');
const {STARTING_BALANCE}= require('../config');


describe('Wallet',()=>{

    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it(`should have a 'balance'`,() => {
        expect(wallet).toHaveProperty('balance');

    }); 
    
    it(`should have a 'publicKey'`,() => {
        // console.log(wallet.publicKey);
        expect(wallet).toHaveProperty('publicKey');

    }); 

    describe('signing Data', () => {
        const data = 'oneiric'

        it('verify a signature', () => {
            
            expect(
                verifySignature({
                    publicKey:wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        });

        it('does not verify invalid signature', () => {
            expect(
                verifySignature({
                    publicKey:wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        });

    });

    describe('createTransaction()',() => {
        describe('and the amount exceeds the balance',() => {
            it('throw an error, money cant be negative',() => {
                expect(() => wallet.createTransaction({amount:9999999999, recipient:'world bank'})).toThrow('Amount exceeds account balance!');
            });
        });

        describe('and the amount is valid',() => {
            let transaction,amount,recipient;
            beforeEach(()=>{
               amount = 69;
               recipient = 'world bank';
               transaction = wallet.createTransaction({amount, recipient});
            });
            it('creates an instance of `Transaction`',() => {
                expect(transaction instanceof Transaction).toBe(true);
            });

            it('matches the transaction input with wallet',() => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it('outputs the amount the recipient',() => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });
        });

        describe('and a chain is passed',()=>{

            it('calls `Wallet.calculateBalance()`',()=>{
                
                const calculateBalanceMock = jest.fn();

                const originalCalculateBalance = Wallet.calculateBalance;

                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({
                    recipient : 'world-government',
                    amount : 20,
                    chain : new Blockchain().chain
                });

                expect(calculateBalanceMock).toHaveBeenCalled();

                Wallet.calculateBalance = originalCalculateBalance;
            });
        });

    });

    describe('calculateBalance()', () => {

        let blockchain;
        beforeEach(() => {
           blockchain = new Blockchain();
        });
        describe('and there are no outputs for the wallet',() => {
            it('returns the `STARTING_BALANCE`',()=>{
                expect(
                    Wallet.calculateBalance({
                        chain : blockchain.chain,
                        address : wallet.publicKey
                    })
                ).toEqual( STARTING_BALANCE );
            });
        });

        describe('and there are outputs for wallet',() => {
            let transaction1, transaction2;
            beforeEach(() => {
                transaction1=new Wallet().createTransaction({
                    recipient:wallet.publicKey,
                    amount:69,
                });
                transaction2 = new Wallet().createTransaction({
                    recipient : wallet.publicKey,
                    amount : 420,
                });
                blockchain.addBlock({data : [transaction1, transaction2]})
            });
            it('adds the sum of all outputs to the balance',() => {
               expect(
                Wallet.calculateBalance({
                   chain:blockchain.chain,
                   address : wallet.publicKey,
               })).toEqual(STARTING_BALANCE + transaction1.outputMap[wallet.publicKey] +
               transaction2.outputMap[wallet.publicKey]);
            });
            
            describe('and the wallet has made a transaction',() => {
                let recentTransaction;
                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({
                        recipient:'address',
                        amount:69
                    });
                    blockchain.addBlock({data:[recentTransaction]});
                });

                it('returns the output amount of the recent transaction',()=>{
                   expect(
                       Wallet.calculateBalance({
                           chain : blockchain.chain,
                           address : wallet.publicKey
                       })
                   ).toEqual(recentTransaction.outputMap[wallet.publicKey])
   
                });

                describe('and there are outputs next to & after the recent transaction',()=>{
                    let sameBlockTransaction, nextBlockTransaction;
                    beforeEach(() => {
                       recentTransaction = wallet.createTransaction({
                          recipient:'later-address',
                          amount:69,
                       });

                       
                       sameBlockTransaction = Transaction.rewardTransaction({minerWallet : wallet});
                       
                       blockchain.addBlock({data : [recentTransaction,sameBlockTransaction]});
                       
                       nextBlockTransaction = new Wallet()
                       .createTransaction({
                           recipient:wallet.publicKey,
                           amount : 420
                        });                        
                        blockchain.addBlock({data:[nextBlockTransaction]});
                    });
                    

                        it('includes the output in the returned balance',()=>{
                            expect(
                                Wallet.calculateBalance({
                                    chain : blockchain.chain,
                                    address : wallet.publicKey,
                                })
                            ).toEqual(recentTransaction.outputMap[wallet.publicKey] + 
                            sameBlockTransaction.outputMap[wallet.publicKey] 
                            + nextBlockTransaction.outputMap[wallet.publicKey]);
                        });
                });
            });
        });
    });
});