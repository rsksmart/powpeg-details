const Bridge = require('@rsksmart/rsk-precompiled-abis').bridge;
const getFederationPublicKeys = require('./pegnatory-public-keys');
const RedeemScriptParser = require('powpeg-redeemscript-parser');
const getFedBtcKeys = require('./federation-btc-keys');

class PowpegDetails {
    constructor(
        federationSize, 
        federationThreshold, 
        federationAddress, 
        pegnatoryPublicKeys, 
        redeemScript, 
        federationCreationBlockNumber
    ) {
        this.federationSize = federationSize;
        this.federationThreshold = federationThreshold;
        this.federationAddress = federationAddress;
        this.pegnatoryPublicKeys = pegnatoryPublicKeys;
        this.redeemScript = redeemScript;
        this.federationCreationBlockNumber = federationCreationBlockNumber;
    }
}

module.exports = async (web3, networkSettings) => {
    const bridge = Bridge.build(web3);
    const federationSize = await bridge.methods.getFederationSize().call();
    const federationThreshold = await bridge.methods.getFederationThreshold().call();
    const federationAddress = await bridge.methods.getFederationAddress().call();
    const pegnatoryPublicKeys = await getFederationPublicKeys(bridge);
    const btcPublicKeys = getFedBtcKeys(pegnatoryPublicKeys);
    const federationCreationBlockNumber = await bridge.methods.getFederationCreationBlockNumber().call();

    let redeemScript;
    if (federationCreationBlockNumber >= networkSettings.getNetworkUpgradesActivationHeights().getActivationHeight('iris')) {
        redeemScript = RedeemScriptParser.getErpRedeemScript(
            btcPublicKeys, 
            networkSettings.getErpDetails().getErpPubKeys(), 
            networkSettings.getErpDetails().getCsvValue()
        ).toString('hex');
    } else {
        redeemScript = RedeemScriptParser.getPowpegRedeemScript(btcPublicKeys).toString('hex');
    }

    return new PowpegDetails(
        Number(federationSize), 
        Number(federationThreshold), 
        federationAddress, 
        pegnatoryPublicKeys, 
        redeemScript, 
        federationCreationBlockNumber
    );
};
