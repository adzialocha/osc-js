import { pad, isString, isUndefined, hasProperty } from '../common/utils'

import Atomic from '../atomic'

/** Slice size of large strings for fallback method */
const STR_SLICE_SIZE = 65537

/** Text encoding format */
const STR_ENCODING = 'utf-8'

/**
 * Helper method to decode a string using different methods depending on environment
 * @param {array} charCodes Array of char codes
 * @return {string} Decoded string
 */
function charCodesToString(charCodes) {
  // Use these methods to be able to convert large strings
  if (hasProperty('Buffer')) {
    return Buffer.from(charCodes).toString(STR_ENCODING)
  } else if (hasProperty('TextDecoder')) {
    return new TextDecoder(STR_ENCODING) // eslint-disable-line no-undef
      .decode(new Int8Array(charCodes))
  }

  // Fallback method
  let str = ''

  for (let i = 0; i < charCodes.length; i += STR_SLICE_SIZE) {
    str += String.fromCharCode.apply(
      null,
      charCodes.slice(i, i + STR_SLICE_SIZE)
    )
  }

  return str
}

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
    const charCodes = []

    for (; offset < dataView.byteLength; offset += 1) {
      charcode = dataView.getUint8(offset)

      // check for terminating null character
      if (charcode !== 0) {
        charCodes.push(charcode)
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
    this.value = charCodesToString(charCodes)

    return this.offset
  }
}
