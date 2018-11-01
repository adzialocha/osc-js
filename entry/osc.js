import OSCBase from '../src/osc'

import BridgePlugin from '../src/plugin/bridge'
import DatagramPlugin from '../src/plugin/dgram'
import WebsocketClientPlugin from '../src/plugin/wsclient'
import WebsocketServerPlugin from '../src/plugin/wsserver'

const defaultOptions = {
  plugin: new WebsocketClientPlugin(),
}

class OSC extends OSCBase {
  constructor(options) {
    super(Object.assign({}, defaultOptions, options))
  }
}

OSC.BridgePlugin = BridgePlugin
OSC.DatagramPlugin = DatagramPlugin
OSC.WebsocketClientPlugin = WebsocketClientPlugin
OSC.WebsocketServerPlugin = WebsocketServerPlugin

export default OSC
