const hexToBinary = require('hex-to-binary');
const Block = require('./block');
const {GENESIS_DATA, MINE_RATE} = require('./config');
const cryptoHash = require('./crypto-hash');

describe('Block', () => {

    const timestamp = 2000;
    const lastHash = 'LHash';
    const hash = 'bar-hash';
    const data = ['blockchain', 'data'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({timestamp, lastHash, hash, data, nonce, difficulty});

    it('has to have a properties of the Block instance', () => {
        expect(block.timestamp).toEqual(timestamp);
        
        expect(block.hash).toEqual(hash);

        expect(block.lastHash).toEqual(lastHash);

        expect(block.nonce).toEqual(nonce);

        expect(block.difficulty).toEqual(difficulty);

        expect(block.data).toEqual(data);
    });


    describe('genesis() block', () => {
        const genesisBlock = Block.genesis();

        console.log(genesisBlock);

        it('should return a Block instance', () => {

            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('should return the genesis data', () => {

            expect(genesisBlock).toEqual(GENESIS_DATA);
        });

    });

    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const minedBlock = Block.mineBlock({lastBlock, data});

        it('should return a Block instance', () => {

            expect(minedBlock instanceof Block).toBe(true);
        });

        it('sets the `lastHash to be the `hash` of the lastBlock ', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('checks the `data`', () => {

            expect(minedBlock.data).toEqual(data);
        });     


        it('checks the `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });
    
    
        it('creates a SHA-256 `hash` based on the proper inputs', () => {

            expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp, minedBlock.nonce, minedBlock.difficulty, lastBlock.hash, data));

        });
    
        it('sets a `hash` that matches the set difficulty', () => {
            expect(hexToBinary(minedBlock.hash).substring(0,minedBlock.difficulty))
            .toEqual('0'.repeat(minedBlock.difficulty));
        });

        it('adjusts the difficulty',() =>{

            const possibleResult = [lastBlock.difficulty + 1, lastBlock.difficulty - 1] ;

            expect(possibleResult.includes(minedBlock.difficulty)).toBe(true);
        });

    });
    

    describe('adjust difficulty', () => {
        it('raises the difficulty if the block is mined quickly', () =>{
            expect(Block.adjustDifficulty({ 
                ogBlock:block,
                timestamp: block.timestamp + MINE_RATE - 100
            })).toEqual(block.difficulty + 1);
        });
        
        it('lowers the difficulty if the block is mined slowly', () =>{
            expect(Block.adjustDifficulty({ 
                ogBlock:block,
                timestamp: block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficulty - 1);
        });

        it('has a lower limit 1',() =>{

            block.difficulty = -1;

            expect(Block.adjustDifficulty({ ogBlock:block })).toEqual(1);
        });
        
     });
});
