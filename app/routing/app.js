module.exports = function (app) {
    /**
     * Uri: /
     * Method: GET, POST, PUT, DELETE
     */
    app.all('/', async(req, res) => {

        return res.render('App')
    })
}