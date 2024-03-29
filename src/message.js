import {
  isArray,
  isString,
  isUndefined,
} from './common/utils'

import Helper, { typeTag, prepareAddress } from './common/helpers'

import AtomicBlob from './atomic/blob'
import AtomicFloat32 from './atomic/float32'
import AtomicFloat64 from './atomic/float64'
import AtomicInt32 from './atomic/int32'
import AtomicInt64 from './atomic/int64'
import AtomicUInt64 from './atomic/uint64'
import AtomicString from './atomic/string'
import {
  VALUE_NONE, VALUE_TRUE, VALUE_FALSE, VALUE_INFINITY,
} from './atomic/constant'

/**
 * A TypedMessage consists of an OSC address and an optional array of typed OSC arguments.
 *
 * @typedef {'i'|'f'|'s'|'b'|'h'|'t'|'d'|'T'|'F'|'N'|'I'} MessageArgType
 *
 * - `i` - int32
 * - `f` - float32
 * - `s` - string
 * - `b` - blob
 * - `h` - int64
 * - `t` - uint64
 * - `d` - double
 * - `T` - True (no argument data)
 * - `F` - False (no argument data)
 * - `N` - Nil (no argument data)
 * - `I` - Infinitum (no argument data)
 *
 * @typedef {number|string|Blob|VALUE_TRUE|VALUE_FALSE|VALUE_NONE|VALUE_INFINITY} MessageArgValue
 *
 * @typedef {object} MessageArgObject
 * @property {MessageArgType} type
 * @property {MessageArgValue} value
 *
 * @example
 * const messageArgObject = {
 *   type: 'i', value: 123
 * }
 */
export class TypedMessage {
  /**
   * Create a TypedMessage instance
   * @param {string[]|string} address Address
   * @param {MessageArgValue[]} args Arguments
   *
   * @example
   * const message = new TypedMessage(['test', 'path'])
   * message.add('d', 123.123456789)
   * message.add('s', 'hello')
   *
   * @example
   * const message = new TypedMessage('/test/path', [
   *   { type: 'i', value: 123 },
   *   { type: 'd', value: 123.123 },
   *   { type: 'h', value: 0xFFFFFFn },
   *   { type: 'T', value: null },
   * ])
   */
  constructor(address, args) {
    /**
     * @type {number} offset
     * @private
     */
    this.offset = 0
    /** @type {string} address */
    this.address = ''
    /** @type {string} types */
    this.types = ''
    /** @type {MessageArgValue[]} args */
    this.args = []

    if (!isUndefined(address)) {
      if (!(isString(address) || isArray(address))) {
        throw new Error('OSC Message constructor first argument (address) must be a string or array')
      }
      this.address = prepareAddress(address)
    }

    if (!isUndefined(args)) {
      if (!isArray(args)) {
        throw new Error('OSC Message constructor second argument (args) must be an array')
      }
      args.forEach((item) => this.add(item.type, item.value))
    }
  }

  /**
   * Add an OSC Atomic Data Type to the list of elements
   * @param {MessageArgType} type
   * @param {MessageArgValue} item
   */
  add(type, item) {
    if (isUndefined(type)) {
      throw new Error('OSC Message needs a valid OSC Atomic Data Type')
    }

    if (type === 'N') {
      this.args.push(VALUE_NONE)
    } else if (type === 'T') {
      this.args.push(VALUE_TRUE)
    } else if (type === 'F') {
      this.args.push(VALUE_FALSE)
    } else if (type === 'I') {
      this.args.push(VALUE_INFINITY)
    } else {
      this.args.push(item)
    }

    this.types += type
  }

  /**
   * Interpret the Message as packed binary data
   * @return {Uint8Array} Packed binary data
   */
  pack() {
    if (this.address.length === 0 || this.address[0] !== '/') {
      throw new Error('OSC Message has an invalid address')
    }

    const encoder = new Helper()

    // OSC Address Pattern and Type string
    encoder.add(new AtomicString(this.address))
    encoder.add(new AtomicString(`,${this.types}`))

    // followed by zero or more OSC Arguments
    if (this.args.length > 0) {
      let argument

      if (this.args.length > this.types.length) {
        throw new Error('OSC Message argument and type tag mismatch')
      }

      this.args.forEach((value, index) => {
        const type = this.types[index]
        if (type === 'i') {
          argument = new AtomicInt32(value)
        } else if (type === 'h') {
          argument = new AtomicInt64(value)
        } else if (type === 't') {
          argument = new AtomicUInt64(value)
        } else if (type === 'f') {
          argument = new AtomicFloat32(value)
        } else if (type === 'd') {
          argument = new AtomicFloat64(value)
        } else if (type === 's') {
          argument = new AtomicString(value)
        } else if (type === 'b') {
          argument = new AtomicBlob(value)
        } else if (type === 'T') {
          argument = VALUE_TRUE
        } else if (type === 'F') {
          argument = VALUE_FALSE
        } else if (type === 'N') {
          argument = VALUE_NONE
        } else if (type === 'I') {
          argument = VALUE_INFINITY
        } else {
          throw new Error('OSC Message found unknown argument type')
        }

        encoder.add(argument)
      })
    }

    return encoder.merge()
  }

  /**
   * Unpack binary data to read a Message
   * @param {DataView} dataView The DataView holding the binary representation of a Message
   * @param {number} [initialOffset=0] Offset of DataView before unpacking
   * @return {number} Offset after unpacking
   */
  unpack(dataView, initialOffset = 0) {
    if (!(dataView instanceof DataView)) {
      throw new Error('OSC Message expects an instance of type DataView.')
    }

    // read address pattern
    const address = new AtomicString()
    address.unpack(dataView, initialOffset)

    // read type string
    const types = new AtomicString()
    types.unpack(dataView, address.offset)

    if (address.value.length === 0 || address.value[0] !== '/') {
      throw new Error('OSC Message found malformed or missing address string')
    }

    if (types.value.length === 0 && types.value[0] !== ',') {
      throw new Error('OSC Message found malformed or missing type string')
    }

    let { offset } = types
    let next
    let type

    const args = []

    // read message arguments (OSC Atomic Data Types)
    for (let i = 1; i < types.value.length; i += 1) {
      type = types.value[i]
      next = null

      if (type === 'i') {
        next = new AtomicInt32()
      } else if (type === 'h') {
        next = new AtomicInt64()
      } else if (type === 't') {
        next = new AtomicUInt64()
      } else if (type === 'f') {
        next = new AtomicFloat32()
      } else if (type === 'd') {
        next = new AtomicFloat64()
      } else if (type === 's') {
        next = new AtomicString()
      } else if (type === 'b') {
        next = new AtomicBlob()
      } else if (type === 'T') {
        args.push(VALUE_TRUE)
      } else if (type === 'F') {
        args.push(VALUE_FALSE)
      } else if (type === 'N') {
        args.push(VALUE_NONE)
      } else if (type === 'I') {
        args.push(VALUE_INFINITY)
      } else {
        throw new Error('OSC Message found unsupported argument type')
      }

      if (next) {
        offset = next.unpack(dataView, offset)
        args.push(next.value)
      }
    }

    this.offset = offset
    this.address = address.value
    this.types = types.value
    this.args = args

    return this.offset
  }
}

/**
 * An OSC message consists of an OSC Address Pattern followed
 * by an OSC Type Tag String followed by zero or more OSC Arguments
 */
export default class Message extends TypedMessage {
  /**
   * Create a Message instance
   * @param {string[]|string} address Address
   * @param {...MessageArgValue} args OSC Atomic Data Types
   *
   * @example
   * const message = new Message(['test', 'path'], 50, 100.52, 'test')
   *
   * @example
   * const message = new Message('/test/path', 51.2)
   */
  constructor(address, ...args) {
    let oscArgs
    if (args.length > 0) {
      if (args[0] instanceof Array) {
        oscArgs = args.shift()
      }
    }

    super(address, oscArgs)

    if (args.length > 0) {
      this.types = args.map((item) => typeTag(item)).join('')
      this.args = args
    }
  }

  /**
   * Add an OSC Atomic Data Type to the list of elements
   * @param {MessageArgValue} item
   */
  add(item) {
    super.add(typeTag(item), item)
  }
}
