const Sensor = require('./Sensor')

/**
 * @abstract
 *
 * @class {Irregular}
 */
class Periodic extends Sensor {
    /**
     * @constructor
     *
     * @param {Number} periodicPollingFrequency
     */
    constructor(periodicPollingFrequency) {
        super(Sensor.OperationModePeriodic)

        /**
         * The number of Milliseconds between each Timeout.
         *
         * @public
         *
         * @type {Number}
         */
        this.periodicPollingFrequency = periodicPollingFrequency

        /**
         * @private
         *
         * @type {Interval}
         */
        this._periodicTimeout = null
    }

    /**
     * Should be implemented by each sensor.
     *
     * @protected
     *
     * @param {Function} callbackFunction Should be used by the sensor Implementation
     *   to trigger the Abstract sensor Object to schedule a new call to `#._onTick`.
     */
    _onTick(callbackFunction) {

    }

    /**
     * Setup the gathering of Data at a Irregular Interval.
     *
     * @public
     */
    startGathering() {
        super.startGathering()

        const instanceOfMe = this

        /**
         * Setup the Timeout which will invoke `#.onTick` Method that
         * should be implemented by each Irregular sensor.
         *
         * @type {*}
         */
        const periodicTimeout = () => {
            instanceOfMe._onTick(
                () => {
                    this._periodicTimeout = setTimeout(periodicTimeout, this.periodicPollingFrequency)
                }
            )
        }

        periodicTimeout()
    }

    /**
     * Clear the Interval.
     *
     * @public
     */
    stopGathering() {
        super.stopGathering()

        clearTimeout(this._periodicTimeout)
    }
}

module.exports = Periodic