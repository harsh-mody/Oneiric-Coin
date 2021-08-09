const Block = require("./block");

describe('Block', () => {
    const timestamp = 'a-date';
    const lastHash = 'har-hash';
    const hash = 'kri-hash';
    const data = ['hello', 'world'];
    const block = new Block({
        timestamp: timestamp,
        lastHash: lastHash,
        hash: hash,
        data: data
    });

    it('has a timestamp, lastHash, hash, and data property', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();
    });
});
