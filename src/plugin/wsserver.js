const WebsocketServer = typeof __dirname !== 'undefined' ? require('ws').Server : undefined

/**
 * Status flags
 * @private
 */
const STATUS = {
  IS_NOT_INITIALIZED: -1,
  IS_CONNECTING: 0,
  IS_OPEN: 1,
  IS_CLOSING: 2,
  IS_CLOSED: 3,
}

/**
 * Default options
 * @private
 */
const defaultOptions = {
  host: 'localhost',
  port: 8080,
}

/**
 * OSC plugin for a Websocket client running in node or browser context
 */
export default class WebsocketServerPlugin {
  /**
   * Create an OSC WebsocketServerPlugin instance with given options.
   * Defaults to *localhost:8080* for the Websocket server
   * @param {object} [options] Custom options
   * @param {string} [options.host='localhost'] Hostname of Websocket server
   * @param {number} [options.port=8080] Port of Websocket server
   *
   * @example
   * const plugin = new OSC.WebsocketServerPlugin({ port: 9912 })
   * const osc = new OSC({ plugin: plugin })
   *
   * osc.open() // start server
   */
  constructor(customOptions) {
    if (!WebsocketServer) {
      throw new Error('WebsocketServerPlugin can not be used in browser context')
    }

    /**
     * @type {object} options
     * @private
     */
    this.options = Object.assign({}, defaultOptions, customOptions)

    /**
     * @type {object} socket
     * @private
     */
    this.socket = null
    /**
     * @type {number} socketStatus
     * @private
     */
    this.socketStatus = STATUS.IS_NOT_INITIALIZED

    /**
     * @type {function} notify
     * @private
     */
    this.notify = () => {}
  }

  /**
   * Internal method to hook into osc library's
   * EventHandler notify method
   * @param {function} fn Notify callback
   * @private
   */
  registerNotify(fn) {
    this.notify = fn
  }

  /**
   * Returns the current status of the connection
   * @return {number} Status identifier
   */
  status() {
    return this.socketStatus
  }

  /**
   * Start a Websocket server. Defaults to global options
   * @param {object} [customOptions] Custom options
   * @param {string} [customOptions.host] Hostname of Websocket server
   * @param {number} [customOptions.port] Port of Websocket server
   */
  open(customOptions = {}) {
    const options = Object.assign({}, this.options, customOptions)
    const { port, host } = options

    // close socket when already given
    if (this.socket) {
      this.close()
    }

    // create websocket server
    this.socket = new WebsocketServer({ host, port })
    this.socket.binaryType = 'arraybuffer'
    this.socketStatus = STATUS.IS_CONNECTING

    // register events
    this.socket.on('listening', () => {
      this.socketStatus = STATUS.IS_OPEN
      this.notify('open')
    })

    this.socket.on('error', (error) => {
      this.notify('error', error)
    })

    this.socket.on('connection', (client) => {
      client.on('message', (message) => {
        this.notify(new Uint8Array(message))
      })
    })
  }

  /**
   * Close Websocket server
   */
  close() {
    this.socketStatus = STATUS.IS_CLOSING

    this.socket.close(() => {
      this.socketStatus = STATUS.IS_CLOSED
      this.notify('close')
    })
  }

  /**
   * Send an OSC Packet, Bundle or Message to Websocket clients
   * @param {Uint8Array} binary Binary representation of OSC Packet
   */
  send(binary) {
    this.socket.clients.forEach((client) => {
      client.send(binary, { binary: true })
    })
  }
}
