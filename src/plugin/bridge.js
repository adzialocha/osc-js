const dgram = typeof __dirname !== 'undefined' ? require('dgram') : undefined
const WebSocketServer = typeof __dirname !== 'undefined' ? require('isomorphic-ws').Server : undefined

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
  udpServer: {
    host: 'localhost',
    port: 41234,
    exclusive: false,
  },
  udpClient: {
    host: 'localhost',
    port: 41235,
  },
  wsServer: {
    host: 'localhost',
    port: 8080,
  },
  receiver: 'ws',
}

/**
 * Helper method to merge nested objects
 * @private
 */
function mergeOptions(base, custom) {
  return {
    ...defaultOptions,
    ...base,
    ...custom,
    udpServer: { ...defaultOptions.udpServer, ...base.udpServer, ...custom.udpServer },
    udpClient: { ...defaultOptions.udpClient, ...base.udpClient, ...custom.udpClient },
    wsServer: { ...defaultOptions.wsServer, ...base.wsServer, ...custom.wsServer },
  }
}

/**
 * OSC plugin for setting up communication between a Websocket
 * client and a udp client with a bridge inbetween
 */
export default class BridgePlugin {
  /**
   * Create an OSC Bridge instance with given options. Defaults to
   * localhost:41234 for udp server, localhost:41235 for udp client and
   * localhost:8080 for Websocket server
   * @param {object} [options] Custom options
   * @param {string} [options.udpServer.host='localhost'] Hostname of udp server to bind to
   * @param {number} [options.udpServer.port=41234] Port of udp server to bind to
   * @param {boolean} [options.udpServer.exclusive=false] Exclusive flag
   * @param {string} [options.udpClient.host='localhost'] Hostname of udp client for messaging
   * @param {number} [options.udpClient.port=41235] Port of udp client for messaging
   * @param {string} [options.wsServer.host='localhost'] Hostname of Websocket server
   * @param {number} [options.wsServer.port=8080] Port of Websocket server
   * @param {http.Server|https.Server} [options.wsServer.server] Optional: a pre-created Node.js HTTP/S server to be used instead of creating a new one
   * @param {string} [options.receiver='ws'] Where messages sent via 'send' method will be
   * delivered to, 'ws' for Websocket clients, 'udp' for udp client
   *
   * @example
   * const plugin = new OSC.BridgePlugin({ wsServer: { port: 9912 } })
   * const osc = new OSC({ plugin: plugin })
   *
   * @example <caption>Using an existing HTTP server</caption>
   * const http = require('http')
   * const httpServer = http.createServer();
   * const plugin = new OSC.BridgePlugin({ wsServer: { server: httpServer } })
   * const osc = new OSC({ plugin: plugin })
   */
  constructor(customOptions = {}) {
    if (!dgram || !WebSocketServer) {
      throw new Error('BridgePlugin can not be used in browser context')
    }

    /** @type {object} options
     * @private
     */
    this.options = mergeOptions({}, customOptions)

    /**
     * @type {object} websocket
     * @private
     */
    this.websocket = null

    /**
     * @type {object} socket
     * @private
     */
    this.socket = dgram.createSocket('udp4')
    /**
     * @type {number} socketStatus
     * @private
     */
    this.socketStatus = STATUS.IS_NOT_INITIALIZED

    // register udp events
    this.socket.on('message', (message) => {
      this.send(message, { receiver: 'ws' })
      this.notify(message.buffer)
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
    const options = mergeOptions(this.options, customOptions)

    this.socketStatus = STATUS.IS_CONNECTING

    // bind udp server
    this.socket.bind({
      address: options.udpServer.host,
      port: options.udpServer.port,
      exclusive: options.udpServer.exclusive,
    }, () => {
      let wsServerOptions = {};
      if (options.wsServer.server) wsServerOptions.server = options.wsServer.server;
      else wsServerOptions = options.wsServer;
      // bind Websocket server
      this.websocket = new WebSocketServer(wsServerOptions)
      this.websocket.binaryType = 'arraybuffer'

      // register Websocket events
      this.websocket.on('listening', () => {
        this.socketStatus = STATUS.IS_OPEN
        this.notify('open')
      })

      this.websocket.on('error', (error) => {
        this.notify('error', error)
      })

      this.websocket.on('connection', (client) => {
        client.on('message', (message, rinfo) => {
          this.send(message, { receiver: 'udp' })
          this.notify(new Uint8Array(message), rinfo)
        })
      })
    })
  }

  /**
   * Close udp socket and Websocket server
   */
  close() {
    this.socketStatus = STATUS.IS_CLOSING

    // close udp socket
    this.socket.close(() => {
      // close Websocket
      this.websocket.close(() => {
        this.socketStatus = STATUS.IS_CLOSED
        this.notify('close')
      })
    })
  }

  /**
   * Send an OSC Packet, Bundle or Message. Use options here for
   * custom receiver, otherwise the global options will be taken
   * @param {Uint8Array} binary Binary representation of OSC Packet
   * @param {object} [customOptions] Custom options
   * @param {string} [customOptions.udpClient.host='localhost'] Hostname of udp client for messaging
   * @param {number} [customOptions.udpClient.port=41235] Port of udp client for messaging
   * @param {string} [customOptions.receiver='ws'] Messages will be delivered to Websocket ('ws')
   * clients or udp client ('udp')
   */
  send(binary, customOptions = {}) {
    const options = mergeOptions(this.options, customOptions)
    const { receiver } = options

    if (receiver === 'udp') {
      // send data to udp client
      const data = binary instanceof Buffer ? binary : Buffer.from(binary)
      this.socket.send(
        data,
        0,
        data.byteLength,
        options.udpClient.port,
        options.udpClient.host,
      )
    } else if (receiver === 'ws') {
      // send data to all Websocket clients
      this.websocket.clients.forEach((client) => {
        client.send(binary, { binary: true })
      })
    } else {
      throw new Error('BridgePlugin can not send message to unknown receiver')
    }
  }
}
