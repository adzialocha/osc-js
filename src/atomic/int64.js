import { isNumber } from '../common/utils'

import Atomic from '../atomic'

// 2n ** (64n - 1n) - 1n
const INT64_MAX = BigInt(9223372036854775807)

/**
 * 64-bit big-endian two's complement integer OSC Atomic Data Type
 */
export default class AtomicInt64 extends Atomic {
  /**
   * Create an AtomicInt64 instance
   * @param {number} [value] Initial integer value
   */
  constructor(value) {
    if (typeof value !== 'bigint') {
      throw new Error('OSC AtomicInt64 constructor expects value of type number')
    }

    if (value > INT64_MAX) {
      throw new Error('OSC AtomicInt64 value is out of bounds')
    }

    super(BigInt.asIntN(64, value))
  }

  /**
   * Interpret the given number as packed binary data
   * @return {Uint8Array} Packed binary data
   */
  pack() {
    return super.pack('setBigInt64', 8)
  }

  /**
   * Unpack binary data from DataView and read a Int64 number
   * @param {DataView} dataView The DataView holding the binary representation of the value
   * @param {number} [initialOffset=0] Offset of DataView before unpacking
   * @return {number} Offset after unpacking
   */
  unpack(dataView, initialOffset = 0) {
    return super.unpack(dataView, 'getBigInt64', 8, initialOffset)
  }
}
