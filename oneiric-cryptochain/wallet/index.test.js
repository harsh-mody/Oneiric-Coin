const Wallet = require('./index');
const Transaction = require('./transaction')
const {verifySignature} = require('../util');

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
    });
});