import OSCBase from '../src/osc'

import WebsocketBrowserPlugin from '../src/plugin/wsbrowser'

const defaultOptions = {
  plugin: new WebsocketBrowserPlugin(),
}

class OSC extends OSCBase {
  constructor(options) {
    super(Object.assign({}, defaultOptions, options))
  }
}

OSC.WebsocketBrowserPlugin = WebsocketBrowserPlugin

export default OSC
