/*! osc-js - v0.0.1 - 2014-03-18 by marmorkuchen.net */
(function(window, undefined) {
  "use strict";
  var FLAGS = {
    SOCKET: {
      IS_NOT_INITALIZED: -1,
      IS_CONNECTING: 0,
      IS_OPEN: 1,
      IS_CLOSING: 2,
      IS_CLOSED: 3
    }
  };
  var _options = {
    discardLateMessages: false
  };
  function _prepareAddress(pAddress) {
    var address = "";
    if (typeof pAddress === "object") {
      address = "/" + pAddress.join("/");
    } else {
      address = pAddress;
      if (address.length > 1 && address[address.length - 1] === "/") {
        address = address.slice(0, address.length - 1);
      }
    }
    return address;
  }
  function _prepareRegExPattern(rPattern) {
    var pattern;
    pattern = rPattern.replace(/\./g, "\\.");
    pattern = pattern.replace(/\(/g, "\\(");
    pattern = pattern.replace(/\)/g, "\\)");
    pattern = pattern.replace(/\{/g, "(");
    pattern = pattern.replace(/\}/g, ")");
    pattern = pattern.replace(/\,/g, "|");
    pattern = pattern.replace(/\[\!/g, "[^");
    pattern = pattern.replace(/\?/g, ".");
    pattern = pattern.replace(/\*/g, ".*");
    return pattern;
  }
  var OSCEventHandler = function() {
    this._callbackHandlers = {
      open: [],
      error: [],
      close: []
    };
    this._addressHandlers = {};
    this._uuid = -1;
    return true;
  };
  OSCEventHandler.prototype.on = function(sEventName, sCallback) {
    var token, address, data, regex;
    if (!((typeof sEventName === "string" || typeof sEventName === "object") && typeof sCallback === "function")) {
      throw "OSCEventHandler Error: on expects string/array as eventName and function as callback";
    }
    token = (++this._uuid).toString();
    data = {
      token: token,
      callback: sCallback
    };
    if (typeof sEventName === "string" && sEventName in this._callbackHandlers) {
      this._callbackHandlers[sEventName].push(data);
      return token;
    }
    address = _prepareAddress(sEventName);
    regex = new RegExp(/[#*\s\[\],\/{}|\?]/g);
    if (regex.test(address.split("/").join(""))) {
      throw "OSCEventHandler Error: address string contains invalid characters";
    }
    if (!(address in this._addressHandlers)) {
      this._addressHandlers[address] = [];
    }
    this._addressHandlers[address].push(data);
    return token;
  };
  OSCEventHandler.prototype.off = function(sEventName, sToken) {
    var key, success, haystack;
    if (!((typeof sEventName === "string" || typeof sEventName === "object") && sToken)) {
      throw "OSCEventHandler Error: off expects string/array as eventName and a proper token";
    }
    success = false;
    if (typeof sEventName === "string" && this._callbackHandlers[sEventName]) {
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
  OSCEventHandler.prototype.notify = function(sEventName, sEventData) {
    var _this, addresses, regex, test;
    if (typeof sEventName !== "string") {
      throw "OSCEventHandler Error: notify expects a string";
    }
    if (this._callbackHandlers[sEventName]) {
      this._callbackHandlers[sEventName].forEach(function(cHandlerItem) {
        cHandlerItem.callback(sEventData);
      });
      return true;
    }
    if (sEventName.length === 0 || sEventName[0] !== "/") {
      throw "OSCEventHandler Error: notify expects a proper address starting with /";
    }
    addresses = Object.keys(this._addressHandlers);
    _this = this;
    addresses.forEach(function(fAddress) {
      regex = new RegExp(_prepareRegExPattern(_prepareAddress(sEventName)), "g");
      test = regex.test(fAddress);
      if (test && fAddress.length === regex.lastIndex) {
        _this._addressHandlers[fAddress].forEach(function(cHandlerItem) {
          cHandlerItem.callback(sEventData);
        });
      }
    });
    return true;
  };
  OSCEventHandler.prototype.notifyLater = function(sEventName, sEventData, sTimeTag) {
    var now, _this, data;
    data = sEventData;
    data.timeStamp = sTimeTag.milliseconds;
    now = new Date();
    if (now.getTime() >= sTimeTag.milliseconds) {
      if (!_options.discardLateMessages) {
        this.notify(sEventName, data);
      }
    } else {
      _this = this;
      window.setTimeout(function() {
        _this.notify(sEventName, data);
      }, sTimeTag.milliseconds - now.getTime());
    }
    return true;
  };
  var OSCSocket = function() {
    this._socket = null;
  };
  OSCSocket.prototype.server = function(sAddress, sPort) {
    if (!(sAddress && sPort)) {
      throw "OSCSocket Error: missing WebSocket address or port";
    }
    this._socket = new WebSocket("ws://" + sAddress + ":" + sPort);
    this._socket.binaryType = "arraybuffer";
    this._socket.onopen = function(sEvent) {
      _oscEventHandler.notify("open", sEvent);
    };
    this._socket.onerror = function(sEvent) {
      _oscEventHandler.notify("error", sEvent);
    };
    this._socket.onmessage = function(sEvent) {
      var message = new OSCPacket();
      message.decode(sEvent.data);
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
  var OSCAtomic = {};
  OSCAtomic.OSCString = function() {
    this.value = "";
    this.offset = 0;
  };
  OSCAtomic.OSCString.prototype.decode = function(sData, sOffset) {
    var i, subarray, str;
    var data = new Int8Array(sData);
    var end = sOffset;
    while (data[end] && end < data.length) {
      end++;
    }
    if (end === data.length) {
      throw "OSCMessage Error: malformed not ending OSC String";
    }
    subarray = data.subarray(sOffset, end);
    str = "";
    for (i = 0; i < subarray.length; i++) {
      str = str + String.fromCharCode(subarray[i]);
    }
    this.offset = Math.ceil((end + 1) / 4) * 4;
    this.value = str;
    return this.offset;
  };
  OSCAtomic.Int32 = function() {
    this.value = 0;
    this.offset = 0;
  };
  OSCAtomic.Int32.prototype.decode = function(sData, sOffset) {
    var dataView = new DataView(sData, sOffset, 4);
    this.value = dataView.getInt32(0);
    this.offset = sOffset + 4;
    return this.offset;
  };
  OSCAtomic.Float32 = function() {
    this.value = 0;
    this.offset = 0;
  };
  OSCAtomic.Float32.prototype.decode = function(sData, sOffset) {
    var dataView = new DataView(sData, sOffset, 4);
    this.value = dataView.getFloat32(0);
    this.offset = sOffset + 4;
    return this.offset;
  };
  OSCAtomic.OSCBlob = function() {
    this.value = new Blob();
    this.offset = 0;
  };
  OSCAtomic.OSCBlob.prototype.decode = function(sData, sOffset) {
    var dataView = new DataView(sData, sOffset, 4);
    var blobSize = dataView.getInt32(0);
    var binary = sData.slice(sOffset + 4, sOffset + 4 + blobSize);
    this.value = new Blob([ binary ]);
    this.offset = sOffset + 4 + blobSize;
    return this.offset;
  };
  OSCAtomic.OSCTimeTag = function() {
    this.value = "";
    this.seconds = 0;
    this.fraction = 0;
    this.offset = 0;
    this.milliseconds = 0;
  };
  OSCAtomic.OSCTimeTag.prototype.decode = function(sData, sOffset) {
    var dataView = new DataView(sData, sOffset, 8);
    this.seconds = dataView.getInt32(0);
    this.fraction = dataView.getInt32(4);
    this.milliseconds = this.seconds * 1e3;
    this.value = this.seconds + "" + this.fraction;
    this.offset = sOffset + 8;
    return this.offset;
  };
  var OSCPacket = function() {
    return true;
  };
  OSCPacket.prototype.decode = function(pData, pTimeTag) {
    var first, message, bundle;
    if (pData.byteLength % 4 !== 0) {
      throw "OSCPackage Error: byteLength has to be a multiple of four";
    }
    first = new OSCAtomic.OSCString();
    first.decode(pData, 0);
    if (first.value === "#bundle") {
      bundle = new OSCBundle();
      bundle.decode(pData);
      if (pTimeTag && bundle.timeTag.value < pTimeTag.value) {
        throw "OSCPackage Error: timetag of enclosing bundle is past timestamp of enclosed ones";
      }
      return bundle;
    } else {
      message = new OSCMessage();
      message.decode(pData);
      if (!pTimeTag) {
        _oscEventHandler.notify(message.address, message.toJSON());
      } else {
        _oscEventHandler.notifyLater(message.address, message.toJSON(), pTimeTag);
      }
      return message;
    }
  };
  var OSCBundle = function() {
    this._CLASS = "OSCBundle";
    this.timeTag = new OSCAtomic.OSCTimeTag();
    this.bundleElements = [];
    return true;
  };
  OSCBundle.prototype.decode = function(bData) {
    var offset, timetag, size, packet;
    timetag = new OSCAtomic.OSCTimeTag();
    offset = timetag.decode(bData, 8);
    this.timeTag = timetag;
    do {
      size = new OSCAtomic.Int32();
      offset = size.decode(bData, offset);
      if (size.value > 0) {
        packet = new OSCPacket();
        this.bundleElements.push(packet.decode(bData.slice(offset, offset + size.value), timetag));
      }
      offset = offset + size.value;
    } while (offset < bData.byteLength);
    return this;
  };
  var OSCMessage = function() {
    this._CLASS = "OSCMessage";
    this.address = "";
    this.typesString = "";
    this.args = [];
    return true;
  };
  OSCMessage.prototype.toJSON = function() {
    return {
      address: this.address,
      types: this.typesString,
      arguments: this.args
    };
  };
  OSCMessage.prototype.decode = function(mData) {
    var address, types, i, args, offset;
    address = new OSCAtomic.OSCString();
    address.decode(mData, 0);
    types = new OSCAtomic.OSCString();
    types.decode(mData, address.offset);
    if (types.length === 0 || types.value[0] !== ",") {
      throw "OSCMessage Error: malformed or missing OSC TypeString";
    }
    args = [];
    offset = types.offset;
    for (i = 1; i < types.value.length; i++) {
      var next;
      if (types.value[i] === "i") {
        next = new OSCAtomic.Int32();
      } else if (types.value[i] === "f") {
        next = new OSCAtomic.Float32();
      } else if (types.value[i] === "s") {
        next = new OSCAtomic.OSCString();
      } else if (types.value[i] === "b") {
        next = new OSCAtomic.OSCBlob();
      } else {
        throw "OSCMessage Error: found nonstandard argument type";
      }
      next.decode(mData, offset);
      offset = next.offset;
      args.push(next.value);
    }
    this.address = address.value;
    this.typesString = types.value.slice(1, types.value.length);
    this.args = args;
    return this;
  };
  OSCMessage.prototype.encode = function(mAddress, mData) {
    console.log(mAddress, mData);
    return true;
  };
  var _oscEventHandler, _oscSocket;
  var OSC = function(mOptions) {
    if (mOptions) {
      Object.keys(mOptions).forEach(function(oKey) {
        if (oKey in _options) {
          _options[oKey] = mOptions[oKey];
        }
      });
    }
    this.SOCKET = FLAGS.SOCKET;
    _oscEventHandler = new OSCEventHandler();
    _oscSocket = new OSCSocket();
    this.__OSCEventHandler = OSCEventHandler;
    this.__OSCSocket = OSCSocket;
    this.__OSCPacket = OSCPacket;
    this.__OSCBundle = OSCBundle;
    this.__OSCMessage = OSCMessage;
    return true;
  };
  OSC.prototype.on = function(sEventName, sCallback) {
    return _oscEventHandler.on(sEventName, sCallback);
  };
  OSC.prototype.off = function(sEventName, sToken) {
    return _oscEventHandler.off(sEventName, sToken);
  };
  OSC.prototype.server = function(sAddress, sPort) {
    return _oscSocket.server(sAddress, sPort);
  };
  OSC.prototype.status = function() {
    return _oscSocket.status();
  };
  window.OSC = OSC;
})(window);