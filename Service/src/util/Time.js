module.exports = {
    /**
     * @public
     *
     * @return {Number}
     */
    getPreciseTimeInMilliseconds() {
        const hrTime = process.hrtime()

        /**
         * @type {Number}
         */
        return hrTime[0] * 1000 + hrTime[1] / 1000000
    }
}