(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.OSC = factory());
}(this, (function () { 'use strict';

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
function isUndefined(n) {
  return typeof n === 'undefined';
}
function pad(n) {
  return n + 3 & ~0x03;
}
function hasProperty(name) {
  return Object.prototype.hasOwnProperty.call(typeof global !== 'undefined' ? global : window,
  name);
}
function dataView(obj) {
  if (obj.buffer) {
    return new DataView(obj.buffer);
  } else if (obj instanceof ArrayBuffer) {
    return new DataView(obj);
  }
  return new DataView(new Uint8Array(obj));
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
  throw new Error('OSC typeTag() found unknown value type');
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
  throw new Error('OSC prepareAddress() needs addresses of type array or string');
}
function prepareRegExPattern(str) {
  var pattern = void 0;
  if (!isString(str)) {
    throw new Error('OSC prepareRegExPattern() needs strings');
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
        throw new Error('OSC Atomic cant\'t be packed without given method or byteLength');
      }
      var data = new Uint8Array(byteLength);
      var dataView$$1 = new DataView(data.buffer);
      if (isUndefined(this.value)) {
        throw new Error('OSC Atomic cant\'t be encoded with empty value');
      }
      dataView$$1[method](this.offset, this.value, false);
      return data;
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView$$1, method, byteLength) {
      var initialOffset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      if (!(dataView$$1 && method && byteLength)) {
        throw new Error('OSC Atomic cant\'t be unpacked without given dataView, method or byteLength');
      }
      if (!(dataView$$1 instanceof DataView)) {
        throw new Error('OSC Atomic expects an instance of type DataView');
      }
      this.value = dataView$$1[method](initialOffset, false);
      this.offset = initialOffset + byteLength;
      return this.offset;
    }
  }]);
  return Atomic;
}();

var AtomicInt32 = function (_Atomic) {
  inherits(AtomicInt32, _Atomic);
  function AtomicInt32(value) {
    classCallCheck(this, AtomicInt32);
    if (value && !isInt(value)) {
      throw new Error('OSC AtomicInt32 constructor expects value of type number');
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
    value: function unpack(dataView$$1) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return get(AtomicInt32.prototype.__proto__ || Object.getPrototypeOf(AtomicInt32.prototype), 'unpack', this).call(this, dataView$$1, 'getInt32', 4, initialOffset);
    }
  }]);
  return AtomicInt32;
}(Atomic);

var AtomicFloat32 = function (_Atomic) {
  inherits(AtomicFloat32, _Atomic);
  function AtomicFloat32(value) {
    classCallCheck(this, AtomicFloat32);
    if (value && !isFloat(value)) {
      throw new Error('OSC AtomicFloat32 constructor expects value of type float');
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
    value: function unpack(dataView$$1) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return get(AtomicFloat32.prototype.__proto__ || Object.getPrototypeOf(AtomicFloat32.prototype), 'unpack', this).call(this, dataView$$1, 'getFloat32', 4, initialOffset);
    }
  }]);
  return AtomicFloat32;
}(Atomic);

var STR_SLICE_SIZE = 65537;
var STR_ENCODING = 'utf-8';
function charCodesToString(charCodes) {
  if (hasProperty('Buffer')) {
    return Buffer.from(charCodes).toString(STR_ENCODING);
  } else if (hasProperty('TextDecoder')) {
    return new TextDecoder(STR_ENCODING)
    .decode(new Int8Array(charCodes));
  }
  var str = '';
  for (var i = 0; i < charCodes.length; i += STR_SLICE_SIZE) {
    str += String.fromCharCode.apply(null, charCodes.slice(i, i + STR_SLICE_SIZE));
  }
  return str;
}
var AtomicString = function (_Atomic) {
  inherits(AtomicString, _Atomic);
  function AtomicString(value) {
    classCallCheck(this, AtomicString);
    if (value && !isString(value)) {
      throw new Error('OSC AtomicString constructor expects value of type string');
    }
    return possibleConstructorReturn(this, (AtomicString.__proto__ || Object.getPrototypeOf(AtomicString)).call(this, value));
  }
  createClass(AtomicString, [{
    key: 'pack',
    value: function pack() {
      if (isUndefined(this.value)) {
        throw new Error('OSC AtomicString can not be encoded with empty value');
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
    value: function unpack(dataView$$1) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (!(dataView$$1 instanceof DataView)) {
        throw new Error('OSC AtomicString expects an instance of type DataView');
      }
      var offset = initialOffset;
      var charcode = void 0;
      var charCodes = [];
      for (; offset < dataView$$1.byteLength; offset += 1) {
        charcode = dataView$$1.getUint8(offset);
        if (charcode !== 0) {
          charCodes.push(charcode);
        } else {
          offset += 1;
          break;
        }
      }
      if (offset === dataView$$1.length) {
        throw new Error('OSC AtomicString found a malformed OSC string');
      }
      this.offset = pad(offset);
      this.value = charCodesToString(charCodes);
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
      throw new Error('OSC AtomicBlob constructor expects value of type Uint8Array');
    }
    return possibleConstructorReturn(this, (AtomicBlob.__proto__ || Object.getPrototypeOf(AtomicBlob)).call(this, value));
  }
  createClass(AtomicBlob, [{
    key: 'pack',
    value: function pack() {
      if (isUndefined(this.value)) {
        throw new Error('OSC AtomicBlob can not be encoded with empty value');
      }
      var byteLength = pad(this.value.byteLength);
      var data = new Uint8Array(byteLength + 4);
      var dataView$$1 = new DataView(data.buffer);
      dataView$$1.setInt32(0, this.value.byteLength, false);
      data.set(this.value, 4);
      return data;
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView$$1) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (!(dataView$$1 instanceof DataView)) {
        throw new Error('OSC AtomicBlob expects an instance of type DataView');
      }
      var byteLength = dataView$$1.getInt32(initialOffset, false);
      this.value = new Uint8Array(dataView$$1.buffer, initialOffset + 4, byteLength);
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
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length > 0) {
      if (!(isString(args[0]) || isArray(args[0]))) {
        throw new Error('OSC Message constructor first argument (address) must be a string or array');
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
      if (isUndefined(item)) {
        throw new Error('OSC Message needs a valid OSC Atomic Data Type');
      }
      this.args.push(item);
      this.types += typeTag(item);
    }
  }, {
    key: 'pack',
    value: function pack() {
      if (this.address.length === 0 || this.address[0] !== '/') {
        throw new Error('OSC Message has an invalid address');
      }
      var encoder = new EncodeHelper();
      encoder.add(new AtomicString(this.address));
      encoder.add(new AtomicString(',' + this.types));
      if (this.args.length > 0) {
        var argument = void 0;
        this.args.forEach(function (value) {
          if (isInt(value)) {
            argument = new AtomicInt32(value);
          } else if (isFloat(value)) {
            argument = new AtomicFloat32(value);
          } else if (isString(value)) {
            argument = new AtomicString(value);
          } else if (isBlob(value)) {
            argument = new AtomicBlob(value);
          } else {
            throw new Error('OSC Message found unknown argument type');
          }
          encoder.add(argument);
        });
      }
      return encoder.merge();
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView$$1) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (!(dataView$$1 instanceof DataView)) {
        throw new Error('OSC Message expects an instance of type DataView.');
      }
      var address = new AtomicString();
      address.unpack(dataView$$1, initialOffset);
      var types = new AtomicString();
      types.unpack(dataView$$1, address.offset);
      if (address.value.length === 0 || address.value[0] !== '/') {
        throw new Error('OSC Message found malformed or missing address string');
      }
      if (types.value.length === 0 && types.value[0] !== ',') {
        throw new Error('OSC Message found malformed or missing type string');
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
          next = new AtomicFloat32();
        } else if (type === 's') {
          next = new AtomicString();
        } else if (type === 'b') {
          next = new AtomicBlob();
        } else {
          throw new Error('OSC Message found non-standard argument type');
        }
        offset = next.unpack(dataView$$1, offset);
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

var SECONDS_70_YEARS = 2208988800;
var TWO_POWER_32 = 4294967296;
var Timetag = function () {
  function Timetag() {
    var seconds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var fractions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    classCallCheck(this, Timetag);
    if (!(isInt(seconds) && isInt(fractions))) {
      throw new Error('OSC Timetag constructor expects values of type integer number');
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
      return (seconds + Math.round(this.fractions / TWO_POWER_32)) * 1000;
    }
  }]);
  return Timetag;
}();
var AtomicTimetag = function (_Atomic) {
  inherits(AtomicTimetag, _Atomic);
  function AtomicTimetag() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();
    classCallCheck(this, AtomicTimetag);
    var timetag = new Timetag();
    if (value instanceof Timetag) {
      timetag = value;
    } else if (isInt(value)) {
      timetag.timestamp(value);
    } else if (isDate(value)) {
      timetag.timestamp(value.getTime());
    }
    return possibleConstructorReturn(this, (AtomicTimetag.__proto__ || Object.getPrototypeOf(AtomicTimetag)).call(this, timetag));
  }
  createClass(AtomicTimetag, [{
    key: 'pack',
    value: function pack() {
      if (isUndefined(this.value)) {
        throw new Error('OSC AtomicTimetag can not be encoded with empty value');
      }
      var _value = this.value,
          seconds = _value.seconds,
          fractions = _value.fractions;
      var data = new Uint8Array(8);
      var dataView$$1 = new DataView(data.buffer);
      dataView$$1.setInt32(0, seconds, false);
      dataView$$1.setInt32(4, fractions, false);
      return data;
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView$$1) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (!(dataView$$1 instanceof DataView)) {
        throw new Error('OSC AtomicTimetag expects an instance of type DataView');
      }
      var seconds = dataView$$1.getUint32(initialOffset, false);
      var fractions = dataView$$1.getUint32(initialOffset + 4, false);
      this.value = new Timetag(seconds, fractions);
      this.offset = initialOffset + 8;
      return this.offset;
    }
  }]);
  return AtomicTimetag;
}(Atomic);

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
      if (args[0] instanceof Date || isInt(args[0])) {
        this.timetag = new AtomicTimetag(args[0]);
      } else if (isArray(args[0])) {
        args[0].forEach(function (item) {
          _this.add(item);
        });
        if (args.length > 1 && (args[1] instanceof Date || isInt(args[0]))) {
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
        throw new Error('OSC Bundle needs an integer for setting the timestamp');
      }
      this.timetag = new AtomicTimetag(ms);
    }
  }, {
    key: 'add',
    value: function add(item) {
      if (!(item instanceof Message || item instanceof Bundle)) {
        throw new Error('OSC Bundle contains only Messages and Bundles');
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
    value: function unpack(dataView$$1) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (!(dataView$$1 instanceof DataView)) {
        throw new Error('OSC Bundle expects an instance of type DataView');
      }
      var head = new AtomicString();
      head.unpack(dataView$$1, initialOffset);
      if (head.value !== BUNDLE_TAG) {
        throw new Error('OSC Bundle does not contain a valid #bundle head');
      }
      var timetag = new AtomicTimetag();
      var offset = timetag.unpack(dataView$$1, head.offset);
      this.bundleElements = [];
      while (offset < dataView$$1.byteLength) {
        var packet = new Packet();
        var size = new AtomicInt32();
        offset = size.unpack(dataView$$1, offset);
        offset = packet.unpack(dataView$$1, offset, this.timetag);
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
      throw new Error('OSC Packet value has to be Message or Bundle');
    }
    this.value = value;
    this.offset = 0;
  }
  createClass(Packet, [{
    key: 'pack',
    value: function pack() {
      if (!this.value) {
        throw new Error('OSC Packet can not be encoded with empty body');
      }
      return this.value.pack();
    }
  }, {
    key: 'unpack',
    value: function unpack(dataView) {
      var initialOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (!(dataView instanceof DataView)) {
        throw new Error('OSC Packet expects an instance of type DataView');
      }
      if (dataView.byteLength % 4 !== 0) {
        throw new Error('OSC Packet byteLength has to be a multiple of four');
      }
      var head = new AtomicString();
      head.unpack(dataView, initialOffset);
      var item = void 0;
      if (head.value === BUNDLE_TAG) {
        item = new Bundle();
      } else {
        item = new Message();
      }
      item.unpack(dataView, initialOffset);
      this.offset = item.offset;
      this.value = item;
      return this.offset;
    }
  }]);
  return Packet;
}();

var defaultOptions$2 = {
  discardLateMessages: false
};
var EventHandler = function () {
  function EventHandler(options) {
    classCallCheck(this, EventHandler);
    this.options = Object.assign({}, defaultOptions$2, options);
    this.addressHandlers = [];
    this.eventHandlers = {
      open: [],
      error: [],
      close: []
    };this.uuid = 0;
  }
  createClass(EventHandler, [{
    key: 'dispatch',
    value: function dispatch(packet) {
      var _this = this;
      if (!(packet instanceof Packet)) {
        throw new Error('OSC EventHander dispatch() accepts only arguments of type Packet');
      }
      if (!packet.value) {
        throw new Error('OSC EventHander dispatch() can\'t read empty Packets');
      }
      if (packet.value instanceof Bundle) {
        var bundle = packet.value;
        return bundle.bundleElements.forEach(function (bundleItem) {
          if (bundleItem instanceof Bundle) {
            if (bundle.timetag.value.timestamp() < bundleItem.timetag.value.timestamp()) {
              throw new Error('OSC Bundle timestamp is older than the timestamp of enclosed Bundles');
            }
            return _this.dispatch(bundleItem);
          } else if (bundleItem instanceof Message) {
            var message = bundleItem;
            return _this.notify(message.address, message, bundle.timetag.value.timestamp());
          }
          throw new Error('OSC EventHander dispatch() can\'t dispatch unknown Packet value');
        });
      } else if (packet.value instanceof Message) {
        var message = packet.value;
        return this.notify(message.address, message);
      }
      throw new Error('OSC EventHander dispatch() can\'t dispatch unknown Packet value');
    }
  }, {
    key: 'call',
    value: function call(name, data) {
      var success = false;
      if (isString(name) && name in this.eventHandlers) {
        this.eventHandlers[name].forEach(function (handler) {
          handler.callback(data);
          success = true;
        });
        return success;
      }
      var handlerKeys = Object.keys(this.addressHandlers);
      var handlers = this.addressHandlers;
      handlerKeys.forEach(function (key) {
        var regex = new RegExp(prepareRegExPattern(prepareAddress(name)), 'g');
        var test = regex.test(key);
        if (test && key.length === regex.lastIndex) {
          handlers[key].forEach(function (handler) {
            handler.callback(data);
            success = true;
          });
        }
      });
      return success;
    }
  }, {
    key: 'notify',
    value: function notify() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (args.length === 0) {
        throw new Error('OSC EventHandler can not be called without any argument');
      }
      if (args[0] instanceof Packet) {
        return this.dispatch(args[0]);
      } else if (args[0] instanceof Bundle || args[0] instanceof Message) {
        return this.dispatch(new Packet(args[0]));
      } else if (!isString(args[0])) {
        var packet = new Packet();
        packet.unpack(dataView(args[0]));
        return this.dispatch(packet);
      }
      var name = args[0];
      var data = null;
      if (args.length > 1) {
        data = args[1];
      }
      var timestamp = null;
      if (args.length > 2) {
        if (isInt(args[2])) {
          timestamp = args[2];
        } else if (args[2] instanceof Date) {
          timestamp = args[2].getTime();
        } else {
          throw new Error('OSC EventHandler timestamp has to be a number or Date');
        }
      }
      if (timestamp) {
        var now = Date.now();
        if (now > timestamp) {
          if (!this.options.discardLateMessages) {
            return this.call(name, data);
          }
        }
        var that = this;
        setTimeout(function () {
          that.call(name, data);
        }, timestamp - now);
        return true;
      }
      return this.call(name, data);
    }
  }, {
    key: 'on',
    value: function on(name, callback) {
      if (!(isString(name) || isArray(name))) {
        throw new Error('OSC EventHandler accepts only strings or arrays for address patterns');
      }
      if (!isFunction(callback)) {
        throw new Error('OSC EventHandler callback has to be a function');
      }
      this.uuid += 1;
      var handler = {
        id: this.uuid,
        callback: callback
      };if (isString(name) && name in this.eventHandlers) {
        this.eventHandlers[name].push(handler);
        return this.uuid;
      }
      var address = prepareAddress(name);
      var regex = new RegExp(/[#*\s[\],/{}|?]/g);
      if (regex.test(address.split('/').join(''))) {
        throw new Error('OSC EventHandler address string contains invalid characters');
      }
      if (!(address in this.addressHandlers)) {
        this.addressHandlers[address] = [];
      }
      this.addressHandlers[address].push(handler);
      return this.uuid;
    }
  }, {
    key: 'off',
    value: function off(name, subscriptionId) {
      if (!(isString(name) || isArray(name))) {
        throw new Error('OSC EventHandler accepts only strings or arrays for address patterns');
      }
      if (!isInt(subscriptionId)) {
        throw new Error('OSC EventHandler subscription id has to be a number');
      }
      var key = void 0;
      var haystack = void 0;
      if (isString(name) && name in this.eventHandlers) {
        key = name;
        haystack = this.eventHandlers;
      } else {
        key = prepareAddress(name);
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

var defaultOptions$1 = {
  plugin: null,
  discardLateMessages: false
};var STATUS = {
  IS_NOT_INITIALIZED: -1,
  IS_CONNECTING: 0,
  IS_OPEN: 1,
  IS_CLOSING: 2,
  IS_CLOSED: 3
};
var OSC$2 = function () {
  function OSC(options) {
    classCallCheck(this, OSC);
    if (options && !isObject(options)) {
      throw new Error('OSC options argument has to be an object.');
    }
    this.options = Object.assign({}, defaultOptions$1, options);
    this.eventHandler = new EventHandler({
      discardLateMessages: this.options.discardLateMessages
    });
    var eventHandler = this.eventHandler;
    if (this.options.plugin && this.options.plugin.registerNotify) {
      this.options.plugin.registerNotify(function () {
        return eventHandler.notify.apply(eventHandler, arguments);
      });
    }
  }
  createClass(OSC, [{
    key: 'on',
    value: function on(eventName, callback) {
      if (!(isString(eventName) && isFunction(callback))) {
        throw new Error('OSC on() needs event- or address string and callback function');
      }
      return this.eventHandler.on(eventName, callback);
    }
  }, {
    key: 'off',
    value: function off(eventName, subscriptionId) {
      if (!(isString(eventName) && isInt(subscriptionId))) {
        throw new Error('OSC off() needs string and number (subscriptionId) to unsubscribe');
      }
      return this.eventHandler.off(eventName, subscriptionId);
    }
  }, {
    key: 'open',
    value: function open(options) {
      if (options && !isObject(options)) {
        throw new Error('OSC open() options argument needs to be an object');
      }
      if (!(this.options.plugin && isFunction(this.options.plugin.open))) {
        throw new Error('OSC Plugin API #open is not implemented!');
      }
      return this.options.plugin.open(options);
    }
  }, {
    key: 'status',
    value: function status() {
      if (!(this.options.plugin && isFunction(this.options.plugin.status))) {
        throw new Error('OSC Plugin API #status is not implemented!');
      }
      return this.options.plugin.status();
    }
  }, {
    key: 'close',
    value: function close() {
      if (!(this.options.plugin && isFunction(this.options.plugin.close))) {
        throw new Error('OSC Plugin API #close is not implemented!');
      }
      return this.options.plugin.close();
    }
  }, {
    key: 'send',
    value: function send(packet, options) {
      if (!(this.options.plugin && isFunction(this.options.plugin.send))) {
        throw new Error('OSC Plugin API #send is not implemented!');
      }
      if (!(packet instanceof Message || packet instanceof Bundle || packet instanceof Packet)) {
        throw new Error('OSC send() needs Messages, Bundles or Packets');
      }
      if (options && !isObject(options)) {
        throw new Error('OSC send() options argument has to be an object');
      }
      return this.options.plugin.send(packet.pack(), options);
    }
  }]);
  return OSC;
}();
OSC$2.STATUS = STATUS;
OSC$2.Packet = Packet;
OSC$2.Bundle = Bundle;
OSC$2.Message = Message;

var STATUS$1 = {
  IS_NOT_INITIALIZED: -1,
  IS_CONNECTING: 0,
  IS_OPEN: 1,
  IS_CLOSING: 2,
  IS_CLOSED: 3
};var defaultOptions$3 = {
  host: 'localhost',
  port: 8080,
  secure: false
};
var WebsocketBrowserPlugin = function () {
  function WebsocketBrowserPlugin(customOptions) {
    classCallCheck(this, WebsocketBrowserPlugin);
    if (!hasProperty('WebSocket')) {
      throw new Error('WebsocketBrowserPlugin can\'t find a WebSocket class');
    }
    this.options = Object.assign({}, defaultOptions$3, customOptions);
    this.socket = null;
    this.socketStatus = STATUS$1.IS_NOT_INITIALIZED;
    this.notify = function () {};
  }
  createClass(WebsocketBrowserPlugin, [{
    key: 'registerNotify',
    value: function registerNotify(fn) {
      this.notify = fn;
    }
  }, {
    key: 'status',
    value: function status() {
      return this.socketStatus;
    }
  }, {
    key: 'open',
    value: function open() {
      var _this = this;
      var customOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var options = Object.assign({}, this.options, customOptions);
      var port = options.port,
          host = options.host,
          secure = options.secure;
      if (this.socket) {
        this.close();
      }
      var protocol = secure ? 'wss' : 'ws';
      this.socket = new WebSocket(protocol + '://' + host + ':' + port);
      this.socket.binaryType = 'arraybuffer';
      this.socketStatus = STATUS$1.IS_CONNECTING;
      this.socket.onopen = function () {
        _this.socketStatus = STATUS$1.IS_OPEN;
        _this.notify('open');
      };
      this.socket.onclose = function () {
        _this.socketStatus = STATUS$1.IS_CLOSED;
        _this.notify('close');
      };
      this.socket.onerror = function (error) {
        _this.notify('error', error);
      };
      this.socket.onmessage = function (message) {
        _this.notify(message.data);
      };
    }
  }, {
    key: 'close',
    value: function close() {
      this.socketStatus = STATUS$1.IS_CLOSING;
      this.socket.close();
    }
  }, {
    key: 'send',
    value: function send(binary) {
      this.socket.send(binary);
    }
  }]);
  return WebsocketBrowserPlugin;
}();

var defaultOptions = {
  plugin: new WebsocketBrowserPlugin()
};
var OSC = function (_OSCBase) {
  inherits(OSC, _OSCBase);
  function OSC(options) {
    classCallCheck(this, OSC);
    return possibleConstructorReturn(this, (OSC.__proto__ || Object.getPrototypeOf(OSC)).call(this, Object.assign({}, defaultOptions, options)));
  }
  return OSC;
}(OSC$2);
OSC.WebsocketBrowserPlugin = WebsocketBrowserPlugin;

return OSC;

})));
