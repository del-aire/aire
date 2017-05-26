const Abstract = require('./Abstract')

/**
 * @class {Abstract}
 */
class Gprmc extends Abstract {
    /**
     * @private
     */
    _parseGpggaSentence(gprmcSentence) {
        if (this._isValidNmeaSentence(gprmcSentence) === false) return

        /**
         * Convert the Nmea Sentence to a Bucket containing information
         * about the Latitude, Longitude, number of Satellites etc.
         *
         * @type {*}
         */
        const gprmcBucket = gprmcSentence.split(',')

        if (gprmcBucket[2] !== 'V') {
            this._fireReadingEvent({
                gprmcDate: gprmcBucket[9].substr(0, 2) + '-' + gprmcBucket[9].substr(2, 2) + '-' + gprmcBucket[9].substr(4)
            })
        }
        else {
            this._fireReadingEvent({
                gprmcDate: null
            })
        }
    }

    /**
     * @public
     */
    startGathering() {
        super.startGathering()

        /**
         * The `data` Event is being emitted by the Serial Connection,
         * as we've used the `\n` Parser we know that we'll receive exactly
         * one Nmea Sentence.
         */
        this._serialPort.on('data', nmeaSentence => {
            nmeaSentence = nmeaSentence.trim()

            if (nmeaSentence.indexOf('$GPRMC') >= 0) this._parseGpggaSentence(nmeaSentence)
        })
    }

    /**
     * @public
     *
     * @static
     *
     * @param {{}} sensorCollection
     * @param {{serialInterface: String}} sensorObj
     *
     * @return {Gprmc}
     */
    static getInstance(sensorCollection, sensorObj) {
        return new Gprmc(sensorObj.serialInterface)
    }
}

module.exports = Gprmc