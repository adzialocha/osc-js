osc-js
======

<p>
  <a href="https://travis-ci.org/adzialocha/osc-js">
    <img src="https://img.shields.io/travis/adzialocha/osc-js/master.svg?style=flat-square" alt="Build status">
  </a>
  <a href="https://www.npmjs.org/package/osc-js">
    <img src="https://img.shields.io/npm/v/osc-js.svg?style=flat-square" alt="npm version">
  </a>
  <a href="http://spdx.org/licenses/MIT">
    <img src="https://img.shields.io/npm/l/osc-js.svg?style=flat-square" alt="npm licence">
  </a>
  <a href="https://adzialocha.github.io/osc-js/">
    <img src="https://adzialocha.github.io/osc-js/badge.svg" alt="ESDoc status">
  </a>
</p>

osc-js is an [Open Sound Control](http://opensoundcontrol.org/) library for all your JavaScript applications (UMD module for Node, Browser etc.) with address pattern matching and timetag handling. Sends messages via *UDP*, *WebSocket* or both (bridge mode) and offers a highly customizable Plugin API for your own network solutions.

[Wiki](https://github.com/adzialocha/osc-js/wiki) | [Basic Usage](https://github.com/adzialocha/osc-js/wiki/Basic-Usage) | [ESDoc Documentation](https://adzialocha.github.io/osc-js/) | [Plugin API](https://github.com/adzialocha/osc-js/wiki/Plugin-API)

## Features

- UMD Module running in Node.js, Electron, Chrome Apps, your browser or any other JS environment
- can be used with Webpack and Browserify
- no dependencies (except of `ws` in Node.js or similar environments)
- simple interface
- built-in *UDP*, *WebSocket* networking support as plugins
- special bridge plugin for easy communication between *UDP*- and *WebSocket* clients
- Plugin API for your own custom networking solutions
- featuring all [OSC 1.0 specifications](http://opensoundcontrol.org/spec-1_0)
- OSC Address pattern matching
- time-critical OSC Bundles with Timetags
- osc-js is written in ES6 :-)

## Documentation

Read more about osc-js and how to use it in the [Wiki](https://github.com/adzialocha/osc-js/wiki).

## Example

```js
const osc = new OSC()

osc.on('/param/density', (message) => {
  console.log(message.args)
})

osc.on(['param', 'volume'], (message) => {
  console.log(message.args)
})

osc.on('open', () => {
  const message = new OSC.Message('/test', 12.221, 'hello')
  osc.send(message)

  const bundle = new OSC.Bundle(Date.now() + 5000)
  bundle.add(message)
  osc.send(bundle, { host: '192.168.178.5' })
})

osc.open({ port: 9000 })
```

## Installation and Usage

Recommended installation via bower `bower install osc-js --save` or npm `npm install osc-js --save`.

Import the library `const OSC = require('osc-js')` or add the script `dist/osc.js` or `dist/osc.min.js` (minified version) for usage in a browser.

To build the library with Webpack or similar tools without errors, use the `alias` configuration and point the module to `node_modules/osc-js/lib/osc.browser.js`. Read more about bundling issues here: [Webpack Bundling](https://github.com/adzialocha/osc-js/wiki/Webpack-bundling).

## Plugins

osc-js offers a plugin architecture for extending it's networking capabilities. The library comes already with four built-in plugins. This is propably all you will ever need for your OSC applications:

- `WebsocketClientPlugin` (default)
- `WebsocketServerPlugin`
- `DatagramPlugin` for UDP network messaging
- `BridgePlugin` useful Bridge between WebSocket- and UDP Clients

Configuration and examples of every plugin can be read here: [Wiki](https://github.com/adzialocha/osc-js/wiki).

### Example: WebSocket Server

Register the plugin when creating the OSC instance:

```js
const osc = new OSC({ plugin: new OSC.WebsocketServerPlugin() })
osc.open() // listening on 'ws://localhost:8080'
```

### Example: OSC between MaxMSP/PD/SC etc. and your browser

1. Write a simple webpage. The library will use a WebSocket client
by default.

  ```html
  <button id="send">Send Message</button>
  <script type="text/javascript" src="dist/osc.min.js"></script>
  <script type="text/javascript">
    var osc = new OSC();
    osc.open(); // connect by default to ws://localhost:8080

    document.getElementById('send').addEventListener('click', function() {
      var message = new OSC.Message('/test/random', Math.random());
      osc.send(message);
    });
  </script>
  ```

2. Write a Node app (the "bridge" between your UDP and WebSocket clients).

  ```js
  const OSC = require('osc-js')

  const config = { udpClient: { port: 9129 } }
  const osc = new OSC({ plugin: new OSC.BridgePlugin(config) })

  osc.open() // start a WebSocket server on port 8080
  ```

3. Create your Max/MSP patch (or PD, or SuperCollider or whatever you need).

  ```
  [udpreceive 9129] // incoming '/test/random' messages with random number
  ```

### Custom solutions with Plugin API

It is possible to write even more sophisticated solutions for your OSC application without loosing the simple osc-js interface (including it's nice message handling etc.). Read the [Plugin API documentation](https://github.com/adzialocha/osc-js/wiki/Plugin-API) for further information.

```js
class MyCustomPlugin {
  // ... read docs for implementation details
}

const osc = new OSC({ plugin: MyCustomPlugin() })
osc.open()

osc.on('/test', (message) => {
  // use event listener with your plugin
})
```

### Usage without plugins

The library can also be used without the mentioned features in case you need to write and read binary OSC data. See this example below for using the [Low-Level API](https://github.com/adzialocha/osc-js/wiki/Low-Level-API) (even though the library already has a solution for handling UDP like in this example):

```js
const dgram = require('dgram')
const OSC = require('osc-js')

const socket = dgram.createSocket('udp4')

// send a messsage via udp
const message = new OSC.Message('/some/path', 21)
const binary = message.pack()
socket.send(new Buffer(binary), 0, binary.byteLength, 41234, 'localhost')

// receive a message via UDP
socket.on('message', (data) => {
  const msg = new OSC.Message()
  msg.unpack(data)
  console.log(msg.args)
})
```

## Development

osc-js uses [Babel](http://babeljs.io) for ES6 support, [ESDoc](https://esdoc.org) for documentation, [Mocha](https://mochajs.org/) + [Chai](http://chaijs.com/) for testing and [Rollup](https://rollupjs.org) for generating the UMD module.

Clone the repository and install all dependencies:

```
git clone git@github.com:adzialocha/osc-js.git
cd osc-js
npm install
```

### Testing

`npm run test` for running the test suites.
`npm run test:watch` for running specs during development. Check your style guide violations with `npm run lint`.

### Deployment

`npm run build` for creating a UMD module in `lib` folder and a browser distribution in `dist` folder.

### ESDocs

`npm run docs` for generating a `docs` folder with HTML files documenting the library. Read them online here: [https://adzialocha.github.io/osc-js/](https://adzialocha.github.io/osc-js/)
