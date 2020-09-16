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
import AtomicString from './atomic/string'

/**
 * TypedMessage is the superclass of Message. It can be used to compose an OSC
 * message with explicit data types.
 */
export class TypedMessage {
  /**
   * Create a TypedMessage instance
   * @param {array|string} args Address
   *
   * @example
   * const message = new TypedMessage(['test', 'path'])
   * message.add('d', 123.123456789)
   * message.add('s', 'hello')
   *
   * @example
   * const message = new Message('/test/path')
   */
  constructor(address) {
    /**
     * @type {number} offset
     * @private
     */
    this.offset = 0
    /** @type {string} address */
    this.address = ''
    /** @type {string} types */
    this.types = ''
    /** @type {array} args */
    this.args = []

    if (!isUndefined(address)) {
      if (!(isString(address) || isArray(address))) {
        throw new Error('OSC Message constructor first argument (address) must be a string or array')
      }

      this.address = prepareAddress(address)
    }
  }

  /**
   * Add an OSC Atomic Data Type to the list of elements
   * @param {string} type
   * @param {*} item
   */
  add(type, item) {
    if (isUndefined(type)) {
      throw new Error('OSC Message needs a valid OSC Atomic Data Type')
    }

    // Some data types e.g. boolean does not require item
    if (!isUndefined(item)) {
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
    if (this.types.length > 0) {
      let argument
      let index = 0
      for (const type of this.types) {
        const value = this.args[index]

        if (type === 'i') {
          argument = new AtomicInt32(value)
          index += 1
        } else if (type === 'h') {
          argument = new AtomicInt64(value)
          index += 1
        } else if (type === 't') {
          argument = new AtomicUInt64(value)
          index += 1
        } else if (type === 'f') {
          argument = new AtomicFloat32(value)
          index += 1
        } else if (type === 'd') {
          argument = new AtomicFloat64(value)
          index += 1
        } else if (type === 's') {
          argument = new AtomicString(value)
          index += 1
        } else if (type === 'b') {
          argument = new AtomicBlob(value)
          index += 1
        } else if (type === 'T' || type === 'F') {
          argument = null
        } else {
          throw new Error('OSC Message found unknown argument type')
        }

        if (argument !== null) {
          encoder.add(argument)
        }
      }
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
      } else if (type === 'T' || type === 'F') {
        next = null
      } else {
        throw new Error('OSC Message found non-standard argument type')
      }

      if (next !== null) {
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
   * @param {array|string} args Address
   * @param {...*} args OSC Atomic Data Types
   *
   * @example
   * const message = new Message(['test', 'path'], 50, 100.52, 'test')
   *
   * @example
   * const message = new Message('/test/path', 51.2)
   */
  constructor(...args) {
    let address
    if (args.length > 0) {
      address = args.shift()
    }

    super(address)

    if (args.length > 0) {
      this.types = args.map((item) => typeTag(item)).join('')
      this.args = args
    }
  }

  /**
   * Add an OSC Atomic Data Type to the list of elements
   * @param {*} item
   */
  add(item) {
    super.add(typeTag(item), item)
  }
}
