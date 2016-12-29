const dgram = typeof __dirname !== 'undefined' ? require('dgram') : undefined
const WebSocket = typeof __dirname !== 'undefined' ? require('ws').Server : undefined

const STATUS = {
  IS_NOT_INITIALIZED: -1,
  IS_CONNECTING: 0,
  IS_OPEN: 1,
  IS_CLOSING: 2,
  IS_CLOSED: 3,
}

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

function mergeOptions(base, custom) {
  return Object.assign({}, defaultOptions, base, custom, {
    udpServer: Object.assign({}, defaultOptions.udpServer, base.udpServer, custom.udpServer),
    udpClient: Object.assign({}, defaultOptions.udpClient, base.udpClient, custom.udpClient),
    wsServer: Object.assign({}, defaultOptions.wsServer, base.wsServer, custom.wsServer),
  })
}

export default class BridgePlugin {
  constructor(customOptions = {}) {
    if (!dgram || !WebSocket) {
      throw new Error('BridgePlugin can not be used in browser context.')
    }

    this.options = mergeOptions({}, customOptions)

    // prepare websocket
    this.websocket = null

    // create udp socket and register events
    this.socket = dgram.createSocket('udp4')

    this.socket.on('message', (message) => {
      this.send(message, { receiver: 'ws' })
      this.notify(message.buffer)
    })

    this.socket.on('error', (error) => {
      this.notify('error', error)
    })

    // prepare notify method
    this.notify = () => {}
  }

  registerNotify(fn) {
    this.notify = fn
  }

  status() {
    return this.socketStatus
  }

  open(customOptions = {}) {
    const options = mergeOptions(this.options, customOptions)

    this.socketStatus = STATUS.IS_CONNECTING

    // bind udp server
    this.socket.bind({
      address: options.udpServer.host,
      port: options.udpServer.port,
      exclusive: options.udpServer.exclusive,
    }, () => {
      // bind websocket server
      this.websocket = new WebSocket({ host: options.wsServer.host, port: options.wsServer.port })
      this.websocket.binaryType = 'arraybuffer'

      this.websocket.on('error', (error) => {
        this.notify('error', error)
      })

      this.websocket.on('connection', (client) => {
        client.on('message', (message) => {
          this.send(message, { receiver: 'udp' })
          this.notify(new Uint8Array(message))
        })
      })

      this.notify('open')
    })
  }

  close() {
    this.socketStatus = STATUS.IS_CLOSING

    this.socket.close(() => {
      this.socketStatus = STATUS.IS_CLOSED
      this.notify('close')

      this.websocket.close()
    })
  }

  send(binary, customOptions = {}) {
    const options = mergeOptions(this.options, customOptions)
    const { receiver } = options

    if (receiver === 'udp') {
      const data = binary instanceof Buffer ? binary : new Buffer(binary)
      this.socket.send(
        data,
        0,
        data.byteLength,
        options.udpClient.port,
        options.udpClient.host,
      )
    } else if (receiver === 'ws') {
      this.websocket.clients.forEach((client) => {
        client.send(binary, { binary: true })
      })
    } else {
      throw new Error('BridgePlugin can not send message to unknown receiver.')
    }
  }
}
