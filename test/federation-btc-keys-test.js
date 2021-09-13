const chai = require('chai')
const expect = chai.expect
const assert = chai.assert

const getFedBtcKeys = require('../federation-btc-keys');
const pegnatoryPublicKeys = [
    {
        btc: '0x023f0283519167f1603ba92b060146baa054712b938a61f35605ba08773142f4da',
        rsk: '0x0287b87976b0de1ef3c104b1e951e786aa78f71aedb3af9ec4ef89985bdaaa9f48',
        mst: '0x02e65505c63cae9fd963afae2aba57a7fda7c5aa5cc9198e30bb2f17497e38fcc4',
        rskAddress: '0xa23eb4f68d5281d8fcdec31a132303eeb3da1c03'
    },
    {
        btc: '0x02afc230c2d355b1a577682b07bc2646041b5d0177af0f98395a46018da699b6da',
        rsk: '0x02afc230c2d355b1a577682b07bc2646041b5d0177af0f98395a46018da699b6da',
        mst: '0x02afc230c2d355b1a577682b07bc2646041b5d0177af0f98395a46018da699b6da',
        rskAddress: '0x4495768e683423a4299d6a7f02a0689a6ff5a0a4'
    },
    {
        btc: '0x031174d64db12dc2dcdc8064a53a4981fa60f4ee649a954e01bcae221fc60777a2',
        rsk: '0x0270467561b9acb6d2c4b73c40ba8cc65094855cf256885f516f00afb78aa2f503',
        mst: '0x03e8ebdaede5fee2d0607f92fc10087cd8aed8829ebc8cd91da65ba78f76c07674',
        rskAddress: '0xcfb39354338b6cdffb2791877676384e71a38875'
    },
    {
        btc: '0x0344a3c38cd59afcba3edcebe143e025574594b001700dec41e59409bdbd0f2a09',
        rsk: '0x0344a3c38cd59afcba3edcebe143e025574594b001700dec41e59409bdbd0f2a09',
        mst: '0x0344a3c38cd59afcba3edcebe143e025574594b001700dec41e59409bdbd0f2a09',
        rskAddress: '0x0345174501d5f6fc7926377b63317c4ad7215905'
    },
    {
        btc: '0x039a060badbeb24bee49eb2063f616c0f0f0765d4ca646b20a88ce828f259fcdb9',
        rsk: '0x039a060badbeb24bee49eb2063f616c0f0f0765d4ca646b20a88ce828f259fcdb9',
        mst: '0x039a060badbeb24bee49eb2063f616c0f0f0765d4ca646b20a88ce828f259fcdb9',
        rskAddress: '0x9a3bfdea2245738dd5f25453d13742350a4f1c6e'
    }];

describe('Get Federation BTC Keys', () => {
    const expectedBtcPublicKeys = ['02afc230c2d355b1a577682b07bc2646041b5d0177af0f98395a46018da699b6da', '0344a3c38cd59afcba3edcebe143e025574594b001700dec41e59409bdbd0f2a09'];

    it('Should Return Federation BTC Keys', async () => {
        let result = await getFedBtcKeys(pegnatoryPublicKeys);
        assert.lengthOf(result, 5);
        expect(result).to.include.members(expectedBtcPublicKeys);
    })
})
