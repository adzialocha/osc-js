import { isInt } from '../common/utils'

import Atomic from '../atomic'

/**
 * 32-bit big-endian two's complement integer OSC Atomic Data Type
 */
export default class AtomicInt32 extends Atomic {
  /**
   * Create an AtomicInt32 instance
   * @param {number} [value] Initial integer value
   */
  constructor(value) {
    if (value && !isInt(value)) {
      throw new Error('OSC AtomicInt32 constructor expects value of type number')
    }

    super(value)
  }

  /**
   * Interpret the given number as packed binary data
   * @return {Uint8Array} Packed binary data
   */
  pack() {
    return super.pack('setInt32', 4)
  }

  /**
   * Unpack binary data from DataView and read a Int32 number
   * @param {DataView} dataView The DataView holding the binary representation of the value
   * @param {number} [initialOffset=0] Offset of DataView before unpacking
   * @return {number} Offset after unpacking
   */
  unpack(dataView, initialOffset = 0) {
    return super.unpack(dataView, 'getInt32', 4, initialOffset)
  }
}
