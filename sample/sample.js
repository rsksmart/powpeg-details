const getPowpegDetails = require('../powpeg-details');
const rskNetworkSettings = require('rsk-network-settings');
const networkParser = require('./network');
const Web3 = require('web3');

(async () => {
    try {
        let network = process.argv[2];
        let web3 = new Web3(networkParser(network));
        let networkSettings = rskNetworkSettings.getNetworkSettingsForThisNetwork(network);
        
        let result = await getPowpegDetails(web3, networkSettings);
        console.log(result);
    } catch (e) {
        console.log(e);
    }
})();
