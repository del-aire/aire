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
 * @type {Collector}
 */
const Collector = require('./src/Collector')

/**
 * +--------------------------------------------------
 * | Inter Process Communication
 * +--------------------------------------------------
 */
const sIpc = require('./src/Ipc')

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
     * Store the Data locally with NeDb.
     *
     * @see Local.js
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

    collectionService.startGathering()

    /**
     * Construct an Api Service from an Id, Secret and Endpoint.
     *
     * @type {{startService: Function, stopService: Function}}
     */
    const apiService = require('./src/Api')(apiConfig.deviceId, apiConfig.deviceSecret, apiConfig.apiEndpoint)

    apiService.startService()
}

onStartup().then(
    () => {
        intelLogger.info(`#.onStartup Executed.`)
    }
)