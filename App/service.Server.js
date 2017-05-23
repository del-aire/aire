/**
 * +--------------------------------------------------
 * | Express
 * +--------------------------------------------------
 */
const express = require('express'), session = require('express-session')

/**
 * +--------------------------------------------------
 * | Body Parser
 * +--------------------------------------------------
 */
const bodyParser = require('body-parser')

/**
 * +--------------------------------------------------
 * | Express Application Instance
 * +--------------------------------------------------
 */
const app = express()

/**
 * +--------------------------------------------------
 * | Cookies
 * +--------------------------------------------------
 *
 app.use(
 session({
        name: 'aire',
        cookie: {
            secure: true
        },
        resave: false,
        saveUninitialized: false,
        secret: process.env.SECRET
    })
 )
 */

/**
 * +--------------------------------------------------
 * | Json Parser
 * +--------------------------------------------------
 */
app.use(
    bodyParser.json()
)

/**
 * +--------------------------------------------------
 * | Pug
 * +--------------------------------------------------
 */
app.set('views', 'view')
app.set('view engine', 'pug')

/**
 * +--------------------------------------------------
 * | Security
 * +--------------------------------------------------
 *
 * Disable unnecessary information emitted by Express.
 */
app.disable(
    'X-Powered-By'.toLowerCase()
)

/**
 * +--------------------------------------------------
 * | Public Directory
 * +--------------------------------------------------
 *
 * Our Public Directory is being used to store CSS, (a)
 * custom Font(s) and more.
 */
app.use(
    express.static('public', {maxAge: 86400 * 1000})
)

/**
 * +--------------------------------------------------
 * | Routing
 * +--------------------------------------------------
 */
const routingDispatch = [
    'app',

    'api',
    'api.Sensor',

    'error.404',
    'error.50x'
]

routingDispatch.forEach(fileName => {
    require(__dirname + `/routing/${fileName}`)(app)
})

app.listen(80, () => {
    console.log(`Application up and running on 80.`)
})