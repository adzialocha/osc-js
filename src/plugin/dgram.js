const dgram = typeof __dirname !== 'undefined' ? require('dgram') : undefined

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
 * Default options for open method
 * @private
 */
const defaultOpenOptions = {
  host: 'localhost',
  port: 41234,
  exclusive: false,
}

/**
 * Default options for send method
 * @private
 */
const defaultSendOptions = {
  host: 'localhost',
  port: 41235,
}

/**
 * Default options
 * @private
 */
const defaultOptions = {
  type: 'udp4',
  open: defaultOpenOptions,
  send: defaultSendOptions,
}

/**
 * Helper method to merge nested objects
 * @private
 */
function mergeOptions(base, custom) {
  return Object.assign({}, defaultOptions, base, custom, {
    open: Object.assign({}, defaultOptions.open, base.open, custom.open),
    send: Object.assign({}, defaultOptions.send, base.send, custom.send),
  })
}

/**
 * OSC plugin for simple OSC messaging via udp client
 * and udp server
 */
export default class DatagramPlugin {
  /**
   * Create an OSC Plugin instance with given options. Defaults to
   * localhost:41234 for server and localhost:41235 for client messaging
   * @param {object} [options] Custom options
   * @param {string} [options.type='udp4'] 'udp4' or 'udp6'
   * @param {string} [options.open.host='localhost'] Hostname of udp server to bind to
   * @param {number} [options.open.port=41234] Port of udp server to bind to
   * @param {boolean} [options.open.exclusive=false] Exclusive flag
   * @param {string} [options.send.host='localhost'] Hostname of udp client for messaging
   * @param {number} [options.send.port=41235] Port of udp client for messaging
   *
   * @example
   * const plugin = new OSC.DatagramPlugin({ send: { port: 9912 } })
   * const osc = new OSC({ plugin: plugin })
   */
  constructor(customOptions = {}) {
    if (!dgram) {
      throw new Error('DatagramPlugin can not be used in browser context')
    }

    /**
     * @type {object} options
     * @private
     */
    this.options = mergeOptions({}, customOptions)

    /**
     * @type {object} socket
     * @private
     */
    this.socket = dgram.createSocket(this.options.type)
    /**
     * @type {number} socketStatus
     * @private
     */
    this.socketStatus = STATUS.IS_NOT_INITIALIZED

    // register events
    this.socket.on('message', (message) => {
      this.notify(message)
    })

    this.socket.on('error', (error) => {
      this.notify('error', error)
    })

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
   * Bind a udp socket to a hostname and port
   * @param {object} [customOptions] Custom options
   * @param {string} [customOptions.host='localhost'] Hostname of udp server to bind to
   * @param {number} [customOptions.port=41234] Port of udp server to bind to
   * @param {boolean} [customOptions.exclusive=false] Exclusive flag
   */
  open(customOptions = {}) {
    const options = Object.assign({}, this.options.open, customOptions)
    const { port, exclusive } = options

    this.socketStatus = STATUS.IS_CONNECTING

    this.socket.bind({
      address: options.host,
      port,
      exclusive,
    }, () => {
      this.socketStatus = STATUS.IS_OPEN
      this.notify('open')
    })
  }

  /**
   * Close udp socket
   */
  close() {
    this.socketStatus = STATUS.IS_CLOSING

    this.socket.close(() => {
      this.socketStatus = STATUS.IS_CLOSED
      this.notify('close')
    })
  }

  /**
   * Send an OSC Packet, Bundle or Message. Use options here for
   * custom port and hostname, otherwise the global options will
   * be taken
   * @param {Uint8Array} binary Binary representation of OSC Packet
   * @param {object} [customOptions] Custom options for udp socket
   * @param {string} [customOptions.host] Hostname of udp client
   * @param {number} [customOptions.port] Port of udp client
   */
  send(binary, customOptions = {}) {
    const options = Object.assign({}, this.options.send, customOptions)
    const { port, host } = options

    this.socket.send(Buffer.from(binary), 0, binary.byteLength, port, host)
  }
}
