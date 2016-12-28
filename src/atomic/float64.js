import { isFloat } from '../common/utils'

import Atomic from '../atomic'

/**
 * 64-bit big-endian floating point number (double precision) OSC Atomic Data Type.
 * This is a non-standard OSC Data Type but enables us to have more reliable float numbers when
 * precision is crucial. Enable the 64-bit float setting in the options to make use of them.
 */
export default class AtomicFloat64 extends Atomic {
  /**
   * Create an AtomicFloat64 instance
   * @param {number} value Float number
   */
  constructor(value) {
    if (value && !isFloat(value)) {
      throw new Error('OSC AtomicFloat64 constructor expects value of type float number.')
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
   * @param {number} initialOffset Offset of DataView before unpacking
   * @return {number} Offset after unpacking
   */
  unpack(dataView, initialOffset = 0) {
    return super.unpack(dataView, 'getFloat64', 8, initialOffset)
  }
}
