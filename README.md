osc-js
======

osc-js is an [Open Sound Control](http://opensoundcontrol.org/) library for all your JavaScript applications (UMD module for Node, Browser etc.) with address pattern matching and timetag handling. Sends messages via *udp*, *WebSocket* or both (bridge mode) and offers a highly customizable Plugin API for your own network solutions.

# Features

- osc-js is a UMD Module running in node or your browser (without dependencies)
- osc-js offers a simple interface
- osc-js offers built-in udp, WebSocket support as plugins
- osc-js comes with a special bridge plugin for easy communication between udp- and WebSocket clients
- osc-js has a Plugin API for your own custom networking solutions
- osc-js features all [OSC 1.0 specifications](http://opensoundcontrol.org/spec-1_0)
- osc-js uses OSC Address pattern matching
- osc-js reads time-critical OSC Bundles with Timetags
- osc-js is written in ES6 :-)

# Documentation

Read more about osc-js and how to use it here: [https://osc-js.github.io](https://osc-js.github.io).

# Installation and Usage

Use [bower](https://bower.io) `bower install osc-js --save` or [npm](https://www.npmjs.com) `npm install osc-js --save` for installing osc-js as your project dependency.

Import the library via `const OSC = require('osc-js')` when using it in a Node app or add the script `dist/osc.js` or 'dist/osc.min.js' (minified version) for usage in a browser. Read below for more examples.

# Example

```
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

# Plugins

osc-js offers a plugin architecture for extending it's networking capabilities. The library comes already with four built-in plugins. This is propably all you will ever need for your OSC applications:

- `WebsocketClientPlugin` (default)
- `WebsocketServerPlugin`
- `DatagramPlugin` for UDP network messaging
- `BridgePlugin` useful Bridge between WebSocket- and UDP Clients

## Example: WebSocket Server

Register the plugin when creating the OSC instance:

```
const osc = new OSC({ plugin: new OSC.WebsocketServerPlugin() }
osc.open() // listening on 'ws://localhost:8080'
```

## Example: OSC between Max/PD/SC etc. and your browser

1. Write a simple webpage. The library will use a WebSocket client
by default.

  ```
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

  ```
  const OSC = require('osc-js')

  const config = { udpClient: { port: 9129 } }
  const osc = new OSC({ plugin: new OSC.BridgePlugin(config) })

  osc.open() // start a WebSocket server on port 8080
  ```

3. Create your Max/MSP patch (or PD, or SuperCollider or whatever you need).

  ```
  [udpreceive 9129] // incoming '/test/random' messages with random number
  ```

## Custom solutions with Plugin API

It is possible to write even more sophisticated or custom solutions for your OSC application while keeping the simple OSC library interface including all message handling etc. Read the [documentation](https://osc-js.github.io) for further information.

```
class MyCustomPlugin {
  // ... read docs for implementation details
}

const osc = new OSC({ plugin: MyCustomPlugin() })
osc.open()

osc.on('/test', (message) => {
  // use event listener with your plugin
})
```

## Usage without plugins

The library can also be used without the mentioned features in case you only need to write and read binary OSC data. See this example below (even though the library already has a solution for handling udp like in this example):

```
const dgram = require('dgram')
const OSC = require('osc-js')

const socket = dgram.createSocket('udp4')

// send a messsage via udp
const message = new OSC.Message('/some/path', 21)
const binary = message.pack()
socket.send(new Buffer(binary), 0, binary.byteLength, 41234, 'localhost')

// receive a message via udp
socket.on('message', (data) => {
  const msg = new OSC.Message()
  msg.unpack(data)
  console.log(msg.args)
})
```

# Development

osc-js uses [Babel](http://babeljs.io) for ES6 support, [ESDoc](https://esdoc.org) for documentation, [Mocha](https://mochajs.org/) + [Chai](http://chaijs.com/) for testing and [Rollup](https://rollupjs.org) for generating the UMD module.

Clone the repository and install all dependencies:

```
git clone git://github.com/adzialocha/osc-js.git
cd osc-js
npm install
```

# Testing

`npm run test` for running the test suites.
`npm run test:watch` for running specs during development. Check your style guide violations with `npm run lint`.

# Deployment

`npm run build` for creating a UMD module in `lib` folder and a browser distribution in `dist` folder.

# ESDocs

`npm run docs` for generating a `docs` folder with HTML files documenting the library.
