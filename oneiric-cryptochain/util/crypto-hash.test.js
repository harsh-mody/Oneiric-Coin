const cryptoHash = require('./crypto-hash');

describe('cryptoHash()',() => {

    it('generates a encrypted hash using SHA-256',() => {

        expect(cryptoHash('Oneiric-Coin')).toEqual('b379d509b62f7cab98efed79ef24e9773df183b5edf431a64d31a846a67641c1');
    });

    it('produces the same value with input given in different order', () => {

        expect(cryptoHash('one', 'two' , 'three')).toEqual(cryptoHash('three', 'two','one'));
    });

    it('produces the unique hash when the properties have changd on an input',() => {
        const oneiric = {};
        const originalHash = cryptoHash(oneiric);
        oneiric['a'] = "a";
        expect(cryptoHash(oneiric)).not.toEqual((originalHash));  
    })

});