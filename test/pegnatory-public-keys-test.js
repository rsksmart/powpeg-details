const chai = require('chai')
const assert = chai.assert

const getFederationPublicKeys = require('../pegnatory-public-keys');

const bridgeStub = () => {
    return {
        methods: ({
            getFederationSize: () => ({
                call: () => Promise.resolve(5)
            }),
            getFederatorPublicKeyOfType: (index, type) => ({
                call: () => {
                    if (type === 'btc') {
                        return Promise.resolve("0x023f0283519167f1603ba92b060146baa054712b938a61f35605ba08773142f4da")
                    } else if (type === 'rsk') {
                        return Promise.resolve("0x023f0283519167f1603ba92b060146baa054712b938a61f35605ba08773142f4da")
                    } else {
                        return Promise.resolve("0x023f0283519167f1603ba92b060146baa054712b938a61f35605ba08773142f4da")
                    }
                }
            })
        })
    };
};

describe('Get Pegnatory Public Keys', () => {
    const bridge = bridgeStub();
    const expectedRSKAddress = "0x6ff11123a854f3cd27812e62d645dca038f39a24"

    it('Should Return Pegnatory Public Keys With RSK Address', async () => {
        let result = await getFederationPublicKeys(bridge);
        assert.lengthOf(result, 5);
        assert.equal(result[0].rskAddress, expectedRSKAddress)
    });
})
