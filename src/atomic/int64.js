import Atomic from '../atomic'

const MAX_INT64 = BigInt('9223372036854775807')
const MIN_INT64 = BigInt('-9223372036854775808')

/**
 * 64-bit big-endian two's complement integer OSC Atomic Data Type
 */
export default class AtomicInt64 extends Atomic {
  /**
   * Create an AtomicInt64 instance
   * @param {number} [value] Initial integer value
   */
  constructor(value) {
    if (value && typeof value !== 'bigint') {
      throw new Error('OSC AtomicInt64 constructor expects value of type BigInt')
    }

    if (value && (value < MIN_INT64 || value > MAX_INT64)) {
      throw new Error('OSC AtomicInt64 value is out of bounds')
    }

    let tmp
    if (value) {
      tmp = BigInt.asIntN(64, value)
    }

    super(tmp)
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
