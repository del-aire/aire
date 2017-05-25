const CircularBuffer = require('estructura/circular-buffer'), Client = require('./../../src/ipc/Client')

module.exports = function (app) {
    /**
     * @type {Boolean}
     */
    let heartBeat = false

    /**
     * @type {String}
     */
    let rollingFile

    /**
     * @type {CircularBuffer}
     */
    const sensorBuffer = new CircularBuffer(20)

    /**
     * `#.sensorBuffer.toArray()`
     *
     * @type {Array.<*>}
     */
    let bufferToArray = []

    /**
     * @type {Client}
     */
    const ipcClient = new Client({
        retryMax: Infinity,
        waitStrategy: Client.BackOff(200, 4)
    })

    ipcClient.on('error', (withError) => {
        console.log(withError)

        heartBeat = false, rollingFile = ''
    })

    ipcClient.on('sensor.Record', (sensorRecord) => {
        sensorBuffer.push(sensorRecord), heartBeat = true

        bufferToArray = sensorBuffer.toArray()
    })

    ipcClient.on('rollingFile.Path', (rollingRecord) => {
        rollingFile = rollingRecord.rollingFile
    })

    ipcClient.connect(8260)

    /**
     * Uri: /api/sensorBuffer
     * Method: GET
     */
    app.get('/api/sensorBuffer', async(req, res) => {
        return res.json({
            heartBeat: heartBeat,
            rollingFile: rollingFile ? true : false,
            sensorBuffer: bufferToArray
        })
    })

    /**
     * Uri: /api/rollingFile
     * Method: GET
     */
    app.get('/api/rollingFile', async(req, res) => {
        if (!rollingFile) return res.status(500).json({withError: "No Data."})

        return res.download(rollingFile, 'Latest.Data.csv')
    })
}