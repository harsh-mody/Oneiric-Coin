const INITIAL_DIFFICULTY = 2;
const MINE_RATE = 5000; 

const GENESIS_DATA = {
    timestamp: 20,
    lastHash: '----',
    hash: 'first-hash',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data: []
    
};

module.exports = {
    GENESIS_DATA,
    MINE_RATE
};