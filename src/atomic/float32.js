import { isFloat, isInt } from '../common/utils'

import Atomic from '../atomic'

/**
 * 32-bit big-endian IEEE 754 floating point number OSC Atomic Data Type
 */
export default class AtomicFloat32 extends Atomic {
  /**
   * Create an AtomicFloat32 instance
   * @param {number} [value] Float number
   */
  constructor(value) {
    if (value && !isFloat(value) && !isInt(value)) {
      throw new Error('OSC AtomicFloat32 constructor expects value of type float or integer')
    }

    super(value)
  }

  /**
   * Interpret the given number as packed binary data
   * @return {Uint8Array} Packed binary data
   */
  pack() {
    return super.pack('setFloat32', 4)
  }

  /**
   * Unpack binary data from DataView and read a Float32 number
   * @param {DataView} dataView The DataView holding the binary representation of the value
   * @param {number} [initialOffset=0] Offset of DataView before unpacking
   * @return {number} Offset after unpacking
   */
  unpack(dataView, initialOffset = 0) {
    return super.unpack(dataView, 'getFloat32', 4, initialOffset)
  }
}
