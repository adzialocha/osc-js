import { pad, isBlob, isUndefined } from '../common/utils'

import Atomic from '../atomic'

/**
 * 8-bit bytes of arbitrary binary data OSC Atomic Data Type
 */
export default class AtomicBlob extends Atomic {
  /**
   * Create an AtomicBlob instance
   * @param {Uint8Array} [value] Binary data
   */
  constructor(value) {
    if (value && !isBlob(value)) {
      throw new Error('OSC AtomicBlob constructor expects value of type Uint8Array')
    }

    super(value)
  }

  /**
   * Interpret the given blob as packed binary data
   * @return {Uint8Array} Packed binary data
   */
  pack() {
    if (isUndefined(this.value)) {
      throw new Error('OSC AtomicBlob can not be encoded with empty value')
    }

    const byteLength = pad(this.value.byteLength)
    const data = new Uint8Array(byteLength + 4)
    const dataView = new DataView(data.buffer)

    // an int32 size count
    dataView.setInt32(0, this.value.byteLength, false)
    // followed by 8-bit bytes of arbitrary binary data
    data.set(this.value, 4)

    return data
  }

  /**
   * Unpack binary data from DataView and read a blob
   * @param {DataView} dataView The DataView holding the binary representation of the blob
   * @param {number} [initialOffset=0] Offset of DataView before unpacking
   * @return {number} Offset after unpacking
   */
  unpack(dataView, initialOffset = 0) {
    if (!(dataView instanceof DataView)) {
      throw new Error('OSC AtomicBlob expects an instance of type DataView')
    }

    const byteLength = dataView.getInt32(initialOffset, false)

    /** @type {Uint8Array} value */
    this.value = new Uint8Array(dataView.buffer, initialOffset + 4, byteLength)
    /** @type {number} offset */
    this.offset = pad(initialOffset + 4 + byteLength)

    return this.offset
  }
}
