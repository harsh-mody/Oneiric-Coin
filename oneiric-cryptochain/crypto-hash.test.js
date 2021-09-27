const cryptoHash = require('./crypto-hash');

describe('cryptoHash()',() => {

    it('generates a encrypted hash using SHA-256',() => {

        expect(cryptoHash('Oneiric-Coin')).toEqual('7e6f36288c1b69e0862c8818b870ad0cc6dde3959b64f521cbc6fa0f019bcc42');
    });

    it('produces the same value with input given in different order', () => {

        expect(cryptoHash('one', 'two' , 'three')).toEqual(cryptoHash('three', 'two','one'));
    });

});