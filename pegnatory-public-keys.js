const ethUtils = require('ethereumjs-util');

class PegnatoryPublicKey {
    constructor(btc, rsk, mst, rskAddress) {
        this.btc = btc;
        this.rsk = rsk;
        this.mst = mst;
        this.rskAddress = rskAddress;
    }
}

const pubKeyToAddress = (hexString) => {
    const addressBuffer = ethUtils.pubToAddress(Buffer.from(hexString.slice(2), 'hex'), true);
    return ethUtils.bufferToHex(addressBuffer);
}

module.exports = async (bridge) => {
    const federationSize = await bridge.methods.getFederationSize().call();
    let fedKeys = [];
    for (let i = 0; i < federationSize; i++) {
        let btc = await bridge.methods.getFederatorPublicKeyOfType(i, 'btc').call();
        let rsk = await bridge.methods.getFederatorPublicKeyOfType(i, 'rsk').call();
        let mst = await bridge.methods.getFederatorPublicKeyOfType(i, 'mst').call();
        let rskAddress = pubKeyToAddress(rsk);
        fedKeys.push(new PegnatoryPublicKey(btc, rsk, mst, rskAddress))
    }
    return fedKeys;
}
