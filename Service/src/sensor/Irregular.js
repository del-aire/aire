const Sensor = require('./Sensor')

/**
 * @abstract
 *
 * @class {Irregular}
 */
class Irregular extends Sensor {
    /**
     * @constructor
     */
    constructor() {
        super(Sensor.OperationModeIrregular)
    }
}

module.exports = Irregular