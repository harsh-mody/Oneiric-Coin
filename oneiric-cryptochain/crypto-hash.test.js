const cryptoHash = require('./crypto-hash');

describe('cryptoHash()',() => {

    it('generates a encrypted hash using SHA-256',() => {

        expect(cryptoHash('hp')).toEqual('93969d193161ae6fbd17b30055a9ed9789cb4bd80a7df0c6df15d3dd98fd7591');
    });

    it('produces the same value with input given in different order', () => {

        expect(cryptoHash('one', 'two' , 'three')).toEqual(cryptoHash('three', 'two','one'));
    });


      
});