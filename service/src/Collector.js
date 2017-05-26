const EventEmitter = require('events').EventEmitter

const Puid = require('puid')

const SensorFactory = require('./sensor/Factory')

const intelLogger = require('intel').getLogger('intel')

/**
 * @class {Collector}
 */
class Collector {
    /**
     * @constructor
     *
     * @param {Array.<Sensor>} sensorCollection
     */
    constructor(sensorCollection) {
        /**
         * @private
         *
         * @type {Array.<Sensor>} _sensorCollection
         */
        this._sensorCollection = sensorCollection

        /**
         * @private
         *
         * @type {EventEmitter}
         */
        this._eventEmitter = new EventEmitter()

        /**
         * @private
         *
         * @type {Puid}
         */
        this._distributedIdGenerator = new Puid()

        /**
         * @private
         *
         * @type {{}}
         */
        this._mandatoryData = Object.assign({
            dhtHumidity: {
                updatedAt: null, sensorValue: null
            },
            dhtTemperature: {
                updatedAt: null, sensorValue: null
            },
            /**
             * Gps Data.
             */
            gpggaTime: {
                updatedAt: null, sensorValue: null
            },
            gprmcDate: {
                updatedAt: null, sensorValue: null
            },
            gpggaLatitude: {
                updatedAt: null, sensorValue: null
            },
            gpggaLongitude: {
                updatedAt: null, sensorValue: null
            },
            gpggaSatelliteCount: {
                updatedAt: null, sensorValue: null
            }
        })

        /**
         * @private
         *
         * @type {{}}
         */
        this._unknownData = Object.create(null)
    }

    /**
     * @private
     *
     * @param {{}} anObj
     *
     * @return {{}}
     */
    _extractValueProperty(anObj) {
        const sensorValueObj = Object.create(null)

        for (const columnKey in anObj) sensorValueObj[columnKey] = anObj[columnKey].sensorValue

        return sensorValueObj
    }

    /**
     * Parse & Store the data from a sensor.
     *
     * @private
     *
     * @param {{}} readingObj
     * @param {{}} sensorObj
     */
    _parseSensorData(readingObj, sensorObj) {
        for (const columnName in readingObj) {
            /**
             * When the value is required use the `#._mandatoryData`, otherwise use `#._unknownData`.
             *
             * @type {{}}
             */
            const useStore = typeof this._mandatoryData[columnName] !== 'undefined' ? this._mandatoryData : this._unknownData

            useStore[columnName] = {
                updatedAt: Date.now(), sensorValue: readingObj[columnName]
            }
        }

        /**
         * @type {String}
         */
        const distributedId = this._distributedIdGenerator.generate()

        this._eventEmitter.emit(
            'record', distributedId, Object.assign(this._extractValueProperty(this._mandatoryData), {_createdAt: Date.now()}), this._extractValueProperty(this._unknownData)
        )
    }

    /**
     * Start the Collection from a particular sensor.
     *
     * @private
     *
     * @param {Sensor} aSensor
     */
    _startSensor(aSensor) {
        aSensor.on('error', (isFatal, anError) => {
            if (isFatal) this.stopGathering()

            this._eventEmitter.emit('error', isFatal, anError)
        })

        aSensor.on('reading', (readingObj, sensorObj) => {
            this._parseSensorData(readingObj, sensorObj)
        })

        aSensor.startGatheringIfNotActivated()
    }

    /**
     * Start the Collection Service.
     *
     * @public
     */
    startGathering() {
        intelLogger.info(`Starting the Collector Service.`)

        this._sensorCollection.forEach(
            aSensor => this._startSensor(aSensor)
        )

        intelLogger.info(`The Collector Service has been started.`)
    }

    /**
     * Stop a particular sensor.
     *
     * @param {Sensor} aSensor
     */
    _stopSensor(aSensor) {
        aSensor.stopSensorIfNotIdle()
    }

    /**
     * Stop the Collection Service. This will stop the Collection of
     * Data from each sensor!
     *
     * @public
     */
    stopGathering() {
        intelLogger.info(`Stopping the Collector Service.`)

        this._sensorCollection.forEach(
            aSensor => this._stopSensor(aSensor)
        )

        intelLogger.info(`The Collector Service has been stopped.`)
    }

    /**
     * @public
     *
     * @param {String} eventName
     * @param {Function} callbackFunction
     */
    on(eventName, callbackFunction) {
        this._eventEmitter.on(eventName, callbackFunction)
    }

    /**
     * @public
     *
     * @param {String} jsonFile
     *
     * @return {Collector}
     */
    static async fromJsonFile(jsonFile) {
        return Collector.fromSensorCollection(
            await SensorFactory.parseJsonFile(jsonFile)
        )
    }

    /**
     * @public
     *
     * @param {Array.<Sensor>} sensorCollection
     *
     * @return {Collector}
     */
    static fromSensorCollection(sensorCollection) {
        return new Collector(sensorCollection)
    }
}

module.exports = Collector