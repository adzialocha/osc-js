// eslint-disable-next-line no-undef, no-use-before-define
const WS = typeof __dirname === 'undefined' ? WebSocket : require('ws')

const STATUS = {
  IS_NOT_INITIALIZED: -1,
  IS_CONNECTING: 0,
  IS_OPEN: 1,
  IS_CLOSING: 2,
  IS_CLOSED: 3,
}

const defaultOptions = {
  host: 'localhost',
  port: 8080,
}

export default class WebsocketPlugin {
  constructor(customOptions = {}) {
    this.options = Object.assign({}, defaultOptions, customOptions)

    this.socket = null
    this.socketStatus = STATUS.IS_NOT_INITIALIZED

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
    const options = Object.assign({}, this.options, customOptions)
    const { port, host } = options

    if (this.socket) {
      this.close()
    }

    this.socket = new WS(`ws://${host}:${port}`)
    this.socket.binaryType = 'arraybuffer'
    this.socketStatus = STATUS.IS_CONNECTING

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

  close() {
    this.socketStatus = STATUS.IS_CLOSING
    this.socket.close()
  }

  send(binary) {
    this.socket.send(binary)
  }
}
