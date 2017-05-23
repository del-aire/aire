module.exports = function (app) {
    /**
     * Uri: /an-unknown-path
     * Allowed Methods: GET, POST, PUT, DELETE
     */
    app.use('*', async(req, res) => {
        return res.status(404).render('404')
    })
}