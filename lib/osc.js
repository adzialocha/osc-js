(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, function () { 'use strict';

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

    throw new Error('OSCMessage found unknown value type.');
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

    throw new Error('Helpers can only prepare addresses which are Array of String.');
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
    return EncodeHelper;
  }();

  var OSCAtomic = function () {
    function OSCAtomic(value) {
      classCallCheck(this, OSCAtomic);

      this.value = value;
      this.offset = 0;
    }

    createClass(OSCAtomic, [{
      key: 'encode',
      value: function encode(type, byteLength) {
        var data = new Uint8Array(byteLength);
        var dataView = new DataView(data.buffer);

        if (!this.value) {
          throw new Error('OSCAtomic can not be encoded with empty value.');
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
    return OSCAtomic;
  }();

  var OSCAtomicInt32 = function (_OSCAtomic) {
    inherits(OSCAtomicInt32, _OSCAtomic);

    function OSCAtomicInt32(value) {
      classCallCheck(this, OSCAtomicInt32);

      if (value && !isInt(value)) {
        throw new Error('OSCAtomicInt32 constructor expects value of type integer number.');
      }

      return possibleConstructorReturn(this, (OSCAtomicInt32.__proto__ || Object.getPrototypeOf(OSCAtomicInt32)).call(this, value));
    }

    createClass(OSCAtomicInt32, [{
      key: 'encode',
      value: function encode() {
        return get(OSCAtomicInt32.prototype.__proto__ || Object.getPrototypeOf(OSCAtomicInt32.prototype), 'encode', this).call(this, 'setInt32', 4);
      }
    }, {
      key: 'decode',
      value: function decode(dataView, offset) {
        return get(OSCAtomicInt32.prototype.__proto__ || Object.getPrototypeOf(OSCAtomicInt32.prototype), 'decode', this).call(this, dataView, 'getInt32', 4, offset);
      }
    }]);
    return OSCAtomicInt32;
  }(OSCAtomic);

  var OSCAtomicFloat32 = function (_OSCAtomic) {
    inherits(OSCAtomicFloat32, _OSCAtomic);

    function OSCAtomicFloat32(value) {
      classCallCheck(this, OSCAtomicFloat32);

      if (value && !isFloat(value)) {
        throw new Error('OSCAtomicFloat32 constructor expects value of type float number.');
      }

      return possibleConstructorReturn(this, (OSCAtomicFloat32.__proto__ || Object.getPrototypeOf(OSCAtomicFloat32)).call(this, value));
    }

    createClass(OSCAtomicFloat32, [{
      key: 'encode',
      value: function encode() {
        return get(OSCAtomicFloat32.prototype.__proto__ || Object.getPrototypeOf(OSCAtomicFloat32.prototype), 'encode', this).call(this, 'setFloat32', 4);
      }
    }, {
      key: 'decode',
      value: function decode(dataView, offset) {
        return get(OSCAtomicFloat32.prototype.__proto__ || Object.getPrototypeOf(OSCAtomicFloat32.prototype), 'decode', this).call(this, dataView, 'getFloat32', 4, offset);
      }
    }]);
    return OSCAtomicFloat32;
  }(OSCAtomic);

  var OSCAtomicString = function (_OSCAtomic) {
    inherits(OSCAtomicString, _OSCAtomic);

    function OSCAtomicString(value) {
      classCallCheck(this, OSCAtomicString);

      if (value && typeof value !== 'string') {
        throw new Error('OSCAtomicString constructor expects value of type string.');
      }

      return possibleConstructorReturn(this, (OSCAtomicString.__proto__ || Object.getPrototypeOf(OSCAtomicString)).call(this, value));
    }

    createClass(OSCAtomicString, [{
      key: 'encode',
      value: function encode() {
        if (!this.value) {
          throw new Error('OSCAtomicString can not be encoded with empty value.');
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
          throw new Error('OSCAtomicString found a malformed OSC string.');
        }

        this.offset = pad(end);
        this.value = String.fromCharCode.apply(null, data);

        return this.offset;
      }
    }]);
    return OSCAtomicString;
  }(OSCAtomic);

  var OSCAtomicBlob = function (_OSCAtomic) {
    inherits(OSCAtomicBlob, _OSCAtomic);

    function OSCAtomicBlob(value) {
      classCallCheck(this, OSCAtomicBlob);

      if (value && !isBlob(value)) {
        throw new Error('OSCAtomicBlob constructor expects value of type Uint8Array.');
      }

      return possibleConstructorReturn(this, (OSCAtomicBlob.__proto__ || Object.getPrototypeOf(OSCAtomicBlob)).call(this, value));
    }

    createClass(OSCAtomicBlob, [{
      key: 'encode',
      value: function encode() {
        if (!this.value) {
          throw new Error('OSCAtomicBlob can not be encoded with empty value.');
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
    return OSCAtomicBlob;
  }(OSCAtomic);

  var OSCMessage = function () {
    function OSCMessage() {
      classCallCheck(this, OSCMessage);

      this.address = '';
      this.types = '';
      this.args = [];
      this.timetag = 0;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (args.length > 0) {
        if (!(isString(args[0]) || isArray(args[0]))) {
          throw new Error('OSCMessage constructor first argument (address) must be a string or array.');
        }

        this.address = prepareAddress(args.shift());
        this.types = args.map(function (item) {
          return typeChar(item);
        }).join('');
        this.args = args;
      }
    }

    createClass(OSCMessage, [{
      key: 'add',
      value: function add(value) {
        if (!value) {
          throw new Error('OSCMessage expects a valid value for adding.');
        }

        this.args.push(value);
        this.types += typeChar(value);
      }
    }, {
      key: 'encode',
      value: function encode() {
        var _this = this;

        if (this.address.length === 0 || this.address[0] !== '/') {
          throw new Error('OSCMessage does not have a proper address.');
        }

        var encoder = new EncodeHelper();

        encoder.add(new OSCAtomicString(this.address));
        encoder.add(new OSCAtomicString(',' + this.types));

        if (this.args.length > 0) {
          (function () {
            var argument = void 0;

            _this.args.forEach(function (value) {
              if (isInt(value)) {
                argument = new OSCAtomicInt32(value);
              } else if (isFloat(value)) {
                argument = new OSCAtomicFloat32(value);
              } else if (isString(value)) {
                argument = new OSCAtomicString(value);
              } else if (isBlob(value)) {
                argument = new OSCAtomicBlob(value);
              } else {
                throw new Error('OSCMessage found unknown argument type.');
              }

              encoder.add(argument);
            });
          })();
        }

        return encoder.merge();
      }
    }, {
      key: 'decode',
      value: function decode(dataView) {
        var address = new OSCAtomicString();
        address.decode(dataView, 0);

        var types = new OSCAtomicString();
        types.decode(dataView, address.offset);

        if (address.value.length === 0 || address.value[0] !== '/') {
          throw new Error('OSCMessage found malformed or missing OSC address string.');
        }

        if (types.value.length === 0 && types.value[0] !== ',') {
          throw new Error('OSCMessage found malformed or missing OSC type string.');
        }

        var offset = types.offset;
        var next = void 0;
        var type = void 0;

        var args = [];

        for (var i = 1; i < types.value.length; i += 1) {
          type = types.value[i];

          if (type === 'i') {
            next = new OSCAtomicInt32();
          } else if (type === 'f') {
            next = new OSCAtomicFloat32();
          } else if (type === 's') {
            next = new OSCAtomicString();
          } else if (type === 'b') {
            next = new OSCAtomicBlob();
          } else {
            throw new Error('OSCMessage found non-standard argument type.');
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
    return OSCMessage;
  }();

  module.exports.OSCMessage = OSCMessage;

}));
//# sourceMappingURL=osc.js.map