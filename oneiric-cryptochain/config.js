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

const STARTING_BALANCE = 5000 ;

const REWARD_INPUT = {
    address: '*authorized-reward*'
};

const MINING_REWARD = 100;

module.exports = {
    GENESIS_DATA,
    MINE_RATE,
    STARTING_BALANCE,
    REWARD_INPUT,
    MINING_REWARD
};