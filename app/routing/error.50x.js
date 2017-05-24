module.exports = function (app) {
    /**
     * Used when an Unknown Error occurred.
     *
     * Uri: *
     * Allowed Methods: GET, POST, PUT, DELETE
     */
    app.use(async(withError, req, res) => {
        /**
         *
         * Log!
         *
         */

        return res.status(500).render('500')
    })
}