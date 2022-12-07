const bridge = require('@rsksmart/rsk-precompiled-abis').bridge;
const redeemScriptParser = require('powpeg-redeemscript-parser');
const getFederationPublicKeys = require('./pegnatory-public-keys');
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

const getActivePowpegRedeemScript = async(bridgeInstance, networkSettings, federationCreationBlockNumber) => {
    let redeemScript;
    if (federationCreationBlockNumber >= networkSettings.getNetworkUpgradesActivationHeights().getActivationHeight('hop')) {
        // Use the Bridge method added in Hop that returns the active powpeg redeem script
        return (await bridgeInstance.methods.getActivePowpegRedeemScript().call()).substring(2);
    }
    if (federationCreationBlockNumber >= networkSettings.getNetworkUpgradesActivationHeights().getActivationHeight('iris')) {
        // Try getting the p2sh erp federation redeem script
        let redeemScript = redeemScriptParser.getP2shErpRedeemScript(
            btcPublicKeys, 
            networkSettings.getErpDetails().getErpPublicKeys(), 
            networkSettings.getErpDetails().getCsvValue()
        ).toString('hex');

        // Compare the address obtained from the redeem script to the one returned by the Bridge
        // If they don't match then it's probably because an ERP federation has not been created yet
        const federationAddress = await bridgeInstance.methods.getFederationAddress().call();
        if (federationAddress == redeemScriptParser.getAddressFromRedeemScript(networkSettings.getNetworkName(), redeemScript)) {
            return redeemScript;
        }
    }
    
    // Return the standard redeem script by default, iris not active or ERP federation not created yet
    return redeemScriptParser.getPowpegRedeemScript(btcPublicKeys).toString('hex');
}

module.exports = async (web3, networkSettings) => {
    const bridgeInstance = bridge.build(web3);
    const federationSize = await bridgeInstance.methods.getFederationSize().call();
    const federationThreshold = await bridgeInstance.methods.getFederationThreshold().call();
    const federationAddress = await bridgeInstance.methods.getFederationAddress().call();
    const pegnatoryPublicKeys = await getFederationPublicKeys(bridgeInstance);
    const btcPublicKeys = getFedBtcKeys(pegnatoryPublicKeys);
    const federationCreationBlockNumber = await bridgeInstance.methods.getFederationCreationBlockNumber().call();
    const redeemScript = await getActivePowpegRedeemScript(bridgeInstance, networkSettings, federationCreationBlockNumber);

    return new PowpegDetails(
        Number(federationSize), 
        Number(federationThreshold), 
        federationAddress, 
        pegnatoryPublicKeys, 
        redeemScript, 
        federationCreationBlockNumber
    );
};
