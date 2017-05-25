const Server = require('./../../src/ipc/Server')

/**
 * @param {Collector} collectionService
 * @param {Number} portNumberOrUnixPath
 *
 * @return {Server}
 */
module.exports = (collectionService, portNumberOrUnixPath = 8260) => {
    /**
     * @type {Server}
     */
    const aServer = new Server()

    collectionService.on('record', (distributedId, rData, oData) => {
        aServer.emit('sensor.Record',
            Object.assign(
                {distributedId: distributedId}, rData, {unknownData: oData}
            )
        )
    })

    aServer.listen(portNumberOrUnixPath)

    return aServer
}