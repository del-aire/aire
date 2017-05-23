const net = require('net')

/**
 * @class {Client}
 */
class Client {
    /**
     * @constructor
     *
     * @param {{retryMax: Number, waitStrategy: {getTimeout: Function, resetTimeout: Function}}
     *
     * @return {Client}
     */
    constructor(clientConf = {retryMax: 4, waitStrategy: Client.BackOff.call(null, 200)}) {
        /**
         * @type {Number}
         */
        this.retryMax = clientConf.retryMax

        /**
         * Is decreased once a connection to the Server has failed. Is reset
         * to `#.retryMax` if the connection is successful.
         *
         * @type {Number}
         */
        this._retryMax = this.retryMax

        /**
         * @type {{getTimeout: Function, resetTimeout: Function}}
         */
        this.waitStrategy = clientConf.waitStrategy

        /**
         * @type {String}
         */
        this.cargoBuffer = ''

        /**
         * @type {String}
         */
        this.eventDelimiter = '\0'

        /**
         * @type {Socket}
         */
        this.ipcSocket = null

        /**
         * @type {{}}
         */
        this.eventMapping = Object.create(null)
    }

    /**
     * @private
     *
     * #.publish
     *
     * Publish an Event to anyone interested.
     *
     * @param {String} eventName
     * @param {*} argCollection
     */
    publish(eventName, ...argCollection) {
        const callbackSet = this.eventMapping[eventName]

        if (!callbackSet) return

        callbackSet.forEach(callbackFunction => {
            callbackFunction.apply(null, argCollection)
        })
    }

    /**
     * #.connect
     *
     * Create the actual connection to the Server.
     *
     * @return {Client}
     */
    connect(unixPath) {
        let ipcSocket

        /**
         * @type {Socket}
         */
        this.ipcSocket = ipcSocket = net.connect(unixPath)

        ipcSocket.on('connect',
            () => {
                /**
                 * Reset the `#._retryMax` so that the Client will try to reconnect
                 * when the Server isn't responding.
                 *
                 * @type {Number}
                 */
                this._retryMax = this.retryMax

                /**
                 * @see `Client.Fixed` and `Client.BackOff`
                 */
                this.waitStrategy.resetTimeout()

                this.publish('connect')
            }
        )

        ipcSocket.on('error',
            (withError) => {
                this.publish('error', withError)
            }
        )

        ipcSocket.on('close',
            () => {
                /**
                 * Try to reconnect to the Server.
                 *
                 * @see {this._retryMax}
                 */
                if (this._retryMax > 0) {
                    process.nextTick(
                        () => {
                            setTimeout(
                                () => {
                                    this._retryMax--

                                    this.connect(unixPath)
                                }, this.waitStrategy.getTimeout()
                            )
                        }
                    )

                    this.publish('disconnect')

                    return
                }

                /**
                 * We've tried reconnecting, but we were unsuccessful. Cleanup
                 * the Socket.
                 *
                 * @see {this._retryMax}
                 */
                ipcSocket.destroy()

                this.publish('destroy')
            }
        )

        ipcSocket.on('data', (dataChunk) => {
            /**
             * Append the data to our internal String buffer. Check if a new
             * message has arrived.
             *
             * @type {String}
             */
            this.cargoBuffer = this.cargoBuffer.concat(dataChunk)

            if (this.cargoBuffer.lastIndexOf(this.eventDelimiter) > -1) {
                /**
                 * Publish each new message.
                 *
                 * @type {Array}
                 */
                const messageCollection = this.cargoBuffer.split(this.eventDelimiter)

                /**
                 * @type {String}
                 */
                this.cargoBuffer = messageCollection.pop()

                messageCollection.forEach(aMessage => {
                    if (!aMessage) return

                    /**
                     * The parsed Json message.
                     *
                     * @type {{eventName: String, hauledCargo: *}}
                     */
                    aMessage = JSON.parse(aMessage)

                    this.publish(aMessage.eventName, aMessage.hauledCargo)
                })
            }
        })

        return this
    }

    /**
     * #.emit
     *
     * Emit an Event, it will be sent to the Server.
     *
     * @param {String} eventName
     * @param {{}} haulCargo
     *
     * @return {Client}
     */
    emit(eventName, haulCargo) {
        this.ipcSocket.write(
            JSON.stringify(
                {
                    eventName: eventName,
                    hauledCargo: haulCargo
                }
            ) + this.eventDelimiter
        )

        return this
    }

    /**
     * #.on
     *
     * Listen to a particular Event.
     *
     * @param {String} eventName
     * @param {Function} callbackFunction
     *
     * @return {Client}
     */
    on(eventName, callbackFunction) {
        if (!this.eventMapping[eventName]) this.eventMapping[eventName] = new Set()

        this.eventMapping[eventName].add(callbackFunction)

        return this
    }

    /**
     * #.removeEventListener
     *
     * @param {String} eventName
     * @param {Function} callbackFunction
     *
     * @return {Boolean}
     */
    removeEventListener(eventName, callbackFunction) {
        if (!this.eventMapping[eventName]) return false

        return this.eventMapping[eventName].delete(callbackFunction)
    }

    /**
     * #.destroy
     *
     * Close the connection to the Server.
     *
     * @return {Client}
     */
    destroy() {
        this.ipcSocket.destroy(), this.ipcSocket = null

        /**
         * @type {{}}
         */
        this.eventMapping = Object.create(null)

        return this
    }
}

/**
 * @param {Number} timeoutInMilliseconds
 *
 * @return {{getTimeout: Function, resetTimeout: Function}}
 */
Client.Fixed = function (timeoutInMilliseconds) {
    return {
        /**
         * #.getTimeout
         *
         * @return {Number}
         */
        getTimeout: () => {
            return timeoutInMilliseconds
        },

        /**
         * #.resetTimeout
         */
        resetTimeout: () => {

        }
    }
}

/**
 * @param {Number} stepInMilliseconds
 * @param {Number} cPow Ex. 4. If the `#.retryCount` is above 7, we'll pick
 *                 a random number between 2^4 - 1 and use that to multiply the
 *                 `#.stepInMilliseconds`;
 *
 * @return {{getTimeout: Function, resetTimeout: Function}}
 *
 * @noteToSelf: verify that Math.random() is random enough for our purpose.
 */
Client.BackOff = function (stepInMilliseconds, cPow = 4) {
    /**
     * @type {Number}
     */
    let retryCount = 0

    /**
     * @see #.getTimeout
     *
     * Used to generate a random number between 0 and `#.maxC` determining the timeout while reconnecting to the server,
     * add + 1 because of the usage of Math.random();
     *
     * @type {Number}
     */
    let maxC = Math.pow(2, cPow) + 1

    return {
        /**
         * #.getTimeout
         *
         * @return {Number}
         */
        getTimeout: () => {
            let betweenZeroAndX

            if (retryCount < 2) {
                /**
                 * 1st Attempt, when `#.retryCount` is equal to 0: [ 0, stepInMilliseconds ]
                 * 2nd Attempt, when `#.retryCount` is equal to 1: [ 0, stepInMilliseconds, stepInMilliseconds * 2 ]
                 *
                 * @type {Number}
                 */
                betweenZeroAndX = retryCount + 2
            }
            else if (retryCount < 8) {
                /**
                 * Pick a random number between 0 and 2^3 - 1. Because Math.random() is generating between 0 (Inclusive)
                 * and 1 (Not Inclusive) we'll need to use 2^3 as `#.betweenZeroAndX`.
                 *
                 * @type {Number}
                 */
                betweenZeroAndX = 8
            }
            else {
                /**
                 * Pick a random number between 0 and 2^cPow.
                 *
                 * @type {Number}
                 */
                betweenZeroAndX = maxC
            }

            /**
             * @type {Number}
             */
            retryCount++

            return stepInMilliseconds * Math.floor(Math.random() * betweenZeroAndX)
        },

        /**
         * #.resetTimeout
         */
        resetTimeout: () => {
            retryCount = 0
        }
    }
}

module.exports = Client