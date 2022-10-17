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
    if (federationCreationBlockNumber >= networkSettings.getNetworkUpgradesActivationHeights().getActivationHeight('hop')) {
        redeemScript = (await bridge.methods.getActivePowpegRedeemScript().call()).substring(2);
    } else if (federationCreationBlockNumber >= networkSettings.getNetworkUpgradesActivationHeights().getActivationHeight('iris')
            && federationCreationBlockNumber < networkSettings.getNetworkUpgradesActivationHeights().getActivationHeight('hop')) {
        const federationAddress = await bridge.methods.getFederationAddress().call();
        redeemScript = RedeemScriptParser.getPowpegRedeemScript(btcPublicKeys).toString('hex');
        if (federationAddress != RedeemScriptParser.getAddressFromRedeemScript(networkSettings.getNetworkName(), redeemScript)) {
            redeemScript = RedeemScriptParser.getP2shErpRedeemScript(
                btcPublicKeys, 
                networkSettings.getErpDetails().getErpPublicKeys(), 
                networkSettings.getErpDetails().getCsvValue()
            ).toString('hex');

            if (federationAddress != RedeemScriptParser.getAddressFromRedeemScript(networkSettings.getNetworkName(), redeemScript)) {
                throw new Error("RedeemScript could not be parsed");
            }
        }
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
