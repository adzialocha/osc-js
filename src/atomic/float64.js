import { isNumber } from '../common/utils'

import Atomic from '../atomic'

/**
 * 64-bit big-endian IEEE 754 floating point number OSC Atomic Data Type
 */
export default class AtomicFloat64 extends Atomic {
  /**
   * Create an AtomicFloat64 instance
   * @param {number} [value] Float number
   */
  constructor(value) {
    if (value && !isNumber(value)) {
      throw new Error('OSC AtomicFloat64 constructor expects value of type float')
    }

    super(value)
  }

  /**
   * Interpret the given number as packed binary data
   * @return {Uint8Array} Packed binary data
   */
  pack() {
    return super.pack('setFloat64', 8)
  }

  /**
   * Unpack binary data from DataView and read a Float64 number
   * @param {DataView} dataView The DataView holding the binary representation of the value
   * @param {number} [initialOffset=0] Offset of DataView before unpacking
   * @return {number} Offset after unpacking
   */
  unpack(dataView, initialOffset = 0) {
    return super.unpack(dataView, 'getFloat64', 8, initialOffset)
  }
}
