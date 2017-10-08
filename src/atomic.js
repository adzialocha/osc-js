import { isUndefined } from './common/utils'

/**
 * Base class for OSC Atomic Data Types
 */
export default class Atomic {
  /**
   * Create an Atomic instance
   * @param {*} [value] Initial value of any type
   */
  constructor(value) {
    /** @type {*} value */
    this.value = value
    /** @type {number} offset */
    this.offset = 0
  }

  /**
   * Interpret the given value of this entity as packed binary data
   * @param {string} method The DataView method to write to the ArrayBuffer
   * @param {number} byteLength Size of array in bytes
   * @return {Uint8Array} Packed binary data
   */
  pack(method, byteLength) {
    if (!(method && byteLength)) {
      throw new Error('OSC Atomic cant\'t be packed without given method or byteLength')
    }

    const data = new Uint8Array(byteLength)
    const dataView = new DataView(data.buffer)

    if (isUndefined(this.value)) {
      throw new Error('OSC Atomic cant\'t be encoded with empty value')
    }

    // use DataView to write to ArrayBuffer
    dataView[method](this.offset, this.value, false)

    // always return binary Uint8Array after packing
    return data
  }

  /**
   * Unpack binary data from DataView according to the given format
   * @param {DataView} dataView The DataView holding the binary representation of the value
   * @param {string} method The DataView method to read the format from the ArrayBuffer
   * @param {number} byteLength Size of array in bytes
   * @param {number} [initialOffset=0] Offset of DataView before unpacking
   * @return {number} Offset after unpacking
   */
  unpack(dataView, method, byteLength, initialOffset = 0) {
    if (!(dataView && method && byteLength)) {
      throw new Error('OSC Atomic cant\'t be unpacked without given dataView, method or byteLength')
    }

    if (!(dataView instanceof DataView)) {
      throw new Error('OSC Atomic expects an instance of type DataView')
    }

    // use DataView to read from ArrayBuffer and add offset
    this.value = dataView[method](initialOffset, false)
    this.offset = initialOffset + byteLength

    // always return offset number after unpacking
    return this.offset
  }
}
