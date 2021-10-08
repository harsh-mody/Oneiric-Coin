const Block=require("../block");
const {GENESIS_DATA, MINE_RATE}=require('../../config');
const {cryptoHash}=require('../../util');
const hexToBinary=require('hex-to-binary');


describe('Block',function callback(){
    const timestamp=2000;
    const lastHash='lastHash';
    const hash='hash';
    const data='data';
    const nonce=1;
    const difficulty=1;
    const block=new Block({timestamp,lastHash,hash,data,nonce,difficulty});
    it('has a timestamp, lastHash, hash & data',() => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);

    });


describe('genesis',()=>{
    const genesisBlock=Block.genesis();
    console.log('genesisBlock',genesisBlock);
    it('returns a block instance',()=>{
        expect(genesisBlock instanceof Block).toBe(true);
    });

    it('returns the genesis data',()=>{
        expect(genesisBlock).toEqual(GENESIS_DATA);
    })

});

    describe('mineBlock',()=>{
        const lastBlock=Block.genesis();
        const minedBlock=Block.mineBlock({lastBlock, data});
        it('returns a block instance',()=>{
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('sets the `lastHash` to be the hash of the lastBlock',()=>{
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);  // In jest, expected value goes into the toEqual & to be Equal value goes into the expected value
                                                            // which isn't the regular rule in the programming world.
        });

        it('sets the `data`',()=>{
            expect(minedBlock.data).toEqual(data);
        });

        it('sets a `timestamp`',function (){
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('sets a hash that meets the difficulty criteria',()=>{
            expect(hexToBinary(minedBlock.hash).substring(0,minedBlock.difficulty))
            .toEqual('0'.repeat(minedBlock.difficulty));
        });

        it('creates a SHA-256 hash based on proper inputs',()=>{
            expect(minedBlock.hash).toEqual(cryptoHash(
                lastBlock.hash,
                minedBlock.timestamp,
                minedBlock.data,
                minedBlock.nonce,
                minedBlock.difficulty));
        });

        it('sets the difficulty criteria',()=>{
            const possibleResults=[lastBlock.difficulty-1,lastBlock.difficulty+1];
            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });

    });


    describe('adjustDifficulty',()=>{
        it('raises the difficulty for a quickly mined block.',()=>{
            expect(Block.adjustDifficulty({
                originalBlock:block,
                timestamp: block.timestamp + MINE_RATE -100,
            })).toEqual(block.difficulty+1);
        });

        it('lowers the difficulty for a slowly mined block',()=>{
            expect(Block.adjustDifficulty({
                originalBlock:block,
                timestamp: block.timestamp + MINE_RATE + 100,
            })).toEqual(block.difficulty-1);
        });

        it('has lower limit of 1',()=>{
            block.difficulty=-1;
            expect(Block.adjustDifficulty({originalBlock: block})).toEqual(1);
        });
    });
});