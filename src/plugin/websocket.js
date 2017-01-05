// eslint-disable-next-line no-undef, no-use-before-define
const WS = typeof __dirname === 'undefined' ? WebSocket : require('ws')

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
 * OSC plugin for Websocket messaging
 */
export default class WebsocketPlugin {
  /**
   * Create an OSC Plugin instance with given options. Defaults to
   * localhost:8080 for Websocket server. Needs 'ws' npm package
   * @param {object} [options] Custom options
   * @param {string} [options.host='localhost'] Hostname of websocket server to bind to
   * @param {number} [options.port=8080] Port of websocket server to bind to
   *
   * @example
   * const plugin = new OSC.WebsocketPlugin({ port: 9912 })
   * const osc = new OSC({ plugin: plugin })
   */
  constructor(customOptions = {}) {
    /** @type {object} options
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
   * @return {number} Status ID
   */
  status() {
    return this.socketStatus
  }

  /**
   * Start a websocket server instance
   * @param {object} [customOptions] Custom options
   * @param {string} [customOptions.host='localhost'] Hostname of websocket server to bind to
   * @param {number} [customOptions.port=41234] Port of websocket server to bind to
   */
  open(customOptions = {}) {
    const options = Object.assign({}, this.options, customOptions)
    const { port, host } = options

    // close socket when already given
    if (this.socket) {
      this.close()
    }

    // create websocket server
    this.socket = new WS(`ws://${host}:${port}`)
    this.socket.binaryType = 'arraybuffer'
    this.socketStatus = STATUS.IS_CONNECTING

    // register events
    this.socket.onopen = () => {
      this.socketStatus = STATUS.IS_OPEN
      this.notify('open')
    }

    this.socket.onclose = () => {
      this.socketStatus = STATUS.IS_CLOSED
      this.notify('close')
    }

    this.socket.onerror = (error) => {
      this.notify('error', error)
    }

    this.socket.onmessage = (message) => {
      this.notify(message.data)
    }
  }

  /**
   * Close websocket
   */
  close() {
    this.socketStatus = STATUS.IS_CLOSING
    this.socket.close()
  }

  /**
   * Send an OSC Packet, Bundle or Message to Websocket clients
   * @param {Uint8Array} binary Binary representation of OSC Packet
   */
  send(binary) {
    this.socket.send(binary)
  }
}
