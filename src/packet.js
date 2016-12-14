import Entity from './entity'
import Bundle, { BUNDLE_TAG } from './bundle'
import Message from './message'
import AtomicString from './atomic/string'

export default class Packet extends Entity {
  constructor(value) {
    if (value && !(value instanceof Message || value instanceof Bundle)) {
      throw new Error('OSC Packet can only consist of Message or Bundle.')
    }
    super(value)
  }

  pack() {
    if (!this.value) {
      throw new Error('OSC Packet cant be encoded with empty body.')
    }

    return this.value.pack()
  }

  unpack(dataView, timetag) {
    if (dataView.byteLength % 4 !== 0) {
      throw new Error('OSC Packet byteLength has to be a multiple of four.')
    }

    const head = new AtomicString()
    head.unpack(dataView, 0)

    let item

    if (head.value === BUNDLE_TAG) {
      item = new Bundle()
    } else {
      item = new Message()
      if (timetag) {
        item.timetag = timetag
      }
    }

    item.unpack(dataView)

    return item
  }
}
