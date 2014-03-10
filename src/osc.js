(function (window, undefined) {

  'use strict';

  var FLAGS = {

    SOCKET: {
      IS_NOT_INITALIZED: -1,
      IS_CONNECTING: 0,
      IS_OPEN: 1,
      IS_CLOSING: 2,
      IS_CLOSED: 3
    }

  };

  function _addressToArray(pAddress) {
    var address = pAddress.split('/');
    address = address.filter(function(aItem){ return aItem.length > 0; });
    return address;
  }

  /*
   * OSCEventHandler
   * event callback handling
   */

  var OSCEventHandler = function() {

    // constants

    this.CALLBACKS_KEY = '_cb';

    // callback subscriptions

    this._callbackHandlers = {
      onOpen: [],
      onError: [],
      onClose: []
    };

    this._addressHandlers = {};

    this._uuid = -1;

    return true;

  };

  // subscribe to event

  OSCEventHandler.prototype.on = function(sEventName, sCallback) {
    var token, address, data, i;

    if (!((typeof sEventName === 'string' || typeof sEventName === 'object') &&
        typeof sCallback === 'function')) {
      throw 'OSCEventHandler Error: on expects string/array as eventName and function as callback';
    }

    token = (++this._uuid).toString();
    data = { token: token, callback: sCallback };

    // distinct between event or osc address listener

    if (typeof sEventName === 'string') {
      if (this._callbackHandlers[sEventName]) {
        this._callbackHandlers[sEventName].push(data);
        return token;
      } else {
        address = _addressToArray(sEventName);
      }
    } else {
      address = sEventName;
    }

    if (typeof sEventName === 'string' && ( sEventName.length === 0 || sEventName[0] !== '/' )) {
      throw 'OSCEventHandler Error: expects string to start with a / character';
    }

    // subscribe osc address listener, put it in a tree

    var obj = this._addressHandlers;

    for (i = 0; i < address.length; ++i) {
      var key = address[i];
      if (!(key in obj)) {
        obj[key] = {};
        obj[key][this.CALLBACKS_KEY] = [];
      }
      obj = obj[key];
    }

    if (!(this.CALLBACKS_KEY in obj)) {
      obj[this.CALLBACKS_KEY] = [];
    }

    obj[this.CALLBACKS_KEY].push(data);

    return token;
  };

  // unsubscribe to event

  OSCEventHandler.prototype.off = function(sEventName, sToken) {
    var address, i, success;

    if (!((typeof sEventName === 'string' || typeof sEventName === 'object') && sToken)) {
      throw 'OSCEventHandler Error: off expects string/array as eventName and a proper token';
    }

    success = false;

    if (typeof sEventName === 'string') {
      if (this._callbackHandlers[sEventName]) {
        // remove event callback
        for (i = 0; i < this._callbackHandlers[sEventName].length; i++) {
          if (this._callbackHandlers[sEventName][i].token === sToken) {
            this._callbackHandlers[sEventName].splice(i, 1);
            success = true;
          }
        }
        return success;
      } else {
        address = _addressToArray(sEventName);
      }
    } else {
      address = sEventName;
    }

    // remove osc address listener

    var handlers = [];

    var obj = this._addressHandlers;

    for (i = 0; i < address.length; ++i) {
      if (obj && address[i] in obj) {
        obj = obj[address[i]];
      } else {
        obj = null;
      }
    }

    if (obj && this.CALLBACKS_KEY in obj) {
      handlers = obj[this.CALLBACKS_KEY];
    }

    handlers.some(function(hItem, hIndex) {
      if (hItem.token === sToken) {
        handlers.splice(hIndex, 1);
        success = true;
        return true;
      } else {
        return false;
      }
    });

    return success;
  };

  // notify subscribers

  OSCEventHandler.prototype.notify = function(sEventName, sEventData) {
    var address, i;

    if (typeof sEventName === 'string') {
      if (this._callbackHandlers[sEventName]) {
        // notify event subscribers
        this._callbackHandlers[sEventName].forEach(function(cHandlerItem) {
          cHandlerItem.callback(sEventData);
        });
        return true;
      } else {
        address = _addressToArray(sEventName);
      }
    } else {
      address = sEventName;
    }

    // notify osc address subscribers

    var handlers = [];
    var obj = this._addressHandlers;

    if (this.CALLBACKS_KEY in obj) {
      handlers = handlers.concat(obj[this.CALLBACKS_KEY]);
    }

    for (i = 0; i < address.length; i++) {
      if (address[i] in obj) {
        obj = obj[address[i]];
        if (this.CALLBACKS_KEY in obj) {
          handlers = handlers.concat(obj[this.CALLBACKS_KEY]);
        }
      }
    }

    handlers.forEach(function(eHandlerItem) {
      eHandlerItem.callback(sEventData);
    });

    return true;
  };

  /*
   * OSCSocket
   * holds all WebSocket handling
   */

  var OSCSocket = function() {
    this._socket = null;
  };

  OSCSocket.prototype.server = function(sAddress, sPort) {
    if (!( sAddress && sPort)) {
      throw 'OSCSocket Error: missing WebSocket address or port';
    }
    // setting up websocket

    this._socket = new WebSocket('ws://' + sAddress + ':' + sPort);
    this._socket.binaryType = 'arraybuffer';

    this._socket.onopen = function(sEvent) {
      _oscEventHandler.notify('onOpen', sEvent);
    };

    this._socket.onerror = function(sEvent) {
      _oscEventHandler.notify('onError', sEvent);
    };

    this._socket.onmessage = function(sEvent) {
      var message = new OSCMessage();
      message.decode(sEvent.data);
      _oscEventHandler.notify( message.address, message.toJSON() );
    };

    return true;
  };

  OSCSocket.prototype.status = function() {
    if (this._socket) {
      return this._socket.readyState;
    } else {
      return FLAGS.SOCKET.IS_NOT_INITALIZED;
    }
  };

  /*
   * OSCMessage
   * is our abstract OSC data package
   */

  var OSCMessage = function() {

    this.address = [];
    this.addressString = '';
    this.typesString = '';
    this.args = [];

    // OSC String (ASCII)

    this.OSCString = function() {
      this.value = '';
      this.offset = 0;
    };

    this.OSCString.prototype.decode = function(sData, sOffset) {
      var data = new Int8Array(sData);
      var end = sOffset;
      while (data[end] && end < data.length) { end++; }

      if (end === data.length) {
        throw 'OSCMessage Error: malformed not ending OSC String';
      }

      this.value = String.fromCharCode.apply(null, data.subarray(sOffset, end));
      this.offset = parseInt( Math.ceil( ( end + 1 ) / 4.0 ) * 4, 10 );

      return this.offset;
    };

    // OSC Integer (32-bit big-endian twos complement)

    this.OSCInt = function() {
      this.value = 0;
      this.offset = 0;
    };

    this.OSCInt.prototype.decode = function(sData, sOffset) {
      var dataView = new DataView(sData, sOffset, 4);
      this.value = dataView.getInt32(0);
      this.offset = sOffset + 4;
      return this.offset;
    };

    // OSC Float (32-bit big-endian IEEE 754 floating point number)

    this.OSCFloat = function() {
      this.value = 0.0;
      this.offset = 0;
    };

    this.OSCFloat.prototype.decode = function(sData, sOffset) {
      var dataView = new DataView(sData, sOffset, 4);
      this.value = dataView.getFloat32(0);
      this.offset = sOffset + 4;
      return this.offset;
    };

    // OSC Blob

    // @ TODO

    this.OSCBlob = function() {
      this.value = 0.0;
      this.offset = 0;
    };

    this.OSCBlob.prototype.decode = function(sData, sOffset) {
      var dataView = new DataView(sData, sOffset, 4);
      this.value = dataView.getFloat32(0);
      this.offset = sOffset + 4;
      return this.offset;
    };

    return true;
  };

  OSCMessage.prototype.toJSON = function() {

    var json = {

      address: this.address,
      addressString: this.addressString,

      types: this.typesString,
      arguments: this.args

    };

    return json;

  };

  OSCMessage.prototype.decode = function(mData) {

    var address, types, i, args, offset;

    // read address and type string

    address = new this.OSCString();
    address.decode(mData, 0);

    types = new this.OSCString();
    types.decode(mData, address.offset);

    // parse type string

    if (types.length === 0 || types.value[0] !== ',') {
      throw 'OSCMessage Error: malformed or missing OSC TypeString';
    }

    args = [];
    offset = types.offset;

    for (i = 1; i < types.value.length; i++) {

      var next;

      if (types.value[i] === 'i') {
        next = new this.OSCInt();
      } else if (types.value[i] === 'f') {
        next = new this.OSCFloat();
      } else if (types.value[i] === 's') {
        next = new this.OSCString();
      } else if (types.value[i] === 'b') {
        next = new this.OSCBlob();
      } else {
        throw 'OSCMessage Error: found nonstandard argument type';
      }

      next.decode(mData, offset);
      offset = next.offset;
      args.push(next.value);

    }

    // persist them

    this.address = _addressToArray(address.value);
    this.addressString = address.value;
    this.typesString = types.value.slice(1, types.value.length);
    this.args = args;

    return true;
  };

  OSCMessage.prototype.encode = function(mAddress, mData) {
    // @ TODO
    console.log(mAddress, mData);
    return true;
  };

  // OSC wrapper object used as main interface

  var _oscEventHandler, _oscSocket, _oscMessage;

  var OSC = function() {

    // expose flags

    this.SOCKET = FLAGS.SOCKET;

    // init

    _oscEventHandler = new OSCEventHandler();
    _oscSocket = new OSCSocket();
    _oscMessage = new OSCMessage();

    // expose for specs

    this.__OSCEventHandler = _oscEventHandler;
    this.__OSCSocket = _oscSocket;
    this.__OSCMessage = _oscMessage;

    return true;
  };

  // event handling

  OSC.prototype.on = function(sEventName, sCallback) {
    return _oscEventHandler.on(sEventName, sCallback);
  };

  OSC.prototype.off = function(sEventName, sToken) {
    return _oscEventHandler.off(sEventName, sToken);
  };

  // socket handling

  OSC.prototype.server = function(sAddress, sPort) {
    return _oscSocket.server(sAddress, sPort);
  };

  OSC.prototype.status = function() {
    return _oscSocket.status();
  };

  // public

  window.OSC = OSC;

}(window));
