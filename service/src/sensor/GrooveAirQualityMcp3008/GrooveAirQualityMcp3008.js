const Periodic = require('./../Periodic'), Mcp3008 = require('mcp3008.js')

/**
 * @class {Dht}
 */
class GrooveAirQualityMcp3008 extends Periodic {
    /**
     * @constructor
     *
     * @param {Number} analogChannel
     * @param {String} deviceAddr
     */
    constructor(analogChannel, deviceAddr = null) {
        super(2000) // Detector Duty (?)

        /**
         * @public
         *
         * @type {Number}
         */
        this.analogChannel = analogChannel

        /**
         * @private
         *
         * @type {Mcp3008}
         */
        this.mcp3008 = new Mcp3008(deviceAddr)

        /**
         * @private
         *
         * @type {Number}
         *
         this._iCount = 0

         /**
         * @private
         *
         * @type {Number}
         *
         this._iVoltage = null

         setTimeout(
         () => {
                console.log('[ DEBUG ]', 'Groove Air Quality Sensor.')

                this.mcp3008.read(this.analogChannel, (initVoltage) => {
                    this._iVoltage = initVoltage

                    console.log('[ DEBUG ]', 'Groove Air Quality Sensor.', this._iVoltage)
                })
            }, 20000
         )

         /**
         * Count.
         *
         * @private
         *
         * @type {Number}
         *
         this._cVoltage = 0

         /**
         * @private
         *
         * @type {Number}
         *
         this._fVoltage = null

         /**
         * @private
         *
         * @type {Number}
         *
         this._lVoltage = null

         /**
         * @private
         *
         * @type {Number}
         *
         this._sVoltage = null

         /**
         * @private
         *
         * @type {Number}
         *
         this._sTimeout = null
         */
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

        this.mcp3008.read(this.analogChannel, (aVoltage) => {
            console.log('[ DEBUG ]', 'Groove Air Quality Sensor.', aVoltage)

            let grooveAirQuality

            if (aVoltage > 700) {
                grooveAirQuality = 0
            }
            else if(aVoltage > 300) {
                grooveAirQuality = 1
            }
            else {
                grooveAirQuality = 2
            }

            this._fireReadingEvent({
                grooveAirQuality: grooveAirQuality
            })
        })

        callbackFunction()

        /*console.log('[ DEBUG ]', 'Voltage of _iVoltage.', this._iVoltage)

         if (!this._iVoltage) return

         /**
         * Ok.
         *
         if (this._iVoltage < 799 && this._iVoltage > 10) {
         this.mcp3008.read(this.analogChannel, (aVoltage) => {
         this._fVoltage = aVoltage

         this._lVoltage = this._fVoltage
         this._sVoltage = this._lVoltage
         })
         }
         else if (this._iVoltage > 798 || this._iVoltage < 11) {
         if (this._sTimeout) return

         this._sTimeout = setTimeout(
         () => {
         console.log('[ DEBUG ]', 'Init Timeout.')

         this._sTimeout = null, this._iCount++

         this.mcp3008.read(this.analogChannel, (aVoltage) => {
         this._iVoltage = aVoltage
         })

         if (this._iCount >= 5) {
         this._fireErrorEvent(
         false, new Error('Groove Air Quality Sensor Unable to Initialize.')
         )
         }
         }, 60000
         )
         }
         else {
         /**
         * @type {Number}
         *
         let grooveAirQuality

         /**
         * Successful initialization.
         *
         if (this._fVoltage - this._lVoltage > 400 || this._fVoltage > 700) {
         console.log('[ DEBUG ]', 'High Pollution.', 0)
         console.log(this._fVoltage, '\n')

         grooveAirQuality = 0
         }
         else if ((this._fVoltage - this._lVoltage > 400 && this._fVoltage < 700) || this._fVoltage - this._sVoltage > 150) {
         console.log('[ DEBUG ]', 'High Pollution.', 1)
         console.log(this._fVoltage, '\n')

         grooveAirQuality = 1
         }
         else if ((this._fVoltage - this._lVoltage > 200 && this._fVoltage < 700) || this._fVoltage - this._sVoltage > 50) {
         console.log('[ DEBUG ]', 'Low Pollution.', 2)
         console.log(this._fVoltage, '\n')

         grooveAirQuality = 2
         }
         else {
         console.log('[ DEBUG ]', 'Air Fresh.', 3)
         console.log(this._fVoltage, '\n')

         grooveAirQuality = 3
         }

         this._fireReadingEvent({
         grooveAirQuality: grooveAirQuality
         })
         }
         */
    }

    /**
     * @public
     *
     * @static
     *
     * @param {{}} sensorCollection
     * @param {{analogChannel: Number, deviceAddr: String}} sensorObj
     */
    static getInstance(sensorCollection, sensorObj) {
        return new GrooveAirQualityMcp3008(sensorObj.analogChannel, sensorObj.deviceAddr)
    }
}

module.exports = GrooveAirQualityMcp3008