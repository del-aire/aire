const Irregular = require('./../Irregular'), SerialPort = require('serialport')

/**
 * @type {Object}
 */
const serialInterfaceMapping = Object.create(null)

/**
 * @class {Abstract}
 */
class Abstract extends Irregular {
    /**
     * @constructor
     *
     * @param {String} serialInterface
     */
    constructor(serialInterface) {
        super()

        /**
         * @public
         *
         * @type {String}
         */
        this.serialInterface = serialInterface

        /**
         * @private
         *
         * @type {SerialPort}
         */
        this._serialPort = null
    }

    /**
     * @protected
     *
     * @param {String} nmeaLatitude
     * @param {String} northOrSouth
     *
     * @return {Number}
     */
    _parseLatitude(nmeaLatitude, northOrSouth) {
        const decimalLatitude = (
            parseInt(nmeaLatitude.slice(0, 2)) + parseFloat(nmeaLatitude.slice(2)) / 60
        ).toFixed(6)

        return northOrSouth === 'S' ? -decimalLatitude : +decimalLatitude
    }

    /**
     * @protected
     *
     * @param {String} nmeaLongitude
     * @param {String} eastOrWest
     *
     * @return {Number}
     */
    _parseLongitude(nmeaLongitude, eastOrWest) {
        const decimalLongitude = (
            parseInt(nmeaLongitude.slice(0, 3)) + parseFloat(nmeaLongitude.slice(3) / 60)
        ).toFixed(6)

        return eastOrWest === 'W' ? -decimalLongitude : +decimalLongitude
    }

    /**
     * @protected
     *
     * @param {String} nmeaSentence
     *
     * @return {Boolean}
     */
    _isValidNmeaSentence(nmeaSentence) {
        if (nmeaSentence.substr(-3, 1) !== '*') return false

        /**
         * Check whether the Checksum is valid.
         *
         * @type {Number}
         */
        let chkChecksum = parseInt(nmeaSentence.substr(-2, 1), 16) * 16 + parseInt(nmeaSentence.substr(-1, 1), 16)

        for (let idxNr = 1, maxNr = nmeaSentence.length - 3; idxNr < maxNr; idxNr++) {
            chkChecksum ^= nmeaSentence.charCodeAt(idxNr)
        }

        return chkChecksum === 0
    }

    /**
     * @public
     */
    startGathering() {
        super.startGathering()

        if (serialInterfaceMapping[this.serialInterface]) {
            this._serialPort = serialInterfaceMapping[this.serialInterface]

            return
        }

        /**
         * Open a Serial Connection to read Data from the Gps. In case of
         * an Error, report it as a Fatal Error.
         *
         * @type {SerialPort}
         */
        this._serialPort = serialInterfaceMapping[this.serialInterface] = new SerialPort(this.serialInterface, {
            baudRate: 9600,
            parser: SerialPort.parsers.readline('\n')
        }, (withError) => {
            if (!withError) return

            this._fireErrorEvent(true, withError)
        })
    }

    /**
     * @public
     */
    stopGathering() {
        super.stopGathering()

        if (this._serialPort.fd) this._serialPort.close()
    }

    /**
     * @public
     *
     * @static
     *
     * @param {{}} sensorCollection
     * @param {{serialInterface: String}} sensorObj
     *
     * @return {Abstract}
     *
     * @throws {Error}
     */
    static getInstance(sensorCollection, sensorObj) {
        throw new Error('Abstract.')
    }
}

module.exports = Abstract