import { isBlob, pad } from '../utils'

import OSCAtomic from '../atomic'

export default class OSCAtomicBlob extends OSCAtomic {
  constructor(value) {
    if (value && !isBlob(value)) {
      throw new Error('OSCAtomicBlob constructor expects value of type Uint8Array.')
    }

    super(value)
  }

  encode() {
    if (!this.value) {
      throw new Error('OSCAtomicBlob can not be encoded with empty value.')
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
