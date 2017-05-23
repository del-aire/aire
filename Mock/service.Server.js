const Server = require('././src/ipc/Server')

/**
 * @type {Server}
 */
const aServer = new Server()

aServer.on('error', (withError) => {

})

aServer.listen(8620)

setInterval(function () {
    const aDate = new Date()

    aServer.emit('sensor.Record', {
        dhtHumidity: 30,
        dhtTemperature: 21,

        gpsTime: `${aDate.getHours()}:${('0' + aDate.getMinutes()).substr(-2)}:${('0' + aDate.getSeconds()).substr(-2)}`,
        gpsDate: '16-05-2017',
        gpsLatitude: 48.8583,
        gpsLongitude: 2.2944,

        dn7c3ca007ParticleMatter2Dot5: (Math.random() * 5).toFixed(4)
    })
}, 200)