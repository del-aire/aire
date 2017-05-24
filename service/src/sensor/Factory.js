const fs = require('fs')

module.exports = {
    /**
     * Get an instance of a sensor for a certain Json Object.
     *
     * @public
     *
     * @param {{}} sensorMapping
     * @param {{sensorName: String}} parsedJsonObject
     *
     * @return {Sensor}
     */
    getInstance(sensorMapping, parsedJsonObject) {
        const fileName = parsedJsonObject.sensorName.indexOf('.') >= 0 ?
            parsedJsonObject.sensorName.replace('.', '/') : parsedJsonObject.sensorName + '/' + parsedJsonObject.sensorName

        /**
         * Load the sensor File and access the `#.getInstance` Method.
         *
         * @type {Function}
         */
        const factoryMethod = require(__dirname + '/' + fileName).getInstance

        return factoryMethod(sensorMapping, parsedJsonObject)
    },

    /**
     * Parse a Json String and return a sensor Collection.
     *
     * @public
     *
     * @param {String} jsonString
     */
    parseJson(jsonString) {
        const sensorMapping = Object.create(null)

        /**
         * Convert the sensor Mapping to an Array.
         *
         * @type {Array}
         */
        let sensorCollection = []

        /**
         * @type {Array.<{uniqueId: String}>}
         */
        const parsedJsonString = JSON.parse(jsonString)

        parsedJsonString.forEach(aSensor => {
            sensorMapping[aSensor.uniqueId] = this.getInstance(sensorMapping, aSensor)
        })

        for (const sensorName in sensorMapping) sensorCollection.push(sensorMapping[sensorName])

        return sensorCollection
    },

    /**
     * Parse a Json File and return a sensor Collection.
     *
     * @public
     *
     * @param {String} jsonFile
     */
    async parseJsonFile(jsonFile) {
        /**
         * @type {Promise}
         */
        const jsonStructure = await new Promise((onFulfilled, onError) => {
            fs.readFile(jsonFile, 'utf8', (withError, jsonStructure) => {
                if (withError) return onError(withError)

                onFulfilled(jsonStructure)
            })
        })

        return this.parseJson(
            jsonStructure.toString()
        )
    }
}