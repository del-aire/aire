const Periodic = require('./../Periodic')

const dhtModule = require('./../../../build/Release/dht')

/**
 * @class {Dht}
 */
class Dht extends Periodic {
    /**
     * @constructor
     *
     * @param {Number} sensorType
     * @param {Number} gpioPin
     */
    constructor(sensorType, gpioPin) {
        super(2000) // Sample Rate of 1 Hz for the Dht11 and .5 Hz for the Dht22

        /**
         * @public
         *
         * @type {Number}
         */
        this.sensorType = sensorType

        /**
         * @public
         *
         * @type {Number}
         */
        this.gpioPin = gpioPin
    }

    /**
     * Executed when the Interval has surpassed.
     *
     * @protected
     *
     * @param {Function} callbackFunction
     */
    _onTick(callbackFunction) {
        super._onTick(callbackFunction)

        dhtModule.readDht(this.sensorType, this.gpioPin, (withError, dhtHumidity, dhtTemperature) => {
            if (withError)
                this._fireErrorEvent(
                    false, new Error(withError)
                )
            else
                this._fireReadingEvent({
                    dhtHumidity: dhtHumidity, dhtTemperature: dhtTemperature
                })

            callbackFunction()
        })
    }

    /**
     * @public
     *
     * @static
     *
     * @param {{}} sensorCollection
     * @param {{sensorType: Number, gpioPin: Number}} sensorObj
     */
    static getInstance(sensorCollection, sensorObj) {
        return new Dht(sensorObj.sensorType, sensorObj.gpioPin)
    }
}

module.exports = Dht