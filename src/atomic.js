export default class OSCAtomic {
  constructor(value) {
    this.value = value
    this.offset = 0
  }

  encode(type, byteLength) {
    const data = new Uint8Array(byteLength)
    const dataView = new DataView(data.buffer)

    if (!this.value) {
      throw new Error('OSCAtomic can not be encoded with empty value.')
    }

    dataView[type](this.offset, this.value, false)

    return data
  }

  decode(dataView, type, byteLength, offset) {
    this.value = dataView[type](offset, false)
    this.offset = offset + byteLength
    return this.offset
  }
}
