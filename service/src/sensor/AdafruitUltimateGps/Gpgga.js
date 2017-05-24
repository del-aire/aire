const Abstract = require('./Abstract')

/**
 * @class {Abstract}
 */
class Gpgga extends Abstract {
    /**
     * @private
     */
    _parseGpggaSentence(gpggaSentence) {
        if (this._isValidNmeaSentence(gpggaSentence) === false) return

        /**
         * Convert the Nmea Sentence to a Bucket containing information
         * about the Latitude, Longitude, number of Satellites etc.
         *
         * @type {*}
         */
        const gpggaBucket = gpggaSentence.split(',')

        /**
         * @type {{gpggaTime: {String | null}, gpggaLatitude: Number, gpggaLongitude: Number, gpggaFix: Boolean, gpggaSatelliteCount: Number}}
         */
        let gpggaObj

        if (parseInt(gpggaBucket[6]) < 1) {
            gpggaObj = {
                gpggaTime: null,

                gpggaLatitude: null,
                gpggaLongitude: null,

                gpggaFix: false, gpggaSatelliteCount: null
            }
        }
        else {
            gpggaObj = {
                gpggaTime: gpggaBucket[1].slice(0, 2) + ':' + gpggaBucket[1].slice(2, 4) + ':' + gpggaBucket[1].slice(4, 6) + '.' + gpggaBucket[1].slice(7),

                gpggaLatitude: this._parseLatitude(
                    gpggaBucket[2], gpggaBucket[3]
                ),
                gpggaLongitude: this._parseLongitude(
                    gpggaBucket[4], gpggaBucket[5]
                ),

                gpggaFix: true, gpggaSatelliteCount: parseInt(gpggaBucket[7])
            }
        }

        this._fireReadingEvent(gpggaObj)
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

            if (nmeaSentence.indexOf('$GPGGA') >= 0) this._parseGpggaSentence(nmeaSentence)
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
     * @return {Gpgga}
     */
    static getInstance(sensorCollection, sensorObj) {
        return new Gpgga(sensorObj.serialInterface)
    }
}

module.exports = Gpgga