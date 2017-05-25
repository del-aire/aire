const net = require('net')

/**
 * @class {Server}
 */
class Server {
    /**
     * @constructor
     *
     * @return {Server}
     */
    constructor() {
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
        this.ipcServer = null

        /**
         * @type {Set}
         */
        this.socketSet = new Set()

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
     * Trigger an Event.
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
     * #.createServer
     *
     * Start the Inter Process Server.
     *
     * @param {String} unixPath
     *
     * @return {Server}
     */
    listen(unixPath) {
        let ipcServer

        /**
         * @type {Socket}
         */
        this.ipcServer = ipcServer = net.createServer({}, aSocket => {
            this.socketSet.add(aSocket)

            aSocket.on('error',
                (withError) => {
                    this.publish('socketError', withError)
                }
            )

            aSocket.on('close',
                () => {
                    this.socketSet.delete(aSocket)

                    this.publish('socketClose', aSocket)
                }
            )

            aSocket.on('data',
                (dataChunk) => {
                    /**
                     * Store the data in our local String buffer.
                     *
                     * @type {String}
                     */
                    this.cargoBuffer = this.cargoBuffer.concat(dataChunk)

                    if (this.cargoBuffer.lastIndexOf(this.eventDelimiter) > -1) {
                        /**
                         * @type {Array}
                         */
                        let messageCollection = this.cargoBuffer.split(this.eventDelimiter)

                        /**
                         * @type {String}
                         */
                        this.cargoBuffer = messageCollection.pop()

                        messageCollection.forEach(aMessage => {
                            if (!aMessage) return

                            /**
                             * The Json message.
                             *
                             * @type {{eventName: String, hauledCargo: *}}
                             */
                            const {eventName, hauledCargo} = JSON.parse(aMessage)

                            this.publish(eventName, hauledCargo)

                            /**
                             * Pass through the information to every Socket that is
                             * connected to our Server.
                             *
                             * @see {this.socketSet}
                             */
                            this.emit(eventName, hauledCargo, aSocket)
                        })
                    }
                }
            )

            this.publish('socketConnect', aSocket)
        })

        ipcServer.on('error',
            (withError) => {
                process.nextTick(
                    () => {
                        this.publish('error', withError)
                    }
                )
            }
        )

        ipcServer.on('close',
            () => {
                this.publish('close')
            }
        )

        ipcServer.listen(unixPath,
            () => {
                this.publish('start')
            }
        )

        return this
    }

    /**
     * #.emit
     *
     * Send data to each Client connected to this Server.
     *
     * @param {String} eventName
     * @param {{}} haulCargo
     * @param {Socket} ignoreSocket
     *
     * @return {Server}
     */
    emit(eventName, haulCargo, ignoreSocket = null) {
        /**
         * @type {String}
         */
        const writeCargo = JSON.stringify({
                eventName: eventName,
                hauledCargo: haulCargo
            }) + this.eventDelimiter

        this.socketSet.forEach(aSocket => {
            if (aSocket === ignoreSocket) return

            /**
             * Send our data to a particular Socket.
             *
             * @see {writeCargo}
             */
            aSocket.write(writeCargo)
        })

        return this
    }

    /**
     * #.on
     *
     * @param {String} eventName
     * @param {Function} callbackFunction
     *
     * @return {Server}
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
     * #.close
     *
     * @return {Server}
     */
    close() {
        this.ipcServer.close()

        return this
    }

    /**
     * #.destroy
     *
     * @return {Server}
     */
    destroy() {
        this.ipcServer.close(), this.eventMapping = Object.create(null)

        return this
    }
}

module.exports = Server