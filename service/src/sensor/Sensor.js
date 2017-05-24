const EventEmitter = require('events').EventEmitter, Time = require('././Time')

/**
 * @abstract
 */
class Sensor {
    /**
     * @constructor
     *
     * @param {String} operationMode
     */
    constructor(operationMode) {
        /**
         * Either `Irregular.OperationModeIrregular` or `Irregular.OperationModePeriodic`.
         *
         * @public
         *
         * @type {String}
         */
        this.operationMode = operationMode

        /**
         * The current State of the Irregular. Equal to `Idle` or `Activated`.
         *
         * @type {String}
         */
        this.currentState = Sensor.StateIdle

        /**
         * @public
         *
         * @type {Number}
         */
        this.lastReadingEventFiredAt = null

        /**
         * @private
         *
         * @type {EventEmitter}
         */
        this._publicEventEmitter = new EventEmitter()
    }

    /**
     * Start the sensor if the current State is NOT equal to
     * `sensor.StateActivated`.
     *
     * @public
     */
    startGatheringIfNotActivated() {
        if (this.currentState !== Sensor.StateActivated) this.startGathering()
    }

    /**
     * Start the sensor, the `reading` Event could be emitted once the
     * `#.startGathering` Method has been activated.
     *
     * @public
     */
    startGathering() {
        if (this.currentState === Sensor.StateActivated) throw new Error('Already Activated.')

        this.currentState = Sensor.StateActivated
    }

    /**
     * Stop the Gathering of Data if the sensor is in the `sensor.StateActivated`
     * State.
     *
     * @public
     */
    stopSensorIfNotIdle() {
        if (this.currentState !== Sensor.StateIdle) this.stopGathering()
    }

    /**
     * Stop gathering Data from the Irregular.
     *
     * @public
     */
    stopGathering() {
        if (this.currentState === Sensor.StateIdle) throw new Error('Already Idle.')

        this.currentState = Sensor.StateIdle
    }

    /**
     * Fire and Event with the appropriate information.
     *
     * @protected
     *
     * @param {String} eventName
     * @param argCollection
     */
    _fireEvent(eventName, ...argCollection) {
        if (this._publicEventEmitter.eventNames().indexOf(eventName) < 0) return

        this._publicEventEmitter.emit.call(this._publicEventEmitter, eventName, ...argCollection, this)
    }

    /**
     * Fire the `reading` Event with new information.
     *
     * @protected
     *
     * @param {{}} readingObj
     */
    _fireReadingEvent(readingObj) {
        this.lastReadingEventFiredAt = Time.getPreciseTimeInMilliseconds()

        this._fireEvent('reading', readingObj)
    }

    /**
     * Fire the `error` Event with information about a certain Error.
     *
     * @protected
     *
     * @param {Boolean} isFatal
     * @param {Error} anError
     */
    _fireErrorEvent(isFatal, anError) {
        this._fireEvent('error', isFatal, anError)
    }

    /**
     * Used in combination with the Event Emitter to implement the
     * Observer Pattern.
     *
     * @public
     *
     * @param {String} eventName
     * @param {Function} callbackFunction
     *
     * @example
     *
     * const aSensor = new Irregular()
     *
     * aSensor.on('reading', (readingObj) => {
     *
     * })
     */
    on(eventName, callbackFunction) {
        this._publicEventEmitter.addListener(eventName, callbackFunction)
    }

    /**
     * @public
     *
     * @static
     */
    getInstance() {
        throw new Error('Not implemented.')
    }
}

/**
 * Used to set the `#.currentState` to "Idle";
 *
 * @type {String}
 */
Sensor.StateIdle = 'Idle'

/**
 * Used to set the `#.currentState` to "Activated";
 *
 * @type {String}
 */
Sensor.StateActivated = 'Activated'

/**
 * @see {Irregular}
 *
 * @type {String}
 */
Sensor.OperationModeIrregular = 'Irregular'

/**
 * @see {Irregular}
 *
 * @type {String}
 */
Sensor.OperationModePeriodic = 'Periodic'

module.exports = Sensor