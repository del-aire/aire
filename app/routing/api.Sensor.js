const CircularBuffer = require('estructura/circular-buffer'), Client = require('./.././src/ipc/Client')

module.exports = function (app) {
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
    const ipcClient = new Client({retryMax: Infinity, waitStrategy: Client.BackOff(null, 4)})

    ipcClient.on('error', (withError) => {
        console.log(withError)
    })

    ipcClient.on('sensor.Record', (sensorRecord) => {
        sensorBuffer.push(sensorRecord)

        bufferToArray = sensorBuffer.toArray()
    })

    ipcClient.connect(8620)

    /**
     * Uri: /api/sensorBuffer
     * Method: GET
     */
    app.get('/api/sensorBuffer', async(req, res) => {
        return res.json({sensorBuffer: bufferToArray})
    })
}