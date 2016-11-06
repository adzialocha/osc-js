import { pad } from '../utils'

import OSCAtomic from '../atomic'

export default class OSCAtomicString extends OSCAtomic {
  constructor(value) {
    if (value && typeof value !== 'string') {
      throw new Error('OSCAtomicString constructor expects value of type string.')
    }

    super(value)
  }

  encode() {
    if (!this.value) {
      throw new Error('OSCAtomicString can not be encoded with empty value.')
    }

    const terminated = `${this.value}\u0000`
    const byteLength = pad(terminated.length)
    const buffer = new Uint8Array(byteLength)

    for (let i = 0; i < terminated.length; i += 1) {
      buffer[i] = terminated.charCodeAt(i)
    }

    return buffer
  }

  decode(dataView, offset) {
    let end = offset
    let charcode
    const data = []

    for (; end < dataView.byteLength; end += 1) {
      charcode = dataView.getUint8(end)

      if (charcode !== 0) {
        data.push(charcode)
      } else {
        end += 1
        break
      }
    }

    if (end === dataView.length) {
      throw new Error('OSCAtomicString found a malformed OSC string.')
    }

    this.offset = pad(end)
    this.value = String.fromCharCode.apply(null, data)

    return this.offset
  }
}
