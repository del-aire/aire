/**
 * @param {Collector} collectionService
 * @param {Server} ipcServer
 *
 * @return {Server}
 */
module.exports = (collectionService, ipcServer) => {
    collectionService.on('record', (distributedId, rData, oData) => {

    })
}