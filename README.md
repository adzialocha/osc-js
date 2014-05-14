osc-js
======

OSC protocol interface for javascript applications based on WebSocket API connections.
```
// setup connection

var osc = new OSC();
osc.connect('localhost', 8080);

// listen to osc messages with address

osc.on('/instrument/1/delay', function(message) {
  // change client values
});

// send a OSC message to server

var msg = new OSC.Message('/controls/*', 21.211, 'somestring', new Blob('binarydata'));
msg.add(912);

osc.send(msg);

// send a OSC bundle to server

var bundle = new OSC.Bundle();
bundle.timestamp(new Date().getTime() + 5000);

bundle.add(msg);
bundle.add(new OSC.message('/controls/21', 19.1));

osc.send(bundle);
```

### WebSocket Servers

To connect your Max MSP / PD / OSC Server etc. and audio environment to your WebSocket client (propably a browser) you can use a NodeJS server as a proxy or these new interesting solutions for a direct link:

* [Pure Data patch by Nicolas Lhommet](http://puredata.hurleur.com/sujet-10062-websocket-server-patch-extended-demo)
* [ol.wsserver object for Max by Oli Larkin](https://github.com/olilarkin/wsserver)
* [Autobahn framework for Python](http://autobahn.ws/)
* [Websocket to UDP Bridge with HTTP server](https://gist.github.com/marmorkuchen-net/48544bd61183da666e6d)
