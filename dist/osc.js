/*! osc-js - v0.0.1 - 2014-03-09 by marmorkuchen.net */
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
    var OSCEventHandler = function() {
        this.CALLBACKS_KEY = "_cb";
        this._callbackHandlers = {
            onOpen: [],
            onError: [],
            onClose: []
        };
        this._addressHandlers = {};
        this._uuid = -1;
        this._transformToArray = function(pAddress) {
            var address = pAddress.split("/");
            address = address.filter(function(aItem) {
                return aItem.length > 0;
            });
            return address;
        };
        this._findAddressHandler = function(fAddress) {
            var obj = this._addressHandlers;
            for (var i = 0; i < fAddress.length; ++i) {
                if (obj && fAddress[i] in obj) {
                    obj = obj[fAddress[i]];
                } else {
                    obj = null;
                }
            }
            if (obj && this.CALLBACKS_KEY in obj) {
                return obj[this.CALLBACKS_KEY];
            }
            return null;
        };
    };
    OSCEventHandler.prototype.on = function(sEventName, sCallback) {
        var token, address, data, i;
        if (!((typeof sEventName === "string" || typeof sEventName === "object") && typeof sCallback === "function")) {
            throw "OSCEventHandler Error: on expects string/array as eventName and function as callback";
        }
        token = (++this._uuid).toString();
        data = {
            token: token,
            callback: sCallback
        };
        if (typeof sEventName === "string") {
            if (this._callbackHandlers[sEventName]) {
                this._callbackHandlers[sEventName].push(data);
                return token;
            } else {
                address = this._transformToArray(sEventName);
            }
        } else {
            address = sEventName;
        }
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
    OSCEventHandler.prototype.off = function(sEventName, sToken) {
        var address, i, success;
        if (!((typeof sEventName === "string" || typeof sEventName === "object") && sToken)) {
            throw "OSCEventHandler Error: off expects string/array as eventName and a proper token";
        }
        success = false;
        if (typeof sEventName === "string") {
            if (this._callbackHandlers[sEventName]) {
                for (i = 0; i < this._callbackHandlers[sEventName].length; i++) {
                    if (this._callbackHandlers[sEventName][i].token === sToken) {
                        this._callbackHandlers[sEventName].splice(i, 1);
                        success = true;
                    }
                }
                return success;
            } else {
                address = this._transformToArray(sEventName);
            }
        } else {
            address = sEventName;
        }
        var handlers = this._findAddressHandler(address);
        if (handlers) {
            for (i = 0; i < handlers.length; i++) {
                if (handlers[i].token === sToken) {
                    handlers.splice(i, 1);
                    success = true;
                }
            }
        }
        return success;
    };
    OSCEventHandler.prototype.notify = function(sEventName, sEventData) {
        var address;
        if (typeof sEventName === "string") {
            if (this._callbackHandlers[sEventName]) {
                this._callbackHandlers[sEventName].forEach(function(cHandlerItem) {
                    cHandlerItem.callback(sEventData);
                });
                return true;
            } else {
                address = this._transformToArray(sEventName);
            }
        } else {
            address = sEventName;
        }
        var handlers = this._findAddressHandler(address);
        handlers.forEach(function(eHandlerItem) {
            eHandlerItem.callback(sEventData);
        });
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
        this._socket.onopen = function(wEvent) {
            _oscEventHandler.notify("onOpen", wEvent);
        };
        this._socket.onerror = function(wEvent) {
            _oscEventHandler.notify("onError", wEvent);
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
    var OSCMessage = function() {
        return true;
    };
    var _oscEventHandler, _oscSocket, _oscMessage;
    var OSC = function() {
        this.SOCKET = FLAGS.SOCKET;
        _oscEventHandler = new OSCEventHandler();
        _oscSocket = new OSCSocket();
        _oscMessage = new OSCMessage();
        this.__OSCEventHandler = _oscEventHandler;
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