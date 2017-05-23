/**
 * @param {Collector} collectionService
 */
module.exports = (collectionService) => {
    collectionService.on('record', (distributedId, rData, oData) => {
        console.log(`Reporting a new record through the Console. Identifier: ${distributedId}`)

        console.log(
            Object.assign({distributedId: distributedId}, rData, {optionalData: oData})
        )
    })
}