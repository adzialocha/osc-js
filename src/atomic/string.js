import { pad, isString, isUndefined } from '../common/utils'

import Atomic from '../atomic'

/**
 * A sequence of non-null ASCII characters OSC Atomic Data Type
 */
export default class AtomicString extends Atomic {
  /**
   * Create an AtomicString instance
   * @param {string} [value] Initial string value
   */
  constructor(value) {
    if (value && !isString(value)) {
      throw new Error('OSC AtomicString constructor expects value of type string')
    }

    super(value)
  }

  /**
   * Interpret the given string as packed binary data
   * @return {Uint8Array} Packed binary data
   */
  pack() {
    if (isUndefined(this.value)) {
      throw new Error('OSC AtomicString can not be encoded with empty value')
    }

    // add 0-3 null characters for total number of bits a multiple of 32
    const terminated = `${this.value}\u0000`
    const byteLength = pad(terminated.length)

    const buffer = new Uint8Array(byteLength)

    for (let i = 0; i < terminated.length; i += 1) {
      buffer[i] = terminated.charCodeAt(i)
    }

    return buffer
  }

  /**
   * Unpack binary data from DataView and read a string
   * @param {DataView} dataView The DataView holding the binary representation of the string
   * @param {number} [initialOffset=0] Offset of DataView before unpacking
   * @return {number} Offset after unpacking
   */
  unpack(dataView, initialOffset = 0) {
    if (!(dataView instanceof DataView)) {
      throw new Error('OSC AtomicString expects an instance of type DataView')
    }

    let offset = initialOffset
    let charcode
    const data = []

    for (; offset < dataView.byteLength; offset += 1) {
      charcode = dataView.getUint8(offset)

      // check for terminating null character
      if (charcode !== 0) {
        data.push(charcode)
      } else {
        offset += 1
        break
      }
    }

    if (offset === dataView.length) {
      throw new Error('OSC AtomicString found a malformed OSC string')
    }

    /** @type {number} offset */
    this.offset = pad(offset)
    /** @type {string} value */
    this.value = String.fromCharCode.apply(null, data);

    return this.offset
  }
}
