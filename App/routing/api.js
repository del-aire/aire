module.exports = function (app) {
    /**
     * Uri: /api/*
     * Allowed Methods: GET, POST, PUT, DELETE
     */
    app.use('/api/*', async(req, res, next) => {
        /**
         * Turn off Caching for every Request made to the Api of the Application,
         * it could skew the Output.
         */
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Pragma', 'no-cache');
        res.set('Cache-Control', 'no-cache');

        next();
    });
}