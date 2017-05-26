const createStream = require('streamroller'), path = require('path')

/**
 * @param {Collector} collectionService
 * @param {{baseDir: String}} rollingFileConf
 * @param {Server} ipcServer
 *
 * @return {Server}
 */
module.exports = (collectionService, rollingFileConf, ipcServer) => {
    /**
     * @type {String}
     */
    const filePath = path.resolve(__dirname + '/../' + rollingFileConf.baseDir) + '/' + rollingFileConf.fileName

    /**
     * @see {rollingFile}
     */
    const writeWith = new createStream.RollingFileStream(
        filePath, rollingFileConf.maxSize, rollingFileConf.maxFiles
    )

    collectionService.on('record', (distributedId, rData, oData) => {
        writeWith.write(
            [distributedId, rData.grooveAirQuality, rData.dhtHumidity, rData.dhtTemperature, rData.gpggaTime, rData.gprmcDate, rData.gpggaLatitude, rData.gpggaLongitude, rData.gpggaSatelliteCount, JSON.stringify(oData)].join(';') + '\n'
        )
 
        ipcServer.emit('rollingFile.Path', {rollingFile: filePath})
    })
}