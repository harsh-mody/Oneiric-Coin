const Transaction = require('./transaction');
const Wallet= require('./index');
const { verifySignature } = require('../util');  

describe('Transaction',()=>{
   let transaction, senderWallet, recipient, amount;

   beforeEach(() => {
      senderWallet = new Wallet();
      recipient='oneiric-public-key';
      amount = 69;

      transaction = new Transaction({senderWallet, recipient, amount});
   });

   it(`should have an 'id'`,()=>{
       expect(transaction).toHaveProperty('id');
   });

   describe('outputMap',()=>{
       it(`should have an 'outputMap'`,()=>{
            expect(transaction).toHaveProperty('outputMap');
       });

       it(`outputs the amount to the recipient`,()=>{
           expect(transaction.outputMap[recipient]).toEqual(amount);
       });

       it(`outputs the remaining balance for the 'senderWallet'`,()=>{
           expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
       });
   });

   describe('input',()=>{
       it(`should have an 'input'`,()=>{
           expect(transaction).toHaveProperty('input');
       });

       it(`should have a 'timestamp' in the input`,()=>{
           expect(transaction.input).toHaveProperty('timestamp');
       });

       it(`must set the 'amount' to the 'senderWallet' balance`,()=>{
          expect(transaction.input.amount).toEqual(senderWallet.balance);
       });

       it(`must set the 'address' to the 'senderWallet' and publicKey`,()=>{
          expect(transaction.input.address).toEqual(senderWallet.publicKey);
       });

       it(`should verify the input`,()=>{
           expect(
               verifySignature({
                   publicKey:senderWallet.publicKey,
                   data:transaction.outputMap,
                   signature:transaction.input.signature
               })
           ).toBe(true);
       })
   });


   describe('validate transaction',()=>{
    let errorMock;

    beforeEach(() => {
       errorMock = jest.fn();
       global.console.error = errorMock;
    });

   describe('when the transaction is valid',() => {
         it('return true',() => {
             expect(Transaction.validateTransaction(transaction)).toBe(true);
         });
   });

   describe('when the transaction is invalid',() => {
       describe('when the transaction outputMap value is invalid',()=>{
         it('return false and logs the error',() => {
             transaction.outputMap[senderWallet.publicKey] = 6969696969;
             expect(Transaction.validateTransaction(transaction)).toBe(false);
             expect(errorMock).toHaveBeenCalled();
         });
       });

       describe('when the transactions input signature is invalid',() => {
           it('return false and logs the error',() => {
               transaction.input.signature = new Wallet().sign('data');
               expect(Transaction.validateTransaction(transaction)).toBe(false);
               expect(errorMock).toHaveBeenCalled();
           });
       });

   });

});


describe('update()',()=>{
    let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

    

    describe('and the amount is valid',()=>{

        beforeEach(()=>{
            originalSignature=transaction.input.signature;
            originalSenderOutput=transaction.outputMap[senderWallet.publicKey];
            nextRecipient='next-recipient';
            nextAmount = 50;
            transaction.update({senderWallet, recipient: nextRecipient, amount: nextAmount});
         });
     

        it('outputs the amount to the next recipient',()=>{
            expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
        });

        it('subtracts the amount from the original sender output amount',()=>{
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount);
        });

        it('maintains a total output that matches the input amount',()=>{
            expect(
                Object.values(transaction.outputMap).reduce((total,outputAmount)=>total + outputAmount))
                .toEqual(transaction.input.amount);
        });

        it('re-signs the transaction',()=>{
            expect(transaction.input.signature).not.toEqual(originalSignature);
        });

        describe('and another update for the same recipient',()=>{
             let addedAmount;
             beforeEach(()=>{
                addedAmount = 80;
                transaction.update({
                     senderWallet, recipient : nextRecipient,amount : addedAmount
                });
             });

             it('adds to the recipient amount',()=>{
                 expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount + addedAmount);
             });

             it('subtracts the amount from original sender output amount',()=>{
                 expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount - addedAmount);
             });
        });
    });

    

    describe('and the amount is invalid',()=>{
        it('throws an error',()=>{
           expect(()=>{
               transaction.update({senderWallet,recipient:'foo',amount:99999999})
           }).toThrow('Amount exceeds balance!');
        });

    });

});

}); 
 