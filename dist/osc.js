(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.OSC = global.OSC || {})));
}(this, (function (exports) { 'use strict';

function isInt(n) {
  return Number(n) === n && n % 1 === 0;
}
function isFloat(n) {
  return Number(n) === n && n % 1 !== 0;
}
function isString(n) {
  return typeof n === 'string';
}
function isArray(n) {
  return Object.prototype.toString.call(n) === '[object Array]';
}
function isObject(n) {
  return Object.prototype.toString.call(n) === '[object Object]';
}
function isFunction(n) {
  return typeof n === 'function';
}
function isBlob(n) {
  return n instanceof Uint8Array;
}
function isDate(n) {
  return n instanceof Date;
}
function pad(n) {
  return n + 3 & ~0x03;
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

function typeTag(item) {
  if (isInt(item)) {
    return 'i';
  } else if (isFloat(item)) {
    return 'f';
  } else if (isString(item)) {
    return 's';
  } else if (isBlob(item)) {
    return 'b';
  }
  throw new Error('OSC Message found unknown value type.');
}
function prepareAddress(obj) {
  var address = '';
  if (isArray(obj)) {
    return '/' + obj.join('/');
  } else if (isString(obj)) {
    address = obj;
    if (address.length > 1 && address[address.length - 1] === '/') {
      address = address.slice(0, address.length - 1);
    }
    if (address.length > 1 && address[0] !== '/') {
      address = '/' + address;
    }
    return address;
  }
  throw new Error('OSC Helpers can only prepare addresses which are of type array or string.');
}
function prepareRegExPattern(str) {
  var pattern = void 0;
  if (!isString(str)) {
    throw new Error('OSC Helper prepareRegExPattern only accepts strings.');
  }
  pattern = str.replace(/\./g, '\\.');
  pattern = pattern.replace(/\(/g, '\\(');
  pattern = pattern.replace(/\)/g, '\\)');
  pattern = pattern.replace(/\{/g, '(');
  pattern = pattern.replace(/\}/g, ')');
  pattern = pattern.replace(/,/g, '|');
  pattern = pattern.replace(/\[!/g, '[^');
  pattern = pattern.replace(/\?/g, '.');
  pattern = pattern.replace(/\*/g, '.*');
  return pattern;
}
var EncodeHelper = function () {
  function EncodeHelper() {
    classCallCheck(this, EncodeHelper);
    this.data = [];
    this.byteLength = 0;
  }
  createClass(EncodeHelper, [{
    key: 'add',
    value: function add(item) {
      var buffer = item.pack();
      this.byteLength += buffer.byteLength;
      this.data.push(buffer);
      return this;
    }
  }, {
    key: 'merge',
    value: function merge() {
      var result = new Uint8Array(this.byteLength);
      var offset = 0;
      this.data.forEach(function (data) {
        result.set(data, offset);
        offset += data.byteLength;
      });
      return result;
    }
  }]);
  return EncodeHelper;
}();

var Atomic = function () {
  function Atomic(value) {
    classCallCheck(this, Atomic);
    this.value = value;
    this.offset = 0;
  }
  createClass(Atomic, [{
    key: 'pack',
    value: function pack(method, byteLength) {
      if (!(method && byteLength)) {
        throw new Error('OSC Atomic cant\'t be packed without given method or byteLength.');
      }
      var data = new Uint8Array(byteLength);
      var dataView = new DataView(data.buffer);
      if (!this.value) {
        throw new Error('OSC Atomic cant\'t be encoded with empty value.');
      }
      dataView[method](this.offset, this.value, false);
      return data;
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView, method, byteLength) {
      var initialOffset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      if (!(dataView && method && byteLength)) {
        throw new Error('OSC Atomic cant\'t be unpacked without given dataView, method or byteLength.');
      }
      if (!(dataView instanceof DataView)) {
        throw new Error('OSC Atomic expects an instance of type DataView.');
      }
      this.value = dataView[method](initialOffset, false);
      this.offset = initialOffset + byteLength;
      return this.offset;
    }
  }]);
  return Atomic;
}();

var SECONDS_70_YEARS = 2208988800;
var TWO_POWER_32 = 4294967296;
var Timetag = function () {
  function Timetag() {
    var seconds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var fractions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    classCallCheck(this, Timetag);
    if (!(isInt(seconds) && isInt(fractions))) {
      throw new Error('OSC Timetag constructor expects values of type integer number.');
    }
    this.seconds = seconds;
    this.fractions = fractions;
  }
  createClass(Timetag, [{
    key: 'timestamp',
    value: function timestamp(milliseconds) {
      var seconds = void 0;
      if (typeof milliseconds === 'number') {
        seconds = milliseconds / 1000;
        var rounded = Math.floor(seconds);
        this.seconds = rounded + SECONDS_70_YEARS;
        this.fractions = Math.round(TWO_POWER_32 * (seconds - rounded));
        return milliseconds;
      }
      seconds = this.seconds - SECONDS_70_YEARS;
      return (seconds + this.fractions / TWO_POWER_32) * 1000;
    }
  }]);
  return Timetag;
}();
var AtomicTimetag = function (_Atomic) {
  inherits(AtomicTimetag, _Atomic);
  function AtomicTimetag(value) {
    classCallCheck(this, AtomicTimetag);
    var timetag = new Timetag();
    if (value instanceof Timetag) {
      timetag = value;
    } else if (isInt(value)) {
      timetag.timestamp(value);
    } else if (isDate(value)) {
      timetag.timestamp(value.getTime());
    } else {
      timetag.timestamp(Date.now());
    }
    return possibleConstructorReturn(this, (AtomicTimetag.__proto__ || Object.getPrototypeOf(AtomicTimetag)).call(this, timetag));
  }
  createClass(AtomicTimetag, [{
    key: 'pack',
    value: function pack() {
      if (!this.value) {
        throw new Error('OSC AtomicTimetag can not be encoded with empty value.');
      }
      var _value = this.value,
          seconds = _value.seconds,
          fractions = _value.fractions;
      var data = new Uint8Array(8);
      var dataView = new DataView(data.buffer);
      dataView.setInt32(0, seconds, false);
      dataView.setInt32(4, fractions, false);
      return data;
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (!(dataView instanceof DataView)) {
        throw new Error('OSC AtomicTimetag expects an instance of type DataView.');
      }
      var seconds = dataView.getUint32(initialOffset, false);
      var fractions = dataView.getUint32(initialOffset + 4, false);
      this.value = new Timetag(seconds, fractions);
      this.offset = initialOffset + 8;
      return this.offset;
    }
  }]);
  return AtomicTimetag;
}(Atomic);

var EventHandler = function () {
  function EventHandler() {
    classCallCheck(this, EventHandler);
    this.addressHandlers = [];
    this.eventHandlers = {
      open: [],
      error: [],
      close: []
    };
    this.uuid = 0;
  }
  createClass(EventHandler, [{
    key: 'notify',
    value: function notify(eventName, data, timetag) {
      var _this = this;
      if (!isString(eventName)) {
        throw new Error('OSC EventHandler notify method accepts only strings.');
      }
      if (timetag && !(timetag instanceof Timetag)) {
        throw new Error('OSC EventHandler accepts only timetags of type Timetag.');
      }
      if (timetag) {
        var now = Date.now();
        if (now > timetag.timestamp()) {
          if (!option('discardLateMessages')) {
            this.notify(eventName, data);
          }
        } else {
          (function () {
            var that = _this;
            setTimeout(function () {
              that.notify(eventName, data);
            }, timetag.timestamp() - now);
          })();
        }
        return true;
      }
      if (isString(eventName) && eventName in this.eventHandlers) {
        this.eventHandlers[eventName].forEach(function (handler) {
          handler.callback(data);
        });
        return true;
      }
      var handlerKeys = Object.keys(this.addressHandlers);
      var handlers = this.addressHandlers;
      handlerKeys.forEach(function (key) {
        var regex = new RegExp(prepareRegExPattern(prepareAddress(eventName)), 'g');
        var test = regex.test(key);
        if (test && key.length === regex.lastIndex) {
          handlers[key].forEach(function (handler) {
            handler.callback(data);
          });
        }
      });
      return true;
    }
  }, {
    key: 'on',
    value: function on(eventName, callback) {
      if (!(isString(eventName) || isArray(eventName))) {
        throw new Error('OSC EventHandler accepts only strings or arrays for address patterns.');
      }
      if (!isFunction(callback)) {
        throw new Error('OSC EventHandler callback has to be a function.');
      }
      this.uuid += 1;
      var handler = {
        id: this.uuid,
        callback: callback
      };
      if (isString(eventName) && eventName in this.eventHandlers) {
        this.eventHandlers[eventName].push(handler);
        return this.uuid;
      }
      var address = prepareAddress(eventName);
      var regex = new RegExp(/[#*\s[\],/{}|?]/g);
      if (regex.test(address.split('/').join(''))) {
        throw new Error('OSC EventHandler address string contains invalid characters.');
      }
      if (!(address in this.addressHandlers)) {
        this.addressHandlers[address] = [];
      }
      this.addressHandlers[address].push(handler);
      return this.uuid;
    }
  }, {
    key: 'off',
    value: function off(eventName, subscriptionId) {
      if (!(isString(eventName) || isArray(eventName))) {
        throw new Error('OSC EventHandler accepts only strings or arrays for address patterns.');
      }
      if (!isInt(subscriptionId)) {
        throw new Error('OSC EventHandler subscription id has to be a number.');
      }
      var key = void 0;
      var haystack = void 0;
      if (isString(eventName) && eventName in this.eventHandlers) {
        key = eventName;
        haystack = this.eventHandlers;
      } else {
        key = prepareAddress(eventName);
        haystack = this.addressHandlers;
      }
      if (key in haystack) {
        return haystack[key].some(function (item, index) {
          if (item.id === subscriptionId) {
            haystack[key].splice(index, 1);
            return true;
          }
          return false;
        });
      }
      return false;
    }
  }]);
  return EventHandler;
}();

var AtomicInt32 = function (_Atomic) {
  inherits(AtomicInt32, _Atomic);
  function AtomicInt32(value) {
    classCallCheck(this, AtomicInt32);
    if (value && !isInt(value)) {
      throw new Error('OSC AtomicInt32 constructor expects value of type number.');
    }
    return possibleConstructorReturn(this, (AtomicInt32.__proto__ || Object.getPrototypeOf(AtomicInt32)).call(this, value));
  }
  createClass(AtomicInt32, [{
    key: 'pack',
    value: function pack() {
      return get(AtomicInt32.prototype.__proto__ || Object.getPrototypeOf(AtomicInt32.prototype), 'pack', this).call(this, 'setInt32', 4);
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return get(AtomicInt32.prototype.__proto__ || Object.getPrototypeOf(AtomicInt32.prototype), 'unpack', this).call(this, dataView, 'getInt32', 4, initialOffset);
    }
  }]);
  return AtomicInt32;
}(Atomic);

var AtomicFloat32 = function (_Atomic) {
  inherits(AtomicFloat32, _Atomic);
  function AtomicFloat32(value) {
    classCallCheck(this, AtomicFloat32);
    if (value && !isFloat(value)) {
      throw new Error('OSC AtomicFloat32 constructor expects value of type float.');
    }
    return possibleConstructorReturn(this, (AtomicFloat32.__proto__ || Object.getPrototypeOf(AtomicFloat32)).call(this, value));
  }
  createClass(AtomicFloat32, [{
    key: 'pack',
    value: function pack() {
      return get(AtomicFloat32.prototype.__proto__ || Object.getPrototypeOf(AtomicFloat32.prototype), 'pack', this).call(this, 'setFloat32', 4);
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return get(AtomicFloat32.prototype.__proto__ || Object.getPrototypeOf(AtomicFloat32.prototype), 'unpack', this).call(this, dataView, 'getFloat32', 4, initialOffset);
    }
  }]);
  return AtomicFloat32;
}(Atomic);

var AtomicFloat64 = function (_Atomic) {
  inherits(AtomicFloat64, _Atomic);
  function AtomicFloat64(value) {
    classCallCheck(this, AtomicFloat64);
    if (value && !isFloat(value)) {
      throw new Error('OSC AtomicFloat64 constructor expects value of type float number.');
    }
    return possibleConstructorReturn(this, (AtomicFloat64.__proto__ || Object.getPrototypeOf(AtomicFloat64)).call(this, value));
  }
  createClass(AtomicFloat64, [{
    key: 'pack',
    value: function pack() {
      return get(AtomicFloat64.prototype.__proto__ || Object.getPrototypeOf(AtomicFloat64.prototype), 'pack', this).call(this, 'setFloat64', 8);
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return get(AtomicFloat64.prototype.__proto__ || Object.getPrototypeOf(AtomicFloat64.prototype), 'unpack', this).call(this, dataView, 'getFloat64', 8, initialOffset);
    }
  }]);
  return AtomicFloat64;
}(Atomic);

var AtomicString = function (_Atomic) {
  inherits(AtomicString, _Atomic);
  function AtomicString(value) {
    classCallCheck(this, AtomicString);
    if (value && !isString(value)) {
      throw new Error('OSC AtomicString constructor expects value of type string.');
    }
    return possibleConstructorReturn(this, (AtomicString.__proto__ || Object.getPrototypeOf(AtomicString)).call(this, value));
  }
  createClass(AtomicString, [{
    key: 'pack',
    value: function pack() {
      if (!this.value) {
        throw new Error('OSC AtomicString can not be encoded with empty value.');
      }
      var terminated = this.value + '\0';
      var byteLength = pad(terminated.length);
      var buffer = new Uint8Array(byteLength);
      for (var i = 0; i < terminated.length; i += 1) {
        buffer[i] = terminated.charCodeAt(i);
      }
      return buffer;
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (!(dataView instanceof DataView)) {
        throw new Error('OSC AtomicString expects an instance of type DataView.');
      }
      var offset = initialOffset;
      var charcode = void 0;
      var data = [];
      for (; offset < dataView.byteLength; offset += 1) {
        charcode = dataView.getUint8(offset);
        if (charcode !== 0) {
          data.push(charcode);
        } else {
          offset += 1;
          break;
        }
      }
      if (offset === dataView.length) {
        throw new Error('OSC AtomicString found a malformed OSC string.');
      }
      this.offset = pad(offset);
      this.value = String.fromCharCode.apply(null, data);
      return this.offset;
    }
  }]);
  return AtomicString;
}(Atomic);

var AtomicBlob = function (_Atomic) {
  inherits(AtomicBlob, _Atomic);
  function AtomicBlob(value) {
    classCallCheck(this, AtomicBlob);
    if (value && !isBlob(value)) {
      throw new Error('OSC AtomicBlob constructor expects value of type Uint8Array.');
    }
    return possibleConstructorReturn(this, (AtomicBlob.__proto__ || Object.getPrototypeOf(AtomicBlob)).call(this, value));
  }
  createClass(AtomicBlob, [{
    key: 'pack',
    value: function pack() {
      if (!this.value) {
        throw new Error('OSC AtomicBlob can not be encoded with empty value.');
      }
      var byteLength = pad(this.value.byteLength);
      var data = new Uint8Array(byteLength + 4);
      var dataView = new DataView(data.buffer);
      dataView.setInt32(0, this.value.byteLength, false);
      data.set(this.value, 4);
      return data;
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (!(dataView instanceof DataView)) {
        throw new Error('OSC AtomicBlob expects an instance of type DataView.');
      }
      var byteLength = dataView.getInt32(initialOffset, false);
      this.value = new Uint8Array(dataView.buffer, initialOffset + 4, byteLength);
      this.offset = pad(initialOffset + 4 + byteLength);
      return this.offset;
    }
  }]);
  return AtomicBlob;
}(Atomic);

var Message = function () {
  function Message() {
    classCallCheck(this, Message);
    this.offset = 0;
    this.address = '';
    this.types = '';
    this.args = [];
    this.timetag = null;
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length > 0) {
      if (!(isString(args[0]) || isArray(args[0]))) {
        throw new Error('OSC Message constructor first argument (address) must be a string or array.');
      }
      this.address = prepareAddress(args.shift());
      this.types = args.map(function (item) {
        return typeTag(item);
      }).join('');
      this.args = args;
    }
  }
  createClass(Message, [{
    key: 'add',
    value: function add(item) {
      if (!item) {
        throw new Error('OSC Message expects a valid item for adding.');
      }
      this.args.push(item);
      this.types += typeTag(item);
    }
  }, {
    key: 'pack',
    value: function pack() {
      var _this = this;
      if (this.address.length === 0 || this.address[0] !== '/') {
        throw new Error('OSC Message does not have a proper address.');
      }
      var encoder = new EncodeHelper();
      encoder.add(new AtomicString(this.address));
      encoder.add(new AtomicString(',' + this.types));
      if (this.args.length > 0) {
        (function () {
          var argument = void 0;
          _this.args.forEach(function (value) {
            if (isInt(value)) {
              argument = new AtomicInt32(value);
            } else if (isFloat(value)) {
              if (option('doublePrecisionFloats')) {
                argument = new AtomicFloat64(value);
              } else {
                argument = new AtomicFloat32(value);
              }
            } else if (isString(value)) {
              argument = new AtomicString(value);
            } else if (isBlob(value)) {
              argument = new AtomicBlob(value);
            } else {
              throw new Error('OSC Message found unknown argument type.');
            }
            encoder.add(argument);
          });
        })();
      }
      return encoder.merge();
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (!(dataView instanceof DataView)) {
        throw new Error('OSC Message expects an instance of type DataView.');
      }
      var address = new AtomicString();
      address.unpack(dataView, initialOffset);
      var types = new AtomicString();
      types.unpack(dataView, address.offset);
      if (address.value.length === 0 || address.value[0] !== '/') {
        throw new Error('OSC Message found malformed or missing address string.');
      }
      if (types.value.length === 0 && types.value[0] !== ',') {
        throw new Error('OSC Message found malformed or missing type string.');
      }
      var offset = types.offset;
      var next = void 0;
      var type = void 0;
      var args = [];
      for (var i = 1; i < types.value.length; i += 1) {
        type = types.value[i];
        if (type === 'i') {
          next = new AtomicInt32();
        } else if (type === 'f') {
          if (option('doublePrecisionFloats')) {
            next = new AtomicFloat64();
          } else {
            next = new AtomicFloat32();
          }
        } else if (type === 's') {
          next = new AtomicString();
        } else if (type === 'b') {
          next = new AtomicBlob();
        } else {
          throw new Error('OSC Message found non-standard argument type.');
        }
        offset = next.unpack(dataView, offset);
        args.push(next.value);
      }
      this.offset = offset;
      this.address = address.value;
      this.types = types.value;
      this.args = args;
      return this.offset;
    }
  }]);
  return Message;
}();

var BUNDLE_TAG = '#bundle';
var Bundle = function () {
  function Bundle() {
    var _this = this;
    classCallCheck(this, Bundle);
    this.offset = 0;
    this.timetag = new AtomicTimetag();
    this.bundleElements = [];
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length > 0) {
      if (args[0] instanceof AtomicTimetag) {
        this.timetag = args.shift();
      } else if (isArray(args[0])) {
        args[0].forEach(function (item) {
          _this.add(item);
        });
        if (args.length > 1 && args[1] instanceof AtomicTimetag) {
          this.timetag = new AtomicTimetag(args[1]);
        }
      } else {
        args.forEach(function (item) {
          _this.add(item);
        });
      }
    }
  }
  createClass(Bundle, [{
    key: 'timestamp',
    value: function timestamp(ms) {
      if (!isInt(ms)) {
        throw new Error('OSC Bundle needs an Integer for setting its timestamp.');
      }
      this.timetag = new AtomicTimetag(ms);
    }
  }, {
    key: 'add',
    value: function add(item) {
      if (!(item instanceof Message || item instanceof Bundle)) {
        throw new Error('OSC Bundle contains only Messages and Bundles.');
      }
      this.bundleElements.push(item);
    }
  }, {
    key: 'pack',
    value: function pack() {
      var encoder = new EncodeHelper();
      encoder.add(new AtomicString(BUNDLE_TAG));
      if (!this.timetag) {
        this.timetag = new AtomicTimetag();
      }
      encoder.add(this.timetag);
      this.bundleElements.forEach(function (item) {
        encoder.add(new AtomicInt32(item.pack().byteLength));
        encoder.add(item);
      });
      return encoder.merge();
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (!(dataView instanceof DataView)) {
        throw new Error('OSC Bundle expects an instance of type DataView.');
      }
      var head = new AtomicString();
      head.unpack(dataView, initialOffset);
      if (head.value !== BUNDLE_TAG) {
        throw new Error('OSC Bundle does not contain a valid #bundle head.');
      }
      var timetag = new AtomicTimetag();
      var offset = timetag.unpack(dataView, head.offset);
      this.bundleElements = [];
      while (offset < dataView.byteLength) {
        var packet = new Packet();
        var size = new AtomicInt32();
        offset = size.unpack(dataView, offset);
        offset = packet.unpack(dataView, offset, this.timetag);
        this.bundleElements.push(packet.value);
      }
      this.offset = offset;
      this.timetag = timetag;
      return this.offset;
    }
  }]);
  return Bundle;
}();

var Packet = function () {
  function Packet(value) {
    classCallCheck(this, Packet);
    if (value && !(value instanceof Message || value instanceof Bundle)) {
      throw new Error('OSC Packet can only consist of Message or Bundle.');
    }
    this.value = value;
    this.offset = 0;
  }
  createClass(Packet, [{
    key: 'pack',
    value: function pack() {
      if (!this.value) {
        throw new Error('OSC Packet can not be encoded with empty body.');
      }
      return this.value.pack();
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var timetag = arguments[2];
      if (!(dataView instanceof DataView)) {
        throw new Error('OSC Packet expects an instance of type DataView.');
      }
      if (dataView.byteLength % 4 !== 0) {
        throw new Error('OSC Packet byteLength has to be a multiple of four.');
      }
      var head = new AtomicString();
      head.unpack(dataView, initialOffset);
      var item = void 0;
      if (head.value === BUNDLE_TAG) {
        item = new Bundle();
        item.unpack(dataView, initialOffset);
        if (timetag && item.timetag.value.timestamp() < timetag.timestamp()) {
          throw new Error('OSC Packet timetag of enclosing bundle is past timestamp of enclosed ones.');
        }
      } else {
        item = new Message();
        item.unpack(dataView, initialOffset);
        var eventHandler = new EventHandler();
        if (timetag) {
          item.timetag = timetag;
          eventHandler.notify(item.address, item, item.timetag.value);
        } else {
          eventHandler.notify(item.address, item);
        }
      }
      this.offset = item.offset;
      this.value = item;
      return this.offset;
    }
  }]);
  return Packet;
}();

var defaultOptions = {
  connectionPlugin: null,
  doublePrecisionFloats: false,
  discardLateMessages: false
};

var instance = null;
function option(key) {
  var options = instance ? instance.options : defaultOptions;
  if (!(key in options) || !isString(key)) {
    throw new Error('OSC option key does not exist or is not valid.');
  }
  return options[key];
}
var OSC = function () {
  function OSC() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, OSC);
    if (!instance) {
      instance = this;
    }
    if (!isObject(options)) {
      throw new Error('OSC options argument has to be an object.');
    }
    this.options = Object.assign({}, defaultOptions, options);
    this.eventHandler = new EventHandler();
    if (this.options.connectionPlugin && this.options.connectionPlugin.registerEventHandler) {
      this.options.connectionPlugin.registerEventHandler(this.eventHandler);
    }
    return instance;
  }
  createClass(OSC, [{
    key: 'on',
    value: function on(eventName, callback) {
      if (!(isString(eventName) && isFunction(callback))) {
        throw new Error('OSC event listener needs an event or address string and a function as callback.');
      }
      return this.eventHandler.on(eventName, callback);
    }
  }, {
    key: 'off',
    value: function off(eventName, subscriptionId) {
      if (!(isString(eventName) && isInt(subscriptionId))) {
        throw new Error('OSC listener needs a string and a listener id number to unsubscribe from event.');
      }
      return this.eventHandler.off(eventName, subscriptionId);
    }
  }, {
    key: 'open',
    value: function open() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (!isObject(options)) {
        throw new Error('OSC connection options argument has to be an object.');
      }
      if (!(this.options.connectionPlugin && isFunction(this.options.connectionPlugin.open))) {
        throw new Error('OSC connection#open is not implemented.');
      }
      return this.options.connectionPlugin.open(options);
    }
  }, {
    key: 'status',
    value: function status() {
      if (!(this.options.connectionPlugin && isFunction(this.options.connectionPlugin.status))) {
        throw new Error('OSC connection#status is not implemented.');
      }
      return this.options.connectionPlugin.status();
    }
  }, {
    key: 'close',
    value: function close() {
      if (!(this.options.connectionPlugin && isFunction(this.options.connectionPlugin.close))) {
        throw new Error('OSC connection#close is not implemented.');
      }
      return this.options.connectionPlugin.close();
    }
  }, {
    key: 'send',
    value: function send(packet) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!(this.options.connectionPlugin && isFunction(this.options.connectionPlugin.send))) {
        throw new Error('OSC connection#send is not implemented.');
      }
      if (!(packet instanceof Message || packet instanceof Bundle || packet instanceof Packet)) {
        throw new Error('OSC can only send Messages, Bundles or Packets.');
      }
      if (!isObject(options)) {
        throw new Error('OSC connection options argument has to be an object.');
      }
      return this.options.connectionPlugin.send(packet.pack(this.options), options);
    }
  }]);
  return OSC;
}();

exports.OSC = OSC;
exports.Packet = Packet;
exports.Bundle = Bundle;
exports.Message = Message;
exports.AtomicInt32 = AtomicInt32;
exports.AtomicFloat32 = AtomicFloat32;
exports.AtomicString = AtomicString;
exports.AtomicBlob = AtomicBlob;
exports.AtomicTimetag = AtomicTimetag;
exports.Timetag = Timetag;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=osc.js.map
