const Blockchain = require('./index')
const Block = require('./block')
const {cryptoHash} = require('../util');

describe('Blockchain description',()=>{

    let blockchain,newChain,ogChain ;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        ogChain = blockchain.chain;
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

        let errorMock , logMock ;

        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
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
                newChain.addBlock({ data: 'Penny'});
                newChain.addBlock({ data: 'Penny'});
                newChain.addBlock({ data: 'Penny'});
                    
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
    });
});