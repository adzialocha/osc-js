import { isBlob, pad } from '../utils'

import Atomic from '../atomic'

export default class AtomicBlob extends Atomic {
  constructor(value) {
    if (value && !isBlob(value)) {
      throw new Error('OSC AtomicBlob constructor expects value of type Uint8Array.')
    }

    super(value)
  }

  encode() {
    if (!this.value) {
      throw new Error('OSC AtomicBlob can not be encoded with empty value.')
    }

    const byteLength = pad(this.value.byteLength)
    const data = new Uint8Array(byteLength + 4)
    const dataView = new DataView(data.buffer)

    dataView.setInt32(0, this.value.byteLength, false)
    data.set(this.value, 4)

    return data
  }

  decode(dataView, offset) {
    const byteLength = dataView.getInt32(offset, false)

    this.value = new Uint8Array(dataView.buffer, offset + 4, byteLength)
    this.offset = pad(offset + 4 + byteLength)

    return this.offset
  }
}
