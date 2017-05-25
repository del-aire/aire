/**
 * +--------------------------------------------------
 * | Configuration
 * +--------------------------------------------------
 */
const {appConfig, intelLogger} = require('./Boot')

/**
 * +--------------------------------------------------
 * | Unhandled Rejection
 * +--------------------------------------------------
 */
process.on('unhandledRejection', (withError) => {
    intelLogger.critical('Unhandled Rejection!', withError)
})

/**
 * @see {Collector}
 */
const Collector = require('./src/Collector')

/**
 * +--------------------------------------------------
 * | Inter Process Communication
 * +--------------------------------------------------
 */
const sIpc = require('./src/Ipc'), sRollingFile = require('./src/RollingFile')

/**
 * +--------------------------------------------------
 * | Startup
 * +--------------------------------------------------
 *
 * Fire up our Collector and append information to the
 * Console & Local Database.
 */
const onStartup = async() => {
    const collectionService = await Collector.fromJsonFile(__dirname + '/config.Sensor.json')

    /**
     * Communicate over the Network.
     *
     * @see Ipc.js
     */
    const aServer = sIpc(collectionService)

    aServer.on('error', (withError) => {
        intelLogger.error('The "ipc.Server" stopped because of an Error.', withError)

        process.exit()
    })

    collectionService.on('error', (isFatal, anError) => {
        if (isFatal) {
            intelLogger.error('The "sensor.Service" stopped because of a Fatal Error emitted by a sensor.', anError)

            process.exit()
        }

        intelLogger.warn('An Error occurred.', anError)
    })

    /**
     * @see RollingFile.js
     */
    sRollingFile(collectionService, appConfig.rollingFile, aServer)

    collectionService.startGathering()
}

onStartup().then(
    () => {
        intelLogger.info(`#.onStartup Executed.`)
    }
)