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

  function _prepareAddress(pAddress) {
    var address = '';
    if (typeof pAddress === 'object') {
      address = '/' + pAddress.join('/');
    } else {
      address = pAddress;
      if (address.length > 1 && address[address.length - 1] === '/') {
        address = address.slice(0, address.length - 1);
      }
    }
    return address;
  }

  function _prepareRegExPattern(rPattern) {
    var pattern;

    pattern = rPattern.replace(/\./g, '\\.');
    pattern = pattern.replace(/\(/g, '\\(');
    pattern = pattern.replace(/\)/g, '\\)');

    pattern = pattern.replace(/\{/g, '(');
    pattern = pattern.replace(/\}/g, ')');
    pattern = pattern.replace(/\,/g, '|');

    pattern = pattern.replace(/\?/g, '.');
    pattern = pattern.replace(/\*/g, '.*');

    return pattern;
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
      open: [],
      error: [],
      close: []
    };

    this._addressHandlers = {};

    this._uuid = -1;

    return true;

  };

  // subscribe to event

  OSCEventHandler.prototype.on = function(sEventName, sCallback) {
    var token, address, data;

    if (!((typeof sEventName === 'string' || typeof sEventName === 'object') &&
        typeof sCallback === 'function')) {
      throw 'OSCEventHandler Error: on expects string/array as eventName and function as callback';
    }

    token = (++this._uuid).toString();
    data = { token: token, callback: sCallback };

    // event listener

    if (typeof sEventName === 'string' && sEventName in this._callbackHandlers) {
      this._callbackHandlers[sEventName].push(data);
      return token;
    }

    // address listener

    address = _prepareAddress(sEventName);

    if (! (address in this._addressHandlers)) {
      this._addressHandlers[address] = [];
    }

    this._addressHandlers[address].push(data);

    return token;
  };

  // unsubscribe to event

  OSCEventHandler.prototype.off = function(sEventName, sToken) {
    var key, success, haystack;

    if (!((typeof sEventName === 'string' || typeof sEventName === 'object') && sToken)) {
      throw 'OSCEventHandler Error: off expects string/array as eventName and a proper token';
    }

    success = false;

    if (typeof sEventName === 'string' && this._callbackHandlers[sEventName]) {
      haystack = this._callbackHandlers;
      key = sEventName;
    } else {
      key = _prepareAddress(sEventName);
      haystack = this._addressHandlers;
    }

    if (key in haystack) {
      haystack[key].forEach(function(hItem, hIndex) {
        if (hItem.token === sToken) {
          haystack[key].splice(hIndex, 1);
          success = true;
        }
      });
    }

    return success;
  };

  // notify subscribers

  OSCEventHandler.prototype.notify = function(sEventName, sEventData) {
    var _this, addresses, regex, test;

    if (typeof sEventName !== 'string') {
      throw 'OSCEventHandler Error: notify expects a string';
    }

    // notify event subscribers

    if (this._callbackHandlers[sEventName]) {
      this._callbackHandlers[sEventName].forEach(function(cHandlerItem) {
        cHandlerItem.callback(sEventData);
      });
      return true;
    }

    if (sEventName.length === 0 || sEventName[0] !== '/' ) {
      throw 'OSCEventHandler Error: notify expects a proper address starting with /';
    }

    // notify osc address subscribers

    addresses = Object.keys(this._addressHandlers);
    _this = this;

    addresses.forEach(function(fAddress) {
      regex = new RegExp(_prepareRegExPattern(_prepareAddress(sEventName)), 'g');
      test = regex.test(fAddress);
      if (test && fAddress.length === regex.lastIndex) {
        _this._addressHandlers[fAddress].forEach(function(cHandlerItem) {
          cHandlerItem.callback(sEventData);
        });
      }
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
      _oscEventHandler.notify('open', sEvent);
    };

    this._socket.onerror = function(sEvent) {
      _oscEventHandler.notify('error', sEvent);
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

    this.address = '';
    this.typesString = '';
    this.args = [];

    // OSC String (ASCII)

    this.OSCString = function() {
      this.value = '';
      this.offset = 0;
    };

    this.OSCString.prototype.decode = function(sData, sOffset) {

      var i, subarray, str;
      var data = new Int8Array(sData);
      var end = sOffset;

      while (data[end] && end < data.length) { end++; }

      if (end === data.length) {
        throw 'OSCMessage Error: malformed not ending OSC String';
      }

      subarray = data.subarray(sOffset, end);

      str = '';

      for (i = 0; i < subarray.length; i++) {
        str = str + String.fromCharCode(subarray[i]);
      }

      // @TODO check this nicer implementation here, it doesnt work in jasmine specs:
      // this.value = String.fromCharCode.apply(null, data.subarray(sOffset, end));

      this.offset = Math.ceil( ( end + 1 ) / 4 ) * 4;
      this.value = str;

      return this.offset;
    };

    // OSC Integer (32-bit big-endian two-complement integer)

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

    this.OSCBlob = function() {
      this.value = new Blob();
      this.offset = 0;
    };

    this.OSCBlob.prototype.decode = function(sData, sOffset) {
      var dataView = new DataView(sData, sOffset, 4);
      var blobSize = dataView.getInt32(0);
      var binary = sData.slice(sOffset + 4,  sOffset + 4 + blobSize);
      this.value = new Blob([ binary ]);
      this.offset = sOffset + 4 + blobSize;
      return this.offset;
    };

    return true;
  };

  OSCMessage.prototype.toJSON = function() {

    var json = {

      address: this.address,
      types: this.typesString,
      arguments: this.args

    };

    return json;

  };

  OSCMessage.prototype.decode = function(mData) {

    var address, types, i, args, offset;

    if (mData.byteLength % 4 !== 0) {
      throw 'OSCMessage Error: byteLength has to be a multiple of four';
    }

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

    this.address = address.value;
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

  var _oscEventHandler, _oscSocket;

  var OSC = function() {

    // expose flags

    this.SOCKET = FLAGS.SOCKET;

    // init

    _oscEventHandler = new OSCEventHandler();
    _oscSocket = new OSCSocket();

    // expose to specs

    this.__OSCEventHandler = OSCEventHandler;
    this.__OSCSocket = OSCSocket;
    this.__OSCMessage = OSCMessage;

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
