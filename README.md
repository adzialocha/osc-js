osc-js
======

OSC protocol interface ([OSC specs](http://opensoundcontrol.org/spec-1_0)) with address pattern matching for javascript applications - based on WebSocket API.
```
// setup connection

var osc = new OSC();
osc.connect('localhost', 8080);

// listen to osc messages with address

var listener = osc.on('/instrument/1/delay', function(message) {
  // do stuff
  console.log(message.args, message.addressPattern);
});

// unregister address listener

osc.off('/instrument/1/delay', listener);

// send a OSC message to server

var msg = new OSC.Message('/controls/*', 21.211, 'somestring', new Blob('binarydata'));

msg.add(912);
msg.add("another string");

osc.send(msg);

// send a OSC bundle to server

var bundle = new OSC.Bundle();
bundle.timestamp(new Date().getTime() + 5000);

bundle.add(msg);
bundle.add(new OSC.message('/controls/21', 19.1));

osc.send(bundle);

// send another OSC bundle

var bundle2 = new OSC.Bundle([ msg ], new Date().getTime() + 7500);
osc.send(bundle2);

// close session

osc.disconnect()
```

## Address Pattern Matching

The OSC address listener notification (on methods) is capable of address pattern matching. Example:
```
// server sends to address /in!trument/*, on client-side these will be called:
osc.on('/instrument/1', function(message) { });
osc.on('/instrument/2', function(message) { });
osc.on('/instrument/3', function(message) { });
```
Read more about this topic in the OSC [specs](http://opensoundcontrol.org/spec-1_0) and [examples](http://opensoundcontrol.org/spec-1_0-examples#addressparts)

### WebSocket Servers

To connect your Max MSP / PD etc. to your WebSocket client (propably a browser) you can use a NodeJS server as a bridge or these new solutions (some of them with a direct websocket link):

* [Pure Data patch by Nicolas Lhommet](http://puredata.hurleur.com/sujet-10062-websocket-server-patch-extended-demo)
* [ol.wsserver object for Max by Oli Larkin](https://github.com/olilarkin/wsserver)
* [Autobahn framework for Python](http://autobahn.ws/)
* [Websocket to UDP Bridge with HTTP server](https://gist.github.com/marmorkuchen-net/48544bd61183da666e6d)

### Development

Fetch respository and set up environment

  git clone git@github.com:marmorkuchen-net/osc-js.git
  npm install && bower install

Start a server on localhost:9000 which is checking your js syntax and running the tests in background after every save. You can also open a browser and check the examples here.

  grunt serve

To build the source (in dist folder) just run

  grunt
