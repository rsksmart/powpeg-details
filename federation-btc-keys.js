module.exports = (federationPublicKeys) => {
    return federationPublicKeys.map(res => {
        return res.btc.substring(2)
    })
}
