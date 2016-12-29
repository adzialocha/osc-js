const dgram = typeof __dirname !== 'undefined' ? require('dgram') : undefined

const STATUS = {
  IS_NOT_INITIALIZED: -1,
  IS_CONNECTING: 0,
  IS_OPEN: 1,
  IS_CLOSING: 2,
  IS_CLOSED: 3,
}

const defaultBindOptions = {
  host: 'localhost',
  port: 41234,
  exclusive: false,
}

const defaultSendOptions = {
  host: 'localhost',
  port: 41234,
}

const defaultOptions = {
  type: 'udp4',
  bind: defaultBindOptions,
  send: defaultSendOptions,
}

export default class DatagramPlugin {
  constructor(customOptions = {}) {
    if (!dgram) {
      throw new Error('DatagramPlugin can not be used in browser context.')
    }

    this.options = Object.assign({}, defaultOptions, customOptions)

    // create udp socket and register events
    this.socket = dgram.createSocket(this.options.type)
    this.socketStatus = STATUS.IS_NOT_INITIALIZED

    this.socket.on('message', (message) => {
      this.notify(message)
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
    const options = Object.assign({}, this.options.bindOptions, customOptions)
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

  close() {
    this.socketStatus = STATUS.IS_CLOSING

    this.socket.close(() => {
      this.socketStatus = STATUS.IS_CLOSED
      this.notify('close')
    })
  }

  send(binary, customOptions = {}) {
    const options = Object.assign({}, this.options.sendOptions, customOptions)
    const { port, host } = options

    this.socket.send(new Buffer(binary), 0, binary.byteLength, port, host)
  }
}
