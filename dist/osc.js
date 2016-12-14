(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.OSC = global.OSC || {})));
}(this, function (exports) { 'use strict';

  var asyncGenerator = function () {
    function AwaitValue(value) {
      this.value = value;
    }

    function AsyncGenerator(gen) {
      var front, back;

      function send(key, arg) {
        return new Promise(function (resolve, reject) {
          var request = {
            key: key,
            arg: arg,
            resolve: resolve,
            reject: reject,
            next: null
          };

          if (back) {
            back = back.next = request;
          } else {
            front = back = request;
            resume(key, arg);
          }
        });
      }

      function resume(key, arg) {
        try {
          var result = gen[key](arg);
          var value = result.value;

          if (value instanceof AwaitValue) {
            Promise.resolve(value.value).then(function (arg) {
              resume("next", arg);
            }, function (arg) {
              resume("throw", arg);
            });
          } else {
            settle(result.done ? "return" : "normal", result.value);
          }
        } catch (err) {
          settle("throw", err);
        }
      }

      function settle(type, value) {
        switch (type) {
          case "return":
            front.resolve({
              value: value,
              done: true
            });
            break;

          case "throw":
            front.reject(value);
            break;

          default:
            front.resolve({
              value: value,
              done: false
            });
            break;
        }

        front = front.next;

        if (front) {
          resume(front.key, front.arg);
        } else {
          back = null;
        }
      }

      this._invoke = send;

      if (typeof gen.return !== "function") {
        this.return = undefined;
      }
    }

    if (typeof Symbol === "function" && Symbol.asyncIterator) {
      AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
        return this;
      };
    }

    AsyncGenerator.prototype.next = function (arg) {
      return this._invoke("next", arg);
    };

    AsyncGenerator.prototype.throw = function (arg) {
      return this._invoke("throw", arg);
    };

    AsyncGenerator.prototype.return = function (arg) {
      return this._invoke("return", arg);
    };

    return {
      wrap: function (fn) {
        return function () {
          return new AsyncGenerator(fn.apply(this, arguments));
        };
      },
      await: function (value) {
        return new AwaitValue(value);
      }
    };
  }();

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

  var Entity = function Entity(value) {
    classCallCheck(this, Entity);

    this.value = value;
    this.offset = 0;
  };

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

  function isBlob(n) {
    return n instanceof Uint8Array;
  }

  function pad(n) {
    return n + 3 & ~0x03;
  }

  function typeChar(item) {
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

    throw new Error('OSC Helpers can only prepare addresses which are Array of String.');
  }

  var Helper = function () {
    function Helper() {
      classCallCheck(this, Helper);

      this.data = [];
      this.byteLength = 0;
    }

    createClass(Helper, [{
      key: 'add',
      value: function add(item) {
        var buffer = item.encode();
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
    return Helper;
  }();

  var Atomic = function (_Entity) {
    inherits(Atomic, _Entity);

    function Atomic() {
      classCallCheck(this, Atomic);
      return possibleConstructorReturn(this, (Atomic.__proto__ || Object.getPrototypeOf(Atomic)).apply(this, arguments));
    }

    createClass(Atomic, [{
      key: 'encode',
      value: function encode(type, byteLength) {
        var data = new Uint8Array(byteLength);
        var dataView = new DataView(data.buffer);

        if (!this.value) {
          throw new Error('OSC Atomic can not be encoded with empty value.');
        }

        dataView[type](this.offset, this.value, false);

        return data;
      }
    }, {
      key: 'decode',
      value: function decode(dataView, type, byteLength, offset) {
        this.value = dataView[type](offset, false);
        this.offset = offset + byteLength;
        return this.offset;
      }
    }]);
    return Atomic;
  }(Entity);

  var AtomicInt32 = function (_Atomic) {
    inherits(AtomicInt32, _Atomic);

    function AtomicInt32(value) {
      classCallCheck(this, AtomicInt32);

      if (value && !isInt(value)) {
        throw new Error('OSC AtomicInt32 constructor expects value of type integer number.');
      }

      return possibleConstructorReturn(this, (AtomicInt32.__proto__ || Object.getPrototypeOf(AtomicInt32)).call(this, value));
    }

    createClass(AtomicInt32, [{
      key: 'encode',
      value: function encode() {
        return get(AtomicInt32.prototype.__proto__ || Object.getPrototypeOf(AtomicInt32.prototype), 'encode', this).call(this, 'setInt32', 4);
      }
    }, {
      key: 'decode',
      value: function decode(dataView, offset) {
        return get(AtomicInt32.prototype.__proto__ || Object.getPrototypeOf(AtomicInt32.prototype), 'decode', this).call(this, dataView, 'getInt32', 4, offset);
      }
    }]);
    return AtomicInt32;
  }(Atomic);

  var AtomicFloat32 = function (_Atomic) {
    inherits(AtomicFloat32, _Atomic);

    function AtomicFloat32(value) {
      classCallCheck(this, AtomicFloat32);

      if (value && !isFloat(value)) {
        throw new Error('OSC AtomicFloat32 constructor expects value of type float number.');
      }

      return possibleConstructorReturn(this, (AtomicFloat32.__proto__ || Object.getPrototypeOf(AtomicFloat32)).call(this, value));
    }

    createClass(AtomicFloat32, [{
      key: 'encode',
      value: function encode() {
        return get(AtomicFloat32.prototype.__proto__ || Object.getPrototypeOf(AtomicFloat32.prototype), 'encode', this).call(this, 'setFloat32', 4);
      }
    }, {
      key: 'decode',
      value: function decode(dataView, offset) {
        return get(AtomicFloat32.prototype.__proto__ || Object.getPrototypeOf(AtomicFloat32.prototype), 'decode', this).call(this, dataView, 'getFloat32', 4, offset);
      }
    }]);
    return AtomicFloat32;
  }(Atomic);

  var AtomicString = function (_Atomic) {
    inherits(AtomicString, _Atomic);

    function AtomicString(value) {
      classCallCheck(this, AtomicString);

      if (value && typeof value !== 'string') {
        throw new Error('OSC AtomicString constructor expects value of type string.');
      }

      return possibleConstructorReturn(this, (AtomicString.__proto__ || Object.getPrototypeOf(AtomicString)).call(this, value));
    }

    createClass(AtomicString, [{
      key: 'encode',
      value: function encode() {
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
      key: 'decode',
      value: function decode(dataView, offset) {
        var end = offset;
        var charcode = void 0;
        var data = [];

        for (; end < dataView.byteLength; end += 1) {
          charcode = dataView.getUint8(end);

          if (charcode !== 0) {
            data.push(charcode);
          } else {
            end += 1;
            break;
          }
        }

        if (end === dataView.length) {
          throw new Error('OSC AtomicString found a malformed  string.');
        }

        this.offset = pad(end);
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
      key: 'encode',
      value: function encode() {
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
      key: 'decode',
      value: function decode(dataView, offset) {
        var byteLength = dataView.getInt32(offset, false);

        this.value = new Uint8Array(dataView.buffer, offset + 4, byteLength);
        this.offset = pad(offset + 4 + byteLength);

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
      this.timetag = 0;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (args.length > 0) {
        if (!(isString(args[0]) || isArray(args[0]))) {
          throw new Error('OSC Message constructor first argument (address) must be a string or array.');
        }

        this.address = prepareAddress(args.shift());
        this.types = args.map(function (item) {
          return typeChar(item);
        }).join('');
        this.args = args;
      }
    }

    createClass(Message, [{
      key: 'add',
      value: function add(value) {
        if (!value) {
          throw new Error('OSC Message expects a valid value for adding.');
        }

        this.args.push(value);
        this.types += typeChar(value);
      }
    }, {
      key: 'encode',
      value: function encode() {
        var _this = this;

        if (this.address.length === 0 || this.address[0] !== '/') {
          throw new Error('OSC Message does not have a proper address.');
        }

        var encoder = new Helper();

        encoder.add(new AtomicString(this.address));
        encoder.add(new AtomicString(',' + this.types));

        if (this.args.length > 0) {
          (function () {
            var argument = void 0;

            _this.args.forEach(function (value) {
              if (isInt(value)) {
                argument = new AtomicInt32(value);
              } else if (isFloat(value)) {
                argument = new AtomicFloat32(value);
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

        this.offset = encoder.byteLength;

        return encoder.merge();
      }
    }, {
      key: 'decode',
      value: function decode(dataView) {
        var address = new AtomicString();
        address.decode(dataView, 0);

        var types = new AtomicString();
        types.decode(dataView, address.offset);

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
            next = new AtomicFloat32();
          } else if (type === 's') {
            next = new AtomicString();
          } else if (type === 'b') {
            next = new AtomicBlob();
          } else {
            throw new Error('OSC Message found non-standard argument type.');
          }

          offset = next.decode(dataView, offset);
          args.push(next.value);
        }

        this.address = address.value;
        this.types = types.value;
        this.args = args;

        return this;
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

      if (value && !(value instanceof Timetag)) {
        throw new Error('OSC AtomicTimetag constructor expects value of type Timetag.');
      }

      return possibleConstructorReturn(this, (AtomicTimetag.__proto__ || Object.getPrototypeOf(AtomicTimetag)).call(this, value));
    }

    createClass(AtomicTimetag, [{
      key: 'encode',
      value: function encode() {
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
      key: 'decode',
      value: function decode(dataView, offset) {
        var seconds = dataView.getUint32(offset, false);
        var fractions = dataView.getUint32(offset + 4, false);

        this.value = new Timetag(seconds, fractions);
        this.offset += 8;

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
        if (args[0] instanceof AtomicTimetag) {
          this.timetag = args.shift();
        } else {
          args.forEach(function (item) {
            _this.add(item);
          });
        }
      }
    }

    createClass(Bundle, [{
      key: 'add',
      value: function add(item) {
        if (!(item instanceof Message || item instanceof Bundle)) {
          throw new Error('OSC Bundle contains only Messages and Bundles');
        }

        this.bundleElements.push(item);
      }
    }, {
      key: 'encode',
      value: function encode() {
        var encoder = new Helper();

        encoder.add(new AtomicString(BUNDLE_TAG));
        encoder.add(this.timetag);

        this.bundleElements.forEach(function (item) {
          item.encode();

          encoder.add(new AtomicInt32(item.offset));
          encoder.add(item);
        });

        return encoder.merge();
      }
    }, {
      key: 'decode',
      value: function decode(dataView, offset) {
        var head = new AtomicString();
        var end = head.decode(dataView, offset);

        if (head !== BUNDLE_TAG) {
          throw new Error('OSC Bundle does not contain a valid #bundle head.');
        }

        var timetag = new AtomicTimetag();
        end = timetag.decode(dataView, end);

        this.bundleElements = [];

        for (var i = 0; i < dataView.byteLength; i += 1) {
          var packet = new Packet();
          var size = new AtomicInt32();

          end = size.decode(dataView, end);
          packet.decode(dataView, end);

          this.bundleElements.push(packet);
        }

        this.offset = end;
        this.timetag = timetag;

        return end;
      }
    }]);
    return Bundle;
  }();

  var Packet = function (_Entity) {
    inherits(Packet, _Entity);

    function Packet(value) {
      classCallCheck(this, Packet);

      if (value && !(value instanceof Message || value instanceof Bundle)) {
        throw new Error('OSC Packet can only consist of Message or Bundle.');
      }
      return possibleConstructorReturn(this, (Packet.__proto__ || Object.getPrototypeOf(Packet)).call(this, value));
    }

    createClass(Packet, [{
      key: 'encode',
      value: function encode() {
        if (!this.value) {
          throw new Error('OSC Packet cant be encoded with empty body.');
        }

        return this.value.encode();
      }
    }, {
      key: 'decode',
      value: function decode(dataView, timetag) {
        if (dataView.byteLength % 4 !== 0) {
          throw new Error('OSC Packet byteLength has to be a multiple of four.');
        }

        var head = new AtomicString();
        head.decode(dataView, 0);

        var item = void 0;

        if (head.value === BUNDLE_TAG) {
          item = new Bundle();
        } else {
          item = new Message();
          if (timetag) {
            item.timetag = timetag;
          }
        }

        item.decode(dataView);

        return item;
      }
    }]);
    return Packet;
  }(Entity);

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

}));
//# sourceMappingURL=osc.js.map