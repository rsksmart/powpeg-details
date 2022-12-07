const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const rewire = require('rewire');

let powpegDetails;
let sandbox;

const stubFederationSize = 5;
const stubFederationThreshold = 3;
const stubFederationAddress = '2N1GMB8gxHYR5HLPSRgf9CJ9Lunjb9CTnKB';
const stubFederationAddressERP = '2MsksJzWBK5jYNk1GXHErcpVhWoRX1VTP5i';
const stubFederationCreationBlockNumber = 1000;
const stubFederationRedeemScript = '5321023f0283519167f1603ba92b060146baa054712b938a61f35605ba08773142f4da2102afc230c2d355b1a577682b07bc2646041b5d0177af0f98395a46018da699b6da21031174d64db12dc2dcdc8064a53a4981fa60f4ee649a954e01bcae221fc60777a2210344a3c38cd59afcba3edcebe143e025574594b001700dec41e59409bdbd0f2a0921039a060badbeb24bee49eb2063f616c0f0f0765d4ca646b20a88ce828f259fcdb955ae';
const stubFederationRedeemScriptERP = '645321023f0283519167f1603ba92b060146baa054712b938a61f35605ba08773142f4da2102afc230c2d355b1a577682b07bc2646041b5d0177af0f98395a46018da699b6da21031174d64db12dc2dcdc8064a53a4981fa60f4ee649a954e01bcae221fc60777a2210344a3c38cd59afcba3edcebe143e025574594b001700dec41e59409bdbd0f2a0921039a060badbeb24bee49eb2063f616c0f0f0765d4ca646b20a88ce828f259fcdb9556702cd50b27552210216c23b2ea8e4f11c3f9e22711addb1d16a93964796913830856b568cc3ea21d321034db69f2112f4fb1bb6141bf6e2bd6631f0484d0bd95b16767902c9fe219d4a6f210275562901dd8faae20de0a4166362a4f82188db77dbed4ca887422ea1ec185f145368ae';
const expectedRskAddress = '0xa23eb4f68d5281d8fcdec31a132303eeb3da1c03';

const bridgeInstanceStub = {
    methods: ({
        getFederationSize: () => ({
            call: () => Promise.resolve(stubFederationSize)
        }),
        getFederationThreshold: () => ({
            call: () => Promise.resolve(stubFederationThreshold)
        }),
        getFederationAddress: () => ({
            call: () => Promise.resolve(stubFederationAddress)
        }),
        getFederatorPublicKeyOfType: (index, type) => ({
            call: () => {
                if (type === 'btc') {
                    return Promise.resolve("0x023f0283519167f1603ba92b060146baa054712b938a61f35605ba08773142f4da")
                } else if (type === 'rsk') {
                    return Promise.resolve("0x0287b87976b0de1ef3c104b1e951e786aa78f71aedb3af9ec4ef89985bdaaa9f48")
                } else {
                    return Promise.resolve("0x02e65505c63cae9fd963afae2aba57a7fda7c5aa5cc9198e30bb2f17497e38fcc4")
                }
            }
        }),
        getFederationCreationBlockNumber: () => ({
            call: () => Promise.resolve(stubFederationCreationBlockNumber)
        }),
        getActivePowpegRedeemScript: () => ({
            call: () => Promise.resolve("0x"+stubFederationRedeemScript)
        })
    })
}

const bridgeInstanceStubERP = {
    methods: ({
        getFederationSize: () => ({
            call: () => Promise.resolve(stubFederationSize)
        }),
        getFederationThreshold: () => ({
            call: () => Promise.resolve(stubFederationThreshold)
        }),
        getFederationAddress: () => ({
            call: () => Promise.resolve(stubFederationAddressERP)
        }),
        getFederatorPublicKeyOfType: (index, type) => ({
            call: () => {
                if (type === 'btc') {
                    return Promise.resolve("0x023f0283519167f1603ba92b060146baa054712b938a61f35605ba08773142f4da")
                } else if (type === 'rsk') {
                    return Promise.resolve("0x0287b87976b0de1ef3c104b1e951e786aa78f71aedb3af9ec4ef89985bdaaa9f48")
                } else {
                    return Promise.resolve("0x02e65505c63cae9fd963afae2aba57a7fda7c5aa5cc9198e30bb2f17497e38fcc4")
                }
            }
        }),
        getFederationCreationBlockNumber: () => ({
            call: () => Promise.resolve(stubFederationCreationBlockNumber)
        }),
        getActivePowpegRedeemScript: () => ({
            call: () => Promise.resolve("0x"+stubFederationRedeemScriptERP)
        })
    })
}

const bridgeStub = {
    build: () => {
        return bridgeInstanceStub
    }
}

const bridgeStubERP = {
    build: () => {
        return bridgeInstanceStubERP
    }
}

const redeemScriptParserStub = { 
    getPowpegRedeemScript: () => {
        return Buffer.from(stubFederationRedeemScript, 'hex');
    },
    getP2shErpRedeemScript: () => {
        return Buffer.from(stubFederationRedeemScriptERP, 'hex');
    },
    getAddressFromRedeemScript: (network, redeemScript) => {
        if (redeemScript == stubFederationRedeemScriptERP) {
            return stubFederationAddressERP;
        } else {
            return stubFederationAddress;
        }
    }
}

const erpDetailsStub = {
    getErpPublicKeys: () => {
        return ['0x1', '0x2'];
    },
    getCsvValue: () => {
        return '500';
    }
}

const networkSettingsStubPreIris = {
    getNetworkUpgradesActivationHeights: () => ({
        getActivationHeight: (networkUpgrade) => {
            if (networkUpgrade == 'hop') {
                return stubFederationCreationBlockNumber + 200;
            }

            if (networkUpgrade == 'iris') {
                return stubFederationCreationBlockNumber + 100;
            }

            return stubFederationCreationBlockNumber - 100;
        }
    }),
    getErpDetails: () => {
        return erpDetailsStub;
    },
    getNetworkName: () => {
        return 'regtest';
    }
}

const networkSettingsStubPostIris = {
    getNetworkUpgradesActivationHeights: () => ({
        getActivationHeight: (networkUpgrade) => {
            if (networkUpgrade == 'hop') {
                return stubFederationCreationBlockNumber + 100;
            }

            if (networkUpgrade == 'iris') {
                return stubFederationCreationBlockNumber - 100;
            }

            return stubFederationCreationBlockNumber - 200;
        }
    }),
    getErpDetails: () => {
        return erpDetailsStub;
    },
    getNetworkName: () => {
        return 'regtest';
    }
}

const networkSettingsStubPostHop = {
    getNetworkUpgradesActivationHeights: () => ({
        getActivationHeight: (networkUpgrade) => {
            if (networkUpgrade == 'hop') {
                return stubFederationCreationBlockNumber - 100;
            }

            if (networkUpgrade == 'iris') {
                return stubFederationCreationBlockNumber - 200;
            }

            return stubFederationCreationBlockNumber - 300;
        }
    }),
    getErpDetails: () => {
        return erpDetailsStub;
    },
    getNetworkName: () => {
        return 'regtest';
    }
}

// Test starts here
describe('Get Powpeg Details', () => {
    beforeEach((done) => {
        powpegDetails = rewire('../powpeg-details');
        powpegDetails.__set__({
            'bridge': bridgeStub,
            'redeemScriptParser': redeemScriptParserStub
        });
        sandbox = sinon.createSandbox();
        done();
    });

    afterEach((done) => {
        sandbox.restore();
        done();
    });

    it('Should Return Powpeg Details Before IRIS', async () => {
        const result = await powpegDetails('', networkSettingsStubPreIris);

        assert.equal(result.federationSize, stubFederationSize);
        assert.equal(result.federationThreshold, stubFederationThreshold);
        assert.equal(result.federationAddress, stubFederationAddress);
        assert.equal(result.pegnatoryPublicKeys[0].rskAddress, expectedRskAddress);
        assert.equal(result.redeemScript, stubFederationRedeemScript);
        assert.equal(result.federationCreationBlockNumber, stubFederationCreationBlockNumber);
    });

    it('Should Return Powpeg Details After IRIS & Before HOP', async () => {
        const result = await powpegDetails('', networkSettingsStubPostIris);

        assert.equal(result.federationSize, stubFederationSize);
        assert.equal(result.federationThreshold, stubFederationThreshold);
        assert.equal(result.federationAddress, stubFederationAddress);
        assert.equal(result.pegnatoryPublicKeys[0].rskAddress, expectedRskAddress);
        assert.equal(result.redeemScript, stubFederationRedeemScript);
        assert.equal(result.federationCreationBlockNumber, stubFederationCreationBlockNumber);
    })

    it('Should Return Powpeg Details After HOP', async () => {
        const result = await powpegDetails('', networkSettingsStubPostHop);

        assert.equal(result.federationSize, stubFederationSize);
        assert.equal(result.federationThreshold, stubFederationThreshold);
        assert.equal(result.federationAddress, stubFederationAddress);
        assert.equal(result.pegnatoryPublicKeys[0].rskAddress, expectedRskAddress);
        assert.equal(result.redeemScript, stubFederationRedeemScript);
        assert.equal(result.federationCreationBlockNumber, stubFederationCreationBlockNumber);
    })
});

describe('Get Powpeg Details ERP', function () {
    before((done) => {
        powpegDetails = rewire('../powpeg-details');
        powpegDetails.__set__({
            'bridge': bridgeStubERP,
            'redeemScriptParser': redeemScriptParserStub
        });
        sandbox = sinon.createSandbox();
        done();
    });

    after((done) => {
        sandbox.restore();
        done();
    });
  
    it('Should Return Powpeg Details After IRIS & Before HOP ErpRedeemScript', async () => {
        const result = await powpegDetails('', networkSettingsStubPostIris);

        assert.equal(result.federationSize, stubFederationSize);
        assert.equal(result.federationThreshold, stubFederationThreshold);
        assert.equal(result.federationAddress, stubFederationAddressERP);
        assert.equal(result.pegnatoryPublicKeys[0].rskAddress, expectedRskAddress);
        assert.equal(result.redeemScript, stubFederationRedeemScriptERP);
        assert.equal(result.federationCreationBlockNumber, stubFederationCreationBlockNumber);
    });

    it('Should Return Powpeg Details After HOP ErpRedeemScript', async () => {
        const result = await powpegDetails('', networkSettingsStubPostHop);

        assert.equal(result.federationSize, stubFederationSize);
        assert.equal(result.federationThreshold, stubFederationThreshold);
        assert.equal(result.federationAddress, stubFederationAddressERP);
        assert.equal(result.pegnatoryPublicKeys[0].rskAddress, expectedRskAddress);
        assert.equal(result.redeemScript, stubFederationRedeemScriptERP);
        assert.equal(result.federationCreationBlockNumber, stubFederationCreationBlockNumber);
    });
});
