import Atomic from '../atomic'

const MAX_UINT64 = BigInt('18446744073709551615')

/**
 * Unsigned 64-bit big-endian two's complement integer OSC Atomic Data Type
 */
export default class AtomicUInt64 extends Atomic {
  /**
   * Create an AtomicUInt64 instance
   * @param {number} [value] Initial integer value
   */
  constructor(value) {
    if (value && typeof value !== 'bigint') {
      throw new Error('OSC AtomicUInt64 constructor expects value of type BigInt')
    }

    if (value && (value < 0 || value > MAX_UINT64)) {
      throw new Error('OSC AtomicUInt64 value is out of bounds')
    }

    let tmp
    if (value) {
      tmp = BigInt.asUintN(64, value)
    }

    super(tmp)
  }

  /**
   * Interpret the given number as packed binary data
   * @return {Uint8Array} Packed binary data
   */
  pack() {
    return super.pack('setBigUint64', 8)
  }

  /**
   * Unpack binary data from DataView and read a UInt64 number
   * @param {DataView} dataView The DataView holding the binary representation of the value
   * @param {number} [initialOffset=0] Offset of DataView before unpacking
   * @return {number} Offset after unpacking
   */
  unpack(dataView, initialOffset = 0) {
    return super.unpack(dataView, 'getBigUint64', 8, initialOffset)
  }
}
