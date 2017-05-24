const Server = require('./../../src/ipc/Server')

/**
 * @param {Collector} collectionService
 *
 * @return {Server}
 */
module.exports = (collectionService) => {
    /**
     * @type {Server}
     */
    const aServer = new Server()

    aServer.listen(8620)

    collectionService.on('record', (distributedId, rData, oData) => {
        aServer.emit('sensor.Record',
            Object.assign(
                {distributedId: distributedId}, rData, {unknownData: oData}
            )
        )
    })

    return aServer
}