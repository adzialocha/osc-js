import {
  isArray,
  isBlob,
  isFloat,
  isInt,
  isString,
  isUndefined,
} from './common/utils'

import Helper, { typeTag, prepareAddress } from './common/helpers'

import AtomicInt32 from './atomic/int32'
import AtomicFloat32 from './atomic/float32'
import AtomicString from './atomic/string'
import AtomicBlob from './atomic/blob'

/**
 * An OSC message consists of an OSC Address Pattern followed
 * by an OSC Type Tag String followed by zero or more OSC Arguments
 */
export default class Message {
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

    if (args.length > 0) {
      if (!(isString(args[0]) || isArray(args[0]))) {
        throw new Error('OSC Message constructor first argument (address) must be a string or array')
      }

      this.address = prepareAddress(args.shift())
      this.types = args.map(item => typeTag(item)).join('')
      this.args = args
    }
  }

  /**
   * Add an OSC Atomic Data Type to the list of elements
   * @param {*} item
   */
  add(item) {
    if (isUndefined(item)) {
      throw new Error('OSC Message needs a valid OSC Atomic Data Type')
    }

    this.args.push(item)
    this.types += typeTag(item)
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

      this.args.forEach((value) => {
        if (isInt(value)) {
          argument = new AtomicInt32(value)
        } else if (isFloat(value)) {
          argument = new AtomicFloat32(value)
        } else if (isString(value)) {
          argument = new AtomicString(value)
        } else if (isBlob(value)) {
          argument = new AtomicBlob(value)
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

      if (type === 'i') {
        next = new AtomicInt32()
      } else if (type === 'f') {
        next = new AtomicFloat32()
      } else if (type === 's') {
        next = new AtomicString()
      } else if (type === 'b') {
        next = new AtomicBlob()
      } else {
        throw new Error('OSC Message found non-standard argument type')
      }

      offset = next.unpack(dataView, offset)
      args.push(next.value)
    }

    this.offset = offset
    this.address = address.value
    this.types = types.value
    this.args = args

    return this.offset
  }
}
