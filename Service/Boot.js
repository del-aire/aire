/**
 * +--------------------------------------------------
 * | Configuration
 * +--------------------------------------------------
 */
const appConfig = require('./config.App.json')

/**
 * +--------------------------------------------------
 * | Intel
 * +--------------------------------------------------
 *
 * Useful for Debugging and Logging.
 */
const intel = require('intel'), intelLogger = intel.getLogger('intel')
intelLogger.addHandler(
    new intel.handlers.File(__dirname + '/' + appConfig.logFile)
)
intelLogger.setLevel(
    intelLogger.VERBOSE
)

module.exports = {appConfig: appConfig, intelLogger: intelLogger}